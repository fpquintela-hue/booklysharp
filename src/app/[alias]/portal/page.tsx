'use client';

import { useSettings } from '@/context/settings-context';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, Loader2, Settings2, Brush, ChevronLeft, Users, Palette, Link as LinkIcon, Smartphone, Check } from 'lucide-react';
import { apiFetch } from '@/lib/mock-service';
import { BookingAdvancePanel } from '@/components/BookingAdvancePanel';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const PALETTES = [
    { id: 'yellow', name: 'Gama de Amarillos', color: '#eab308' },
    { id: 'blue', name: 'Gama de Azules', color: '#3b82f6' },
    { id: 'red', name: 'Gama de Rojos', color: '#ef4444' },
    { id: 'black', name: 'Gama de Negros', color: '#09090b' },
    { id: 'green', name: 'Gama de Verdes', color: '#22c55e' },
    { id: 'purple', name: 'Gama de Violetas', color: '#8b5cf6' },
];

export default function PortalSettingsPage() {
    const { settings, updateSettings, refreshSettings } = useSettings();
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const alias = params?.alias as string;
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [logoUrl, setLogoUrl] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [portalEnabled, setPortalEnabled] = useState(true);
    const [enableProfessionalSelection, setEnableProfessionalSelection] = useState(true);
    const [portalColorPalette, setPortalColorPalette] = useState('blue');

    const [activeTab, setActiveTab] = useState<'general' | 'personalizacion'>('general');

    const menuItems = [
        { id: 'general', label: 'Opciones Generales', icon: Settings2 },
        { id: 'personalizacion', label: 'Personalización', icon: Brush },
    ];

    useEffect(() => {
        if (settings) {
            setLogoUrl(settings.logoUrl || '');
            setWelcomeMessage(settings.welcomeMessage || '');
            setPortalEnabled(settings.portalEnabled !== 'false');
            setEnableProfessionalSelection(settings.enableProfessionalSelection !== 'false');
            setPortalColorPalette(settings.portalColorPalette || 'blue');
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
                portalEnabled: portalEnabled.toString(),
                enableProfessionalSelection: enableProfessionalSelection.toString(),
                portalColorPalette
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
        <div className="flex h-full w-full bg-white dark:bg-slate-900">
            {/* Sidebar similar to settings */}
            <aside className="w-64 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/${alias}`} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ChevronLeft className="w-4 h-4 text-slate-400" />
                        </Link>
                        <h2 className="text-xl font-black text-primary tracking-tight uppercase">Portal Online</h2>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                activeTab === item.id
                                    ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                    : "text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 p-8 md:p-12">
                <div className="max-w-5xl mx-auto space-y-6">
                    <header className="flex justify-between items-center w-full mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#004ac6] dark:text-blue-400 font-headline tracking-tight uppercase">
                                {activeTab === 'general' ? 'Opciones Generales' : 'Personalización'}
                            </h1>
                            <p className="text-slate-500 font-body mt-1">Configura la experiencia de reserva de tus clientes</p>
                        </div>
                        <button onClick={handleSaveSettings} disabled={loading} className="bg-[#004ac6] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 inline-flex items-center gap-2">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Guardar Cambios
                        </button>
                    </header>

                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Section: Visibilidad */}
                            <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,74,198,0.08)] border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                            <span className="material-symbols-outlined" data-icon="visibility">visibility</span>
                                        </div>
                                        <h2 className="text-xl font-black font-headline uppercase italic">VISIBILIDAD Y APERTURA DE AGENDA</h2>
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
                                        className="scale-125"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Link Público de Reservas</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <LinkIcon className="w-4 h-4" />
                                            </span>
                                            <input 
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[#004ac6] dark:text-blue-400 font-bold focus:ring-2 focus:ring-[#004ac6]/20 outline-none" 
                                                readOnly 
                                                type="text" 
                                                value={typeof window !== 'undefined' ? `${window.location.origin}/${alias}/reserve-new` : `/${alias}/reserve-new`}
                                            />
                                        </div>
                                        <button onClick={() => { 
                                            const url = typeof window !== 'undefined' ? `${window.location.origin}/${alias}/reserve-new` : `/${alias}/reserve-new`;
                                            
                                            // Robust copy to clipboard
                                            if (navigator.clipboard && window.isSecureContext) {
                                                navigator.clipboard.writeText(url).then(() => {
                                                    toast.success('Enlace copiado al portapapeles');
                                                }).catch(() => {
                                                    toast.error('No se pudo copiar');
                                                });
                                            } else {
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
                                        }} className="bg-primary/10 text-primary px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all active:scale-95 flex items-center gap-2 shadow-sm">
                                            <span className="material-symbols-outlined" data-icon="content_copy">content_copy</span>
                                            <span className="hidden sm:inline">Copiar</span>
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 italic">Comparte este enlace en tus redes sociales para recibir reservas directamente. Los clientes verán la nueva versión.</p>
                                </div>
                            </section>

                            {/* Elegir Profesional */}
                            <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,74,198,0.08)] border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight italic">Permitir Elección de Profesional</h3>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
                                            Si activas esta opción, el cliente podrá elegir específicamente con quién reservar en el portal de citas.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <Switch 
                                            checked={enableProfessionalSelection}
                                            onCheckedChange={(val) => {
                                                setEnableProfessionalSelection(val);
                                                // auto-save logic
                                                updateSettings({ enableProfessionalSelection: val.toString() }).then(() => {
                                                    refreshSettings();
                                                    toast.success(`Elección de profesional ${val ? 'activada' : 'desactivada'}`);
                                                });
                                            }}
                                            className="scale-125"
                                        />
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.2em] mt-2",
                                            enableProfessionalSelection ? "text-primary" : "text-slate-400"
                                        )}>
                                            {enableProfessionalSelection ? 'Activado' : 'Desactivado'}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Apertura de Agenda */}
                            <BookingAdvancePanel />
                        </div>
                    )}

                    {activeTab === 'personalizacion' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Section: Marca Corporativa */}
                            <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,74,198,0.08)] border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                        <Brush className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black font-headline uppercase italic">MARCA CORPORATIVA</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Logo del Negocio</label>
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group h-48"
                                        >
                                            {logoUrl ? (
                                                <div className="w-24 h-24 bg-transparent flex items-center justify-center mb-4 relative overflow-hidden">
                                                    <img src={logoUrl} alt="Preview" className="w-full h-full object-contain" />
                                                    <button 
                                                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                                                        onClick={(e) => { e.stopPropagation(); setLogoUrl(''); }}
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                                                    <span className="material-symbols-outlined text-4xl text-slate-400" data-icon="add_photo_alternate">add_photo_alternate</span>
                                                </div>
                                            )}
                                            <span className="text-xs font-black text-[#004ac6] dark:text-blue-400 text-center uppercase tracking-widest italic">Subir Logotipo</span>
                                            <p className="text-[10px] text-slate-500 text-center mt-2 font-bold uppercase">PNG, JPG hasta 2MB</p>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Mensaje de Bienvenida</label>
                                        <textarea 
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-[#004ac6]/20 text-sm font-bold resize-none h-48 outline-none" 
                                            placeholder="Ej: ¡Hola! Estamos encantados de recibirte. Selecciona tu servicio..." 
                                            value={welcomeMessage}
                                            onChange={(e) => setWelcomeMessage(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </section>

                            {/* Section: Paleta de Colores */}
                            <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,74,198,0.08)] border border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                                <Palette className="w-6 h-6" />
                                            </div>
                                            <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight italic">PALETA DE COLORES</h3>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
                                            Elige la gama de colores que mejor se adapte a tu marca corporativa para la nueva página de reservas online.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {PALETTES.map(palette => (
                                        <button
                                            key={palette.id}
                                            onClick={() => setPortalColorPalette(palette.id)}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                                                portalColorPalette === palette.id
                                                    ? "border-primary bg-primary/5 scale-[1.02] shadow-sm"
                                                    : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                                            )}
                                        >
                                            <div 
                                                className="w-12 h-12 rounded-full shadow-inner flex items-center justify-center text-white"
                                                style={{ backgroundColor: palette.color }}
                                            >
                                                {portalColorPalette === palette.id && <Check className="w-5 h-5" />}
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                                                {palette.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <div className="bg-[#ffdbcd] dark:bg-orange-900/20 rounded-3xl p-6 flex gap-5 border border-[#943700]/10 dark:border-orange-900/50 items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-14 w-14 bg-[#943700]/10 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#943700] dark:text-orange-400 text-3xl" data-icon="tips_and_updates">tips_and_updates</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[#360f00] dark:text-orange-200 font-black text-sm mb-1 uppercase tracking-widest italic">CONSEJO DE PRO</h4>
                                    <p className="text-[#7d2d00] dark:text-orange-300/80 text-sm leading-relaxed font-bold">
                                        Regula la imagen de tu portal. Negocios con logo y un mensaje de bienvenida logran conectar mejor de cara al público aumentando retención.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
