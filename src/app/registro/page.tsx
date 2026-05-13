'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

const FormInput = ({ label, id, className, ...props }: any) => (
    <div className={`group ${className || ''}`}>
        <label className="block text-sm font-medium text-[#596064] mb-2 font-body" htmlFor={id}>{label}</label>
        <input 
            className="w-full px-4 py-3.5 rounded-xl bg-[#f0f4f7] border border-transparent focus:border-[#005bc4] focus:ring-4 focus:ring-[#005bc4]/10 transition-all text-[#2c3437] font-body placeholder:text-[#acb3b7] outline-none" 
            id={id} 
            name={id} 
            {...props} 
        />
    </div>
);

export default function RegisterWizard() {
    const router = useRouter();
    const { login } = useAuth();
    
    /* State Management */
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [successEmail, setSuccessEmail] = useState('');

    // Form Data - Paso 1 (Admin)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [apellidos, setApellidos] = useState('');
    
    // Form Data - Paso 2 (Negocio)
    const [alias, setAlias] = useState('');
    const [nombreComercial, setNombreComercial] = useState('');
    const [telefono, setTelefono] = useState('');
    const [pais, setPais] = useState('es');
    const [provincia, setProvincia] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [calle, setCalle] = useState('');
    const [numero, setNumero] = useState('');
    const [codigoPostal, setCodigoPostal] = useState('');
    
    // Form Data - Paso 3 (Planes y Facturación)
    const [nivelSuscripcion, setNivelSuscripcion] = useState('individual');
    const [usarMismaDireccion, setUsarMismaDireccion] = useState(true);
    const [formaPago, setFormaPago] = useState('Tarjeta');
    
    // Facturación
    const [facturacionPais, setFacturacionPais] = useState('es');
    const [facturacionProvincia, setFacturacionProvincia] = useState('');
    const [facturacionCiudad, setFacturacionCiudad] = useState('');
    const [facturacionCalle, setFacturacionCalle] = useState('');
    const [facturacionNumero, setFacturacionNumero] = useState('');
    const [facturacionCodigoPostal, setFacturacionCodigoPostal] = useState('');
    const [aceptaLegal, setAceptaLegal] = useState(false);

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
                    toast.error('Este correo electrónico ya está registrado.');
                    setLoading(false);
                    return;
                }
            } catch (err) {
                toast.error('Error al validar el correo.');
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
                    toast.error('Este subdominio ya existe.');
                    setLoading(false);
                    return;
                }
            } catch (err) {
                toast.error('Error al validar el subdominio.');
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
                toast.success('Registro completado. Revisa tu email.');
                setSuccessEmail(email);
            } else {
                toast.error(data.error || 'Error al crear la cuenta');
            }
        } catch (error) {
            toast.error('Error de red');
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = email && password.length >= 6 && name;
    const isStep2Valid = nombreComercial && alias && telefono && calle && ciudad && pais;

    if (successEmail) {
        return (
            <div className="bg-[#f7f9fb] min-h-screen flex flex-col antialiased font-sans">
                <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#eaeff2] shadow-sm">
                    <div className="flex justify-between items-center h-16 px-6 max-w-[1400px] mx-auto">
                        <div className="text-xl font-bold tracking-tight text-[#005bc4] font-headline">BooklySharp</div>
                    </div>
                </header>
                <main className="flex-1 flex items-center justify-center p-6 pt-24">
                    <div className="bg-white p-10 rounded-3xl shadow-sm border border-[#eaeff2] max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl text-[#005bc4]">mark_email_read</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#2c3437] mb-4 font-headline">¡Registro Completado!</h2>
                        <p className="text-[#596064] mb-8 leading-relaxed text-sm font-body">
                            Se le ha enviado un email a <strong className="text-[#005bc4] block mt-1 text-base">{successEmail}</strong>
                            <br />
                            Visite su correo para activar la cuenta.
                        </p>
                        <button onClick={() => router.push('/login')} className="w-full px-6 py-3.5 rounded-xl bg-[#005bc4] text-white font-bold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 font-body">
                            Ir al Login <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-[#f7f9fb] min-h-screen flex flex-col selection:bg-[#005bc4]/20 selection:text-[#005bc4]">
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-[#eaeff2] shadow-sm">
                <div className="flex justify-between items-center h-16 px-6 max-w-[1400px] mx-auto">
                    <div className="text-xl font-bold tracking-tight text-[#005bc4] font-headline">BooklySharp</div>
                    <div className="flex items-center gap-4">
                        <button className="text-[#596064] hover:text-[#005bc4] transition-colors h-10 w-10 rounded-full hover:bg-[#f0f4f7] flex items-center justify-center">
                            <span className="material-symbols-outlined">help_outline</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 pt-16 max-w-[1400px] mx-auto w-full">
                <aside className="h-[calc(100vh-4rem)] w-72 hidden lg:flex flex-col sticky top-16 bg-white border-r border-[#eaeff2] font-body">
                    <div className="p-8 pb-4">
                        <h2 className="text-xl font-bold text-[#2c3437] font-headline">Progreso</h2>
                        <p className="text-sm text-[#596064] mt-1">Configuración inicial</p>
                    </div>
                    <nav className="p-4 space-y-1">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${step === 1 ? 'bg-[#005bc4]/10 text-[#005bc4]' : 'text-[#596064]'}`}>
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: step >= 1 ? "'FILL' 1" : "'FILL' 0" }}>manage_accounts</span>
                            <span className="text-sm">Credenciales</span>
                        </div>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${step === 2 ? 'bg-[#005bc4]/10 text-[#005bc4]' : 'text-[#596064]'}`}>
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: step >= 2 ? "'FILL' 1" : "'FILL' 0" }}>business</span>
                            <span className="text-sm">Perfil del Negocio</span>
                        </div>
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${step === 3 ? 'bg-[#005bc4]/10 text-[#005bc4]' : 'text-[#596064]'}`}>
                            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: step >= 3 ? "'FILL' 1" : "'FILL' 0" }}>credit_card</span>
                            <span className="text-sm">Facturación</span>
                        </div>
                    </nav>
                </aside>

                <main className="flex-1 p-6 md:p-10 lg:p-12 w-full max-w-5xl mx-auto">
                    <div className="mb-12">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <span className="text-xs font-bold tracking-widest uppercase text-[#005bc4] font-headline">Paso {step} de 3</span>
                                <h1 className="text-4xl font-extrabold text-[#2c3437] font-headline mt-2">
                                    {step === 1 && "Credenciales de acceso"}
                                    {step === 2 && "Perfil del Negocio"}
                                    {step === 3 && "Suscripción y Facturación"}
                                </h1>
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-sm text-[#596064] font-medium">
                                    {step === 1 ? "Próximo: Perfil" : step === 2 ? "Próximo: Facturación" : "Finalizar"}
                                </p>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-[#e3e9ed] rounded-full overflow-hidden">
                            <div className="h-full bg-[#005bc4] rounded-full transition-all duration-500 ease-out" style={{ width: `${(step / 3) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                        <div className="space-y-10">
                            {step === 1 && (
                                <form onSubmit={handleNext} className="space-y-8 animate-in fade-in duration-500">
                                    <section className="bg-white p-8 md:p-10 rounded-2xl border border-[#eaeff2] shadow-sm">
                                        <h3 className="text-xl font-bold text-[#2c3437] mb-8 font-headline">Información Personal</h3>
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <FormInput label="Nombre" id="name" placeholder="Ej. Alejandro" value={name} onChange={(e: any) => setName(e.target.value)} required />
                                                <FormInput label="Apellidos" id="apellidos" placeholder="Ej. García" value={apellidos} onChange={(e: any) => setApellidos(e.target.value)} required />
                                            </div>
                                            <FormInput label="Email" id="email" type="email" placeholder="nombre@ejemplo.com" value={email} onChange={(e: any) => setEmail(e.target.value)} required />
                                            <div className="group">
                                                <label className="block text-sm font-medium text-[#596064] mb-2 font-body">Contraseña</label>
                                                <div className="relative">
                                                    <input 
                                                        type={showPassword ? "text" : "password"}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required minLength={6}
                                                        className="w-full px-4 py-3.5 rounded-xl bg-[#f0f4f7] border border-transparent focus:border-[#005bc4] focus:ring-4 focus:ring-[#005bc4]/10 transition-all text-[#2c3437] outline-none"
                                                        placeholder="••••••••"
                                                    />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#acb3b7]">
                                                        {showPassword ? 'visibility_off' : 'visibility'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                    <div className="flex justify-end pt-4">
                                        <button type="submit" disabled={!isStep1Valid || loading} className="px-10 py-3.5 rounded-xl bg-[#005bc4] text-white font-semibold shadow-sm hover:bg-[#004fad] transition-all flex items-center gap-2">
                                            {loading ? 'Validando...' : 'Siguiente'} <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleNext} className="space-y-8 animate-in fade-in duration-500">
                                    <section className="bg-white p-8 md:p-10 rounded-2xl border border-[#eaeff2] shadow-sm">
                                        <h3 className="text-xl font-bold text-[#2c3437] mb-8 font-headline">Información General</h3>
                                        <div className="space-y-8">
                                            <FormInput label="Nombre Comercial" id="nombre_comercial" value={nombreComercial} onChange={(e: any) => setNombreComercial(e.target.value)} required placeholder="Nombre de tu clínica" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="group">
                                                    <label className="block text-sm font-medium text-[#596064] mb-2 font-body">Subdominio</label>
                                                    <div className="relative flex items-center">
                                                        <input className="w-full pl-4 pr-[140px] py-3.5 rounded-xl bg-[#f0f4f7] border border-transparent focus:border-[#005bc4] focus:ring-4 focus:ring-[#005bc4]/10 transition-all text-[#2c3437] outline-none font-mono" value={alias} onChange={(e) => setAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} required placeholder="clinica-smith" />
                                                        <span className="absolute right-4 text-sm font-medium text-[#acb3b7]">.booklysharp.com</span>
                                                    </div>
                                                </div>
                                                <FormInput label="Teléfono" id="telefono" value={telefono} onChange={(e: any) => setTelefono(e.target.value)} required placeholder="+34 000 000 000" />
                                            </div>
                                        </div>
                                    </section>
                                    <section className="bg-white p-8 md:p-10 rounded-2xl border border-[#eaeff2] shadow-sm">
                                        <h3 className="text-xl font-bold text-[#2c3437] mb-8 font-headline">Ubicación</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                            <div className="md:col-span-9"><FormInput label="Calle" id="calle" value={calle} onChange={(e: any) => setCalle(e.target.value)} required /></div>
                                            <div className="md:col-span-3"><FormInput label="Nº" id="numero" value={numero} onChange={(e: any) => setNumero(e.target.value)} required /></div>
                                            <div className="md:col-span-4"><FormInput label="C.P." id="cp" value={codigoPostal} onChange={(e: any) => setCodigoPostal(e.target.value)} required /></div>
                                            <div className="md:col-span-4"><FormInput label="Ciudad" id="ciudad" value={ciudad} onChange={(e: any) => setCiudad(e.target.value)} required /></div>
                                            <div className="md:col-span-4">
                                                <label className="block text-sm font-medium text-[#596064] mb-2">País</label>
                                                <select value={pais} onChange={(e) => setPais(e.target.value)} className="w-full px-4 py-3.5 rounded-xl bg-[#f0f4f7] outline-none">
                                                    <option value="es">España</option>
                                                    <option value="mx">México</option>
                                                    <option value="co">Colombia</option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>
                                    <div className="flex justify-between pt-4">
                                        <button type="button" onClick={handleBack} className="px-8 py-3.5 rounded-xl font-semibold text-[#596064] hover:bg-[#e3e9ed] transition-all">Volver</button>
                                        <button type="submit" disabled={!isStep2Valid || loading} className="px-10 py-3.5 rounded-xl bg-[#005bc4] text-white font-semibold shadow-sm hover:bg-[#004fad] transition-all flex items-center gap-2">
                                            {loading ? 'Validando...' : 'Siguiente'} <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                    </div>
                                </form>
                            )}

                            {step === 3 && (
                                <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                                    <section className="space-y-6">
                                        <h3 className="text-xl font-bold text-[#2c3437] font-headline">Elige tu Plan</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {SUBSCRIPTION_PLANS.map((plan) => (
                                                <div key={plan.id} onClick={() => setNivelSuscripcion(plan.id)} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${nivelSuscripcion === plan.id ? 'border-[#005bc4] bg-white shadow-lg' : 'border-transparent bg-white shadow-sm'}`}>
                                                    <h4 className="font-bold text-[#2c3437] mb-2">{plan.name}</h4>
                                                    <p className="text-2xl font-black text-[#005bc4] mb-4">{plan.monthlyPrice === 0 ? 'Gratis' : `${plan.monthlyPrice}€/mes`}</p>
                                                    <ul className="text-xs space-y-2 text-[#596064]">
                                                        {plan.features.slice(0, 3).map((f, i) => <li key={i} className="flex gap-1"><span className="material-symbols-outlined text-sm">check</span>{f}</li>)}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                    <section className="bg-white p-8 md:p-10 rounded-2xl border border-[#eaeff2] shadow-sm">
                                        <h3 className="text-xl font-bold text-[#2c3437] mb-8 font-headline">Facturación</h3>
                                        <label className="flex items-center gap-3 p-4 rounded-xl border border-[#eaeff2] hover:bg-[#f7f9fb] transition-colors cursor-pointer mb-6">
                                            <input type="checkbox" checked={aceptaLegal} onChange={() => setAceptaLegal(!aceptaLegal)} className="w-5 h-5 accent-[#005bc4]" />
                                            <span className="text-sm font-medium text-[#596064]">Acepto los términos y la política de privacidad.</span>
                                        </label>
                                        <div className="p-4 bg-[#f0f4f7] rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3"><span className="material-symbols-outlined text-[#005bc4] text-3xl">credit_card</span><span className="font-bold text-sm">Pago Seguro vía Stripe</span></div>
                                            <span className="material-symbols-outlined text-[#acb3b7]">lock</span>
                                        </div>
                                    </section>
                                    <div className="flex justify-between pt-4">
                                        <button type="button" onClick={handleBack} disabled={loading} className="px-8 py-3.5 rounded-xl font-semibold text-[#596064] hover:bg-[#e3e9ed] transition-all">Volver</button>
                                        <button type="submit" disabled={!aceptaLegal || loading} className="px-10 py-3.5 rounded-xl bg-[#005bc4] text-white font-semibold shadow-sm hover:bg-[#004fad] transition-all flex items-center gap-2">
                                            {loading ? 'Procesando...' : 'Finalizar Registro'} <span className="material-symbols-outlined">check_circle</span>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#005bc4] p-8 rounded-2xl text-white shadow-sm relative overflow-hidden">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                <h4 className="text-xl font-bold font-headline mb-4 relative z-10">¿Sabías que?</h4>
                                <p className="text-white/90 text-sm leading-relaxed mb-8 font-body relative z-10">Tu perfil de negocio es lo primero que verán tus clientes al reservar. Hazlo atractivo.</p>
                                <div className="flex items-center gap-3 p-4 bg-black/10 rounded-xl backdrop-blur-sm relative z-10">
                                    <span className="material-symbols-outlined">shield</span><span className="text-xs font-medium">Tus datos están seguros.</span>
                                </div>
                            </div>
                            {step === 2 && (
                                <div className="bg-white p-6 rounded-2xl border border-[#eaeff2] shadow-sm">
                                    <h4 className="text-sm font-bold text-[#2c3437] font-headline mb-4">Vista previa URL</h4>
                                    <div className="p-3 bg-[#f0f4f7] rounded-lg text-xs font-mono text-[#596064] truncate">https://{alias || 'clinica'}.booklysharp.com</div>
                                </div>
                            )}
                            <div className="rounded-2xl overflow-hidden shadow-sm h-48 bg-[#e3e9ed] relative group">
                                <img alt="Office" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDVAboNaP3-lCYXierqcYGEyzHsfdV_6NBnNembsXKxsum3VJEfVnX2bI5yXH5gBiwt1Li9qSdzTVSu-ZX9gqOPYTYQwsLQ6eRnM466YkCI-kDrRCttZPbChQdbmNR2g_m6VynTorRfR33GJkVQbgG9_r0Yxiw5PzXvzKJXkF0sRJz_hZnmOnK0WkzFUFiAiwTX71dTieYtGevEUPzcBy96M7FhW6HGk_6rZ9-UfEz6D7N1g1WfC_Td6m3we27LJr_Oxnzn-PAncJK" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <footer className="w-full py-8 mt-auto bg-white border-t border-[#eaeff2]">
                <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-[1400px] mx-auto">
                    <p className="font-body text-xs text-[#596064]">© 2026 BooklySharp. All rights reserved.</p>
                    <div className="flex gap-8 mt-4 md:mt-0 text-xs text-[#596064]">
                        <Link href="/terminos">Términos</Link><Link href="/privacidad">Privacidad</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
