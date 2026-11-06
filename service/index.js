import express from 'express';

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// Parse incoming JSON
app.use(express.json());

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

// Return React for frontend routes
app.get(/.*/, (_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Startup service listening on port ${port}`);
});