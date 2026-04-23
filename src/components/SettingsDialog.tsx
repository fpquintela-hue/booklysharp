'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/auth-context';
import { userService } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Settings, Moon, Sun, Lock, Palette, Calendar, Check, Bell, MessageCircle, Fingerprint, CalendarDays, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppSettingsPanel } from './AppSettingsPanel';
import { AppointmentTypesPanel } from './AppointmentTypesPanel';
import { ProfessionalsPanel } from './ProfessionalsPanel';
import { ScheduleSettingsPanel } from './ScheduleSettingsPanel';
import { CustomNotificationsPanel } from './CustomNotificationsPanel';
import { WhatsAppSettingsPanel } from './WhatsAppSettingsPanel';
import { BookingAdvancePanel } from './BookingAdvancePanel';
import { useSettings } from '@/context/settings-context';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

interface SettingsDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function SettingsDialog({ open: controlledOpen, onOpenChange: controlledOnOpenChange, trigger }: SettingsDialogProps) {
    const { setTheme, theme } = useTheme();
    const { user, updateUser } = useAuth();
    const [internalOpen, setInternalOpen] = useState(false);

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

    const [activeTab, setActiveTab] = useState<'appearance' | 'security' | 'app' | 'horarios' | 'citas' | 'profesionais' | 'email' | 'whatsapp'>('appearance');
    const { settings, refreshSettings } = useSettings();
    const { t, lang } = useTranslation();

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (newPassword !== confirmPassword) {
            toast.error(t('settings.password_error_match'));
            return;
        }

        if (newPassword.length < 4) {
            toast.error(t('settings.password_error_length'));
            return;
        }

        // Mock verification of current password
        // In a real app, the server would handle this.
        if (user.password && user.password !== currentPassword) {
            toast.error(t('settings.password_error_current'));
            return;
        }

        setLoading(true);
        try {
            await userService.updateUser(user.id, { password: newPassword });
            toast.success(t('settings.password_success'));
            setOpen(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            toast.error(t('settings.error_saving'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <button className="p-3 rounded-xl text-gray-500 hover:bg-white/50 hover:text-primary transition-all dark:text-gray-400 dark:hover:bg-white/10 group">
                        <Settings className="h-6 w-6 group-hover:rotate-45 transition-transform duration-500" />
                    </button>
                )}
            </DialogTrigger>
            <DialogContent
                className="max-w-[95vw] sm:max-w-5xl h-[90vh] p-0 overflow-hidden border-none shadow-2xl flex flex-col"
            >
                <div className="bg-[#fbfcfd] dark:bg-slate-900 h-full flex flex-col sm:flex-row">

                    {/* Sidebar */}
                    <div className="w-full sm:w-56 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col flex-shrink-0">
                        <DialogHeader className="p-6 pb-2 text-left">
                            <DialogTitle className="text-2xl font-bold text-primary dark:text-primary-light">{t('settings.header_title')}</DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">
                                {t('settings.header_desc')}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-1 p-4 overflow-y-auto">
                            <button
                                onClick={() => setActiveTab('appearance')}
                                className={cn(
                                    "flex items-center justify-start gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                                    activeTab === 'appearance'
                                        ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:hover:text-slate-300 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <Palette className="w-4 h-4" />
                                {t('settings.tab_appearance')}
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={cn(
                                    "flex items-center justify-start gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                                    activeTab === 'security'
                                        ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:hover:text-slate-300 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <Lock className="w-4 h-4" />
                                {t('settings.tab_security')}
                            </button>
                            {user?.role === 'ADMIN' && (
                                <button
                                    onClick={() => setActiveTab('app')}
                                    className={cn(
                                        "flex items-center justify-start gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                                        activeTab === 'app'
                                            ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:hover:text-slate-300 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    <Fingerprint className="w-4 h-4" />
                                    {t('settings.tab_app')}
                                </button>
                            )}
                            {user?.role === 'ADMIN' && (
                                <button
                                    onClick={() => setActiveTab('citas')}
                                    className={cn(
                                        "flex items-center justify-start gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                                        activeTab === 'citas'
                                            ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:hover:text-slate-300 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    <CalendarDays className="w-4 h-4" />
                                    {t('settings.tab_citas')}
                                </button>
                            )}
                            {user?.role === 'ADMIN' && (
                                <button
                                    onClick={() => setActiveTab('horarios')}
                                    className={cn(
                                        "flex items-center justify-start gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                                        activeTab === 'horarios'
                                            ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:hover:text-slate-300 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    <Calendar className="w-4 h-4" />
                                    {t('settings.tab_horarios')}
                                </button>
                            )}
                            {user?.role === 'ADMIN' && (
                                <button
                                    onClick={() => setActiveTab('profesionais')}
                                    className={cn(
                                        "flex items-center justify-start gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                                        activeTab === 'profesionais'
                                            ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:hover:text-slate-300 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    <Users className="w-4 h-4" />
                                    {t('settings.tab_professionals')}
                                </button>
                            )}
                             {user?.role === 'ADMIN' && (
                                <button
                                    onClick={() => setActiveTab('email')}
                                    className={cn(
                                        "flex items-center justify-start gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                                        activeTab === 'email'
                                            ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:hover:text-slate-300 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    <Bell className="w-4 h-4" />
                                    Email
                                </button>
                            )}
                            {user?.role === 'ADMIN' && (
                                <button
                                    onClick={() => setActiveTab('whatsapp')}
                                    className={cn(
                                        "flex items-center justify-start gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                                        activeTab === 'whatsapp'
                                            ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 dark:hover:text-slate-300 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col bg-white dark:bg-slate-900">

                        {activeTab === 'appearance' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('settings.tab_appearance')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.appearance_desc')}</p>
                                </div>
                                <div className="space-y-4 pt-2 flex flex-col items-center text-center">
                                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tema</Label>
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-[60%] mx-auto">
                                        <button
                                            onClick={async () => {
                                                setTheme('light');
                                                if (user) {
                                                    updateUser({ theme: 'light' });
                                                    await userService.updateUser(user.id, { theme: 'light' });
                                                }
                                            }}
                                            className={cn(
                                                "relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group",
                                                theme === 'light'
                                                    ? "border-primary bg-primary/5 text-primary shadow-md"
                                                    : "border-slate-200 dark:border-slate-800 hover:border-primary/50 text-slate-500 dark:text-slate-400"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-3 rounded-full transition-colors",
                                                theme === 'light' ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10"
                                            )}>
                                                <Sun className="h-6 w-6" />
                                            </div>
                                            <span className="font-bold text-sm">{t('settings.theme_light')}</span>
                                            {theme === 'light' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />}
                                        </button>

                                        <button
                                            onClick={async () => {
                                                setTheme('dark');
                                                if (user) {
                                                    updateUser({ theme: 'dark' });
                                                    await userService.updateUser(user.id, { theme: 'dark' });
                                                }
                                            }}
                                            className={cn(
                                                "relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all group",
                                                theme === 'dark'
                                                    ? "border-primary bg-primary/5 text-primary shadow-md"
                                                    : "border-slate-200 dark:border-slate-800 hover:border-primary/50 text-slate-500 dark:text-slate-400"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-3 rounded-full transition-colors",
                                                theme === 'dark' ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10"
                                            )}>
                                                <Moon className="h-6 w-6" />
                                            </div>
                                            <span className="font-bold text-sm">{t('settings.theme_dark')}</span>
                                            {theme === 'dark' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('settings.calendar_style')}</Label>
                                    <div className="grid grid-cols-2 gap-3 w-full max-w-[60%] mx-auto">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (user) {
                                                    updateUser({ calendarViewMode: 'vista1' });
                                                    await userService.updateUser(user.id, { calendarViewMode: 'vista1' });
                                                }
                                                // fallback/also update global? user wants it to be user-specific.
                                                // refreshSettings(); // Keep it for now if other components use it
                                            }}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                                                (user?.calendarViewMode === 'vista1' || !user?.calendarViewMode)
                                                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 text-slate-500'
                                            )}
                                        >
                                            <span className="font-bold text-sm">{t('settings.style_modern')}</span>
                                            <span className="text-[10px] opacity-70 mt-1 text-center">{t('settings.style_modern_desc')}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (user) {
                                                    updateUser({ calendarViewMode: 'vista2' });
                                                    await userService.updateUser(user.id, { calendarViewMode: 'vista2' });
                                                }
                                            }}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                                                user?.calendarViewMode === 'vista2'
                                                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 text-slate-500'
                                            )}
                                        >
                                            <span className="font-bold text-sm">{t('settings.style_classic')}</span>
                                            <span className="text-[10px] opacity-70 mt-1 text-center">{t('settings.style_classic_desc')}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                                    <Label className="text-base font-bold text-slate-700 dark:text-slate-200">{t('settings.language')}</Label>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{t('settings.lang_desc')}</p>
                                    <div className="w-full max-w-[60%] mx-auto">
                                        <Select
                                            value={user?.language || 'es'}
                                            onValueChange={async (val) => {
                                                if (user) {
                                                    updateUser({ language: val });
                                                    await userService.updateUser(user.id, { language: val });
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-full bg-white dark:bg-slate-800">
                                                <SelectValue placeholder="Selecciona un idioma" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                                                <SelectItem value="es" className="rounded-xl my-1">🇪🇸 Español</SelectItem>
                                                <SelectItem value="gl" className="rounded-xl my-1">🇪🇸 Galego</SelectItem>
                                                <SelectItem value="eu" className="rounded-xl my-1">🟢 Euskera</SelectItem>
                                                <SelectItem value="ca" className="rounded-xl my-1">🟡 Català</SelectItem>
                                                <SelectItem value="pt" className="rounded-xl my-1">🇵🇹 Português</SelectItem>
                                                <SelectItem value="fr" className="rounded-xl my-1">🇫🇷 Français</SelectItem>
                                                <SelectItem value="it" className="rounded-xl my-1">🇮🇹 Italiano</SelectItem>
                                                <SelectItem value="de" className="rounded-xl my-1">🇩🇪 Deutsch</SelectItem>
                                                <SelectItem value="pl" className="rounded-xl my-1">🇵🇱 Polski</SelectItem>
                                                <SelectItem value="en" className="rounded-xl my-1">🇬🇧 English</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('settings.primary_color')}</Label>
                                    <div className="grid grid-cols-7 gap-2 w-full max-w-[80%] mx-auto">
                                        {['#2563EB', '#7C3AED', '#06B6D4', '#1F2937', '#166534', '#92400e', '#701a75'].map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={async () => {
                                                    if (user) {
                                                        updateUser({ primaryColor: c });
                                                        await userService.updateUser(user.id, { primaryColor: c });
                                                    }
                                                }}
                                                className={cn(
                                                    "w-full aspect-square rounded-lg border-2 transition-all p-0.5 relative group/color",
                                                    (user?.primaryColor || '#2563EB') === c ? "border-primary scale-110 shadow-lg" : "border-transparent hover:scale-105"
                                                )}
                                            >
                                                <div className="w-full h-full rounded-md shadow-inner" style={{ backgroundColor: c }} />
                                                {(user?.primaryColor || '#2563EB') === c && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-white">
                                                        <Check className="w-3 h-3 drop-shadow-md" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 italic">{t('settings.primary_color_desc')}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'horarios' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 flex-1 flex flex-col">
                                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('settings.tab_horarios')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.blocks_desc')}</p>
                                </div>
                                <div className="pt-2 flex-1 flex flex-col">
                                    <ScheduleSettingsPanel />
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('settings.tab_security')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.security_desc')}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                    <div className="md:col-span-1 space-y-4">
                                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{t('settings.security_account')}</h4>
                                                <p className="text-xs text-slate-500 mt-1">{t('settings.security_account_desc')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <form onSubmit={handlePasswordChange} className="space-y-5">
                                            <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50 space-y-5">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="current" className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('settings.password_current')}</Label>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                            <Input
                                                                id="current"
                                                                type="password"
                                                                className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-primary/20 rounded-xl transition-all"
                                                                placeholder="••••••••"
                                                                value={currentPassword}
                                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="new" className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('settings.password_new')}</Label>
                                                            <div className="relative group">
                                                                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                                <Input
                                                                    id="new"
                                                                    type="password"
                                                                    className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-primary/20 rounded-xl transition-all"
                                                                    placeholder="••••••••"
                                                                    value={newPassword}
                                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="confirm" className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('settings.password_confirm')}</Label>
                                                            <div className="relative group">
                                                                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                                                <Input
                                                                    id="confirm"
                                                                    type="password"
                                                                    className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-primary/20 rounded-xl transition-all"
                                                                    placeholder="••••••••"
                                                                    value={confirmPassword}
                                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="w-full h-11 rounded-xl bg-primary hover:bg-primary-light text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            {t('settings.saving')}
                                                        </div>
                                                    ) : t('settings.password_update_button')}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'citas' && user?.role === 'ADMIN' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 flex-1 flex flex-col">
                                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('settings.tab_citas')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.citas_desc')}</p>
                                </div>
                                <div className="pt-2 flex-1">
                                    <AppointmentTypesPanel />
                                </div>
                            </div>
                        )}

                        {activeTab === 'app' && user?.role === 'ADMIN' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('settings.tab_app')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.app_general_desc')}</p>
                                </div>
                                <div className="pt-2">
                                    <AppSettingsPanel onClose={() => setOpen(false)} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'profesionais' && user?.role === 'ADMIN' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t('settings.tab_professionals')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.professionals_desc')}</p>
                                </div>
                                <div className="pt-2">
                                    <ProfessionalsPanel />
                                </div>
                            </div>
                        )}

                        {activeTab === 'email' && user?.role === 'ADMIN' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 flex-1 flex flex-col">
                                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Configuración de Email</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Configura tu servidor SMTP personalizado para el envío de correos</p>
                                </div>
                                <div className="pt-2 flex-1">
                                    <CustomNotificationsPanel />
                                </div>
                            </div>
                        )}

                        {activeTab === 'whatsapp' && user?.role === 'ADMIN' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 flex-1 flex flex-col">
                                <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">WhatsApp Business</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Vincula tu número y gestiona tu instancia de Evolution API</p>
                                </div>
                                <div className="pt-2 flex-1">
                                    <WhatsAppSettingsPanel />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
