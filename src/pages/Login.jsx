
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import FormInput from '../components/FormInput.jsx';

import Brand from '../components/Brand.jsx';
import Icon from '../components/Icon.jsx';

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
        await authenticateLogin();
        return;
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
          <div className="brand" id="app-title"><Brand /></div>
          <span className="login-header-label">Your lending workspace</span>
        </div>
      </header>

      <main className="page-main login-main">
        <section className="login-card">
          <div className="login-symbol"><Icon name="lock" /></div>
          <div className="login-heading">
            <p className="page-label">WELCOME TO MORTGAGE</p>
            <h1>Welcome back</h1>
            <p>
              Your pipeline, pricing, and next opportunity.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Email"
              id="username"
              type="email"
              placeholder="Enter your email"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError('');
              }}
              required
            />

            <FormInput
              label="Password"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              required
            />

            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}

            <div className="button-group">
              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading ? 'Please wait...' : 'Log in to your workspace'}
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
          <p className="login-note"><Icon name="lock" /> A private workspace for your mortgage leads.</p>
        </section>
      </main>

      {/* GitHub repository link for CS 260 grading */}
      <div className="login-source">
        <a
          href="https://github.com/sugar-s-santillan/startup"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Source Code on GitHub
        </a>
      </div>

      <Footer />
    </div>
  );
}
