'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';

/* 1. Mapeo de Suscripciones (Fuente de Verdad) */
const PLANS = [
    {
        id: 'Gratis',
        name: 'Gratis',
        price: '0€',
        period: '/mes',
        features: ['1 calendario', '1 mes de historial', 'Soporte básico'],
        mostPopular: false
    },
    {
        id: 'Plan Individual',
        name: 'Plan Individual',
        price: '10€',
        period: '/mes',
        features: ['1 calendario', '4 tipos de reservas', 'WhatsApp integrado'],
        mostPopular: true
    },
    {
        id: 'Plan Profesional',
        name: 'Plan Profesional',
        price: '15€',
        period: '/mes',
        features: ['2 calendarios', '5 tipos de reservas', 'Soporte prioritario'],
        mostPopular: false
    }
];

// Reusable Input Component Defined OUTSIDE to prevent re-renders losing focus
const ChunkInput = ({ label, icon, type = "text", ...props }: any) => (
    <div className="group">
        <label className="block text-sm font-semibold text-[#596064] mb-2">{label}</label>
        <div className="relative">
            {icon && (
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#acb3b7] group-focus-within:text-[#005bc4] transition-colors">
                    {icon}
                </span>
            )}
            <input 
                type={type}
                className={`w-full ${icon ? 'pl-12' : 'px-4'} pr-4 py-3 rounded-xl bg-[#f0f4f7] border-none focus:ring-2 focus:ring-[#005bc4] transition-all text-[#2c3437] font-sans placeholder:text-[#acb3b7] outline-none`}
                {...props}
            />
        </div>
    </div>
);

export default function RegisterWizard() {
    const router = useRouter();
    const { login } = useAuth();
    
    /* 2. State Management for the Wizard */
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form Data - Paso 1 (Admin)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [apellidos, setApellidos] = useState('');
    
    // Form Data - Paso 2 (Negocio)
    const [alias, setAlias] = useState('');
    const [nombreComercial, setNombreComercial] = useState('');
    const [telefono, setTelefono] = useState('');
    const [pais, setPais] = useState('España');
    const [provincia, setProvincia] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [calle, setCalle] = useState('');
    const [numero, setNumero] = useState('');
    const [codigoPostal, setCodigoPostal] = useState('');
    
    // Form Data - Paso 3 (Planes y Facturación)
    const [nivelSuscripcion, setNivelSuscripcion] = useState('Plan Individual');
    const [usarMismaDireccion, setUsarMismaDireccion] = useState(true);
    const [formaPago, setFormaPago] = useState('Tarjeta');
    
    // Direccion facturación opcional
    const [facturacionPais, setFacturacionPais] = useState('España');
    const [facturacionProvincia, setFacturacionProvincia] = useState('');
    const [facturacionCiudad, setFacturacionCiudad] = useState('');
    const [facturacionCalle, setFacturacionCalle] = useState('');
    const [facturacionNumero, setFacturacionNumero] = useState('');
    const [facturacionCodigoPostal, setFacturacionCodigoPostal] = useState('');

    const handleNext = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (step === 1) {
            setLoading(true);
            try {
                const res = await fetch('/api/auth/check-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (data.exists) {
                    toast.error('Este correo electrónico ya está registrado como propietario de otro negocio.');
                    setLoading(false);
                    return;
                }
            } catch (err) {
                toast.error('Error de red al validar el correo.');
                setLoading(false);
                return;
            }
            setLoading(false);
        }

        if (step === 2) {
             setLoading(true);
             try {
                const res = await fetch('/api/auth/check-alias', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ alias })
                });
                const data = await res.json();
                if (data.exists) {
                    toast.error('Este subdominio ya ha sido registrado. Por favor, elige uno diferente.');
                    setLoading(false);
                    return;
                }
            } catch (err) {
                toast.error('Error de red al validar el subdominio.');
                setLoading(false);
                return;
            }
            setLoading(false);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(step + 1);
    };

    const handleBack = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(step - 1);
    };

    /* 4. Conexión Final (Submit) */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = {
                email, password, name, apellidos,
                alias, nombre_comercial: nombreComercial, telefono,
                pais, provincia, ciudad, calle, numero, codigo_postal: codigoPostal,
                facturacion_pais: usarMismaDireccion ? pais : facturacionPais,
                facturacion_provincia: usarMismaDireccion ? provincia : facturacionProvincia,
                facturacion_ciudad: usarMismaDireccion ? ciudad : facturacionCiudad,
                facturacion_calle: usarMismaDireccion ? calle : facturacionCalle,
                facturacion_numero: usarMismaDireccion ? numero : facturacionNumero,
                facturacion_codigo_postal: usarMismaDireccion ? codigoPostal : facturacionCodigoPostal,
                forma_de_pago: formaPago,
                nivel_de_suscripcion: nivelSuscripcion
            };

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Registro con éxito. Revisa tu email para activar la cuenta.');
                router.push(`/login`);
            } else {
                toast.error(data.error || 'Error al crear la cuenta');
            }
        } catch (error) {
            toast.error('Error de red al procesar el registro');
        } finally {
            setLoading(false);
        }
    };

    // Validaciones básicas de pasos
    const isStep1Valid = email && password.length >= 6 && name;
    const isStep2Valid = nombreComercial && alias && telefono && calle && ciudad && pais;

    return (
        <div className="bg-[#f7f9fb] min-h-screen flex flex-col antialiased font-sans">
            {/* TopNavBar */}
            <header className="fixed top-0 w-full z-50 bg-white border-b border-slate-100 shadow-sm">
                <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto">
                    <div className="text-xl font-bold tracking-tight flex items-center gap-2 font-[Inter]">
                        <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white text-sm font-extrabold shadow-sm">
                            B
                        </div>
                        <span><span className="text-black">Bookly</span><span className="text-[#2563EB]">Sharp</span></span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 pt-16">
                {/* SideNavBar */}
                <aside className="h-screen w-64 hidden lg:flex flex-col sticky top-16 bg-slate-50 text-sm border-r border-[#e3e9ed]">
                    <div className="p-6">
                        <h2 className="text-lg font-extrabold text-[#2c3437]">Progreso</h2>
                        <p className="text-xs text-slate-500 mt-1">Asistente de Onboarding</p>
                    </div>
                    <nav className="p-4 space-y-2">
                        <div className={`flex items-center gap-3 p-3 rounded-lg font-bold transition-all ${step >= 1 ? 'bg-blue-50 text-blue-700' : 'text-[#596064]'}`}>
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: step >= 1 ? "'FILL' 1" : "'FILL' 0" }}>manage_accounts</span>
                            <span>Tus Credenciales</span>
                        </div>
                        <div className={`flex items-center gap-3 p-3 rounded-lg font-bold transition-all ${step >= 2 ? 'bg-blue-50 text-blue-700' : 'text-[#596064]'}`}>
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: step >= 2 ? "'FILL' 1" : "'FILL' 0" }}>business</span>
                            <span>Info de la Empresa</span>
                        </div>
                        <div className={`flex items-center gap-3 p-3 rounded-lg font-bold transition-all ${step >= 3 ? 'bg-blue-50 text-blue-700' : 'text-[#596064]'}`}>
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: step >= 3 ? "'FILL' 1" : "'FILL' 0" }}>credit_card</span>
                            <span>Suscripción</span>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full">
                    {/* Progress Indicator */}
                    <div className="mb-10">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <span className="text-xs font-bold tracking-widest uppercase text-[#005bc4]">PASO {step} DE 3</span>
                                <h1 className="text-3xl font-extrabold text-[#2c3437] mt-1">
                                    {step === 1 && "Tus credenciales de acceso"}
                                    {step === 2 && "Perfil del Negocio"}
                                    {step === 3 && "Suscripción y Facturación"}
                                </h1>
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-sm text-[#596064]">
                                    {step === 1 && "Próximo paso: Perfil del Negocio"}
                                    {step === 2 && "Próximo paso: Suscripción"}
                                    {step === 3 && "Último paso"}
                                </p>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-[#e3e9ed] rounded-full overflow-hidden">
                            <div className={`h-full bg-[#005bc4] rounded-full transition-all duration-500`} style={{ width: `${(step / 3) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Section */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* PASO 1 - CREDENCIALES */}
                            <div className={`transition-all duration-500 ${step === 1 ? 'block animate-in fade-in' : 'hidden'}`}>
                                <section className="bg-white p-8 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-[#eaeff2]">
                                    <h3 className="text-lg font-bold text-[#2c3437] mb-6">Información del Administrador</h3>
                                    <form className="space-y-6" onSubmit={handleNext}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <ChunkInput label="Nombre" placeholder="Ej. Alejandro" value={name} onChange={(e: any) => setName(e.target.value)} required />
                                            <ChunkInput label="Apellidos" placeholder="Ej. García López" value={apellidos} onChange={(e: any) => setApellidos(e.target.value)} required />
                                        </div>
                                        <ChunkInput label="Correo Electrónico" icon="mail" type="email" placeholder="nombre@negocio.com" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
                                        
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-[#596064] mb-2">Contraseña</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#acb3b7] group-focus-within:text-[#005bc4] transition-colors">lock</span>
                                                <input 
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    minLength={6}
                                                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-[#f0f4f7] border-none focus:ring-2 focus:ring-[#005bc4] transition-all text-[#2c3437] font-sans placeholder:text-[#acb3b7] outline-none"
                                                    placeholder="••••••••"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#acb3b7] hover:text-[#596064] transition-colors"
                                                >
                                                    {showPassword ? 'visibility_off' : 'visibility'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6">
                                            <button 
                                                disabled={!isStep1Valid || loading}
                                                className="w-full sm:w-auto px-10 py-3 rounded-xl bg-[#005bc4] text-white font-bold shadow-lg shadow-[#005bc4]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100" 
                                                type="submit"
                                            >
                                                {loading ? 'Validando...' : 'Siguiente: Datos del Negocio'}
                                                {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
                                            </button>
                                        </div>
                                    </form>
                                </section>
                            </div>

                            {/* PASO 2 - NEGOCIO Y DIRECCION */}
                            <div className={`transition-all duration-500 ${step === 2 ? 'block animate-in fade-in' : 'hidden'}`}>
                                <section className="bg-white p-8 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-[#eaeff2]">
                                    <h3 className="text-lg font-bold text-[#2c3437] mb-6">Información General</h3>
                                    <form className="space-y-6" onSubmit={handleNext}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <ChunkInput label="Nombre Comercial" placeholder="Ej. Clínica Dental Smith" value={nombreComercial} onChange={(e: any) => setNombreComercial(e.target.value)} required />
                                            <ChunkInput label="Teléfono del Negocio" placeholder="+34 900 000 000" value={telefono} onChange={(e: any) => setTelefono(e.target.value)} required />
                                        </div>
                                        
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-[#596064] mb-2">Subdominio (Alias Web)</label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#acb3b7] group-focus-within:text-[#005bc4] transition-colors">language</span>
                                                <input 
                                                    type="text"
                                                    value={alias}
                                                    onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                                    required
                                                    className="w-full pl-12 pr-[110px] py-3 rounded-xl bg-[#f0f4f7] border-none focus:ring-2 focus:ring-[#005bc4] transition-all text-[#2c3437] font-mono font-bold placeholder:text-[#acb3b7] outline-none"
                                                    placeholder="clinica-smith"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#acb3b7] font-mono text-sm pointer-events-none">
                                                    .booklysharp.com
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 mt-6 border-t border-[#eaeff2]">
                                            <h3 className="text-lg font-bold text-[#2c3437] mb-6">Dirección Física</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                                <div className="col-span-12 md:col-span-8">
                                                    <ChunkInput label="Calle" value={calle} onChange={(e: any) => setCalle(e.target.value)} required placeholder="Av. de la Constitución" />
                                                </div>
                                                <div className="col-span-12 md:col-span-4">
                                                    <ChunkInput label="Número" value={numero} onChange={(e: any) => setNumero(e.target.value)} required placeholder="12" />
                                                </div>
                                                <div className="col-span-6 md:col-span-4">
                                                    <ChunkInput label="Código Postal" value={codigoPostal} onChange={(e: any) => setCodigoPostal(e.target.value)} required placeholder="28001" />
                                                </div>
                                                <div className="col-span-6 md:col-span-4">
                                                    <ChunkInput label="Ciudad" value={ciudad} onChange={(e: any) => setCiudad(e.target.value)} required placeholder="Madrid" />
                                                </div>
                                                <div className="col-span-12 md:col-span-4 group">
                                                    <label className="block text-sm font-semibold text-[#596064] mb-2">País</label>
                                                    <select 
                                                        value={pais}
                                                        onChange={(e) => setPais(e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl bg-[#f0f4f7] border-none focus:ring-2 focus:ring-[#005bc4] transition-all text-[#2c3437] font-sans appearance-none outline-none"
                                                    >
                                                        <option value="España">España</option>
                                                        <option value="México">México</option>
                                                        <option value="Colombia">Colombia</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
                                            <button 
                                                type="button"
                                                onClick={handleBack}
                                                className="w-full sm:w-auto px-6 py-3 rounded-xl text-[#596064] font-bold hover:bg-[#eaeff2] transition-colors flex items-center justify-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-lg">arrow_back</span> Volver
                                            </button>
                                            <button 
                                                disabled={!isStep2Valid || loading}
                                                className="w-full sm:w-auto px-10 py-3 rounded-xl bg-[#005bc4] text-white font-bold shadow-lg shadow-[#005bc4]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100" 
                                                type="submit"
                                            >
                                                {loading ? 'Validando...' : 'Siguiente: Facturación'}
                                                {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
                                            </button>
                                        </div>
                                    </form>
                                </section>
                            </div>

                            {/* PASO 3 - SUSCRIPCIÓN */}
                            <div className={`transition-all duration-500 ${step === 3 ? 'block animate-in fade-in' : 'hidden'}`}>
                                <section className="bg-transparent space-y-6">
                                    <h3 className="text-lg font-bold text-[#2c3437]">Selecciona tu Plan</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {PLANS.map((plan) => {
                                            const isSelected = nivelSuscripcion === plan.id;
                                            return (
                                                <div 
                                                    key={plan.id}
                                                    onClick={() => setNivelSuscripcion(plan.id)}
                                                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${isSelected ? 'border-[#005bc4] bg-white shadow-xl shadow-[#005bc4]/10 scale-[1.02]' : 'border-transparent bg-white shadow-sm hover:shadow-md'}`}
                                                >
                                                    {plan.mostPopular && (
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#005bc4] text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
                                                            Popular
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col h-full">
                                                        <h4 className="font-bold text-[#2c3437] text-sm mb-2">{plan.name}</h4>
                                                        <div className="flex items-end gap-1 mb-6">
                                                            <span className="text-3xl font-black text-[#005bc4]">{plan.price}</span>
                                                            <span className="text-sm font-medium text-[#acb3b7] mb-1">{plan.period}</span>
                                                        </div>
                                                        <ul className="space-y-3 mt-auto">
                                                            {plan.features.map((feature, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-sm font-medium text-[#596064]">
                                                                    <span className="material-symbols-outlined text-lg opacity-70">check</span>
                                                                    <span className="leading-tight">{feature}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-[#eaeff2] mt-6">
                                        <h3 className="text-lg font-bold text-[#2c3437] mb-6">Método de Facturación</h3>
                                        
                                        <label className="flex items-center gap-4 cursor-pointer group mb-6 p-4 rounded-xl border border-[#eaeff2] hover:bg-[#f7f9fb] transition-colors">
                                            <input 
                                                type="checkbox" 
                                                checked={usarMismaDireccion} 
                                                onChange={() => setUsarMismaDireccion(!usarMismaDireccion)} 
                                                className="w-5 h-5 rounded border-[#acb3b7] text-[#005bc4] focus:ring-[#005bc4] transition-all cursor-pointer" 
                                            />
                                            <span className="font-semibold text-sm text-[#2c3437]">Usar la misma dirección física para facturación</span>
                                        </label>

                                        {!usarMismaDireccion && (
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
                                                <div className="col-span-12 md:col-span-8">
                                                    <ChunkInput label="Calle Facturación" value={facturacionCalle} onChange={(e: any) => setFacturacionCalle(e.target.value)} required />
                                                </div>
                                                <div className="col-span-6 md:col-span-4">
                                                    <ChunkInput label="C.P." value={facturacionCodigoPostal} onChange={(e: any) => setFacturacionCodigoPostal(e.target.value)} required />
                                                </div>
                                                <div className="col-span-6 md:col-span-6">
                                                    <ChunkInput label="Ciudad" value={facturacionCiudad} onChange={(e: any) => setFacturacionCiudad(e.target.value)} required />
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-4 bg-[#f0f4f7] rounded-xl flex items-center justify-between border border-[#e3e9ed]">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-[#005bc4] text-4xl">credit_card</span>
                                                <div>
                                                    <p className="font-bold text-[#2c3437] text-sm">Pago Seguro vía Stripe (Simulación)</p>
                                                    <p className="text-xs text-[#596064]">No se realizarán cargos reales todavía.</p>
                                                </div>
                                            </div>
                                            <span className="material-symbols-outlined text-[#acb3b7]">lock</span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#eaeff2] mt-8">
                                            <button 
                                                type="button"
                                                onClick={handleBack}
                                                disabled={loading}
                                                className="w-full sm:w-auto px-6 py-3 rounded-xl text-[#596064] font-bold hover:bg-[#eaeff2] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-lg">arrow_back</span> Volver
                                            </button>
                                            <button 
                                                disabled={loading}
                                                className="w-full sm:w-auto px-10 py-3 rounded-xl bg-gradient-to-r from-[#005bc4] to-[#4388fd] text-white font-bold shadow-lg shadow-[#005bc4]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100" 
                                                type="submit"
                                            >
                                                {loading ? (
                                                    <span className="flex items-center gap-2">
                                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Configurando...
                                                    </span>
                                                ) : (
                                                    <>
                                                        Completar Registro
                                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </section>
                            </div>

                        </div>

                        {/* Info Sidebar (Dynamic per step) */}
                        <div className="space-y-6">
                            {step === 1 && (
                                <>
                                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-xl text-white shadow-xl shadow-blue-500/10">
                                        <h4 className="text-lg font-bold mb-4">¿Por qué es importante?</h4>
                                        <p className="text-blue-100 text-sm leading-relaxed mb-6">
                                            Tu perfil de administrador es el núcleo de tu cuenta. Configura tus datos ahora para comenzar a gestionar tu agenda profesional con precisión clínica.
                                        </p>
                                        <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-md">
                                            <span className="material-symbols-outlined text-blue-200">security</span>
                                            <span className="text-xs font-medium text-blue-50">Seguridad de grado clínico.</span>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-[#2c3437] mb-2">Privacidad de Datos</h4>
                                        <p className="text-xs text-[#596064] leading-relaxed">Tus datos están protegidos con encriptación de extremo a extremo, cumpliendo con las normativas locales.</p>
                                    </div>
                                </>
                            )}
                            
                            {step === 2 && (
                                <>
                                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-xl text-white shadow-xl shadow-blue-500/10">
                                        <h4 className="text-lg font-bold mb-4">Tu Subdominio</h4>
                                        <p className="text-blue-100 text-sm leading-relaxed mb-6">
                                            El alias web es la dirección única donde tus clientes accederán para reservar su cita. Haz que sea fácil de recordar.
                                        </p>
                                        <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-md">
                                            <span className="material-symbols-outlined text-blue-200">public</span>
                                            <span className="text-xs font-medium text-blue-50 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                                                {alias ? `${alias}.booklysharp.com` : 'tu-negocio.booklysharp.com'}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {step === 3 && (
                                <>
                                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                        <h4 className="text-sm font-bold text-[#2c3437] mb-4">Resumen</h4>
                                        <ul className="space-y-4">
                                            <li className="flex justify-between text-sm">
                                                <span className="text-[#596064]">Administrador:</span>
                                                <span className="font-bold text-[#2c3437]">{name} {apellidos}</span>
                                            </li>
                                            <li className="flex justify-between text-sm">
                                                <span className="text-[#596064]">Clínica:</span>
                                                <span className="font-bold text-[#2c3437]">{nombreComercial || '-'}</span>
                                            </li>
                                            <li className="flex justify-between text-sm">
                                                <span className="text-[#596064]">Dominio:</span>
                                                <span className="font-bold text-[#2c3437]">{alias || '-'}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="w-full py-6 mt-auto bg-white border-t border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-7xl mx-auto">
                    <p className="text-xs text-slate-400">© 2026 BooklySharp. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
