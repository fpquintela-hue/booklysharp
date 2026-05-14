'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import {
    CalendarDays,
    Users,
    LayoutDashboard,
    BarChart3,
    Globe,
    Settings,
    LogOut,
    HelpCircle,
    Moon,
    Sun,
    Rocket
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { LogoutDialog } from './LogoutDialog';
import { useState } from 'react';
import { DifyChatbot } from './DifyChatbot';
import { OnboardingGuide } from './OnboardingGuide';

function initials(name: string) {
  if (!name) return '??';
  const p = name.trim().split(' ');
  return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : name.slice(0, 2)).toUpperCase();
}

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { settings } = useSettings();
    const { alias } = useParams() as { alias: string };
    const { theme, setTheme } = useTheme();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
    const isIndividualPlan = user?.tenantSubscriptionPlan === 'individual';
    const base = `/${alias}`;

    const navLinks = [
        { href: base,               icon: CalendarDays,    title: 'Calendario',   always: true  },
        { href: `${base}/patients`, icon: Users,           title: 'Clientes',    always: true  },
        { href: `${base}/stats`,    icon: BarChart3,       title: 'Estadísticas', admin: true   },
        { href: `${base}/portal`,   icon: Globe,           title: 'Portal web',   admin: true   },
    ];

    if (!user) return null;

    return (
        <aside
            className="hidden md:flex flex-col items-center py-8 gap-8 flex-shrink-0 z-20 sticky top-0 h-screen transition-colors duration-300 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)]"
            style={{ width: 80 }}
        >
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xl"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary))', opacity: 0.9, boxShadow: '0 4px 14px rgba(var(--primary-rgb),.3)', fontFamily: 'Manrope,sans-serif' }}>
                {(settings.appTitle ?? alias ?? 'A').charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-4">
                {navLinks
                    .filter(l => (l.always || (l.admin && isAdmin)))
                    .map(l => {
                        const Icon = l.icon;
                        const isActive = l.href === base
                            ? pathname === base || pathname === `${base}/`
                            : pathname.startsWith(l.href);

                        return (
                            <Link key={l.href} href={l.href} title={l.title}
                                className="w-12 h-12 flex items-center justify-center rounded-xl transition-all group relative mx-auto"
                                style={isActive
                                    ? { background: 'rgba(var(--primary-rgb),.1)', color: 'var(--primary)' }
                                    : { color: '#94a3b8' }}>
                                <Icon className="h-5 w-5" />
                                <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    {l.title}
                                </span>
                            </Link>
                        );
                    })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col gap-3 items-center">
                <button
                    onClick={() => setIsGuideOpen(true)}
                    title="Primeros Pasos"
                    className="w-12 h-12 flex items-center justify-center rounded-xl transition-all group relative mx-auto"
                    style={{ color: isGuideOpen ? 'var(--primary)' : '#94a3b8', background: isGuideOpen ? 'rgba(var(--primary-rgb),.1)' : 'transparent' }}
                >
                    <Rocket className="h-5 w-5" />
                    <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Primeros Pasos
                    </span>
                </button>

                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    title="Ayuda"
                    className="w-12 h-12 flex items-center justify-center rounded-xl transition-all group relative mx-auto"
                    style={{ color: isChatOpen ? 'var(--primary)' : '#94a3b8', background: isChatOpen ? 'rgba(var(--primary-rgb),.1)' : 'transparent' }}
                >
                    <HelpCircle className="h-5 w-5" />
                    <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Ayuda
                    </span>
                </button>



                <Link href={`${base}/settings`} title="Configuración"
                    className="w-12 h-12 flex items-center justify-center rounded-xl transition-all group relative mx-auto"
                    style={{ color: pathname.includes('/settings') ? 'var(--primary)' : 'var(--nav-icon-color, #94a3b8)', background: pathname.includes('/settings') ? 'rgba(var(--primary-rgb),.1)' : 'transparent' }}>
                    <Settings className="h-5 w-5 group-hover:rotate-45 transition-transform duration-500" />
                    <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Configuración
                    </span>
                </Link>

                <button onClick={() => setIsLogoutOpen(true)} title="Cerrar sesión"
                    className="w-12 h-12 flex items-center justify-center rounded-xl transition-all group relative mx-auto"
                    style={{ color: '#ef4444' }}>
                    <LogOut className="h-5 w-5" />
                    <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Cerrar sesión
                    </span>
                </button>

                {/* User avatar */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary))', opacity: 0.9 }}>
                    {initials(user?.name ?? '')}
                </div>
            </div>

            <LogoutDialog
                open={isLogoutOpen}
                onOpenChange={setIsLogoutOpen}
                onConfirm={logout}
            />

            {isGuideOpen && <OnboardingGuide alias={alias} onClose={() => setIsGuideOpen(false)} />}
            {isChatOpen && <DifyChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
        </aside>
    );
}
