'use client';

import { useAuth } from '@/context/auth-context';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { LogoutDialog } from './LogoutDialog';

export function MobileUserBar() {
    const { user, logout } = useAuth();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

    if (!user) return null;

    // Get initials for avatar
    const fullName = `${user.name} ${user.apellidos || ''}`.trim();
    const initials = fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    return (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 px-4 py-3 flex items-center justify-between z-50">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 text-[#A11C3B] dark:text-red-200 flex items-center justify-center font-bold text-sm">
                    {initials}
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Hola,</span>
                    <span className="text-sm font-bold text-[#A11C3B] dark:text-red-400 leading-tight">
                        {fullName}
                    </span>
                </div>
            </div>

            <button
                onClick={() => setIsLogoutOpen(true)}
                className="flex items-center gap-2 text-red-600 font-medium text-sm hover:bg-red-50 px-3 py-2 rounded-lg transition-colors dark:hover:bg-red-900/20"
            >
                <LogOut className="h-4 w-4" />
                Salir
            </button>
            <LogoutDialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen} onConfirm={logout} />
        </div>
    );
}
