
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Leads from './pages/Leads.jsx';
import Pricing from './pages/Pricing.jsx';

function ProtectedRoute({ children }) {
  const username = localStorage.getItem('username');

  return username ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
