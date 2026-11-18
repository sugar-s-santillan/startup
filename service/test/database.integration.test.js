// Opt-in live Atlas test: creates and removes only uniquely named fictional records.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { MongoClient } from 'mongodb';
import { randomUUID, createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';

const enabled = process.env.RUN_DB_TESTS === '1';
test('Atlas authentication, ownership, and restart persistence', { skip: !enabled, timeout: 90000 }, async () => {
  const emails = [0, 1].map((n) => `startup-db-test-${randomUUID()}-${n}@example.invalid`);
  const password = `Fictional-${randomUUID()}`;
  const config = JSON.parse(await readFile(new URL('../dbConfig.json', import.meta.url)));
  const client = new MongoClient(`mongodb+srv://${encodeURIComponent(config.userName)}:${encodeURIComponent(config.password)}@${config.hostname}`, { serverSelectionTimeoutMS: 10000, tls: true });
  const db = client.db('startup');
  const port = 4000;
  let backend;
  let frontend;
  async function start(production = false) {
    backend = spawn(process.execPath, ['index.js', String(port)], { cwd: new URL('..', import.meta.url), stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, NODE_ENV: production ? 'production' : 'test' } });
    await new Promise((resolve, reject) => {
      backend.stdout.on('data', (chunk) => { if (chunk.toString().includes('listening')) resolve(); });
      backend.once('exit', () => reject(new Error('Backend failed to start; check Atlas access and port 4000')));
      backend.once('error', reject);
    });
  }
  async function stop(child) {
    if (child && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit'); child.kill('SIGTERM'); await exited;
    }
  }
  async function request(path, { method = 'GET', body, cookie, status = 200 } = {}) {
    const response = await fetch(`http://127.0.0.1:${port}/api${path}`, {
      method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    assert.equal(response.status, status, `${method} ${path}`);
    const text = await response.text();
    return { data: text ? JSON.parse(text) : null, cookie: response.headers.get('set-cookie') };
  }
  try {
    await client.connect();
    await start();
    await request('/health');
    await request('/products');
    await request('/auth/me', { status: 401 });
    await request('/leads', { status: 401 });
    await request('/leads', { method: 'POST', body: {}, status: 401 });
    await request('/auth/create', { method: 'POST', body: {}, status: 400 });
    await request('/auth/create', { method: 'POST', body: { email: emails[0], password: 'x'.repeat(73) }, status: 400 });
    for (const email of emails) {
      assert.deepEqual((await request('/auth/create', { method: 'POST', body: { email, password } })).data, { email });
    }
    await request('/auth/create', { method: 'POST', body: { email: emails[0].toUpperCase(), password }, status: 409 });
    await request('/auth/login', { method: 'POST', body: { email: emails[0], password: 'incorrect' }, status: 401 });
    const first = await request('/auth/login', { method: 'POST', body: { email: emails[0].toUpperCase(), password } });
    assert.match(first.cookie, /HttpOnly/i); assert.match(first.cookie, /SameSite=Strict/i);
    const cookie = first.cookie.split(';')[0];
    const rawToken = cookie.slice('token='.length);
    const stored = await db.collection('users').findOne({ email: emails[0] });
    assert.notEqual(stored.password, password);
    assert.ok(await bcrypt.compare(password, stored.password));
    assert.equal(stored.token, undefined);
    assert.equal(stored.tokenHash, createHash('sha256').update(rawToken).digest('hex'));
    assert.deepEqual((await request('/auth/me', { cookie })).data, { email: emails[0], authenticated: true });
    await request('/leads', { method: 'POST', cookie, body: {}, status: 400 });
    await request('/leads', { method: 'POST', cookie, body: { fullName: 'Fictional', address: 'Test', loanType: {} }, status: 400 });
    const lead = (await request('/leads', { method: 'POST', cookie, status: 201, body: {
      fullName: 'Fictional Test Borrower', address: '123 Imaginary Lane, Test City', creditScore: '720',
      loanType: 'Purchase', loanAmount: '250000', owner: emails[1],
    } })).data;
    assert.equal(lead.owner, emails[0]); assert.equal(lead._id, undefined);
    assert.equal(lead.fullName, 'Fictional Test Borrower'); assert.equal(lead.creditScore, '720');
    assert.equal(lead.loanType, 'Purchase'); assert.equal(lead.loanAmount, '250000'); assert.ok(lead.dateAdded);
    assert.deepEqual((await request('/leads', { cookie })).data, [lead]);
    const other = (await request('/auth/login', { method: 'POST', body: { email: emails[1], password } })).cookie.split(';')[0];
    assert.deepEqual((await request('/leads', { cookie: other })).data, []);
    await request(`/leads/${lead.id}`, { method: 'PATCH', cookie: other, body: { owner: emails[1] }, status: 404 });
    await stop(backend); await start();
    assert.deepEqual((await request('/leads', { cookie })).data, [lead]);
    await request('/auth/me', { cookie });
    const rotated = (await request('/auth/login', { method: 'POST', body: { email: emails[0], password } })).cookie.split(';')[0];
    assert.notEqual(rotated, cookie);
    await request('/auth/me', { cookie, status: 401 });
    await request('/auth/logout', { method: 'DELETE', cookie: rotated, status: 204 });
    await request('/auth/me', { cookie: rotated, status: 401 });
    await request('/leads', { cookie: rotated, status: 401 });
    await request('/auth/logout', { method: 'DELETE', status: 204 });
    const expiring = (await request('/auth/login', { method: 'POST', body: { email: emails[0], password } })).cookie.split(';')[0];
    await db.collection('users').updateOne({ email: emails[0] }, { $set: { tokenExpiresAt: new Date(0) } });
    await request('/auth/me', { cookie: expiring, status: 401 });
    const userIndexes = await db.collection('users').indexes();
    assert.ok(userIndexes.some((index) => index.key.email === 1 && index.unique));
    frontend = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '5178', '--strictPort'], {
      cwd: new URL('../..', import.meta.url), stdio: ['ignore', 'pipe', 'pipe'],
    });
    await new Promise((resolve, reject) => {
      frontend.stdout.on('data', (chunk) => { if (chunk.toString().includes('5178')) resolve(); });
      frontend.once('exit', () => reject(new Error('Vite failed to start'))); frontend.once('error', reject);
    });
    assert.equal((await fetch('http://127.0.0.1:5178/')).status, 200);
    const proxied = await fetch('http://127.0.0.1:5178/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emails[0], password }),
    });
    assert.equal(proxied.status, 200);
    const proxiedCookie = proxied.headers.get('set-cookie').split(';')[0];
    const proxiedLeads = await fetch('http://127.0.0.1:5178/api/leads', { headers: { Cookie: proxiedCookie } });
    assert.deepEqual(await proxiedLeads.json(), [lead]);
    await stop(backend); await start(true);
    const productionLogin = await request('/auth/login', { method: 'POST', body: { email: emails[0], password } });
    assert.match(productionLogin.cookie, /; Secure/i);
    console.log('PASS: credentials hashed, cookie flags, owner isolation, token rotation/expiry/logout, restart persistence, Vite HTTP smoke check');
  } finally {
    await stop(frontend); await stop(backend);
    try {
      await db.collection('leads').deleteMany({ owner: { $in: emails } });
      await db.collection('users').deleteMany({ email: { $in: emails } });
    } finally { await client.close(); }
  }
});
