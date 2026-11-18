// Opt-in registration-only Atlas test. Passwords are generated in memory.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

test('MongoDB registration validation, uniqueness, hashes, and restart persistence', {
  skip: process.env.RUN_DB_TESTS !== '1', timeout: 60000,
}, async () => {
  const email = `registration-test-${randomUUID()}@example.invalid`;
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
    server = spawn(process.execPath, ['index.js', '4101'], {
      cwd: new URL('..', import.meta.url), stdio: ['ignore', 'pipe', 'ignore'],
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Backend startup timed out')), 15000);
      server.stdout.on('data', (chunk) => {
        if (chunk.toString().includes('listening on port 4101')) {
          clearTimeout(timer);
          resolve();
        }
      });
      server.once('error', () => { clearTimeout(timer); reject(new Error('Backend could not start')); });
      server.once('exit', () => { clearTimeout(timer); reject(new Error('Backend exited before readiness')); });
    });
  }
  async function stop() {
    if (server && server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit');
      server.kill('SIGTERM');
      await exited;
    }
  }
  async function register(body, status) {
    const response = await fetch('http://127.0.0.1:4101/api/auth/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    assert.equal(response.status, status);
    const result = await response.json();
    if (status === 200) {
      assert.deepEqual(result, { email });
      assert.equal(response.headers.get('set-cookie'), null);
    } else {
      assert.equal(typeof result.msg, 'string');
    }
  }

  try {
    try { await client.connect(); connected = true; }
    catch { throw new Error('Atlas connection failed; check private configuration and network access'); }
    await start();
    for (const body of [
      {}, { email, password: '' }, { email: 123, password }, { email, password: {} },
      { email: '   ', password }, { email: 'missing-at-sign', password },
      { email: 'missing-domain@', password }, { email: 'two@@example.invalid', password },
      { email: 'has space@example.invalid', password },
      { email, password: randomBytes(40).toString('hex') },
      { email, password: 'é'.repeat(37) },
    ]) await register(body, 400);
    assert.equal(await users.countDocuments({ email }), 0);

    // The index must resolve concurrent attempts to create the same normalized email.
    const body = { email: `  ${email.toUpperCase()}  `, password };
    const responses = await Promise.all([1, 2].map(() => fetch('http://127.0.0.1:4101/api/auth/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })));
    assert.deepEqual(responses.map((response) => response.status).sort(), [200, 409]);
    for (const response of responses) {
      assert.deepEqual(await response.json(), response.status === 200 ? { email } : { msg: 'User already exists' });
    }
    assert.equal(await users.countDocuments({ email }), 1);
    const stored = await users.findOne({ email });
    assert.equal(stored.email, email);
    assert.ok(stored.password !== password);
    assert.match(stored.password, /^\$2[aby]\$/);
    assert.ok(await bcrypt.compare(password, stored.password));
    assert.deepEqual(Object.keys(stored).sort(), ['_id', 'email', 'password']);
    const indexes = await users.indexes();
    assert.ok(indexes.some((index) => index.key.email === 1 && index.unique));

    await stop();
    await start();
    await register({ email, password }, 409);
    const persisted = await users.findOne({ email });
    assert.ok(persisted._id.equals(stored._id));
    assert.ok(await bcrypt.compare(password, persisted.password));
  } finally {
    await stop();
    try { if (connected) await users.deleteMany({ email }); }
    finally { await client.close(); }
  }
});
