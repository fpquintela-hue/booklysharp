'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Sun, Moon, Palette, Clock, Monitor, Type,
    MessageSquare, Globe, Check, Laptop, Sparkles, Building2,
    CheckCircle2, AlertCircle, Trash2, ArrowRight, ArrowLeft, Eye, X,
    Mail, MapPin, User as UserIcon, Calendar as CalendarIcon, Phone, ExternalLink, Info,
    LayoutDashboard, Users, Activity, Settings, LogOut, Search, Plus, Store, Zap, TrendingUp,
    MoreVertical
} from 'lucide-react';
import { TenantUsersDialog } from '@/components/TenantUsersDialog';
import { SuperadminSettingsDialog } from '@/components/SuperadminSettingsDialog';
import { SuperadminPasswordDialog } from '@/components/SuperadminPasswordDialog';
import { EvolutionMonitor } from '@/components/superadmin/EvolutionMonitor';
import { SuperadminAnalytics } from '@/components/superadmin/SuperadminAnalytics';
import { motion, AnimatePresence } from 'framer-motion';

// Material Symbols Component (safely)
const MaterialIcon = ({ icon, className = "", fill = false }: { icon: string; className?: string; fill?: boolean }) => (
    <span className={cn("material-symbols-outlined", className)} style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}>
        {icon}
    </span>
);

export default function SuperAdminDashboard() {
    const { user, login, logout, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [tenants, setTenants] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ totalTenants: 0, totalAppointments: 0, totalProfessionals: 0, growth: '0' });
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

    // State for create flow
    const [isCreating, setIsCreating] = useState(false);
    const [isEvolutionMonitor, setIsEvolutionMonitor] = useState(false);
    const [isAnalytics, setIsAnalytics] = useState(false);
    const [isAudit, setIsAudit] = useState(false);
    const [step, setStep] = useState(1);

    // Login state
    const [loginUser, setLoginUser] = useState('');
    const [loginPass, setLoginPass] = useState('');

    // Form data for creation
    const [alias, setAlias] = useState('');
    const [name, setName] = useState('');
    const [aliasError, setAliasError] = useState('');
    const [checkingAlias, setCheckingAlias] = useState(false);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactAddress, setContactAddress] = useState('');
    const [appTitle, setAppTitle] = useState('');
    const [loginText, setLoginText] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('20:00');
    const [gridStep, setGridStep] = useState('30');
    const [primaryColor, setPrimaryColor] = useState('#2563EB');
    const [theme, setTheme] = useState('light');
    const [calendarViewMode, setCalendarViewMode] = useState('vista1');
    const [language, setLanguage] = useState('es');
    const [adminPassword, setAdminPassword] = useState('');
    const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [subscriptionType, setSubscriptionType] = useState('FREE');
    const [billingAddress, setBillingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    // Details Modal
    const [selectedTenant, setSelectedTenant] = useState<any>(null);
    const [tenantToDelete, setTenantToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [openUserDialogTenant, setOpenUserDialogTenant] = useState<any>(null);

    const colors = ['#2563EB', '#7C3AED', '#06B6D4', '#1F2937', '#166534', '#92400e', '#701a75'];

    useEffect(() => {
        if (user && user.role === 'SUPERADMIN') {
            fetchTenants();
            fetchStats();
        }
    }, [user]);

    const fetchTenants = async () => {
        try {
            const res = await fetch('/api/superadmin/tenants');
            if (res.ok) {
                const data = await res.json();
                setTenants(data);
            }
        } catch (error) {
            console.error('Failed to fetch tenants:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/superadmin/stats');
            if (res.ok) setStats(await res.json());
        } catch (e) {}
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await login(loginUser, loginPass);
        setIsLoading(false);
        if (!success) {
            toast.error('Credenciales incorrectas');
        }
    };

    const handleDeleteTenant = async () => {
        if (!tenantToDelete) return;
        
        setIsDeleting(true);
        try {
            const res = await fetch('/api/superadmin/tenants', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: tenantToDelete.id })
            });
            if (res.ok) {
                toast.success('Negocio eliminado correctamente');
                setTenantToDelete(null);
                fetchTenants();
                fetchStats();
            } else {
                toast.error('Error al eliminar negocio');
            }
        } catch (err) {
            toast.error('Error al eliminar negocio');
        } finally {
            setIsDeleting(false);
        }
    };

    const resetCreation = () => {
        setIsCreating(false);
        setIsEvolutionMonitor(false);
        setIsAnalytics(false);
        setIsAudit(false);
        setStep(1);
        setAlias('');
        setName('');
        setAdminPassword('');
        setAdminPasswordConfirm('');
        setPasswordError('');
    };

    const handleEnterTenant = async (alias: string) => {
        try {
            await fetch('/api/superadmin/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantAlias: alias, adminUser: user?.email || 'Superadmin' })
            });
        } catch (e) {}

        logout();
        toast.info('Cerrando sesión de superadmin...');
        setTimeout(() => {
            router.push(`/${alias}/login`);
        }, 800);
    };

    const handleUpdateLimit = async (id: string, field: string, value: any) => {
        try {
            const res = await fetch('/api/superadmin/tenants', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, [field]: value })
            });
            if (res.ok) {
                toast.success('Dato actualizado');
                fetchTenants(); 
            }
        } catch (err) {
            toast.error('Error al actualizar');
        }
    };

    const handleSubscriptionAction = async (tenant: any, action: 'suspend' | 'reactivate') => {
        let expiresAt = new Date();
        if (action === 'suspend') {
            expiresAt.setDate(expiresAt.getDate() - 1); // Yesterday
        } else {
            expiresAt.setDate(expiresAt.getDate() + 15); // 15 Days
        }

        try {
            const res = await fetch('/api/superadmin/tenants', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: tenant.id, 
                    subscriptionExpiresAt: expiresAt.toISOString(),
                    subscriptionType: action === 'reactivate' && (tenant.subscription_status === 'expired' || !tenant.subscription_status) ? 'trial' : 'expired'
                })
            });
            if (res.ok) {
                toast.success(action === 'suspend' ? 'Acceso suspendido' : 'Acceso restaurado (15 días)');
                fetchTenants();
            }
        } catch (e) {
            toast.error('Error al procesar acción');
        }
    };

    const handleCreateTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');

        if (adminPassword.length < 8) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (adminPassword !== adminPasswordConfirm) {
            setPasswordError('Las contraseñas no coinciden.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/superadmin/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alias, name, adminPassword, contactName, contactEmail, contactAddress,
                    appTitle, loginText, startTime, endTime, gridStep,
                    primaryColor, theme, calendarViewMode, language,
                    subscriptionType, billingAddress, paymentMethod
                }),
            });
            if (res.ok) {
                toast.success('Negocio creado con éxito');
                resetCreation();
                fetchTenants();
                fetchStats();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Error al crear negocio');
            }
        } catch (error) {
            toast.error('Error del servidor');
        } finally {
            setIsLoading(false);
        }
    };

    const validateAlias = async (e: React.FormEvent) => {
        e.preventDefault();
        setAliasError('');
        if (!alias || !name) {
            setAliasError('Alias y nombre son obligatorios.');
            return;
        }

        setCheckingAlias(true);
        try {
            const res = await fetch(`/api/superadmin/tenants/check-alias?alias=${alias}`);
            const data = await res.json();
            if (data.available) {
                setStep(2);
            } else {
                setAliasError('Este alias ya está en uso.');
            }
        } catch (error) {
            setAliasError('Error al comprobar disponibilidad.');
        } finally {
            setCheckingAlias(false);
        }
    };

    const sortedTenants = [...tenants].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const filteredTenants = sortedTenants.filter((t: any) => 
        (t.nombre_comercial?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         t.alias?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSort = (key: string) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
        });
    };

    if (authLoading) return null;

    if (!user || user.role !== 'SUPERADMIN') {
        return (
            <div className="min-h-screen bg-[#1F2937] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl">
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-black font-headline text-blue-900 tracking-tighter">METRIC</span>
                            <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></span>
                        </div>
                    </div>
                    <h1 className="text-xl font-bold text-center mb-8 text-slate-800">SuperAdmin Access</h1>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-slate-400 ml-1">Username</Label>
                            <Input 
                                className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:ring-blue-500/20" 
                                value={loginUser} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginUser(e.target.value)} required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-slate-400 ml-1">Password</Label>
                            <Input 
                                type="password" 
                                className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:ring-blue-500/20" 
                                value={loginPass} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginPass(e.target.value)} required 
                            />
                        </div>
                        <Button type="submit" className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold transition-all shadow-lg shadow-blue-500/20" disabled={isLoading}>
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </Button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex bg-[#faf8ff] text-[#191b23] min-h-screen font-body selection:bg-[#dbe1ff] selection:text-[#00174b]">
            {/* SideNavBar */}
            <aside className="w-64 fixed left-0 top-0 h-full z-40 border-r border-slate-200/50 bg-slate-50 font-headline font-medium flex flex-col antialiased">
                <div className="p-8">
                    <motion.div initial={{ x: -10 }} animate={{ x: 0 }} className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold tracking-tight text-blue-900">Metric Admin</h1>
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    </motion.div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Global Infrastructure</p>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <NavItem icon="dashboard" label="Dashboard" active={!isCreating && !isEvolutionMonitor && !isAnalytics && !isAudit} onClick={() => { setIsCreating(false); setIsEvolutionMonitor(false); setIsAnalytics(false); setIsAudit(false); }} />
                    <NavItem icon="domain" label="Tenants" active={!isCreating && !isEvolutionMonitor && !isAnalytics && !isAudit} onClick={() => { setIsCreating(false); setIsEvolutionMonitor(false); setIsAnalytics(false); setIsAudit(false); }} fill />
                    <NavItem icon="chat" label="Monitor WhatsApp" active={isEvolutionMonitor} onClick={() => { setIsEvolutionMonitor(true); setIsCreating(false); setIsAnalytics(false); setIsAudit(false); }} />
                    <NavItem icon="insights" label="Analytics" active={isAnalytics} onClick={() => { setIsAnalytics(true); setIsCreating(false); setIsEvolutionMonitor(false); setIsAudit(false); }} />
                    <SuperadminSettingsDialog trigger={
                        <button className="w-full flex items-center gap-3 px-6 py-4 transition-all duration-300 rounded-2xl group text-slate-400 hover:text-blue-600 hover:bg-blue-50/50">
                            <MaterialIcon icon="settings" className="text-xl transition-transform group-hover:scale-110" />
                            <span className="text-sm tracking-tight text-left">Ajustes Sistema</span>
                        </button>
                    } />
                    <SuperadminPasswordDialog trigger={
                        <button className="w-full flex items-center gap-3 px-6 py-4 transition-all duration-300 rounded-2xl group text-slate-400 hover:text-red-600 hover:bg-red-50/50">
                            <MaterialIcon icon="lock" className="text-xl transition-transform group-hover:scale-110" />
                            <span className="text-sm tracking-tight text-left">Seguridad Global</span>
                        </button>
                    } />
                    <NavItem icon="history" label="Audit Logs" active={isAudit} onClick={() => { setIsAudit(true); setIsAnalytics(false); setIsCreating(false); setIsEvolutionMonitor(false); }} />
                </nav>

                <div className="p-4 mt-auto">
                    {/* Botón inferior duplicado eliminado para evitar confusión */}
                </div>
            </aside>

            {/* Main Content */}
                <main className="flex-1 ml-64 min-h-screen transition-all">
                    {/* Top Header */}
                    <header className="sticky top-0 right-0 flex justify-between items-center px-8 z-30 bg-white/80 backdrop-blur-md w-full h-16 border-b border-slate-200/50">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <MaterialIcon icon="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737686] text-xl" />
                                <input 
                                    className="pl-11 pr-4 py-2 bg-[#f3f3fe] border-none rounded-2xl w-72 focus:ring-2 focus:ring-[#004ac6]/10 text-sm transition-all outline-none" 
                                    placeholder="Search businesses..." 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <nav className="hidden md:flex gap-6 text-sm font-medium">
                                <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Documentation</a>
                                <a href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Support</a>
                            </nav>
                        </div>

                        <div className="flex items-center gap-2">
                            <HeaderAction icon="notifications" />
                            <HeaderAction icon="help_outline" />
                            <div className="h-8 w-px bg-slate-200 mx-2"></div>
                            
                            <div className="flex items-center gap-3 pl-2 group cursor-pointer hover:bg-slate-50 p-1 rounded-xl transition-all">
                                <div className="text-right">
                                    <p className="text-xs font-black leading-none text-slate-800">SuperAdmin</p>
                                    <p className="text-[10px] text-slate-500 font-bold">Global Manager</p>
                                </div>
                                <img 
                                    className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-100 group-hover:ring-blue-400 transition-all" 
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS1ELoXAkaV7DHXB581w2pbgRcNcCIfgeiQGF43v50BybA8MisLxI3uO16y-WysvIXC-qJjyYoGfIIRFuEQuAG233bACwmwIecqcNlX6A4cdxu_lDzbj6B7cNloCdUrIkDcY-YEH9PQ8oIG1vr41bSeTywA7g2HO99GijE8zLy76KsAAcslsnluE61Hts-TI1h_vnuzqLrvDS6BkQCl6hPHMgPFHkvqOGRXmgJMLiQsl5ULfFq48PWIy5hlnYRXZBPIJMygteaVbE"
                                    alt="Admin"
                                />
                                <button 
                                    onClick={logout}
                                    className="text-[#ba1a1a] hover:bg-red-50 p-2 rounded-xl transition-all ml-1"
                                    title="Cerrar Sesión"
                                >
                                    <MaterialIcon icon="logout" className="text-xl" />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Editorial Canvas */}
                    <div className="p-10 max-w-7xl mx-auto space-y-10">
                        {isEvolutionMonitor ? (
                            <EvolutionMonitor />
                        ) : isAnalytics ? (
                            <SuperadminAnalytics tenants={tenants} />
                        ) : isAudit ? (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                <h2 className="text-4xl font-extrabold tracking-tight font-headline text-[#191b23]">Audit Logs Globales</h2>
                                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-[#f3f3fe]/50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Acción</th>
                                                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Usuario</th>
                                                <th className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Detalle</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {[
                                                { date: new Date().toISOString(), action: 'LOGIN_AS_TENANT', user: 'SuperAdmin', detail: 'Ingresó al panel del negocio usando ENTER.' },
                                                { date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), action: 'SUSPEND_TENANT', user: 'System', detail: 'Suspensión automática de tenant expirado.' },
                                                { date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), action: 'CREATE_TENANT', user: 'SuperAdmin', detail: 'Nuevo tenant registrado exitosamente.' },
                                                { date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), action: 'REACTIVATE_TENANT', user: 'SuperAdmin', detail: 'Suscripción extendida por 30 días.' }
                                            ].map((log, i) => (
                                                <tr key={i} className="hover:bg-slate-50">
                                                    <td className="px-8 py-4 text-sm font-medium text-slate-500">{new Date(log.date).toLocaleString()}</td>
                                                    <td className="px-8 py-4">
                                                        <span className="text-[10px] font-black px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase tracking-wider">{log.action}</span>
                                                    </td>
                                                    <td className="px-8 py-4 text-sm font-bold text-slate-700">{log.user}</td>
                                                    <td className="px-8 py-4 text-sm text-slate-600">{log.detail}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        ) : isCreating ? (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                                <div className="flex items-center gap-4 mb-8">
                                    <button onClick={resetCreation} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <h2 className="text-3xl font-extrabold tracking-tight font-headline">Nuevo Negocio</h2>
                                </div>
                                <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-blue-900/5 border border-slate-100">
                                    {/* Existing multi-step form adapted to new aesthetic */}
                                    <StepForm 
                                        step={step} 
                                        setStep={setStep} 
                                        formData={{
                                            alias, setAlias, name, setName, checkingAlias, aliasError, validateAlias,
                                            contactName, setContactName, contactEmail, setContactEmail, contactAddress, setContactAddress,
                                            appTitle, setAppTitle, loginText, setLoginText, startTime, setStartTime, endTime, setEndTime, gridStep, setGridStep,
                                            primaryColor, setPrimaryColor, theme, setTheme, calendarViewMode, setCalendarViewMode, language, setLanguage,
                                            adminPassword, setAdminPassword, adminPasswordConfirm, setAdminPasswordConfirm, passwordError, handleCreateTenant, isLoading
                                        }}
                                        colors={colors}
                                        resetCreation={resetCreation}
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                {/* Hero Header */}
                                <section className="flex justify-between items-end">
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-extrabold tracking-tight font-headline text-[#191b23]">Agendas Registradas</h2>
                                        <p className="text-[#434655] font-medium max-w-md">Gestiona y supervisa todas las unidades de negocio activas dentro del ecosistema Metric.</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <SuperadminSettingsDialog trigger={
                                            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl flex items-center gap-2 hover:bg-slate-50 active:scale-95 transition-all text-sm shadow-sm">
                                                <MaterialIcon icon="tune" className="text-lg" />
                                                Configuración
                                            </button>
                                        } />
                                        <SuperadminPasswordDialog trigger={
                                            <button className="px-6 py-3 bg-white border border-red-100 text-red-500 font-bold rounded-2xl flex items-center gap-2 hover:bg-red-50 active:scale-95 transition-all text-sm shadow-sm">
                                                <MaterialIcon icon="key" className="text-lg" />
                                                Seguridad
                                            </button>
                                        } />
                                        <button 
                                            onClick={() => setIsCreating(true)}
                                            className="px-8 py-3 bg-gradient-to-br from-[#004ac6] to-[#2563eb] text-white font-black rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all text-sm uppercase tracking-tight"
                                        >
                                            <MaterialIcon icon="add_business" className="text-xl" />
                                            Nuevo Negocio
                                        </button>
                                    </div>
                                </section>

                                {/* Stats Bento Grid */}
                                <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <StatCard icon="storefront" label="Total Agendas" value={stats.totalTenants} color="bg-[#dbe1ff]" textColor="text-[#00174b]" />
                                    <StatCard icon="calendar_month" label="Citas Globales" value={stats.totalAppointments.toLocaleString()} color="bg-[#dbe1ff]" textColor="text-[#00174b]" />
                                    <StatCard icon="group" label="Total Staff" value={stats.totalProfessionals} color="bg-[#ffdbcd]" textColor="text-[#360f00]" />
                                    <StatCard icon="trending_up" label="Crecimiento" value={`${stats.growth}%`} color="bg-[#b4c5ff]" textColor="text-[#003ea8]" />
                                </section>

                                {/* Table Section */}
                                <div className="bg-white rounded-3xl border border-slate-200/50 overflow-hidden shadow-2xl shadow-blue-900/5">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse text-left">
                                            <thead>
                                                <tr className="bg-[#f3f3fe]/50 border-b border-slate-100">
                                                    <th className="px-8 py-6 text-[10px] font-black text-[#434655] uppercase tracking-widest">Negocio / Plan</th>
                                                    <th 
                                                        className="px-8 py-6 text-[10px] font-black text-[#434655] uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors"
                                                        onClick={() => handleSort('createdAt')}
                                                    >
                                                        Registro {sortConfig.key === 'createdAt' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                                                    </th>
                                                    <th className="px-8 py-6 text-[10px] font-black text-[#434655] uppercase tracking-widest">Actividad</th>
                                                    <th className="px-8 py-6 text-[10px] font-black text-[#434655] uppercase tracking-widest text-center">Servicios / Límite</th>
                                                    <th className="px-8 py-6 text-[10px] font-black text-[#434655] uppercase tracking-widest text-center">Staff / Límite</th>
                                                    <th className="px-8 py-6 text-[10px] font-black text-[#434655] uppercase tracking-widest text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {filteredTenants.length > 0 ? filteredTenants.map((tenant: any) => {
                                                    const isExpired = ((tenant.subscriptionExpiresAt || tenant.fecha_fin_suscripcion || tenant.expires_at) && new Date(tenant.subscriptionExpiresAt || tenant.fecha_fin_suscripcion || tenant.expires_at) < new Date()) || tenant.subscription_status === 'expired';
                                                    return (
                                                    <tr key={tenant.id} className={cn("transition-colors group", isExpired ? "bg-red-100/40 hover:bg-red-200/40" : "hover:bg-[#f3f3fe]/30")}>
                                                        <td className="px-8 py-6">
                                                            <div className="flex items-center gap-4">
                                                                 <div className="w-10 h-10 rounded-xl bg-[#ededf9] flex items-center justify-center font-bold text-[#004ac6] shadow-inner uppercase">
                                                                    {(tenant.nombre_comercial || tenant.alias || '??').substring(0, 2)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-[#191b23] group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                                                        {tenant.nombre_comercial || tenant.alias}
                                                                        <span className={cn(
                                                                            "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest border",
                                                                            tenant.subscription_status === 'trial' ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                                            tenant.subscription_status === 'expired' ? "bg-red-50 text-red-600 border-red-200" :
                                                                            "bg-green-50 text-green-600 border-green-200"
                                                                        )}>
                                                                            {tenant.subscription_plan || tenant.subscription_status || 'Trial'}
                                                                        </span>
                                                                    </p>
                                                                    <p className="text-[10px] text-[#434655] font-medium mt-0.5 flex gap-2 items-center">
                                                                        <span>/{tenant.alias}</span>
                                                                        {(tenant.subscriptionExpiresAt || tenant.fecha_fin_suscripcion || tenant.expires_at) && (
                                                                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", isExpired ? "text-red-500 bg-red-100/50" : "text-slate-400 bg-slate-100")}>
                                                                                Exp: {new Date(tenant.subscriptionExpiresAt || tenant.fecha_fin_suscripcion || tenant.expires_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className="text-xs font-bold text-slate-700 block">
                                                                {new Date(tenant.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <span className="text-xs font-bold text-slate-600 block">
                                                                {tenant.lastActivity ? new Date(tenant.lastActivity).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-6 text-center w-32">
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex justify-between items-center text-[10px] font-bold">
                                                                    <span className="text-slate-700">{tenant._count?.appointmentTypes || 0}</span>
                                                                    <span className="text-slate-400">/ {tenant.maxAppointmentTypes}</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className={cn("h-full rounded-full transition-all", ((tenant._count?.appointmentTypes || 0) >= tenant.maxAppointmentTypes) ? "bg-red-500" : "bg-blue-500")}
                                                                        style={{ width: `${Math.min(100, ((tenant._count?.appointmentTypes || 0) / Math.max(1, tenant.maxAppointmentTypes)) * 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-center w-32">
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex justify-between items-center text-[10px] font-bold">
                                                                    <span className="text-slate-700">{tenant._count?.professionals || 0}</span>
                                                                    <span className="text-slate-400">/ {tenant.maxProfessionals}</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className={cn("h-full rounded-full transition-all", ((tenant._count?.professionals || 0) >= tenant.maxProfessionals) ? "bg-red-500" : "bg-blue-500")}
                                                                        style={{ width: `${Math.min(100, ((tenant._count?.professionals || 0) / Math.max(1, tenant.maxProfessionals)) * 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-6 text-right">
                                                            <div className="flex justify-end gap-2 items-center">
                                                                <div className="flex border-r border-slate-100 pr-2 mr-2 gap-1">
                                                                    {isExpired ? (
                                                                            <RowAction 
                                                                            icon="lock" 
                                                                            onClick={() => handleSubscriptionAction(tenant, 'reactivate')} 
                                                                            title="Reactivar (15 días)" 
                                                                            danger 
                                                                        />
                                                                    ) : (
                                                                        <RowAction 
                                                                            icon="lock_open" 
                                                                            onClick={() => handleSubscriptionAction(tenant, 'suspend')} 
                                                                            title="Suspender Acceso" 
                                                                            primary 
                                                                        />
                                                                    )}
                                                                </div>
                                                                <RowAction icon="group" onClick={() => setOpenUserDialogTenant(tenant)} title="Users" />
                                                                <RowAction icon="visibility" onClick={() => setSelectedTenant(tenant)} title="View" />
                                                                <RowAction icon="delete" onClick={() => setTenantToDelete({ id: tenant.id, name: tenant.nombre_comercial || tenant.alias || 'Negocio' })} title="Delete" danger />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                                }) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium">
                                                            {searchQuery ? 'No businesses found matching your search.' : 'No businesses registered in the ecosystem.'}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        
                                        {/* Pagination Footer */}
                                        <div className="px-8 py-6 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {filteredTenants.length} of {tenants.length} agendas</p>
                                            <div className="flex gap-2">
                                                <button className="p-2 border border-slate-200 rounded-xl hover:bg-white disabled:opacity-20 shadow-sm" disabled><MaterialIcon icon="chevron_left" /></button>
                                                <button className="px-4 py-2 bg-[#004ac6] text-white rounded-xl font-black text-xs shadow-lg shadow-blue-500/20">1</button>
                                                <button className="px-4 py-2 hover:bg-white rounded-xl font-bold text-xs transition-colors border border-transparent hover:border-slate-200">2</button>
                                                <button className="p-2 border border-slate-200 rounded-xl hover:bg-white shadow-sm"><MaterialIcon icon="chevron_right" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Branding */}
                                <footer className="flex flex-col items-center justify-center pt-10 pb-4 opacity-40 hover:opacity-100 transition-all duration-700 space-y-2 grayscale hover:grayscale-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl font-black font-headline text-blue-900 tracking-tighter">METRIC</span>
                                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#434655]">Intelligent Administration</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400">© 2024 Metric Infrastructure Systems. All rights reserved.</p>
                                </footer>
                            </motion.div>
                        )}
                    </div>
                </main>

                {/* Global Dialogs */}
                <AnimatePresence mode="wait">
                    {selectedTenant && (
                        <TenantDetailModal 
                            key="tenant-detail"
                            tenant={selectedTenant} 
                            onClose={() => setSelectedTenant(null)} 
                            onUpdate={handleUpdateLimit} 
                            onEnter={handleEnterTenant} 
                        />
                    )}
                    {tenantToDelete && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-xl w-full border border-red-100">
                                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6 mx-auto">
                                    <MaterialIcon icon="report_problem" className="text-4xl text-red-600" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-800 text-center mb-2 tracking-tight">¡ATENCIÓN: BORRADO TOTAL!</h3>
                                <div className="p-6 bg-red-50 rounded-2xl border border-red-100 mb-8">
                                    <p className="text-red-800 text-center leading-relaxed font-bold">
                                        Vas a eliminar permanentemente a <span className="uppercase underline">"{tenantToDelete.name}"</span>. 
                                    </p>
                                    <p className="text-red-600 text-center text-sm mt-3 leading-relaxed">
                                        Esta acción <span className="font-black">BORRARÁ PARA SIEMPRE</span>:
                                        <br />• Todos los clientes y su historial.
                                        <br />• Todas las citas (pasadas y futuras).
                                        <br />• Configuración, empleados y servicios.
                                    </p>
                                    <p className="text-slate-500 text-center text-[10px] uppercase font-black mt-4 tracking-widest">
                                        Si el cliente solo quiere cancelar su suscripción, NO lo borres. Deja que caduque para que los datos se conserven.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 h-14 rounded-2xl font-bold border-slate-200" 
                                            onClick={() => setTenantToDelete(null)}
                                            disabled={isDeleting}
                                        >
                                            No, Salir de aquí
                                        </Button>
                                        <Button 
                                            className="flex-1 h-14 rounded-2xl bg-[#ba1a1a] hover:bg-[#93000a] text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-red-500/20"
                                            onClick={handleDeleteTenant}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? 'Borrando...' : 'Borrar TODO Permanentemente'}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-center font-bold">
                                        Solo borra si el cliente ha pedido explícitamente el ejercicio de su derecho al olvido (RGPD).
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <TenantUsersDialog 
                    key="tenant-users"
                    tenant={openUserDialogTenant || {}} 
                    open={!!openUserDialogTenant} 
                    onOpenChange={(open) => !open && setOpenUserDialogTenant(null)} 
                    hideTrigger 
                />
            </div>
    );
}

// Helper Components
const NavItem = ({ icon, label, active = false, fill = false, onClick }: { icon: string; label: string; active?: boolean; fill?: boolean; onClick?: () => void }) => (
    <button 
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-6 py-4 transition-all duration-300 rounded-2xl group",
            active 
                ? "text-[#004ac6] font-bold border-r-4 border-[#004ac6] bg-blue-50 shadow-sm" 
                : "text-slate-400 hover:text-blue-600 hover:bg-blue-50/50"
        )}
    >
        <MaterialIcon icon={icon} fill={active || fill} className={cn("text-xl transition-transform group-hover:scale-110", active && "scale-110")} />
        <span className="text-sm tracking-tight">{label}</span>
    </button>
);

const HeaderAction = ({ icon }: { icon: string }) => (
    <button className="text-slate-400 hover:text-blue-600 transition-all p-2 rounded-xl hover:bg-blue-50">
        <MaterialIcon icon={icon} className="text-2xl" />
    </button>
);

const StatCard = ({ icon, label, value, color, textColor }: { icon: string; label: string; value: string | number; color: string; textColor: string }) => (
    <motion.div whileHover={{ y: -5 }} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 flex items-center gap-5">
        <div className={cn("p-4 rounded-2xl shadow-inner", color, textColor)}>
            <MaterialIcon icon={icon} className="text-3xl" />
        </div>
        <div>
            <p className="text-[10px] text-[#434655] font-black uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-extrabold font-headline leading-none">{value}</p>
        </div>
    </motion.div>
);

const RowAction = ({ icon, onClick, title, danger = false, primary = false }: { icon: string; onClick: () => void; title: string; danger?: boolean; primary?: boolean }) => (
    <button 
        onClick={onClick}
        title={title}
        className={cn(
            "p-2.5 rounded-xl transition-all active:scale-90",
            danger ? "text-[#ba1a1a] hover:bg-red-50" : primary ? "text-[#004ac6] hover:bg-blue-50" : "text-[#434655] hover:bg-slate-100"
        )}
    >
        <MaterialIcon icon={icon} className="text-xl" />
    </button>
);

function StepForm({ step, setStep, formData, colors, resetCreation }: { step: number; setStep: (s: number) => void; formData: any; colors: string[]; resetCreation: () => void }) {
    const { 
        alias, setAlias, name, setName, checkingAlias, aliasError, validateAlias,
        contactName, setContactName, contactEmail, setContactEmail, contactAddress, setContactAddress,
        appTitle, setAppTitle, loginText, setLoginText, startTime, setStartTime, endTime, setEndTime, gridStep, setGridStep,
        primaryColor, setPrimaryColor, theme, setTheme, calendarViewMode, setCalendarViewMode, language, setLanguage,
        adminPassword, setAdminPassword, adminPasswordConfirm, setAdminPasswordConfirm, passwordError, handleCreateTenant, isLoading
    } = formData;

    const StepDot = ({ s }: { s: number }) => (
        <div className={cn(
            "w-3 h-3 rounded-full transition-all duration-500",
            step === s ? "bg-blue-600 w-10 shadow-lg shadow-blue-500/30" : (step > s ? "bg-green-500" : "bg-slate-200")
        )} />
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">Step {step} of 5</p>
                    <h3 className="text-2xl font-bold text-slate-800">
                        {step === 1 && 'Identidad del Negocio'}
                        {step === 2 && 'Contacto Administrativo'}
                        {step === 3 && 'Parámetros del Sistema'}
                        {step === 4 && 'Diseño y Experiencia'}
                        {step === 5 && 'Seguridad de Acceso'}
                    </h3>
                </div>
                <div className="flex gap-3">
                    {[1, 2, 3, 4, 5].map((s: number) => <StepDot key={s} s={s} />)}
                </div>
            </div>

            <div className="min-h-[400px]">
                {step === 1 && (
                    <form onSubmit={validateAlias} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 mb-1"><Building2 className="w-4 h-4" /> Nombre Comercial</Label>
                                <Input
                                    className="h-14 rounded-2xl bg-slate-50 border-none text-lg font-bold px-6 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                                    placeholder="Blue Sky Boutique"
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setName(e.target.value);
                                        if (!appTitle || appTitle === name) setAppTitle(e.target.value);
                                    }}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 mb-1"><Globe className="w-4 h-4" /> Identificador Único (Alias)</Label>
                                <div className="relative">
                                    <Input
                                        className="h-14 rounded-2xl bg-slate-50 border-none text-lg font-mono font-bold pl-6 pr-12 focus:ring-4 focus:ring-blue-500/10 transition-all text-blue-600"
                                        placeholder="bluesky"
                                        value={alias}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                                        required
                                    />
                                    {checkingAlias && <Activity className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-400" />}
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold px-1 italic">Producción: <span className="text-blue-500 underline">metric.sharp/{alias || 'alias'}</span></p>
                            </div>
                        </div>
                        {aliasError && <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
                            <AlertCircle className="w-4 h-4" /> {aliasError}
                        </motion.div>}
                        <div className="flex pt-10 justify-end gap-4 border-t border-slate-50">
                            <Button type="button" variant="ghost" className="h-14 px-8 rounded-2xl font-bold" onClick={resetCreation}>Descartar</Button>
                            <Button type="submit" disabled={checkingAlias} className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 group">
                                {checkingAlias ? 'Verifying...' : 'Next Step'} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase text-slate-400 ml-1">Representante Legal</Label>
                                <Input className="h-14 rounded-2xl bg-slate-50 border-none" placeholder="Nombre completo" value={contactName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactName(e.target.value)} required />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase text-slate-400 ml-1">E-mail Corporativo</Label>
                                <Input type="email" className="h-14 rounded-2xl bg-slate-50 border-none" placeholder="email@negocio.com" value={contactEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactEmail(e.target.value)} required />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase text-slate-400 ml-1">Información de Facturación / Localización</Label>
                            <Input className="h-14 rounded-2xl bg-slate-50 border-none" placeholder="Calle, Ciudad, Provincia..." value={contactAddress} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactAddress(e.target.value)} />
                        </div>
                        <div className="flex pt-10 justify-between items-center border-t border-slate-50">
                            <Button type="button" variant="ghost" className="h-14 px-8 rounded-2xl font-bold" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Atrás</Button>
                            <Button type="submit" className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 group">Continuar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 ml-1"><Type className="w-4 h-4" /> Branding Front-end</Label>
                                    <Input className="h-14 rounded-2xl bg-slate-50 border-none font-bold" placeholder="Axenda Peluquería" value={appTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppTitle(e.target.value)} required />
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 ml-1"><MessageSquare className="w-4 h-4" /> Message Prompt</Label>
                                    <Input className="h-14 rounded-2xl bg-slate-50 border-none" placeholder="Welcome to our portal..." value={loginText} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginText(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 ml-1"><Clock className="w-4 h-4" /> Window Settings</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Open</span>
                                            <Input type="time" className="h-12 rounded-xl bg-slate-50 border-none font-bold" value={startTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Close</span>
                                            <Input type="time" className="h-12 rounded-xl bg-slate-50 border-none font-bold" value={endTime} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase text-slate-400 ml-1">Precision Step (Grid)</Label>
                                    <div className="flex gap-4">
                                        {['30', '60'].map((m: string) => (
                                            <button
                                                key={m} type="button" onClick={() => setGridStep(m)}
                                                className={cn(
                                                    "flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                                    gridStep === m ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                                                )}
                                            >
                                                {m === '60' ? '1 Hour' : '30 Minutes'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex pt-10 justify-between items-center border-t border-slate-50">
                            <Button type="button" variant="ghost" className="h-14 px-8 rounded-2xl font-bold" onClick={() => setStep(2)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                            <Button type="submit" className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 group">Continue <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button>
                        </div>
                    </form>
                )}

                {step === 4 && (
                    <form onSubmit={(e) => { e.preventDefault(); setStep(5); }} className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 ml-1"><Palette className="w-4 h-4" /> Brand Primary Color</Label>
                                    <div className="grid grid-cols-7 gap-3">
                                        {colors.map((c: string) => (
                                            <button
                                                key={c} type="button" onClick={() => setPrimaryColor(c)}
                                                className={cn(
                                                    "aspect-square rounded-xl border-4 transition-all relative group",
                                                    primaryColor === c ? "border-slate-900 scale-110 shadow-xl" : "border-transparent"
                                                )}
                                                style={{ backgroundColor: c }}
                                            >
                                                {primaryColor === c && <div className="absolute inset-0 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 ml-1"><Monitor className="w-4 h-4" /> Default UI Mode</Label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button" onClick={() => setTheme('light')}
                                            className={cn(
                                                "flex-1 py-4 px-6 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all font-bold",
                                                theme === 'light' ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md" : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                                            )}
                                        >
                                            <Sun className="w-4 h-4" /> Light
                                        </button>
                                        <button
                                            type="button" onClick={() => setTheme('dark')}
                                            className={cn(
                                                "flex-1 py-4 px-6 rounded-2xl border-2 flex items-center justify-center gap-3 transition-all font-bold",
                                                theme === 'dark' ? "border-slate-900 bg-slate-900 text-white shadow-xl shadow-black/20" : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                                            )}
                                        >
                                            <Moon className="w-4 h-4" /> Night
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 ml-1"><Globe className="w-4 h-4" /> Language Engine</Label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button" onClick={() => setLanguage('es')}
                                            className={cn(
                                                "flex-1 py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all",
                                                language === 'es' ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-50 bg-slate-50 text-slate-400"
                                            )}
                                        >
                                            Castellano
                                        </button>
                                        <button
                                            type="button" onClick={() => setLanguage('gl')}
                                            className={cn(
                                                "flex-1 py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-[10px] transition-all",
                                                language === 'gl' ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-50 bg-slate-50 text-slate-400"
                                            )}
                                        >
                                            Galego
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 ml-1"><Monitor className="w-4 h-4" /> Dashboard View Style</Label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button" onClick={() => setCalendarViewMode('vista1')}
                                            className={cn(
                                                "flex-1 p-5 rounded-2xl border-2 transition-all group",
                                                calendarViewMode === 'vista1' ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md" : "border-slate-50 bg-slate-50 text-slate-500"
                                            )}
                                        >
                                            <p className="font-black text-[10px] uppercase tracking-widest mb-1">Standard</p>
                                            <p className="text-[10px] opacity-60 font-medium">Spacious & Modern</p>
                                        </button>
                                        <button
                                            type="button" onClick={() => setCalendarViewMode('vista2')}
                                            className={cn(
                                                "flex-1 p-5 rounded-2xl border-2 transition-all",
                                                calendarViewMode === 'vista2' ? "border-blue-500 bg-blue-50 text-blue-600 shadow-md" : "border-slate-50 bg-slate-50 text-slate-500"
                                            )}
                                        >
                                            <p className="font-black text-[10px] uppercase tracking-widest mb-1">Classic</p>
                                            <p className="text-[10px] opacity-60 font-medium">Compact & Dense</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex pt-10 justify-between items-center border-t border-slate-50">
                            <Button type="button" variant="ghost" className="h-14 px-8 rounded-2xl font-bold" onClick={() => setStep(3)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                            <Button type="submit" className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 group">Continue <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button>
                        </div>
                    </form>
                )}

                {step === 5 && (
                    <form onSubmit={handleCreateTenant} className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex flex-col md:flex-row gap-10 items-start">
                            <div className="flex-1 w-full space-y-6">
                                <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl space-y-8 relative overflow-hidden">
                                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                                    <div className="flex items-center gap-5 border-b border-white/10 pb-8 relative z-10">
                                        <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                                            <Building2 className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h4 className="text-3xl font-black tracking-tight">{name}</h4>
                                            <p className="text-blue-400 font-mono text-sm font-black">sharp.metric/{alias}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-8 relative z-10">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">System Admin</p>
                                            <p className="font-bold text-lg">{contactName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">E-mail</p>
                                            <p className="font-bold text-lg text-blue-200">admin</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Work Window</p>
                                            <p className="font-bold text-lg">{startTime}—{endTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Precision</p>
                                            <p className="font-bold text-lg">{gridStep} min</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 w-full space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-xs font-black uppercase text-slate-400 ml-1">System Access Password</Label>
                                    <Input
                                        type="password"
                                        className="h-16 rounded-3xl bg-slate-50 border-none px-8 font-mono text-xl tracking-widest focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                                        placeholder="••••••••"
                                        value={adminPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminPassword(e.target.value)} required
                                    />
                                    <Label className="text-xs font-black uppercase text-slate-400 ml-1">Repeat for Confirmation</Label>
                                    <Input
                                        type="password"
                                        className="h-16 rounded-3xl bg-slate-50 border-none px-8 font-mono text-xl tracking-widest focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                                        placeholder="••••••••"
                                        value={adminPasswordConfirm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminPasswordConfirm(e.target.value)} required
                                    />
                                </div>
                                {passwordError && (
                                    <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3">
                                        <AlertCircle className="w-4 h-4" /> {passwordError}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex pt-10 justify-between items-center border-t border-slate-100">
                            <Button type="button" variant="ghost" className="h-16 px-8 rounded-3xl font-bold" onClick={() => setStep(4)}><ArrowLeft className="w-4 h-4 mr-2" /> Atrás</Button>
                            <Button 
                                type="submit" 
                                disabled={isLoading} 
                                className="h-16 px-12 rounded-[2rem] bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-blue-600/40 transition-all active:scale-95 flex items-center gap-3"
                            >
                                {isLoading ? <Activity className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {isLoading ? 'Generating Infrastructure...' : 'Launch Business Platform'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

function TenantDetailModal({ tenant, onClose, onUpdate, onEnter }: { tenant: any; onClose: () => void; onUpdate: (id: string, field: string, value: any) => void; onEnter: (alias: string) => void }) {
    const [formData, setFormData] = useState({
        nombre_comercial: tenant.nombre_comercial || '',
        telefono: tenant.telefono || '',
        contactName: tenant.contactName || '',
        contactEmail: tenant.contactEmail || '',
        subscriptionType: tenant.subscriptionType || 'FREE',
        maxAppointmentTypes: tenant.maxAppointmentTypes || 0,
        maxProfessionals: tenant.maxProfessionals || 0,
        pais: tenant.pais || '',
        ciudad: tenant.ciudad || '',
        calle: tenant.calle || '',
        forma_de_pago: tenant.forma_de_pago || '',
        datos_de_pago: tenant.datos_de_pago || ''
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateMockData = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/superadmin/generate-mock-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId: tenant.id })
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || 'Datos simulados generados');
            } else {
                toast.error(data.error || 'Error al generar datos');
            }
        } catch (e) {
            toast.error('Error de red al generar datos');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        // We simulate saving all fields through the existing onUpdate prop
        // Normally onUpdate updates one field, but we can do a batch update directly to the API
        try {
            const res = await fetch('/api/superadmin/tenants', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: tenant.id,
                    ...formData,
                    maxAppointmentTypes: Number(formData.maxAppointmentTypes),
                    maxProfessionals: Number(formData.maxProfessionals)
                })
            });
            if (res.ok) {
                toast.success('Datos del tenant guardados con éxito');
                onClose();
                // We'd ideally refresh the list here
                window.location.reload(); 
            } else {
                toast.error('Error al guardar datos');
            }
        } catch(e) {
             toast.error('Error al guardar datos');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl my-auto overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
                <div className="p-8 bg-blue-900 text-white flex justify-between items-center relative overflow-hidden shrink-0">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/50 rounded-full blur-3xl"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shadow-lg">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black font-headline tracking-tighter">Detalles de {tenant.nombre_comercial}</h3>
                            <p className="text-blue-200 text-xs font-black uppercase tracking-widest">ID: {tenant.id.substring(0, 16)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs border-b pb-2">Información Básica</h4>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Nombre Comercial</Label>
                                <Input name="nombre_comercial" value={formData.nombre_comercial} onChange={handleChange} className="h-10 rounded-xl" />
                            </div>
                            <div>
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Representante / Nombre</Label>
                                <Input name="contactName" value={formData.contactName} onChange={handleChange} className="h-10 rounded-xl" />
                            </div>
                            <div>
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Email Contacto</Label>
                                <Input name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="h-10 rounded-xl" />
                            </div>
                            <div>
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Teléfono</Label>
                                <Input name="telefono" value={formData.telefono} onChange={handleChange} className="h-10 rounded-xl" />
                            </div>
                        </div>
                    </div>

                    {/* Subscription Limits */}
                    <div className="space-y-4">
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs border-b pb-2">Suscripción y Límites</h4>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Tipo de Plan</Label>
                                <select name="subscriptionType" value={formData.subscriptionType} onChange={handleChange} className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm">
                                    <option value="FREE">FREE</option>
                                    <option value="PRO">PRO</option>
                                    <option value="ENTERPRISE">ENTERPRISE</option>
                                    <option value="EXPIRED">EXPIRED</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Max Servicios</Label>
                                    <Input type="number" name="maxAppointmentTypes" value={formData.maxAppointmentTypes} onChange={handleChange} className="h-10 rounded-xl" />
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Max Staff</Label>
                                    <Input type="number" name="maxProfessionals" value={formData.maxProfessionals} onChange={handleChange} className="h-10 rounded-xl" />
                                </div>
                            </div>
                            <div className="pt-2">
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Expira en</Label>
                                <div className="h-10 flex items-center px-3 rounded-xl bg-slate-50 font-mono text-sm text-slate-600">
                                    {new Date(tenant.subscriptionExpiresAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address / Billing */}
                    <div className="space-y-4">
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs border-b pb-2">Ubicación y Fiscal</h4>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-[10px] uppercase font-bold text-slate-400">País</Label>
                                <Input name="pais" value={formData.pais} onChange={handleChange} className="h-10 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Ciudad</Label>
                                    <Input name="ciudad" value={formData.ciudad} onChange={handleChange} className="h-10 rounded-xl" />
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Calle / Dirección</Label>
                                    <Input name="calle" value={formData.calle} onChange={handleChange} className="h-10 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Data */}
                    <div className="space-y-4">
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs border-b pb-2">Datos Bancarios / Pago</h4>
                        <div className="space-y-3">
                            <div>
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Forma de Pago (Stripe/Bank)</Label>
                                <Input name="forma_de_pago" value={formData.forma_de_pago} onChange={handleChange} className="h-10 rounded-xl" />
                            </div>
                            <div>
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Datos de Pago (Token / IBAN)</Label>
                                <Input name="datos_de_pago" value={formData.datos_de_pago} onChange={handleChange} className="h-10 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between shrink-0">
                    <div className="flex gap-2">
                        <button onClick={() => onEnter(tenant.alias)} className="px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-all flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" /> Entrar al Panel
                        </button>
                        <button 
                            onClick={handleGenerateMockData} 
                            disabled={isGenerating}
                            className="px-6 py-3 rounded-xl border-2 border-purple-200 text-purple-600 hover:bg-purple-50 font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isGenerating ? <Activity className="w-4 h-4 animate-spin" /> : <MaterialIcon icon="science" className="text-lg" />}
                            {isGenerating ? 'Generando...' : 'Generar Datos Simulados'}
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="rounded-xl h-12 px-6">Cancelar</Button>
                        <Button onClick={handleSave} className="rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700 font-bold">Guardar Cambios</Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
