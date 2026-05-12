import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { UsersManager } from './pages/UsersManager';
import { PetsManager } from './pages/PetsManager';
import { Feed } from './pages/Feed';
import { Adoptions } from './pages/Adoptions';
import { AdoptionsAdmin } from './pages/AdoptionsAdmin';
import { Chat } from './pages/Chat';
import { Store } from './pages/Store';
import { Profile } from './pages/Profile';
import { AdminHome } from './pages/AdminHome';
import { VetView } from './pages/VetView';
import { BottomNav } from './components/ui/BottomNav';
import type { ReactNode } from 'react';

const ProtectedRoute = ({ children, allowedRoles }: { children: ReactNode, allowedRoles?: string[] }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) return (
        <div style={{
            height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--color-surface)'
        }}>
            <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }} />
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Cargando...</span>
        </div>
    );
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

    const path = location.pathname;

    if (user.nombre_completo === 'Nuevo Usuario' && path !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    if (user.nombre_completo !== 'Nuevo Usuario' && path === '/onboarding') {
        return <Navigate to="/feed" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.rol)) {
        // Admin gets redirected to admin-home if trying to access user-only pages
        if (user.rol === 'admin') return <Navigate to="/admin-home" replace />;
        return <Navigate to="/feed" replace />;
    }

    return children;
};

// Layout wrapper that includes BottomNav on mobile
const AppLayout = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const hideNav = ['/login', '/register', '/'].includes(location.pathname);
    
    return (
        <>
            {children}
            {isAuthenticated && !hideNav && <BottomNav />}
        </>
    );
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, user, loading } = useAuth();
    if (loading) return null;
    if (isAuthenticated && user) {
        if (user.nombre_completo === 'Nuevo Usuario') return <Navigate to="/onboarding" replace />;
        if (user.rol === 'admin') return <Navigate to="/admin-home" replace />;
        // VET_REDIRECT - Veterinarios van a su vista al hacer login
        if (user.rol === 'veterinario') return <Navigate to="/vet-view" replace />;
        return <Navigate to="/feed" replace />;
    }
    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppLayout>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="/login" element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } />
                        <Route path="/register" element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        } />
                        {/* AUTH_EMAIL_ROUTES - Sin PublicRoute para no redirigir a usuarios ya logueados */}
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password"  element={<ResetPassword />} />

                        {/* Onboarding */}
                        <Route path="/onboarding" element={
                            <ProtectedRoute>
                                <Onboarding />
                            </ProtectedRoute>
                        } />

                        {/* Admin home selector */}
                        <Route path="/admin-home" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminHome />
                            </ProtectedRoute>
                        } />

                        {/* Admin routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/users" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <UsersManager />
                            </ProtectedRoute>
                        } />
                        <Route path="/posts" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <PetsManager />
                            </ProtectedRoute>
                        } />
                        <Route path="/adoptions-admin" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdoptionsAdmin />
                            </ProtectedRoute>
                        } />

                        {/* Shared routes (admin + users) */}
                        <Route path="/feed" element={
                            <ProtectedRoute allowedRoles={['normal', 'rescatista', 'veterinario', 'admin']}>
                                <Feed />
                            </ProtectedRoute>
                        } />
                        <Route path="/chat" element={
                            <ProtectedRoute allowedRoles={['normal', 'rescatista', 'veterinario', 'admin']}>
                                <Chat />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute allowedRoles={['normal', 'rescatista', 'veterinario', 'admin']}>
                                <Profile />
                            </ProtectedRoute>
                        } />

                        {/* User-only routes */}
                        <Route path="/adoptions" element={
                            <ProtectedRoute allowedRoles={['normal', 'rescatista', 'veterinario']}>
                                <Adoptions />
                            </ProtectedRoute>
                        } />
                        <Route path="/store" element={
                            <ProtectedRoute allowedRoles={['normal', 'rescatista', 'veterinario']}>
                                <Store />
                            </ProtectedRoute>
                        } />
                        {/* VET_VIEW_ROUTE - Vista exclusiva para veterinarios */}
                        <Route path="/vet-view" element={
                            <ProtectedRoute allowedRoles={['veterinario', 'admin']}>
                                <VetView />
                            </ProtectedRoute>
                        } />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </AppLayout>
            </AuthProvider>
        </Router>
    );
}

export default App;
