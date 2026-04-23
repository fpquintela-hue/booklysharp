'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Calendar, Users, UserPlus, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export function MobileNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    if (!user || user.role === 'SUPERADMIN') return null;

    const params = useParams();
    const alias = params?.alias as string || '';
    const basePath = alias ? `/${alias}` : '';

    const tabs = [
        { href: `${basePath}`, label: 'Agenda', icon: Calendar },
        { href: `${basePath}/patients`, label: 'Usuarios', icon: Users },
    ];

    if (user.role === 'ADMIN') {
        tabs.push({ href: `${basePath}/userapp`, label: 'UserApp', icon: UserPlus });
        tabs.push({ href: `${basePath}/stats`, label: 'Stats', icon: BarChart3 });
    }

    return (
        <div className="flex md:hidden w-full glass-effect border-b border-border">
            {tabs.map(tab => {
                const isActive = tab.href === basePath
                    ? pathname === tab.href || pathname === `${tab.href}/`
                    : pathname.startsWith(tab.href);
                const Icon = tab.icon;

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-b-2",
                            isActive
                                ? "text-primary border-primary bg-primary/5"
                                : "text-muted-foreground border-transparent hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
