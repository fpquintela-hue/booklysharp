'use client';

import { useTheme } from 'next-themes';
import { useAuth } from '@/context/auth-context';
import { userService } from '@/lib/mock-service';
import { Check, Square, Monitor, Globe, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/context/settings-context';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function AppearanceSettingsPanel() {
    const { setTheme, theme } = useTheme();
    const { user, updateUser } = useAuth();
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const logoToUse = mounted && theme === 'dark' ? '/logo_booklymo.png' : '/logo_bookly1.png';
    const currentLogoUrl = settings.logoUrl && settings.logoUrl !== '/logo_bookly1.png' && settings.logoUrl !== '/logo_booklymo.png' ? settings.logoUrl : logoToUse;

    const colors = ['#005bc4', '#2563EB', '#7C3AED', '#06B6D4', '#FF69B4', '#166534', '#92400E', '#7e1b2f'];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col w-full h-full">

            {/* TopAppBar Equivalent */}
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-8 border-b border-slate-100 dark:border-slate-800 mb-10 px-2 lg:px-8">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                        <Palette className="w-3 h-3" />
                        Identidad Visual
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[0.9]">
                        Apariencia de la <span className="text-primary">Interfaz</span>
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                        Personaliza cómo se ve tu plataforma, desde el esquema de colores hasta el modo de visualización del calendario.
                    </p>
                </div>
            </header>

            <div className="px-2 lg:px-8 space-y-12 pb-24 max-w-5xl">
                {/* Section: TEMA VISUAL */}
                <section>
                    <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Tema Visual</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* CLARO Card */}
                        <div 
                            className="relative group cursor-pointer"
                            onClick={async () => {
                                setTheme('light');
                                if (user) {
                                    updateUser({ theme: 'light' });
                                    await userService.updateUser(user.id, { theme: 'light' });
                                }
                            }}
                        >
                            <div className={cn(
                                "h-48 rounded-2xl bg-white dark:bg-slate-900 border-2 overflow-hidden flex flex-col p-4 transition-all hover:shadow-md",
                                theme === 'light' ? "border-primary shadow-sm bg-primary/5" : "border-slate-200 dark:border-slate-800"
                            )}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={cn(
                                        "text-sm font-black uppercase tracking-tight",
                                        theme === 'light' ? "text-primary" : "text-slate-700 dark:text-slate-300"
                                    )}>Claro</span>
                                    {theme === 'light' && (
                                        <div className="bg-primary text-white rounded-full p-0.5 flex items-center justify-center">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-auto space-y-2 opacity-80">
                                    <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/80 rounded"></div>
                                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
                                </div>
                            </div>
                        </div>

                        {/* OSCURO Card */}
                        <div 
                            className="relative group cursor-pointer"
                            onClick={async () => {
                                setTheme('dark');
                                if (user) {
                                    updateUser({ theme: 'dark' });
                                    await userService.updateUser(user.id, { theme: 'dark' });
                                }
                            }}
                        >
                            <div className={cn(
                                "h-48 rounded-2xl bg-slate-950 border-2 overflow-hidden flex flex-col p-4 transition-all hover:bg-slate-900",
                                theme === 'dark' ? "border-primary shadow-sm bg-primary/20" : "border-slate-800 dark:border-slate-700"
                            )}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={cn(
                                        "text-sm font-black uppercase tracking-tight",
                                        theme === 'dark' ? "text-primary-foreground" : "text-slate-300"
                                    )}>Oscuro</span>
                                    {theme === 'dark' && (
                                        <div className="bg-primary text-white rounded-full p-0.5 flex items-center justify-center">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                </div>
                                <div className="mt-auto space-y-2 opacity-80">
                                    <div className="h-3 w-2/3 bg-slate-800 rounded"></div>
                                    <div className="h-3 w-full bg-slate-900 rounded"></div>
                                    <div className="h-3 w-1/2 bg-slate-800 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: ESTILO DEL CALENDARIO */}
                <section>
                    <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">{t('settings.calendar_style')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div 
                            className={cn(
                                "relative p-6 rounded-2xl border-2 flex items-center gap-4 transition-all cursor-pointer hover:shadow-sm",
                                (user?.calendarViewMode === 'vista1' || !user?.calendarViewMode) ? "bg-white dark:bg-slate-900 border-primary" : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                            )}
                            onClick={async () => {
                                if (user) {
                                    updateUser({ calendarViewMode: 'vista1' });
                                    await userService.updateUser(user.id, { calendarViewMode: 'vista1' });
                                }
                            }}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                (user?.calendarViewMode === 'vista1' || !user?.calendarViewMode) ? "bg-primary/10 text-primary" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                            )}>
                                <Monitor className="w-5 h-5" />
                            </div>
                            <div className="flex-grow">
                                <h3 className={cn("font-black uppercase tracking-tight", (user?.calendarViewMode === 'vista1' || !user?.calendarViewMode) ? "text-slate-900 dark:text-white" : "text-slate-500")}>MODERNO</h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Bordes redondeados y suaves.</p>
                            </div>
                            {(user?.calendarViewMode === 'vista1' || !user?.calendarViewMode) && (
                                <div className="bg-primary text-white rounded-full p-0.5">
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                            )}
                        </div>

                        {/* CLÁSICA */}
                        <div 
                            className={cn(
                                "relative p-6 rounded-2xl border-2 flex items-center gap-4 transition-all cursor-pointer hover:shadow-sm",
                                user?.calendarViewMode === 'vista2' ? "bg-white dark:bg-slate-900 border-primary" : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                            )}
                            onClick={async () => {
                                if (user) {
                                    updateUser({ calendarViewMode: 'vista2' });
                                    await userService.updateUser(user.id, { calendarViewMode: 'vista2' });
                                }
                            }}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-lg flex items-center justify-center",
                                user?.calendarViewMode === 'vista2' ? "bg-primary/10 text-primary" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                            )}>
                                <Square className="w-5 h-5" />
                            </div>
                            <div className="flex-grow">
                                <h3 className={cn("font-black uppercase tracking-tight", user?.calendarViewMode === 'vista2' ? "text-slate-900 dark:text-white" : "text-slate-500")}>CLÁSICA</h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">Bordes rectos y tradicionales.</p>
                            </div>
                            {user?.calendarViewMode === 'vista2' && (
                                <div className="bg-primary text-white rounded-full p-0.5">
                                    <Check className="w-3.5 h-3.5" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Section: IDIOMA & COLOR PRINCIPAL */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* IDIOMA */}
                    <section>
                        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">{t('settings.language')}</h2>
                        <div className="relative">
                            <Select
                                value={user?.language || 'es'}
                                onValueChange={async (val) => {
                                    if (user) {
                                        updateUser({ language: val });
                                        await userService.updateUser(user.id, { language: val });
                                    }
                                }}
                            >
                                <SelectTrigger className="w-full h-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-sm font-bold">
                                    <div className="flex items-center gap-3">
                                        <Globe className="w-4 h-4 text-slate-400" />
                                        <SelectValue placeholder="Selecciona un idioma" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                                    <SelectItem value="es" className="py-3 px-4 focus:bg-primary/5 font-bold">es Español</SelectItem>
                                    <SelectItem value="en" className="py-3 px-4 focus:bg-primary/5 font-bold">en English</SelectItem>
                                    <SelectItem value="gl" className="py-3 px-4 focus:bg-primary/5 font-bold">gl Galego</SelectItem>
                                    <SelectItem value="eu" className="py-3 px-4 focus:bg-primary/5 font-bold">eu Euskera</SelectItem>
                                    <SelectItem value="ca" className="py-3 px-4 focus:bg-primary/5 font-bold">ca Català</SelectItem>
                                    <SelectItem value="pt" className="py-3 px-4 focus:bg-primary/5 font-bold">pt Português</SelectItem>
                                    <SelectItem value="fr" className="py-3 px-4 focus:bg-primary/5 font-bold">fr Français</SelectItem>
                                    <SelectItem value="it" className="py-3 px-4 focus:bg-primary/5 font-bold">it Italiano</SelectItem>
                                    <SelectItem value="de" className="py-3 px-4 focus:bg-primary/5 font-bold">de Deutsch</SelectItem>
                                    <SelectItem value="pl" className="py-3 px-4 focus:bg-primary/5 font-bold">pl Polski</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </section>

                    {/* COLOR PRINCIPAL */}
                    <section>
                        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">{t('settings.primary_color')}</h2>
                        <div className="flex flex-wrap gap-4 items-center">
                            {colors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={async () => {
                                        if (user) {
                                            updateUser({ primaryColor: c });
                                            await userService.updateUser(user.id, { primaryColor: c });
                                            updateSettings({ primaryColor: c });
                                        }
                                    }}
                                    className={cn(
                                        "w-11 h-11 rounded-full flex items-center justify-center text-white transition-all overflow-hidden relative group",
                                        (user?.primaryColor || '#005bc4') === c ? "ring-4 ring-primary/20 scale-110 shadow-md" : "hover:scale-110 hover:shadow-sm"
                                    )}
                                >
                                    <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: c }} />
                                    {(user?.primaryColor || '#005bc4') === c && (
                                        <Check className="w-4 h-4 drop-shadow-md relative z-10" />
                                    )}
                                </button>
                            ))}
                            
                            {/* Custom Color Picker */}
                            <div className="relative group">
                                <input
                                    type="color"
                                    value={user?.primaryColor || '#005bc4'}
                                    onChange={async (e) => {
                                        const c = e.target.value;
                                        if (user) {
                                            updateUser({ primaryColor: c });
                                            await userService.updateUser(user.id, { primaryColor: c });
                                            updateSettings({ primaryColor: c });
                                        }
                                    }}
                                    className="w-11 h-11 rounded-full border-none p-0 cursor-pointer overflow-hidden appearance-none"
                                    style={{ backgroundColor: 'transparent' }}
                                />
                                {!colors.includes(user?.primaryColor || '') && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="mt-3 text-[10px] font-medium text-slate-400 italic">{t('settings.primary_color_desc')}</p>
                    </section>
                </div>


            </div>
        </div>
    );
}
