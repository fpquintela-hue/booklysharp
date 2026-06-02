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
    Calendar,
    ChevronLeft,
    CreditCard,
    Fingerprint,
    Bell,
    MessageCircle
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
                    "flex-shrink-0 z-50 h-screen transition-all duration-300 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] overflow-hidden",
                    mobileOpen ? "flex fixed left-0 top-0" : "hidden md:flex sticky top-0",
                    settingsOpen ? "w-64 flex-col" : "w-[80px] flex-col items-center py-8 gap-8"
                )}
            >
                {settingsOpen ? (
                    <div className="flex flex-col w-full h-full animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-2 p-6 border-b border-slate-100 dark:border-slate-800">
                            <button onClick={() => setSettingsOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                <ChevronLeft className="w-5 h-5 text-slate-500" />
                            </button>
                            <h2 className="text-lg font-black text-primary tracking-tight uppercase">Configuración</h2>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                            <Link href={`${base}/settings?tab=appearance`} onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all">
                                <Palette className="w-4 h-4" /> Apariencia
                            </Link>
                            <Link href={`${base}/settings?tab=security`} onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all">
                                <Lock className="w-4 h-4" /> Seguridad
                            </Link>
                            {isAdmin && (
                                <>
                                    <Link href={`${base}/settings?tab=subscription`} onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all">
                                        <CreditCard className="w-4 h-4" /> Suscripción
                                    </Link>
                                    <Link href={`${base}/settings?tab=app`} onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all">
                                        <Fingerprint className="w-4 h-4" /> Identidad
                                    </Link>
                                    <Link href={`${base}/settings?tab=citas`} onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all">
                                        <CalendarDays className="w-4 h-4" /> Servicios
                                    </Link>
                                    <Link href={`${base}/settings?tab=horarios`} onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all">
                                        <Calendar className="w-4 h-4" /> Horarios
                                    </Link>
                                    <Link href={`${base}/settings?tab=profesionais`} onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all">
                                        <Users className="w-4 h-4" /> Profesionales
                                    </Link>
                                    <Link href={`${base}/settings?tab=staff`} onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all">
                                        <Users className="w-4 h-4" /> Staff
                                    </Link>
                                    <Link href={`${base}/settings?tab=reminders`} onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all">
                                        <Bell className="w-4 h-4" /> Recordatorios
                                    </Link>
                                    <Link href={`${base}/settings?tab=whatsapp`} onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all">
                                        <MessageCircle className="w-4 h-4" /> WhatsApp
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                ) : (
                    <>
                        <div>
                          <div className="w-12 h-12 relative flex items-center justify-center rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-transform hover:scale-105 duration-300 overflow-hidden">
                            <img src="/assets/logo_bookly2.png" alt="BooklySharp Logo" className="w-full h-full object-cover" />
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
                        <div className="mt-auto flex flex-col gap-3 items-center w-full">
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

                            <button onClick={() => setSettingsOpen(true)} title="Configuración"
                                className="w-12 h-12 flex items-center justify-center rounded-xl transition-all group relative mx-auto"
                                style={{ color: pathname.includes('/settings') ? 'var(--primary)' : 'var(--nav-icon-color, #94a3b8)', background: pathname.includes('/settings') ? 'rgba(var(--primary-rgb),.1)' : 'transparent' }}>
                                <Settings className="h-5 w-5 group-hover:rotate-45 transition-transform duration-500" />
                                <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    Configuración
                                </span>
                            </button>

                            <button onClick={() => setIsLogoutOpen(true)} title="Cerrar sesión"
                                className="w-12 h-12 flex items-center justify-center rounded-xl transition-all group relative mx-auto"
                                style={{ color: '#ef4444' }}>
                                <LogOut className="h-5 w-5" />
                                <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    Cerrar sesión
                                </span>
                            </button>

                            {/* User avatar */}
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold mb-8"
                                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary))', opacity: 0.9 }}>
                                {initials(user?.name ?? '')}
                            </div>
                        </div>
                    </>
                )}
            </aside>

            <LogoutDialog
                open={isLogoutOpen}
                onOpenChange={setIsLogoutOpen}
                onConfirm={logout}
            />

            {isGuideOpen && <OnboardingGuide alias={alias} onClose={() => setIsGuideOpen(false)} />}
            {isChatOpen && <DifyChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
        </>
    );
}
