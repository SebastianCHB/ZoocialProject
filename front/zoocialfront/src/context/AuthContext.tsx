import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api/axios';

// Interfaces for our User structure based on Laravel Models
export interface User {
    id_usuario: number;
    nombre_completo: string;
    correo_e: string;
    telefono?: string;
    ciudad?: string;
    rol: 'normal' | 'rescatista' | 'veterinario' | 'admin';
    edad?: number;
    validaciones?: any[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hydrate user data if token exists but no user state
        const fetchUser = async () => {
            if (token && !user) {
                try {
                    const response = await api.get('/user');
                    setUser(response.data);
                } catch (error) {
                    console.error("Failed to fetch user. Token might be invalid.", error);
                    logout();
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [token, user]);

    const login = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.warn("Logout request failed, cleaning local state anyway.");
        }
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            isAuthenticated: !!token,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
