import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';


const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;
// Temporary in-memory user storage
const users = [];

const authCookieName = 'token';

// Parse incoming JSON
app.use(express.json());
app.use(cookieParser());

// Serve the React frontend in production
app.use(express.static('public'));

// API router
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Health check
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Prometheus Mortgage API',
  });
});

// Temporary endpoint for loan products
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

  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: normalizedEmail,
    password: passwordHash,
    token: uuidv4(),
  };

  users.push(user);

  res.json({
    email: user.email,
  });
});


// Login an existing user
apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ msg: 'Email and password are required' });
  }

  const user = users.find(
    (u) => u.email === email.trim().toLowerCase()
  );

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ msg: 'Invalid email or password' });
  }

  // Generate a new authentication token
  user.token = uuidv4();

  // Store the token in an HTTP-only cookie
  res.cookie(authCookieName, user.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  res.json({ email: user.email });
});


// Logout
apiRouter.delete('/auth/logout', (req, res) => {
  const token = req.cookies?.[authCookieName];

  const user = users.find((u) => u.token === token);

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


// Verify authentication before accessing protected endpoints
function verifyAuth(req, res, next) {
  const token = req.cookies?.[authCookieName];

  const user = users.find((u) => u.token && u.token === token);

  if (!user) {
    return res.status(401).json({
      msg: 'Unauthorized',
    });
  }

  req.user = user;
  next();
}

// Protected endpoint: Current user
apiRouter.get('/auth/me', verifyAuth, (req, res) => {
  res.json({
    email: req.user.email,
    authenticated: true,
  });
});


// Return React for frontend routes
app.get(/.*/, (_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Startup service listening on port ${port}`);
});