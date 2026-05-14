'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { userService } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export function SecuritySettingsPanel() {
    const { user, logout } = useAuth();
    const { t } = useTranslation();

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

        if (user.password && user.password !== currentPassword) {
            toast.error(t('settings.password_error_current'));
            return;
        }

        setLoading(true);
        try {
            await userService.updateUser(user.id, { password: newPassword });
            toast.success(t('settings.password_success'));
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{t('settings.tab_security')}</h3>
                <p className="text-slate-500 font-medium">{t('settings.security_desc')}</p>
            </div>

            <div className="flex flex-col gap-8 pt-4 max-w-2xl">
                <div>
                    <div className="p-8 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <h4 className="font-black text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{t('settings.security_account')}</h4>
                            <p className="text-[11px] font-medium text-emerald-600/70 dark:text-emerald-400/60 mt-2 leading-relaxed">
                                {t('settings.security_account_desc')}
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 space-y-6 shadow-sm">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('settings.password_current')}</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <Input
                                            type="password"
                                            className="h-14 pl-12 rounded-2xl bg-slate-50/50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 font-bold focus:border-primary/40 focus:ring-0 transition-all"
                                            placeholder="••••••••"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('settings.password_new')}</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                            <Input
                                                type="password"
                                                className="h-14 pl-12 rounded-2xl bg-slate-50/50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 font-bold focus:border-primary/40 focus:ring-0 transition-all"
                                                placeholder="••••••••"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{t('settings.password_confirm')}</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                            <Input
                                                type="password"
                                                className="h-14 pl-12 rounded-2xl bg-slate-50/50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 font-bold focus:border-primary/40 focus:ring-0 transition-all"
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
                                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all active:scale-95"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        {t('settings.saving')}
                                    </div>
                                ) : t('settings.password_update_button')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
