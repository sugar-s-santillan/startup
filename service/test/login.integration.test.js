// Opt-in login-only Atlas test. Fictional credentials are generated in memory.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

test('MongoDB login credentials, private responses, and persistent hashed sessions', {
  skip: process.env.RUN_DB_TESTS !== '1', timeout: 60000,
}, async () => {
  const email = `login-test-${randomUUID()}@example.invalid`;
  const password = randomBytes(24).toString('hex');
  const config = JSON.parse(await readFile(new URL('../dbConfig.json', import.meta.url), 'utf8'));
  const client = new MongoClient(
    `mongodb+srv://${encodeURIComponent(config.userName)}:${encodeURIComponent(config.password)}@${config.hostname}`,
    { serverSelectionTimeoutMS: 10000, tls: true },
  );
  const users = client.db('startup').collection('users');
  let server;
  let connected = false;

  async function start() {
    server = spawn(process.execPath, ['index.js', '4102'], {
      cwd: new URL('..', import.meta.url), stdio: ['ignore', 'pipe', 'ignore'],
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Backend startup timed out')), 15000);
      server.stdout.on('data', (chunk) => {
        if (chunk.toString().includes('listening on port 4102')) {
          clearTimeout(timer); resolve();
        }
      });
      server.once('error', () => { clearTimeout(timer); reject(new Error('Backend could not start')); });
      server.once('exit', () => { clearTimeout(timer); reject(new Error('Backend exited before readiness')); });
    });
  }
  async function stop() {
    if (server && server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit'); server.kill('SIGTERM'); await exited;
    }
  }
  async function login(body, status = 200) {
    const response = await fetch('http://127.0.0.1:4102/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), status === 200 ? { email } : { msg: 'Invalid email or password' });
    if (status !== 200) assert.equal(response.headers.get('set-cookie'), null);
    return response.headers.get('set-cookie');
  }
  async function currentUser(cookie, status = 200) {
    const response = await fetch('http://127.0.0.1:4102/api/auth/me', {
      headers: cookie ? { Cookie: cookie } : {},
    });
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), status === 200 ? { email, authenticated: true } : { msg: 'Unauthorized' });
  }

  try {
    try { await client.connect(); connected = true; }
    catch { throw new Error('Atlas connection failed; check private configuration and network access'); }
    // Seed the fixture directly so this test exercises no registration or lead endpoints.
    await users.insertOne({ email, password: await bcrypt.hash(password, 10) });
    await start();
    await login({ email, password: randomBytes(24).toString('hex') }, 401);
    await login({ email: `absent-${randomUUID()}@example.invalid`, password }, 401);
    await login({ email, password: randomBytes(40).toString('hex') }, 401);
    await login({ email, password: '' }, 401);
    assert.equal((await users.findOne({ email })).tokenHash, undefined);

    const header = await login({ email: `  ${email.toUpperCase()}  `, password });
    assert.match(header, /HttpOnly/i);
    assert.match(header, /SameSite=Strict/i);
    const cookie = header.split(';')[0];
    const token = cookie.slice('token='.length);
    assert.ok(/^[a-f0-9]{64}$/.test(token));
    const stored = await users.findOne({ email });
    assert.ok(stored.tokenHash === createHash('sha256').update(token).digest('hex'));
    assert.equal(stored.token, undefined);
    assert.ok(stored.tokenHash !== token);
    assert.ok(stored.tokenExpiresAt > new Date());
    assert.ok(await bcrypt.compare(password, stored.password));
    await currentUser(cookie);
    await currentUser(undefined, 401);
    await currentUser(`token=${randomBytes(32).toString('hex')}`, 401);

    await stop(); await start();
    await currentUser(cookie);
    const persisted = await users.findOne({ email });
    assert.ok(persisted.tokenHash === stored.tokenHash);
    assert.equal(persisted.tokenExpiresAt.getTime(), stored.tokenExpiresAt.getTime());

    const rotated = (await login({ email, password })).split(';')[0];
    assert.ok(rotated !== cookie);
    await currentUser(cookie, 401);
    await currentUser(rotated);
    // Failed credentials must not invalidate an existing valid session.
    await login({ email, password: randomBytes(24).toString('hex') }, 401);
    await currentUser(rotated);
  } finally {
    await stop();
    try { if (connected) await users.deleteMany({ email }); }
    finally { await client.close(); }
  }
});
