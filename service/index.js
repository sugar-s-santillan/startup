import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

const authCookieName = 'token';

// Temporary in-memory storage
const users = [];
const leads = [];

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

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.email === normalizedEmail
  );

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

  users.push(user);

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

  const user = users.find(
    (u) => u.email === email.trim().toLowerCase()
  );

  if (
    !user ||
    !(await bcrypt.compare(password, user.password))
  ) {
    return res.status(401).json({
      msg: 'Invalid email or password',
    });
  }

  // Generate authentication token
  user.token = uuidv4();

  res.cookie(authCookieName, user.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.json({
    email: user.email,
  });
});

// Logout
apiRouter.delete('/auth/logout', (req, res) => {
  const token = req.cookies?.[authCookieName];

  const user = users.find(
    (u) => u.token && u.token === token
  );

  if (user) {
    delete user.token;
  }

  res.clearCookie(authCookieName, {
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(204).end();
});

// ----------------------------------
// AUTHENTICATION MIDDLEWARE
// ----------------------------------

function verifyAuth(req, res, next) {
  const token = req.cookies?.[authCookieName];

  const user = users.find(
    (u) => u.token && u.token === token
  );

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
apiRouter.get('/leads', verifyAuth, (req, res) => {
  const userLeads = leads.filter(
    (lead) => lead.owner === req.user.email
  );

  res.json(userLeads);
});

// Create a new lead
apiRouter.post('/leads', verifyAuth, (req, res) => {
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

  leads.push(lead);

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
  console.error(err);

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

// Start Express server
app.listen(port, () => {
  console.log(`Startup service listening on port ${port}`);
});
