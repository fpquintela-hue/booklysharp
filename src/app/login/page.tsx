'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Check, BellRing, Users, User, LockKeyhole, ArrowRight, HelpCircle, FileText, Stethoscope, X, Mail } from 'lucide-react';
import ResetPasswordPage from './reset/page';

export default function GlobalLoginPage() {
    const { login, logout, user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResetPath, setIsResetPath] = useState(false);
    const [showForgotDialog, setShowForgotDialog] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [isSendingForgot, setIsSendingForgot] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.has('token')) { setIsResetPath(true); return; }
        
        if (searchParams.has('logout')) {
            logout();
            window.history.replaceState({}, document.title, '/login');
            return;
        }

        if (user) {
            if (user.role === 'SUPERADMIN') {
                router.push('/superadminlogin');
            } else if (user.tenantAlias) {
                router.push(`/${user.tenantAlias}`);
            } else {
                // If they don't have a tenant, they haven't finished registration or their account is orphaned.
                router.push('/registro');
            }
        }
    }, [user, router, logout]);

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    if (isResetPath) return <ResetPasswordPage />;
    if (user) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-medium">Redirigiendo a tu panel...</p>
            </div>
        </div>
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        const success = await login(email, password); // El login hook maneja guardar el usuario.
        if (success) {
            // Se hace redirect desde el context o use effect superior, pero reforzamos aquí
        } else {
            setError('Credenciales inválidas o suscripción inactiva.');
            setIsSubmitting(false);
        }
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSendingForgot(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const data = await res.json();
            if (data.success) { toast.success('Las instrucciones han sido enviadas.'); setShowForgotDialog(false); }
            else { toast.error(data.error || 'Error'); }
        } catch { toast.error('Error de conexión'); }
        finally { setIsSendingForgot(false); }
    };

    return (
        <main className="relative min-h-screen w-full flex overflow-hidden bg-[#f7f9fb] font-sans text-[#2c3437] antialiased">
            {/* Left Side: Visual Narrative & Branding */}
            <section className="relative hidden lg:flex lg:w-3/5 xl:w-2/3 h-screen overflow-hidden">
                <img 
                    alt="Clinical Environment" 
                    className="absolute inset-0 w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIV3y9ktODDYaBaTuInbUNeBrMF907xZ0YHC3SMhNcT92olLME5E6TJC0uUsg7mQwL-el6W4-THcyzMMbdq2YMuKk3Bzm4HI0gDgxynS4nO-j4QHj22w7S1mJeSK4TWDOIndcR_QxsDeriKNHRss8sYeDJZFpYyNKgog_meM6gBuqXBHsyEdS_Cwt8hRakbkPf5kiRVffZ_KMxWcrA2gdPhg2mXQkFEwLN0Ly7Hc8iMratazwEGCXJWpenf_thHrX6B5sGK6h3DAYI"
                />
                {/* Branding Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-16 text-[#f9f8ff]" style={{ background: 'rgba(12, 99, 206, 0.75)', backdropFilter: 'blur(12px)' }}>
                    <div>
                        <div className="mb-12">
                            <img src="/booklysharp_logotb.png" alt="BooklySharp Logo" className="h-12 w-auto" />
                        </div>
                        
                        <div className="max-w-xl">
                            <h1 className="font-sans text-5xl font-bold leading-tight mb-8">
                                Gestión clínica sin complicaciones.
                            </h1>
                            <ul className="space-y-6">
                                <li className="flex items-center gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all group-hover:bg-white/40">
                                        <Check className="text-white text-sm" size={16} />
                                    </div>
                                    <span className="text-lg font-medium">Control de ausencias en tiempo real</span>
                                </li>
                                <li className="flex items-center gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all group-hover:bg-white/40">
                                        <BellRing className="text-white text-sm" size={16} />
                                    </div>
                                    <span className="text-lg font-medium">Recordatorios automáticos</span>
                                </li>
                                <li className="flex items-center gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center transition-all group-hover:bg-white/40">
                                        <Users className="text-white text-sm" size={16} />
                                    </div>
                                    <span className="text-lg font-medium">Gestión multi-profesional</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-white/70">
                        <span className="text-sm font-sans tracking-widest uppercase">BooklySharp System</span>
                        <div className="h-px w-12 bg-white/30"></div>
                        <span className="text-sm font-sans tracking-widest uppercase">Global Access</span>
                    </div>
                </div>
            </section>

            {/* Right Side: Login Functional Interface */}
            <section className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f7f9fb] lg:bg-white lg:shadow-[-20px_0_60px_rgba(0,0,0,0.05)] z-10">
                <div className="w-full max-w-md">
                    {/* Mobile Header (Hidden on LG) */}
                    <div className="lg:hidden flex flex-col items-center mb-10 text-center">
                        <img src="/booklysharp_logo.png?v=1" alt="BooklySharp Logo" className="h-10 w-auto" />
                    </div>

                    {/* Main Card Header */}
                    <header className="mb-10 text-center lg:text-left">
                        <h2 className="font-sans text-3xl font-bold text-[#2c3437] mb-2">Bienvenido</h2>
                        <p className="text-[#596064] text-base leading-relaxed">
                            Añade tus credenciales para acceder a tu entorno.
                        </p>
                    </header>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#2c3437] ml-1" htmlFor="email">Correo Electrónico</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#747c80] group-focus-within:text-[#0c63ce] transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input 
                                    className="block w-full pl-12 pr-4 py-3.5 bg-[#eaeff2] border-transparent focus:border-[#0c63ce] focus:ring-0 rounded-xl text-[#2c3437] placeholder:text-[#747c80] transition-all outline-none" 
                                    id="email" 
                                    name="email" 
                                    placeholder="tunombre@ejemplo.com" 
                                    type="text" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="block text-sm font-semibold text-[#2c3437]" htmlFor="password">Contraseña</label>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#747c80] group-focus-within:text-[#0c63ce] transition-colors">
                                    <LockKeyhole size={20} />
                                </div>
                                <input 
                                    className="block w-full pl-12 pr-12 py-3.5 bg-[#eaeff2] border-transparent focus:border-[#0c63ce] focus:ring-0 rounded-xl text-[#2c3437] placeholder:text-[#747c80] transition-all outline-none" 
                                    id="password" 
                                    name="password" 
                                    placeholder="••••••••••••" 
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button 
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#747c80] hover:text-[#0c63ce] transition-colors" 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Actions Row */}
                        <div className="flex items-center justify-between px-1 py-1">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input 
                                    className="w-5 h-5 rounded border-[#acb3b7] text-[#0c63ce] focus:ring-[#0c63ce]/20 bg-[#eaeff2] transition-all outline-none" 
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                />
                                <span className="text-sm font-medium text-[#596064]">Recordarme</span>
                            </label>
                            <button type="button" className="text-sm font-semibold text-[#0c63ce] hover:text-[#004fad] transition-colors" onClick={() => setShowForgotDialog(true)}>
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        {error && <div className="text-center text-[#a83836] text-sm font-medium">{error}</div>}

                        {/* Primary CTA */}
                        <button 
                            className="w-full text-white py-4 px-6 rounded-xl font-sans font-bold text-lg flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(12,99,206,0.2)] hover:shadow-[0_8px_40px_rgba(12,99,206,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100" 
                            style={{ background: 'linear-gradient(135deg, #0c63ce 0%, #4388fd 100%)' }}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Accediendo...' : 'Entrar al panel'}
                            {!isSubmitting && <ArrowRight size={20} />}
                        </button>
                        
                        <div className="mt-4 text-center">
                            <button type="button" onClick={() => router.push('/registro')} className="text-sm font-semibold text-[#0c63ce] hover:underline">
                                ¿No tienes un negocio aún? Crea tu cuenta
                            </button>
                        </div>
                    </form>

                    {/* Professional Footer */}
                    <footer className="mt-16 pt-8 border-t border-[#dce4e8] flex flex-col items-center">
                        <p className="text-[10px] font-sans tracking-[0.2em] text-[#acb3b7] mb-4 uppercase">Powered by</p>
                        <div className="flex items-center gap-2 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                            <FileText className="text-[#596064]" size={24} />
                            <span className="font-sans font-extrabold text-[#596064] tracking-tighter text-lg uppercase">BooklySharp Corp</span>
                        </div>
                    </footer>
                </div>
            </section>

            {/* Support Floating Bubble (Material Style) - hidden on lg */}
            <div className="fixed bottom-8 right-8 z-50 lg:hidden">
                <button className="w-14 h-14 bg-white shadow-2xl rounded-full flex items-center justify-center text-[#0c63ce] border border-[#acb3b7]/10">
                    <HelpCircle size={28} />
                </button>
            </div>

            {/* Forgot Dialog */}
            {showForgotDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm relative">
                        <button onClick={() => setShowForgotDialog(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer">
                            <X size={24} />
                        </button>
                        <h3 className="font-sans font-bold text-xl mb-2 text-[#2c3437]">Recuperar clave</h3>
                        <p className="text-sm text-[#596064] mb-6">Introduce tu email y te enviaremos instrucciones.</p>
                        <input 
                            className="block w-full px-4 py-3 bg-[#eaeff2] border-transparent focus:border-[#0c63ce] focus:ring-0 rounded-xl text-[#2c3437] placeholder:text-[#747c80] transition-all outline-none mb-4" 
                            placeholder="tu@email.com" 
                            type="email"
                            value={forgotEmail} 
                            onChange={e => setForgotEmail(e.target.value)} 
                        />
                        <button 
                            className="w-full text-white py-3 px-6 rounded-xl font-sans font-bold flex items-center justify-center transition-all" 
                            style={{ background: 'linear-gradient(135deg, #0c63ce 0%, #4388fd 100%)' }}
                            onClick={handleForgotSubmit} 
                            disabled={isSendingForgot}
                        >
                            {isSendingForgot ? 'Enviando...' : 'Enviar instrucciones'}
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
