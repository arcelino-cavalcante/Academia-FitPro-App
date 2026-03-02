import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Workouts from './pages/Workouts';
import StudentWorkout from './pages/StudentWorkout';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './components/ui/ToastProvider';

// Protected Route and Role Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuthStore();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    const isAdmin = profile.role === 'ADMIN' || profile.role === 'MASTER';
    if (isAdmin && (allowedRoles.includes('ADMIN') || allowedRoles.includes('MASTER'))) return children;

    if (profile.role === 'TRAINER') return <Navigate to="/" replace />;
    if (profile.role === 'STUDENT') return <Navigate to="/my-workout" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

// Home component to handle role-based landing
const Home = () => {
  const { profile, loading } = useAuthStore();
  if (loading) return null;
  if (!profile) return <Navigate to="/login" />;

  if (profile.role === 'ADMIN' || profile.role === 'MASTER') return <Navigate to="/admin" />;
  if (profile.role === 'STUDENT') return <Navigate to="/my-workout" />;
  return <Dashboard />;
};

function App() {
  const init = useAuthStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/workouts" element={<Workouts />} />
                  <Route path="/my-workout" element={<StudentWorkout />} />
                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
