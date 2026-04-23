'use client';

import { Menu } from 'lucide-react';
import { useSettings } from '@/context/settings-context';
import { MobileSettingsDialog } from './MobileSettingsDialog';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export function MobileHeader() {
    const { settings } = useSettings();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const appTitle = settings.appTitle || 'booklysharp';
    const logoToUse = mounted && resolvedTheme === 'dark' ? '/logo_booklymo.png' : '/logo_bookly1.png';
    const logoUrl = settings.logoUrl || logoToUse;

    return (
        <header className="flex md:hidden items-center justify-between px-4 py-3 glass-effect border-b border-border sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <img src={logoUrl} alt="Logo" className="h-8 w-auto max-w-[60px] object-contain" />
                <h1 className="font-bold text-lg text-primary line-clamp-1">{appTitle}</h1>
            </div>
            <MobileSettingsDialog />
        </header>
    );
}
