import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';
import { randomBytes, createHash } from 'node:crypto';
import * as DB from './database.js';

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

const authCookieName = 'token';

const sessionDuration = 7 * 24 * 60 * 60 * 1000;
const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve React frontend in production
app.use(express.static('public'));

// API router
const apiRouter = express.Router();
app.use('/api', apiRouter);

// ----------------------------------
// GENERAL API ENDPOINTS
// ----------------------------------

// Health check
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Prometheus Mortgage API',
  });
});

// Available loan products
apiRouter.get('/products', (_req, res) => {
  res.json([
    {
      id: 'dscr',
      name: 'DSCR Loan',
      description: 'Investment property financing',
    },
    {
      id: 'bridge',
      name: 'Bridge Loan',
      description: 'Short-term property financing',
    },
  ]);
});

// ----------------------------------
// AUTHENTICATION
// ----------------------------------

// Register a new user
apiRouter.post('/auth/create', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string' ||
    !password
  ) {
    return res.status(400).json({
      msg: 'Email and password are required',
    });
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ msg: 'Password must be at most 72 UTF-8 bytes' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ msg: 'A valid email address is required' });
  }

  const existingUser = await DB.getUser(normalizedEmail);

  if (existingUser) {
    return res.status(409).json({
      msg: 'User already exists',
    });
  }

  // Hash password with BCrypt
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: normalizedEmail,
    password: passwordHash,
  };

  try {
    await DB.addUser(user);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ msg: 'User already exists' });
    throw err;
  }

  res.json({
    email: user.email,
  });
});

// Login
apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return res.status(400).json({
      msg: 'Email and password are required',
    });
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ msg: 'Password must be at most 72 UTF-8 bytes' });
  }

  const user = await DB.getUser(email.trim().toLowerCase());

  if (
    !user ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return res.status(401).json({
      msg: 'Invalid email or password',
    });
  }

  // Keep only a hash of the random bearer token in MongoDB.
  const token = randomBytes(32).toString('hex');
  await DB.setSession(user.email, hashToken(token), new Date(Date.now() + sessionDuration));
  res.cookie(authCookieName, token, { ...cookieOptions, maxAge: sessionDuration });

  res.json({
    email: user.email,
  });
});

// Logout
apiRouter.delete('/auth/logout', async (req, res) => {
  const token = req.cookies?.[authCookieName];
  if (typeof token === 'string') await DB.removeSession(hashToken(token));
  res.clearCookie(authCookieName, cookieOptions);
  res.status(204).end();
});

// ----------------------------------
// AUTHENTICATION MIDDLEWARE
// ----------------------------------

async function verifyAuth(req, res, next) {
  const token = req.cookies?.[authCookieName];

  const user = typeof token === 'string' && /^[a-f0-9]{64}$/.test(token)
    ? await DB.getUserByToken(hashToken(token))
    : null;

  if (!user) {
    return res.status(401).json({
      msg: 'Unauthorized',
    });
  }

  req.user = user;
  next();
}

// Get currently authenticated user
apiRouter.get('/auth/me', verifyAuth, (req, res) => {
  res.json({
    email: req.user.email,
    authenticated: true,
  });
});

// ----------------------------------
// LEADS API
// ----------------------------------

// Get leads belonging to logged-in user
apiRouter.get('/leads', verifyAuth, async (req, res) => {
  const userLeads = await DB.getLeads(req.user.email);

  res.json(userLeads);
});

// Create a new lead
apiRouter.post('/leads', verifyAuth, async (req, res) => {
  const {
    fullName,
    address,
    creditScore,
    loanType,
    loanAmount,
  } = req.body ?? {};

  if (
    typeof fullName !== 'string' ||
    !fullName.trim() ||
    typeof address !== 'string' ||
    !address.trim()
  ) {
    return res.status(400).json({
      msg: 'Full name and property address are required',
    });
  }

  if (![creditScore, loanAmount].every((value) => value == null || typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))) ||
      (loanType != null && typeof loanType !== 'string')) {
    return res.status(400).json({ msg: 'Invalid lead field types' });
  }

  const lead = {
    id: uuidv4(),
    fullName: fullName.trim(),
    address: address.trim(),
    creditScore: creditScore ?? '',
    loanType: loanType ?? 'Purchase',
    loanAmount: loanAmount ?? '',
    dateAdded: new Date().toLocaleDateString(),
    owner: req.user.email,
  };

  await DB.addLead(lead);

  res.status(201).json(lead);
});

// ----------------------------------
// ERROR HANDLING
// ----------------------------------

// Handle unknown API endpoints
apiRouter.use((_req, res) => {
  res.status(404).json({
    msg: 'API endpoint not found',
  });
});

// Handle server errors
app.use((err, _req, res, _next) => {
  // Driver errors may contain connection details; never print raw errors.
  console.error('API request failed');
  if (err.type === 'entity.parse.failed') return res.status(400).json({ msg: 'Invalid JSON' });

  res.status(500).json({
    msg: 'Internal server error',
  });
});

// ----------------------------------
// FRONTEND FALLBACK
// ----------------------------------

// Return React for frontend routes
app.get(/.*/, (_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Refuse to accept requests until MongoDB and its indexes are ready.
let server;
try {
  await DB.connect();
  server = app.listen(port, () => {
    console.log(`Startup service listening on port ${port}`);
  });
} catch {
  console.error('Database startup failed. Check service/dbConfig.json, Atlas database permissions, Network Access, DNS, and TLS trust.');
  await DB.close();
  process.exitCode = 1;
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    if (server) server.close(async () => { await DB.close(); });
    else void DB.close();
  });
}
