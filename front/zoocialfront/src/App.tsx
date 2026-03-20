import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { UsersManager } from './pages/UsersManager';
import { PetsManager } from './pages/PetsManager';
import { Feed } from './pages/Feed';
import { Adoptions } from './pages/Adoptions';
import { Chat } from './pages/Chat';
import { Store } from './pages/Store';
import { Profile } from './pages/Profile';

import type { ReactNode } from 'react';

const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const path = window.location.pathname;

  // Enforce Onboarding if the user is completely new (profile not filled out)
  if (user.nombre_completo === 'Nuevo Usuario' && path !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
  }

  // Prevent accessing Onboarding again if already completed
  if (user.nombre_completo !== 'Nuevo Usuario' && path === '/onboarding') {
      return <Navigate to="/feed" replace />;
  }

  // Check roles
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
      return <Navigate to="/feed" replace />; // Redirect unauthorized to feed
  }

  // Check validations for Rescatista and Veterinario
  if (user.rol === 'rescatista' || user.rol === 'veterinario') {
      const validations = user.validaciones || [];
      const hasApproved = validations.some((v: any) => v.estado === 'aprobado');

      // If they are trying to access regular protected pages but aren't approved
      // Exception: Don't loop if they are in onboarding 
      if (!hasApproved && path !== '/onboarding') {
          // If we want a separate route we can use it, but for now they stay blocked or can see a pending state
          // Alternatively, we could create a /pending-approval route.
          // For now, allow them through to feed where they might see a "Pending" banner, or send them to onboarding to see step 3
      }
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/feed" element={
            <ProtectedRoute allowedRoles={['normal', 'rescatista', 'veterinario', 'admin']}>
              <Feed />
            </ProtectedRoute>
          } />
          
          <Route path="/adoptions" element={
            <ProtectedRoute allowedRoles={['normal', 'rescatista', 'veterinario']}>
              <Adoptions />
            </ProtectedRoute>
          } />
          
          {/* App Routes */}
          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
                <UsersManager />
            </ProtectedRoute>
          } />
          <Route path="/posts" element={
            <ProtectedRoute allowedRoles={['admin', 'rescatista', 'normal', 'veterinario']}>
                <PetsManager />
            </ProtectedRoute>
          } />
          
          <Route path="/support" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
