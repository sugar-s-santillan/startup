import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import FormInput from '../components/FormInput.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function authenticate(endpoint) {
    if (!username.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          email: username.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Authentication failed');
      }

      // Registration creates the account, but login sets the cookie.
      if (endpoint === '/api/auth/create') {
        return await authenticateLogin();
      }

      navigate('/leads');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function authenticateLogin() {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        email: username.trim(),
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Login failed');
    }

    navigate('/leads');
  }

  function handleSubmit(event) {
    event.preventDefault();
    authenticate('/api/auth/login');
  }

  return (
    <div className="app-layout">
      <header className="login-header">
        <div className="page-container">
          <h1 id="app-title">Prometheus Mortgage Pricer</h1>
        </div>
      </header>

      <main className="page-main login-main">
        <section className="login-card">
          <div className="login-heading">
            <h2>Welcome back</h2>
            <p>Log in to access the lender-matching tool.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Email"
              id="username"
              type="email"
              placeholder="Enter your email"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />

            <FormInput
              label="Password"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && <p role="alert">{error}</p>}

            <div className="button-group">
              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? 'Please wait...' : 'Log in'}
              </button>

              <button
                type="button"
                className="secondary-button"
                disabled={loading}
                onClick={() => authenticate('/api/auth/create')}
              >
                Create Account
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
