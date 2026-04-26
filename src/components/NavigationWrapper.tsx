'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { MobileHeader } from '@/components/MobileHeader';
import { MobileNav } from '@/components/MobileNav';
import { MobileUserBar } from '@/components/MobileUserBar';
import * as React from 'react';
import { useEffect } from 'react';
import { useSettings } from '@/context/settings-context';
import { GlobalAppointmentDialog } from './GlobalAppointmentDialog';

import { useAuth } from '@/context/auth-context';

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { settings, isNotFound } = useSettings();
    const { user, isLoading: authLoading } = useAuth();
    const isPublicPage = pathname === '/' || pathname === '/registro' || pathname === '/register' || pathname.endsWith('/login') || pathname === '/superadminlogin' || pathname.endsWith('/reserve') || pathname.endsWith('/verificar') || pathname.includes('/confirm');

    // The tenant main calendar page is a full self-contained shell — no external chrome needed
    const pathParts2 = pathname.split('/').filter(Boolean);
    const isTenantCalendarRoot = pathParts2.length === 1 && !['registro', 'register', 'superadminlogin', 'login'].includes(pathParts2[0]);

    useEffect(() => {
        const pathParts = pathname.split('/').filter(Boolean);
        const isMainDomain = pathname === '/' || pathname === '/superadminlogin';
        
        let title = 'booklysharp';
        if (!isMainDomain) {
            title = settings.appTitle || (pathParts[0] && pathParts[0] !== 'api' ? pathParts[0].toUpperCase() : 'booklysharp');
        }

        if (typeof document !== 'undefined') {
            document.title = title;
        }
    }, [settings.appTitle, settings, pathname]);

    // Apply user-specific or global brand color
    useEffect(() => {
        const primaryColor = user?.primaryColor || settings.brandColor || '#2563EB';
        const primaryLight = `${primaryColor}dd`;

        document.documentElement.style.setProperty('--primary', primaryColor);
        document.documentElement.style.setProperty('--primary-light', primaryLight);
        document.documentElement.style.setProperty('--ring', primaryColor);
        document.documentElement.style.setProperty('--sidebar-primary', primaryColor);
        document.documentElement.style.setProperty('--accent-foreground', primaryColor);
        document.documentElement.style.setProperty('--secondary-foreground', primaryColor);

        // Also update favicon color or other theme-aware elements if needed
        // For now, these CSS variables handle most of the UI
    }, [user?.primaryColor, settings.brandColor]);

    if (authLoading) {
        return null; // Don't show anything while loading session
    }

    if (isNotFound) {
        return (
            <div className="dark min-h-screen w-full bg-slate-950 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full glass-panel p-10 rounded-3xl border-white/10 shadow-2xl">
                    <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl text-primary font-black">domain_disabled</span>
                    </div>
                    <h1 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Business Not Found</h1>
                    <p className="text-slate-400 mb-8 font-medium italic">
                        The agenda you are looking for does not exist or has been disabled.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full py-4 px-6 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
                    >
                        Go to Main Portal
                    </button>
                </div>
            </div>
        );
    }

    if (isPublicPage) {
        return <main className="h-full w-full overflow-y-auto">{children}</main>;
    }

    if (!user) {
        return null; // redirection handled by AuthProvider
    }

    // Security check: Match URL alias with user's tenant alias to ensure absolute isolation
    const pathParts = pathname.split('/').filter(Boolean);
    const currentAlias = pathParts[0];
    const isTenantMismatch = user.role !== 'SUPERADMIN' && user.tenantAlias && currentAlias && user.tenantAlias !== currentAlias;

    if (isTenantMismatch) {
        return (
            <div className="light min-h-screen w-full bg-[#F9FAFB] flex items-center justify-center p-6 text-center font-sans">
                <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                    <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <span className="material-symbols-outlined text-5xl font-black">domain_error</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase leading-tight">Contexto non autorizado</h1>
                    <p className="text-slate-500 mb-10 font-medium leading-relaxed">
                        Estás tentando acceder á axenda de <strong className="text-primary">"{currentAlias}"</strong>, pero os teus permisos están vinculados á axenda de <strong className="text-primary">"{user.tenantAlias}"</strong>.
                    </p>
                    <button
                        onClick={() => window.location.href = `/${user.tenantAlias}`}
                        className="w-full py-5 px-8 rounded-2xl bg-[#2563EB] text-white font-black hover:bg-[#1d4ed8] transition-all shadow-xl shadow-blue-500/20 active:scale-95 uppercase tracking-widest text-sm"
                    >
                        Voltar á miña axenda
                    </button>
                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <button 
                            onClick={() => { localStorage.removeItem('auth_session_user'); window.location.href = `/${currentAlias}/login`; }}
                            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                        >
                            Pechar sesión e cambiar de conta
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Tenant calendar root: self-contained shell — skip NavigationWrapper chrome entirely
    if (isTenantCalendarRoot) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-full w-full">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Mobile Header */}
                <MobileHeader />

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden md:p-0">
                    {children}
                </div>

                {/* Mobile Navigation */}
                <MobileNav />
                <MobileUserBar />

                <GlobalAppointmentDialog />
            </main>
        </div>
    );
}
