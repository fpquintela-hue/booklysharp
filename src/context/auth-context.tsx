'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { useRouter, usePathname } from 'next/navigation';
import { userService } from '@/lib/mock-service';
import { useTheme } from 'next-themes';

interface AuthContextType {
    user: User | null;
    login: (email: string, p: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Helper for session persistence
const SESSION_KEY = 'auth_session_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const { setTheme } = useTheme();

    // Efecto eliminado para prevenir conflictos con next-themes

    useEffect(() => {
        // Init session
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            try {
                const parsedUser = JSON.parse(stored);
                if (parsedUser && parsedUser.id) {
                    // Check if old session without tenantId
                    if (parsedUser.role !== 'SUPERADMIN' && !parsedUser.tenantId) {
                        localStorage.removeItem(SESSION_KEY);
                        setUser(null);
                    } else {
                        setUser(parsedUser);
                        // PERSIST USER PREFERENCES TO SYSTEM ON RELOAD
                        if (parsedUser.theme) {
                            setTheme(parsedUser.theme);
                        }
                        // Validar que la cookie de sesión del servidor sigue viva;
                        // si no (sesión antigua o expirada), limpiar el estado local.
                        fetch('/api/auth/me').then((res) => {
                            if (res.status === 401) {
                                localStorage.removeItem(SESSION_KEY);
                                setUser(null);
                            }
                        }).catch(() => { /* sin red: mantener estado local */ });
                    }
                } else {
                    localStorage.removeItem(SESSION_KEY);
                }
            } catch (e) {
                localStorage.removeItem(SESSION_KEY);
            }
        }
        setIsLoading(false);
    }, [setTheme]);

    const login = async (email: string, pass: string) => {
        const u = await userService.login(email, pass);
        if (u) {
            setUser(u);
            localStorage.setItem(SESSION_KEY, JSON.stringify(u));
            if (u.theme) {
                setTheme(u.theme);
            }
            return true;
        }
        return false;
    };

    const logout = () => {
        // Try to capture alias from URL before clearing state
        const pathParts = pathname.split('/').filter(Boolean);
        const aliasFromUrl = pathParts[0];

        // Invalidar la cookie de sesión en el servidor
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });

        setUser(null);
        localStorage.removeItem(SESSION_KEY);

        if (aliasFromUrl === 'superadminlogin' || aliasFromUrl === 'superadmin') {
            router.push('/superadminlogin');
        } else {
            router.push('/login');
        }
    };

    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    };

    // Protect Routes Middleware-ish
    useEffect(() => {
        if (isLoading) return;
        const isPublicRoute = pathname === '/' || pathname === '/login' || pathname.endsWith('/login') || pathname === '/superadminlogin' || pathname.endsWith('/reserve') || pathname.endsWith('/reserve-new') || pathname === '/registro' || pathname.includes('/confirm') || pathname.endsWith('/verificar') || pathname === '/politica-de-privacidad' || pathname === '/politica-de-cookies' || pathname === '/terminos-del-servicio';
        
        if (!user && !isPublicRoute) {
            const pathParts = pathname.split('/').filter(Boolean);
            const route = pathParts[0];
            if (route === 'superadminlogin' || route === 'superadmin') {
                router.push('/superadminlogin');
            } else {
                router.push('/login');
            }
            return;
        }

        // Paywall Logic
        if (user && user.role !== 'SUPERADMIN' && !isPublicRoute) {
            const status = user.tenantSubscriptionStatus;
            let resolvedExpiresAt = user.tenantExpiresAt ? new Date(user.tenantExpiresAt) : null;
            if (!resolvedExpiresAt && user.tenantCreatedAt) {
                resolvedExpiresAt = new Date(new Date(user.tenantCreatedAt).getTime() + 14 * 24 * 60 * 60 * 1000);
            }
            
            const isExpired = status === 'expired' || (resolvedExpiresAt && new Date() > resolvedExpiresAt);
            const isSettingsRoute = pathname.endsWith('/settings');
            
            if (isExpired && !isSettingsRoute) {
                router.push(`/${user.tenantAlias}/settings`);
            }
        }
    }, [user, pathname, isLoading, router]);

    // Inactivity Timeout (1 hour)
    useEffect(() => {
        if (!user) return;

        let timeoutId: NodeJS.Timeout;
        const TIMEOUT_DURATION = 60 * 60 * 1000; // 60 minutes

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                logout();
            }, TIMEOUT_DURATION);
        };

        // Events to track activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
        events.forEach(event => document.addEventListener(event, resetTimer));

        // Initial timer
        resetTimer();

        return () => {
            events.forEach(event => document.removeEventListener(event, resetTimer));
            clearTimeout(timeoutId);
        };
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
