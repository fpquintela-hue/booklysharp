'use client';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calendar, Users } from 'lucide-react';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, UserPlus, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SettingsDialog } from './SettingsDialog';
import { LogoutDialog } from './LogoutDialog';
import { CommandMenu } from './CommandMenu';
import { useTheme } from 'next-themes';

import { useSettings } from '@/context/settings-context';
import { useTranslation } from '@/hooks/useTranslation';

export function NavBar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { settings } = useSettings();
    const { t } = useTranslation();
    const { resolvedTheme } = useTheme();
    const [isPrefsOpen, setIsPrefsOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const logoToUse = mounted && resolvedTheme === 'dark' ? '/logo_booklymo.png' : '/logo_bookly1.png';
    const logoUrl = settings.logoUrl || logoToUse;

    if (!user) return null;

    const params = useParams();
    const alias = params?.alias as string || '';
    const basePath = alias && alias !== 'login' && alias !== 'superadmin' ? `/${alias}` : '';

    const links = [
        { href: `${basePath}`, label: t('sidebar.calendar'), icon: Calendar },
        { href: `${basePath}/patients`, label: t('sidebar.users'), icon: Users },
    ];

    return (
        <nav className="hidden md:flex glass-effect border-b border-white/20 dark:border-white/5 px-8 py-3 items-center gap-8 sticky top-0 z-50 transition-colors duration-300">
            <div className="flex items-center gap-3 mr-4">
                <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
                <div className="font-bold text-xl text-primary">{settings.appTitle || 'booklysharp'}</div>
            </div>
            {links.map(link => {
                const Icon = link.icon;
                const isActive = link.href === basePath
                    ? pathname === link.href || pathname === `${link.href}/`
                    : pathname.startsWith(link.href);
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.href = link.href;
                        }}
                        className={cn(
                            "flex items-center gap-2 text-sm font-medium transition-all px-3 py-2 rounded-lg",
                            isActive
                                ? "text-primary bg-primary/10 dark:bg-primary/20"
                                : "text-muted-foreground hover:text-primary hover:bg-primary/5 dark:hover:text-primary-foreground dark:hover:bg-primary/10"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {link.label}
                    </Link>
                )
            })}

            {user.role === 'ADMIN' && (
                <Link
                    href={`${basePath}/userapp`}
                    onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `${basePath}/userapp`;
                    }}
                    className={cn(
                        "flex items-center gap-2 text-sm font-medium transition-all px-3 py-2 rounded-lg",
                        pathname === `${basePath}/userapp`
                            ? "text-primary bg-primary/10 dark:bg-primary/20"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/5 dark:hover:text-primary-foreground dark:hover:bg-primary/10"
                    )}
                >
                    <UserPlus className="h-4 w-4" />
                    {t('sidebar.dashboard')}
                </Link>
            )}

            <div className="ml-auto flex items-center gap-4">
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-new-appointment'))}
                    className="mr-2 bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 px-5 py-2 rounded-xl text-sm font-bold tracking-wide transition-all hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                    Nueva Cita
                </button>
                <CommandMenu />
                <SettingsDialog
                    open={isPrefsOpen}
                    onOpenChange={setIsPrefsOpen}
                    trigger={
                        <button
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-primary/5 dark:hover:bg-white/5 transition-colors group border border-transparent hover:border-primary/10"
                        >
                            <div className="text-sm text-muted-foreground group-hover:text-primary dark:group-hover:text-primary-foreground transition-colors">
                                Hola, <span className="font-medium text-primary dark:text-primary-foreground">{user.name}</span>
                            </div>
                            <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary dark:group-hover:text-primary-foreground transition-colors" />
                        </button>
                    }
                />
                <Button variant="ghost" size="sm" onClick={() => setIsLogoutOpen(true)} className="text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20">
                    <LogOut className="h-4 w-4 mr-2" />
                    Salir
                </Button>
                <LogoutDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen} onConfirm={logout} />
            </div>
        </nav>
    );
}
