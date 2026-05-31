'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    Rocket,
    Palette,
    Lock,
    Calendar
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

export function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean, onClose?: () => void } = {}) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { settings } = useSettings();
    const { alias } = useParams() as { alias: string };
    const { theme, setTheme } = useTheme();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

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
        <>
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 bg-black/20 z-40" onClick={onClose} />
            )}
            <aside
                className={cn(
                    "flex-col items-center py-8 gap-8 flex-shrink-0 z-50 h-screen transition-colors duration-300 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)]",
                    mobileOpen ? "flex fixed left-0 top-0" : "hidden md:flex sticky top-0"
                )}
                style={{ width: 80 }}
            >
            <div>
              <div className="w-12 h-12 relative flex items-center justify-center rounded-xl shadow-lg shadow-slate-200/50 border border-slate-100 transition-transform hover:scale-105 duration-300 overflow-hidden">
                <img 
                  src="/assets/logo_bookly2.png" 
                  alt="BooklySharp Logo" 
                  className="w-full h-full object-cover"
                />
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



                <div className="flex flex-col items-center gap-2">
                    <button onClick={() => setSettingsOpen(!settingsOpen)} title="Configuración"
                        className="w-12 h-12 flex items-center justify-center rounded-xl transition-all group relative mx-auto"
                        style={{ color: pathname.includes('/settings') ? 'var(--primary)' : 'var(--nav-icon-color, #94a3b8)', background: pathname.includes('/settings') ? 'rgba(var(--primary-rgb),.1)' : 'transparent' }}>
                        <Settings className={cn("h-5 w-5 transition-transform duration-500", settingsOpen ? "rotate-90" : "group-hover:rotate-45")} />
                        <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            Configuración
                        </span>
                    </button>
                    
                    <div className={cn("flex flex-col gap-2 overflow-hidden transition-all duration-300", settingsOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
                        <Link href={`${base}/settings?tab=appearance`} title="Apariencia" className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors group relative">
                            <Palette className="w-4 h-4" />
                            <span className="absolute left-12 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Apariencia</span>
                        </Link>
                        <Link href={`${base}/settings?tab=security`} title="Seguridad" className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors group relative">
                            <Lock className="w-4 h-4" />
                            <span className="absolute left-12 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Seguridad</span>
                        </Link>
                        {isAdmin && (
                            <>
                                <Link href={`${base}/settings?tab=citas`} title="Servicios" className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors group relative">
                                    <CalendarDays className="w-4 h-4" />
                                    <span className="absolute left-12 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Servicios</span>
                                </Link>
                                <Link href={`${base}/settings?tab=horarios`} title="Horarios" className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors group relative">
                                    <Calendar className="w-4 h-4" />
                                    <span className="absolute left-12 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Horarios</span>
                                </Link>
                                <Link href={`${base}/settings?tab=profesionais`} title="Profesionales" className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors group relative">
                                    <Users className="w-4 h-4" />
                                    <span className="absolute left-12 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Profesionales</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <button onClick={() => setIsLogoutOpen(true)} title="Cerrar sesión"
                    className="w-12 h-12 flex items-center justify-center rounded-xl transition-all group relative mx-auto mt-auto"
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
        </>
    );
}
