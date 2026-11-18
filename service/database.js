import { readFile } from 'node:fs/promises';
import { MongoClient } from 'mongodb';

let client;
let users;
let leads;

export async function connect() {
  const config = JSON.parse(await readFile(new URL('./dbConfig.json', import.meta.url), 'utf8'));
  if (![config.userName, config.password, config.hostname].every((value) => typeof value === 'string' && value.length)) {
    throw new Error('Database configuration is incomplete');
  }
  // Only accept a host, preventing URI options from disabling TLS verification.
  if (!/^[a-zA-Z0-9.-]+$/.test(config.hostname)) throw new Error('Invalid Atlas hostname');
  const uri = `mongodb+srv://${encodeURIComponent(config.userName)}:${encodeURIComponent(config.password)}@${config.hostname}`;
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000, tls: true });
  const db = client.db('startup');
  await db.command({ ping: 1 });
  users = db.collection('users');
  leads = db.collection('leads');
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ tokenHash: 1 }, { unique: true, sparse: true });
  await leads.createIndex({ owner: 1 });
  await leads.createIndex({ id: 1 }, { unique: true });
  console.log('Connected to MongoDB startup database');
}

export async function close() { await client?.close(); }
export function getUser(email) { return users.findOne({ email }); }
export function addUser(user) { return users.insertOne({ ...user }); }
export function setSession(email, tokenHash, tokenExpiresAt) {
  return users.updateOne({ email }, { $set: { tokenHash, tokenExpiresAt } });
}
export function getUserByToken(tokenHash) {
  return users.findOne({ tokenHash, tokenExpiresAt: { $gt: new Date() } });
}
export function removeSession(tokenHash) {
  return users.updateOne({ tokenHash }, { $unset: { tokenHash: '', tokenExpiresAt: '' } });
}
export function getLeads(owner) {
  return leads.find({ owner }, { projection: { _id: 0 } }).toArray();
}
export function addLead(lead) { return leads.insertOne({ ...lead }); }
