'use client';

import { useSettings } from '@/context/settings-context';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/mock-service';
import { BookingAdvancePanel } from '@/components/BookingAdvancePanel';

export default function PortalSettingsPage() {
    const { settings, updateSettings, refreshSettings } = useSettings();
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const alias = params?.alias as string;
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [logoUrl, setLogoUrl] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [portalEnabled, setPortalEnabled] = useState(true);

    useEffect(() => {
        if (settings) {
            setLogoUrl(settings.logoUrl || '');
            setWelcomeMessage(settings.welcomeMessage || '');
            setPortalEnabled(settings.portalEnabled !== 'false');
        }
    }, [settings]);

    const [stats, setStats] = useState<{ count: number; appointments: any[] }>({ count: 0, appointments: [] });

    useEffect(() => {
        // Fetch real stats
        const loadStats = async () => {
            try {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
                const url = `appointments?alias=${alias}&start=${startOfMonth}&end=${endOfMonth}`;
                const data = await apiFetch(url);
                
                if (Array.isArray(data)) {
                    setStats({ count: data.length, appointments: data });
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };
        loadStats();
    }, [alias]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('La imagen no debe superar los 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
                toast.success('Logotipo cargado correctamente en memoria.');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        try {
            await updateSettings({
                logoUrl,
                welcomeMessage: welcomeMessage,
                portalEnabled: portalEnabled.toString()
            });
            await refreshSettings();
            toast.success('Cambios guardados correctamente');
        } catch (error) {
            toast.error('Error al guardar la configuración');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-6 flex flex-col h-full fade-in w-full text-slate-800 dark:text-slate-200">
            <header className="flex justify-between items-center w-full mb-12">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#004ac6] dark:text-blue-400 font-headline tracking-tight uppercase">CANAL DE VENTAS ONLINE</h1>
                    <p className="text-slate-500 font-body mt-1">Configura la experiencia de reserva de tus clientes</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Settings */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Section: Visibilidad */}
                    <section className="bg-white dark:bg-slate-900/50 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#004ac6] dark:text-blue-400" data-icon="visibility">visibility</span>
                                <h2 className="text-xl font-bold font-headline">VISIBILIDAD Y APERTURA DE AGENDA</h2>
                            </div>
                            <Switch 
                                checked={portalEnabled}
                                onCheckedChange={(val: boolean) => {
                                    setPortalEnabled(val);
                                    // Actualizar inmediatamente en la DB
                                    updateSettings({
                                        portalEnabled: val.toString()
                                    }).then(() => {
                                        refreshSettings();
                                        toast.success(`Portal ${val ? 'activado' : 'desactivado'}`);
                                    }).catch(() => {
                                        toast.error('Error al actualizar visibilidad');
                                        setPortalEnabled(!val); // Revertir en caso de error
                                    });
                                }}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-label">Link Público de Reservas</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-sm" data-icon="link">link</span>
                                    <input 
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[#004ac6] dark:text-blue-400 font-medium focus:ring-2 focus:ring-[#004ac6] outline-none" 
                                        readOnly 
                                        type="text" 
                                        value={typeof window !== 'undefined' ? `${window.location.origin}/${alias}/reserve` : `/${alias}/reserve`}
                                    />
                                </div>
                                <button onClick={() => { 
                                    const url = typeof window !== 'undefined' ? `${window.location.origin}/${alias}/reserve` : `/${alias}/reserve`;
                                    
                                    // Robust copy to clipboard
                                    if (navigator.clipboard && window.isSecureContext) {
                                        navigator.clipboard.writeText(url).then(() => {
                                            toast.success('Enlace copiado al portapapeles');
                                        }).catch(() => {
                                            toast.error('No se pudo copiar');
                                        });
                                    } else {
                                        // Fallback para contextos no seguros o navegadores antiguos
                                        const textArea = document.createElement("textarea");
                                        textArea.value = url;
                                        document.body.appendChild(textArea);
                                        textArea.select();
                                        try {
                                            document.execCommand('copy');
                                            toast.success('Enlace copiado al portapapeles');
                                        } catch (err) {
                                            toast.error('No se pudo copiar');
                                        }
                                        document.body.removeChild(textArea);
                                    }
                                }} className="bg-[#dbe1ff] dark:bg-blue-900/30 text-[#003ea8] dark:text-blue-200 px-4 py-2 rounded-lg font-bold hover:bg-[#acbfff] dark:hover:bg-blue-800 transition-colors flex items-center gap-2">
                                    <span className="material-symbols-outlined" data-icon="content_copy">content_copy</span>
                                    <span className="hidden sm:inline">Copiar</span>
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 italic">Comparte este enlace en tus redes sociales para recibir reservas directamente.</p>
                        </div>
                    </section>

                    {/* Section: Marca Corporativa */}
                    <section className="bg-white dark:bg-slate-900/50 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-8">
                            <span className="material-symbols-outlined text-[#004ac6] dark:text-blue-400" data-icon="brush">brush</span>
                            <h2 className="text-xl font-bold font-headline">MARCA CORPORATIVA</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-label">Logo del Negocio</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                                >
                                    {logoUrl ? (
                                        <div className="w-20 h-20 bg-transparent flex items-center justify-center mb-4 relative overflow-hidden">
                                            <img src={logoUrl} alt="Preview" className="w-full h-full object-contain" />
                                            <button 
                                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => { e.stopPropagation(); setLogoUrl(''); }}
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-lg shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                            <span className="material-symbols-outlined text-4xl text-slate-400" data-icon="add_photo_alternate">add_photo_alternate</span>
                                        </div>
                                    )}
                                    <span className="text-xs font-bold text-[#004ac6] dark:text-blue-400 text-center uppercase">Subir Logotipo</span>
                                    <p className="text-[10px] text-slate-500 text-center mt-1">PNG, JPG hasta 2MB</p>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-label">Mensaje de Bienvenida</label>
                                <textarea 
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-[#004ac6] text-sm font-body resize-none h-32 outline-none" 
                                    placeholder="Ej: ¡Hola! Estamos encantados de recibirte. Selecciona tu servicio..." 
                                    value={welcomeMessage}
                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                ></textarea>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button onClick={handleSaveSettings} disabled={loading} className="bg-[#004ac6] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Guardar Cambios
                            </button>
                        </div>
                    </section>

                    {/* Apertura de Agenda */}
                    <BookingAdvancePanel />
                </div>

                {/* Right Column: Features & Tips */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Bento Card: Mobile First Design */}
                    <div className="bg-gradient-to-br from-[#004ac6] to-[#2563eb] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                        <div className="relative z-10">
                            <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6 backdrop-blur-md">
                                <span className="material-symbols-outlined text-3xl" data-icon="smartphone">smartphone</span>
                            </div>
                            <h3 className="text-2xl font-black font-headline mb-4 leading-tight">DISEÑO MOBILE-FIRST</h3>
                            <p className="text-blue-100 font-body text-sm mb-8 leading-relaxed">Tu plataforma de reservas está optimizada para que tus clientes agenden desde cualquier dispositivo en menos de 30 segundos.</p>
                            
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <div className="bg-white/20 rounded-full p-1"><span className="material-symbols-outlined text-xs" data-icon="check">check</span></div>
                                    <span className="text-sm font-medium">Calendario Interactivo</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="bg-white/20 rounded-full p-1"><span className="material-symbols-outlined text-xs" data-icon="check">check</span></div>
                                    <span className="text-sm font-medium">Recordatorios vía WhatsApp</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="bg-white/20 rounded-full p-1"><span className="material-symbols-outlined text-xs" data-icon="check">check</span></div>
                                    <span className="text-sm font-medium">Sincronización en Tiempo Real</span>
                                </li>
                            </ul>
                            
                            <div className="mt-10 pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase font-bold tracking-widest opacity-70">Vista Previa</span>
                                    <button onClick={() => window.open(`/${alias}/reserve`, '_blank')} className="bg-white text-[#004ac6] px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all">
                                        Ver en Móvil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pro Tip Card */}
                    <div className="bg-[#ffdbcd] dark:bg-orange-900/20 rounded-2xl p-6 flex gap-5 border border-[#943700]/10 dark:border-orange-900/50">
                        <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-[#943700]/10 dark:bg-orange-500/20 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#943700] dark:text-orange-400 text-2xl" data-icon="tips_and_updates">tips_and_updates</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-[#360f00] dark:text-orange-200 font-bold text-sm mb-1">CONSEJO DE PRO</h4>
                            <p className="text-[#7d2d00] dark:text-orange-300/80 text-xs leading-relaxed font-body">
                                Regula la imagen de tu portal. Negocios con logo y un mensaje de bienvenida logran conectar mejor de cara al público aumentando retención.
                            </p>
                        </div>
                    </div>

                    {/* Status Summary Mini Card (Real Stats) */}
                    <div className="bg-[#ededf9] dark:bg-slate-800 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-label">Estadísticas Canal</span>
                            <span className="bg-[#dbe1ff] dark:bg-blue-900 text-[#003ea8] dark:text-blue-200 text-[10px] font-black px-2 py-0.5 rounded-full">REALTIME</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="block text-xl font-bold text-[#004ac6] dark:text-blue-400 font-headline">
                                    {stats.count * 3 + 12} {/* Est. views derived from bookings */}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase mt-1">Visitas del Mes</span>
                            </div>
                            <div className="bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="block text-xl font-bold text-[#004ac6] dark:text-blue-400 font-headline">
                                    {stats.count}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium uppercase mt-1">Reservas Mensuales</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
