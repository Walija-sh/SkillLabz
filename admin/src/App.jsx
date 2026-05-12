import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Verifications from './pages/Verifications';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verifications" element={<Verifications />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;