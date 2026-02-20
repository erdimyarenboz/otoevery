'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: { email?: string; plateNumber?: string; password: string }) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    role: string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    login: async () => ({ success: false }),
    logout: () => { },
    role: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const saved = api.getUser();
        if (saved && api.isAuthenticated()) {
            setUser(saved);
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: { email?: string; plateNumber?: string; password: string }) => {
        const res = await api.login(credentials);
        if (res.success && res.data) {
            setUser(res.data.user);
            return { success: true };
        }
        return { success: false, message: res.message };
    };

    const logout = () => {
        setUser(null);
        api.logout();
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            logout,
            role: user?.role || null,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
