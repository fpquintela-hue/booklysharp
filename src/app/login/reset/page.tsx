'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSettings } from '@/context/settings-context';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const alias = Array.isArray(params?.alias) ? params.alias[0] : params?.alias as string | undefined;
    const { settings } = useSettings();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const logoToUse = mounted && resolvedTheme === 'dark' ? '/logo_booklymo.png' : '/logo_bookly1.png';
    const logoUrl = settings.logoUrl || logoToUse;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t('reset.error_match'));
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password, alias })
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                toast.success(t('reset.success'));
                setTimeout(() => {
                    router.push(`/${alias}/login`);
                }, 3000);
            } else {
                setError(data.error || t('reset.error'));
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <span className="material-symbols-outlined text-red-500 text-6xl mb-4">error</span>
                    <h1 className="text-2xl font-bold mb-4">{t('reset.error')}</h1>
                    <button onClick={() => router.push(`/${alias}/login`)} className="text-primary font-bold hover:underline">
                        {t('forgot.back_to_login')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="light">
            <div className="bg-[#F9FAFB] min-h-screen w-full flex items-center justify-center font-sans antialiased relative overflow-hidden">
                <div className="absolute inset-0 z-0 bg-grid-slate-200/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"></div>

                <main className="relative z-10 w-full max-w-md px-6 py-8 flex flex-col items-center justify-center">
                    <div className="text-center mb-8 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-3xl shadow-xl mb-6 w-48 h-auto flex items-center justify-center border border-slate-100">
                            <img src={logoUrl} alt="Logo" className="w-full h-auto" />
                        </div>
                        <h1 className="font-display font-black text-4xl leading-tight text-slate-900 tracking-tighter uppercase mb-2">
                            {settings.appTitle || (alias ? alias.toUpperCase() : 'BOOKLYSHARP')}
                        </h1>
                    </div>

                    <div className="bg-[#2563EB] w-full rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl shadow-[#2563EB]/30 border border-white/10">
                        <div className="mb-8 text-center sm:text-left relative z-10">
                            <h2 className="text-3xl font-display font-bold text-white mb-2">{t('reset.title')}</h2>
                            <p className="text-white/80 text-sm font-medium">{success ? t('reset.success') : t('reset.desc')}</p>
                        </div>

                        {!success && (
                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-white/90 uppercase tracking-wider ml-1">
                                        {t('reset.password_new')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-white/60">lock</span>
                                        </div>
                                        <input
                                            className="block w-full pl-11 pr-4 py-4 rounded-2xl bg-white/15 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50 transition-all font-medium"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-white/90 uppercase tracking-wider ml-1">
                                        {t('reset.password_confirm')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-white/60">lock_reset</span>
                                        </div>
                                        <input
                                            className="block w-full pl-11 pr-4 py-4 rounded-2xl bg-white/15 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50 transition-all font-medium"
                                            type="password"
                                            placeholder="••••••••"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-500/20 text-white text-xs rounded-xl border border-red-500/30 text-center font-bold animate-shake">
                                        {error}
                                    </div>
                                )}

                                <button
                                    className="w-full py-4 px-4 rounded-2xl shadow-xl text-sm font-black text-[#2563EB] bg-white hover:bg-slate-50 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest disabled:opacity-50"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? t('settings.processing') : t('reset.button')}
                                </button>
                            </form>
                        )}

                        {success && (
                            <button
                                onClick={() => router.push(`/${alias}/login`)}
                                className="w-full py-4 px-4 rounded-2xl shadow-xl text-sm font-black text-[#2563EB] bg-white hover:bg-slate-50 transition-all duration-300 uppercase tracking-widest mt-4"
                            >
                                {t('forgot.back_to_login')}
                            </button>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
