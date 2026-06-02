import { useState, useEffect } from 'react';
import { useSettings } from '@/context/settings-context';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/mock-service';
import { Loader2, Check, Save, Globe, Fingerprint } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/hooks/useTranslation';

export function AppSettingsPanel({ onClose }: { onClose: () => void }) {
    const { settings, refreshSettings } = useSettings();
    const { t } = useTranslation();
    const [appTitle, setAppTitle] = useState(settings.appTitle || '');
    const [appDescription, setAppDescription] = useState(settings.appDescription || '');
    const [startTime, setStartTime] = useState(settings.startTime || '07:00');
    const [endTime, setEndTime] = useState(settings.endTime || '21:00');
    const [gridStep, setGridStep] = useState(settings.gridStep || '30');
    const [timezone, setTimezone] = useState(settings.timezone || 'Europe/Madrid');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { updateSettings } = useSettings();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        setMounted(true);
    }, []);

    const logoToUse = mounted && theme === 'dark' ? '/logo_booklymo.png' : '/logo_bookly1.png';
    const currentLogoUrl = settings.logoUrl && settings.logoUrl !== '/logo_bookly1.png' && settings.logoUrl !== '/logo_booklymo.png' ? settings.logoUrl : logoToUse;

    useEffect(() => {
        if (settings) {
            if (settings.appTitle) setAppTitle(settings.appTitle);
            if (settings.appDescription) setAppDescription(settings.appDescription);
            if (settings.startTime) setStartTime(settings.startTime);
            if (settings.endTime) setEndTime(settings.endTime);
            if (settings.gridStep) setGridStep(settings.gridStep);
            if (settings.timezone) setTimezone(settings.timezone);
        }
    }, [settings]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const data = await apiFetch('settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appTitle,
                    appDescription,
                    startTime,
                    endTime,
                    gridStep,
                    timezone
                }),
            });

            if (data?.error) throw new Error(data.error);

            await refreshSettings();
            toast.success('Cambios guardados correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar la configuración');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-8 border-b border-slate-100 dark:border-slate-800 mb-10">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                        <Fingerprint className="w-3 h-3" />
                        {t('settings.panel_app_badge')}
                    </div>
                    <h1 className="text-2xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[0.9]">
                        {t('settings.panel_app_title1')} <span className="text-primary">{t('settings.panel_app_title2')}</span>
                    </h1>
                    <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                        {t('settings.panel_app_desc')}
                    </p>
                </div>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* SECTION 1: Identidad del Negocio */}
                <section className="lg:col-span-7 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>fingerprint</span>
                        <h2 className="text-xl font-bold font-headline tracking-tight uppercase text-slate-800 dark:text-slate-200">Identidad del Negocio</h2>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8 transition-colors">
                        {/* Logo */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Logo de la Aplicación</label>
                            <div className="flex flex-col items-center sm:items-start gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl">
                                <label className="relative group cursor-pointer inline-block">
                                    <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary group-hover:shadow-xl group-hover:shadow-primary/10">
                                        {settings.logoUrl ? (
                                            <img src={currentLogoUrl} alt="Logo actual" className="w-full h-full object-contain p-4" />
                                        ) : (
                                            <div className="text-slate-400 dark:text-slate-600 flex flex-col items-center gap-2">
                                                <Globe className="w-8 h-8" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Subir Logo</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Cambiar Logo</span>
                                        </div>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const formData = new FormData();
                                            formData.append('logo', file);
                                            try {
                                                const res = await fetch('/api/settings/logo', {
                                                    method: 'POST',
                                                    headers: { 'x-tenant-id': user?.tenantId || '' },
                                                    body: formData
                                                });
                                                if (res.ok) {
                                                    const data = await res.json();
                                                    updateSettings({ logoUrl: data.logoUrl });
                                                    toast.success('Logo actualizado correctamente');
                                                } else {
                                                    toast.error('Error al subir el logo');
                                                }
                                            } catch (error) {
                                                toast.error('Error de conexión');
                                            }
                                        }}
                                    />
                                </label>
                                {(settings.logoUrl && settings.logoUrl !== '/logo_bookly1.png' && settings.logoUrl !== '/logo_booklymo.png') && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-8 rounded-lg px-4 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[10px] font-black uppercase tracking-widest"
                                        onClick={async () => {
                                            await updateSettings({ logoUrl: '' });
                                            toast.info('Restaurado logo por defecto');
                                        }}
                                    >
                                        Eliminar Personalización
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* App Title */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Nombre Comercial</label>
                            <input 
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg outline-none" 
                                type="text" 
                                value={appTitle}
                                onChange={(e) => setAppTitle(e.target.value)}
                                placeholder="Pon el nombre de tu negocio aqui"
                            />
                            <p className="text-[10px] text-slate-400 font-medium italic ml-1">Nombre público que verán tus clientes en la cabecera.</p>
                        </div>

                        {/* Welcome Message */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Texto Pantalla Inicio</label>
                            <textarea 
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all resize-none font-medium text-sm outline-none" 
                                rows={4}
                                value={appDescription}
                                onChange={(e) => setAppDescription(e.target.value)}
                                placeholder="Escribe aquí el mensaje que verán los usuarios al entrar..."
                            />
                        </div>

                        {/* Timezone */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Zona Horaria (Timezone)</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl p-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all appearance-none font-bold outline-none cursor-pointer"
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                >
                                    <option value="Europe/Madrid">Europe/Madrid (Madrid, Barcelona)</option>
                                    <option value="Atlantic/Canary">Atlantic/Canary (Canary Islands)</option>
                                    <option value="Europe/Lisbon">Europe/Lisbon (Lisbon)</option>
                                    <option value="Europe/London">Europe/London (London, Dublin)</option>
                                    <option value="Europe/Paris">Europe/Paris (Paris, Brussels, Berlin)</option>
                                    <option value="America/New_York">America/New_York (Eastern Time)</option>
                                    <option value="America/Chicago">America/Chicago (Central Time)</option>
                                    <option value="America/Denver">America/Denver (Mountain Time)</option>
                                    <option value="America/Los_Angeles">America/Los_Angeles (Pacific Time)</option>
                                    <option value="America/Mexico_City">America/Mexico_City</option>
                                    <option value="America/Bogota">America/Bogota</option>
                                    <option value="America/Argentina/Buenos_Aires">America/Argentina</option>
                                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                                    <option value="Asia/Shanghai">Asia/Shanghai</option>
                                    <option value="Australia/Sydney">Australia/Sydney</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">expand_more</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Left side: Parameters & Granularity */}
                <aside className="lg:col-span-5 space-y-8">
                    {/* Parámetros Temporales */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                            <h2 className="text-lg font-bold font-headline tracking-tight uppercase text-slate-800 dark:text-slate-200">Parámetros Temporales</h2>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 transition-colors">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Apertura</label>
                                <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border border-transparent focus-within:border-primary/20 transition-all">
                                    <span className="material-symbols-outlined text-sm mr-2 text-slate-400">login</span>
                                    <input 
                                        className="bg-transparent border-none p-0 w-full font-black text-slate-900 dark:text-white outline-none focus:ring-0" 
                                        type="time" 
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Cierre</label>
                                <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 border border-transparent focus-within:border-primary/20 transition-all">
                                    <span className="material-symbols-outlined text-sm mr-2 text-slate-400">logout</span>
                                    <input 
                                        className="bg-transparent border-none p-0 w-full font-black text-slate-900 dark:text-white outline-none focus:ring-0" 
                                        type="time" 
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Granularidad Visual */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-xl">grid_view</span>
                            <h2 className="text-lg font-bold font-headline tracking-tight uppercase text-slate-800 dark:text-slate-200">Granularidad Visual</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {/* Option 1: 1 Hora */}
                            <div 
                                onClick={() => setGridStep('60')}
                                className={cn(
                                    "cursor-pointer transition-all rounded-2xl p-4 flex items-center justify-between border-2",
                                    gridStep === '60' 
                                        ? "bg-primary/5 border-primary shadow-md shadow-primary/5" 
                                        : "bg-slate-50 dark:bg-slate-900 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                        gridStep === '60' ? "bg-primary text-white" : "bg-white dark:bg-slate-800 text-slate-400"
                                    )}>
                                        <span className={cn("material-symbols-outlined", gridStep === '60' && "active-nav-icon")}>calendar_today</span>
                                    </div>
                                    <div>
                                        <p className={cn("font-black tracking-tight", gridStep === '60' ? "text-primary" : "text-slate-700 dark:text-slate-300")}>1 HORA</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                                    gridStep === '60' ? "bg-primary scale-110" : "border-2 border-slate-200 dark:border-slate-800"
                                )}>
                                    {gridStep === '60' && <Check className="w-3 h-3 text-white font-bold" />}
                                </div>
                            </div>

                            {/* Option 2: 45 Min */}
                            <div 
                                onClick={() => setGridStep('45')}
                                className={cn(
                                    "cursor-pointer transition-all rounded-2xl p-4 flex items-center justify-between border-2",
                                    gridStep === '45' 
                                        ? "bg-primary/5 border-primary shadow-md shadow-primary/5" 
                                        : "bg-slate-50 dark:bg-slate-900 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                        gridStep === '45' ? "bg-primary text-white" : "bg-white dark:bg-slate-800 text-slate-400"
                                    )}>
                                        <span className={cn("material-symbols-outlined", gridStep === '45' && "active-nav-icon")}>timer</span>
                                    </div>
                                    <div>
                                        <p className={cn("font-black tracking-tight", gridStep === '45' ? "text-primary" : "text-slate-700 dark:text-slate-300")}>45 MIN</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                                    gridStep === '45' ? "bg-primary scale-110" : "border-2 border-slate-200 dark:border-slate-800"
                                )}>
                                    {gridStep === '45' && <Check className="w-3 h-3 text-white font-bold" />}
                                </div>
                            </div>

                            {/* Option 3: 30 Min */}
                            <div 
                                onClick={() => setGridStep('30')}
                                className={cn(
                                    "cursor-pointer transition-all rounded-2xl p-4 flex items-center justify-between border-2",
                                    gridStep === '30' 
                                        ? "bg-primary/5 border-primary shadow-md shadow-primary/5" 
                                        : "bg-slate-50 dark:bg-slate-900 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                        gridStep === '30' ? "bg-primary text-white" : "bg-white dark:bg-slate-800 text-slate-400"
                                    )}>
                                        <span className={cn("material-symbols-outlined", gridStep === '30' && "active-nav-icon")}>schedule</span>
                                    </div>
                                    <div>
                                        <p className={cn("font-black tracking-tight", gridStep === '30' ? "text-primary" : "text-slate-700 dark:text-slate-300")}>30 MIN</p>
                                    </div>
                                </div>
                                <div className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                                    gridStep === '30' ? "bg-primary scale-110" : "border-2 border-slate-200 dark:border-slate-800"
                                )}>
                                    {gridStep === '30' && <Check className="w-3 h-3 text-white font-bold" />}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Floating Save Button */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 z-[100]">
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-3 bg-primary hover:bg-primary-light text-white px-10 py-5 rounded-full shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all active:scale-95 group disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                        <Save className="w-6 h-6 transition-transform group-hover:rotate-12" />
                    )}
                    <span className="font-black tracking-widest uppercase text-sm">Guardar Cambios</span>
                </button>
            </div>
        </div>
    );
}
