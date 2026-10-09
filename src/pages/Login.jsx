import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import FormInput from '../components/FormInput.jsx';

export default function Login() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/leads');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center">
        <div className="page-container">
          <h1 id="app-title">Prometheus Mortgage Pricer</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <section className="login-card">
          <div className="login-heading">
            <h2>Welcome back</h2>
            <p>Log in to access the lender-matching tool.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Username"
              id="username"
              placeholder="Enter your username"
              required
            />
            <FormInput
              label="Password"
              id="password"
              type="password"
              placeholder="Enter your password"
              required
            />
            <div className="button-group">
              <button type="submit" className="primary-button">
                Log in
              </button>
              <button type="button" className="secondary-button">
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
