import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { IntroScreen } from './components/IntroScreen';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAppContext();
  if (!user) return <Navigate to={`/login/${allowedRole}`} />;
  if (user.role !== allowedRole) return <Navigate to="/" />;
  return <DashboardLayout role={allowedRole}>{children}</DashboardLayout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login/student" element={<Login role="student" />} />
      <Route path="/login/admin" element={<Login role="admin" />} />
      <Route path="/register" element={<Register />} />
      
      {/* Student Routes */}
      <Route path="/student/*" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppProvider>
      <AnimatePresence>
        {showIntro && <IntroScreen key="intro" />}
      </AnimatePresence>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;

