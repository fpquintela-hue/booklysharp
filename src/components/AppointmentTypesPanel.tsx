'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Plus, Trash2, Pencil, Check, X, Palette, Clock, AlertTriangle, 
    Sparkles, Scissors, Infinity as InfinityIcon, Image as ImageIcon, Save,
    MoreVertical, TrendingUp
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/settings-context';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from '@/lib/mock-service';

interface AppointmentType {
    id: string;
    name: string;
    duration: number;
    color: string;
    price?: number | null;
    image?: string | null;
    description?: string | null;
}

const PREDEFINED_COLORS = [
    '#2563EB', '#7C3AED', '#DB2777', '#F59E0B', '#10B981', '#EF4444', '#0EA5E9', '#6366F1',
];

export function AppointmentTypesPanel() {
    const { settings, refreshSettings } = useSettings();
    const [types, setTypes] = useState<AppointmentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<AppointmentType>>({});
    const [typeToDelete, setTypeToDelete] = useState<AppointmentType | null>(null);
    const [limits, setLimits] = useState({ maxAppointmentTypes: 4 });
    const [imagePickerOpen, setImagePickerOpen] = useState(false);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [stats, setStats] = useState({ count: 0, percentage: 0, trend: 'up' });
    const [portalEnabled, setPortalEnabled] = useState(settings.portalEnabled === 'true');
    const [welcomeMessage, setWelcomeMessage] = useState(settings.welcomeMessage || '');
    
    const colorInputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    const fetchTypes = async () => {
        try {
            const [typesData, limitsData, statsData] = await Promise.all([
                apiFetch('appointment-types'),
                apiFetch('tenant/me'),
                apiFetch('appointments/stats')
            ]);
            if (typesData && !typesData.error) setTypes(typesData);
            if (limitsData && !limitsData.error) setLimits(limitsData);
            if (statsData && !statsData.error) setStats(statsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGallery = async () => {
        try {
            const res = await fetch('/api/gallery');
            if (res.ok) {
                const data = await res.json();
                setGalleryImages(data);
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
        }
    };

    useEffect(() => {
        fetchTypes();
        fetchGallery();
    }, []);

    const handleSaveSettings = async () => {
        try {
            await apiFetch('settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ portalEnabled: String(portalEnabled), welcomeMessage }),
            });
            await refreshSettings();
            toast.success(t('settings.save_success'));
        } catch (error) {
            toast.error(t('settings.error_saving'));
        }
    };

    const startEdit = (type: AppointmentType) => {
        setEditingId(type.id);
        setEditForm({ ...type }); // Clone to avoid direct mutations
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async (dataToSave?: Partial<AppointmentType>) => {
        const finalForm = dataToSave || editForm;
        if (!finalForm.name) return;
        
        try {
            const data = await apiFetch('appointment-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalForm),
            });
            if (data && !data.error) {
                toast.success(t('settings.save_success'));
                fetchTypes();
                window.dispatchEvent(new Event('refreshAppointments'));
                if (!dataToSave) cancelEdit(); // Only close if it's the main save
            } else {
                toast.error(data.error || t('settings.error_saving'));
            }
        } catch (error: any) {
            toast.error(error.message || t('settings.error_saving'));
        }
    };

    const confirmDelete = async () => {
        if (!typeToDelete) return;
        try {
            const data = await apiFetch('appointment-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: typeToDelete.id, action: 'delete' }),
            });
            if (data && !data.error) {
                toast.success(t('common.deleted'));
                fetchTypes();
                window.dispatchEvent(new Event('refreshAppointments'));
                setTypeToDelete(null);
            }
        } catch (error: any) {
            toast.error(error.message || t('settings.error_saving'));
        }
    };

    const addType = async () => {
        if (types.length >= limits.maxAppointmentTypes) {
            toast.error(`Límite máximo de ${limits.maxAppointmentTypes} tipos alcanzado.`);
            return;
        }
        const newType = { name: 'Nuevo Servicio', duration: 30, color: '#2563EB', price: null, image: null };
        try {
            const data = await apiFetch('appointment-types', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newType),
            });
            if (data && !data.error) {
                setTypes([...types, data]);
                window.dispatchEvent(new Event('refreshAppointments'));
                startEdit(data);
            }
        } catch (error) {
            toast.error(t('settings.error_saving'));
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 flex flex-col h-full fade-in w-full text-slate-800 dark:text-slate-200">
            <header className="flex justify-between items-start w-full mb-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Reservas</h1>
                    <p className="text-slate-500 font-medium mt-2 max-w-lg">Gestiona tus servicios, duraciones y colores corporativos.</p>
                </div>
                <button onClick={handleSaveSettings} className="flex items-center gap-2 bg-[#2563EB] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors active:scale-95">
                    <Save className="w-4 h-4" />
                    Guardar cambios
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-4 space-y-6 text-slate-800 dark:text-slate-200">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-sm transition-all hover:shadow-md">
                        <p className="text-blue-700 dark:text-blue-400 font-bold text-sm mb-1 uppercase tracking-widest">Citas este mes</p>
                        <p className="text-5xl font-black text-blue-800 dark:text-blue-300 tracking-tighter">{stats.count}</p>
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">+{stats.percentage}% vs mes anterior</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <section className="bg-white dark:bg-slate-900/50 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Servicios</h2>
                                <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500">
                                    {types.length} / {limits.maxAppointmentTypes}
                                </div>
                            </div>
                            <button onClick={addType} className="group flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 active:scale-95">
                                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                                Añadir Servicio
                            </button>
                        </div>
                    
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 auto-rows-min">
                            {types.map((type) => (
                                <div
                                    key={type.id}
                                    className={cn(
                                        "bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col relative overflow-hidden",
                                        editingId === type.id 
                                            ? "border-[#2563EB] ring-8 ring-blue-500/5 shadow-2xl z-10 scale-[1.02]" 
                                            : "border-slate-100 dark:border-slate-800 hover:border-blue-500/30 hover:shadow-xl"
                                    )}
                                >
                                    {editingId === type.id ? (
                                        <div className="flex flex-col h-full gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#2563EB]">Nombre del Servicio</Label>
                                                    <Input
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#2563EB]">Descripción</Label>
                                                    <Input
                                                        value={editForm.description || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                        className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 font-bold"
                                                        placeholder="Breve descripción del servicio"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#2563EB]">Minutos</Label>
                                                        <Input
                                                            type="number"
                                                            value={editForm.duration === 0 ? '' : editForm.duration}
                                                            onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || 0 })}
                                                            className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 font-bold"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#2563EB]">Precio (€)</Label>
                                                        <Input
                                                            type="number"
                                                            value={editForm.price ?? ''}
                                                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value ? parseFloat(e.target.value) : null })}
                                                            className="h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 font-bold"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2.5">
                                                    <Label className="text-[10px] uppercase tracking-[0.2em] font-black text-[#2563EB]">Color Corporativo</Label>
                                                    <div className="flex flex-wrap gap-2.5 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 shadow-inner">
                                                        {PREDEFINED_COLORS.map(c => (
                                                            <button
                                                                key={c}
                                                                type="button"
                                                                onClick={() => setEditForm({ ...editForm, color: c })}
                                                                className={cn(
                                                                    "w-7 h-7 rounded-full border-2 transition-all duration-300 hover:scale-125",
                                                                    editForm.color?.toUpperCase() === c.toUpperCase() ? "border-slate-900 scale-110 ring-4 ring-slate-100 shadow-md" : "border-transparent"
                                                                )}
                                                                style={{ backgroundColor: c }}
                                                            />
                                                        ))}
                                                        <div className="relative group">
                                                            <button
                                                                type="button"
                                                                onClick={() => colorInputRef.current?.click()}
                                                                className={cn(
                                                                    "w-7 h-7 rounded-full border-2 border-slate-100 flex items-center justify-center bg-slate-50 transition-all hover:bg-white hover:shadow-md",
                                                                    !PREDEFINED_COLORS.includes(editForm.color?.toUpperCase() || '') ? "border-slate-900 scale-110 ring-4 ring-slate-100" : ""
                                                                )}
                                                                style={!PREDEFINED_COLORS.includes(editForm.color?.toUpperCase() || '') ? { backgroundColor: editForm.color } : {}}
                                                            >
                                                                <Palette className={cn("w-3.5 h-3.5", !PREDEFINED_COLORS.includes(editForm.color?.toUpperCase() || '') ? "text-white drop-shadow-sm" : "text-slate-400")} />
                                                            </button>
                                                            <input
                                                                ref={colorInputRef}
                                                                type="color"
                                                                value={editForm.color || '#2563EB'}
                                                                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                                                                className="absolute opacity-0 w-0 h-0 pointer-events-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-auto flex gap-3 pt-3">
                                                <Button onClick={() => saveEdit()} className="flex-1 bg-[#2563EB] text-white font-black rounded-xl h-12 shadow-xl shadow-blue-500/20 active:scale-95">Guardar</Button>
                                                <Button onClick={cancelEdit} variant="outline" className="px-6 font-black rounded-xl h-12 text-slate-400 hover:text-slate-600 transition-colors">X</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col h-full cursor-pointer group/card" onClick={() => startEdit(type)}>
                                            <div className="flex justify-between items-start mb-5">
                                                <div 
                                                    className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover/card:scale-110 shadow-2xl shadow-black/5 overflow-hidden border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-900"
                                                    style={{ color: type.color }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEdit(type); // Ensure editForm is set before opening picker
                                                        setImagePickerOpen(true);
                                                    }}
                                                >
                                                    {type.image ? (
                                                        <img src={type.image} alt={type.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Scissors className="w-8 h-8" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1 items-end">
                                                    <span className="px-3 py-1 bg-green-500/10 text-green-600 text-[10px] font-black rounded-full uppercase tracking-tighter">Activo</span>
                                                    <div className="w-4 h-4 rounded-full mt-1 border-2 border-white shadow-sm" style={{ backgroundColor: type.color }} />
                                                </div>
                                            </div>
                                            
                                            <h4 className="font-black text-slate-900 dark:text-white text-xl capitalize truncate transition-colors group-hover/card:text-[#2563EB]">{type.name}</h4>
                                            
                                            <div className="flex items-center gap-2 mt-2 text-slate-400 dark:text-slate-500">
                                                {type.duration === 0 ? <InfinityIcon className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                <span className="text-xs font-black uppercase tracking-widest">
                                                    {type.duration === 0 ? 'SIN LÍMITE' : `${type.duration} MINUTOS`}
                                                </span>
                                            </div>
                                            
                                            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversión</span>
                                                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                                                        {type.price != null ? `${type.price.toFixed(2)}€` : 'Gratis'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-x-4 group-hover/card:translate-x-0">
                                                    <button onClick={(e) => { e.stopPropagation(); setTypeToDelete(type); }} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); startEdit(type); }} className="p-2.5 bg-blue-50 text-[#2563EB] rounded-xl hover:bg-[#2563EB] hover:text-white transition-all shadow-lg shadow-blue-500/10">
                                                        <Pencil className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <Dialog open={!!typeToDelete} onOpenChange={(open) => !open && setTypeToDelete(null)}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border border-white/10 dark:bg-slate-900/95 shadow-3xl p-8">
                    <DialogHeader>
                        <div className="bg-red-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-red-500 mb-4 mx-auto sm:mx-0">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Confirmar eliminación</DialogTitle>
                        <DialogDescription className="text-slate-500 pt-2 font-medium text-base">
                            ¿Estás seguro de eliminar <strong>"{typeToDelete?.name}"</strong>? Los datos asociados desaparecerán para siempre.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-8 gap-3 flex-col sm:flex-row">
                        <Button variant="outline" onClick={() => setTypeToDelete(null)} className="font-black rounded-2xl h-14 text-slate-400 flex-1 hover:bg-slate-50 border-slate-100">Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete} className="font-black rounded-2xl h-14 flex-1 shadow-2xl shadow-red-500/20 active:scale-95">Sí, eliminar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={imagePickerOpen} onOpenChange={setImagePickerOpen}>
                <DialogContent className="sm:max-w-md rounded-[3.5rem] overflow-hidden p-0 border-none shadow-3xl animate-in zoom-in-95 duration-500">
                    <div className="bg-[#2563EB] p-10 pb-28 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -ml-24 -mb-24"></div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h3 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Galería Visual</h3>
                            <p className="text-white/60 text-xs font-black tracking-[0.3em] uppercase mt-3">Personaliza el catálogo</p>
                        </div>
                    </div>
                    
                    <div className="px-10 -mt-20 pb-12 relative z-20">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
                            <div className="grid grid-cols-3 gap-5 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {galleryImages.map((img) => (
                                    <button
                                        key={img}
                                        onClick={async () => {
                                            const updatedForm = { ...editForm, image: img };
                                            setEditForm(updatedForm);
                                            
                                            // IMMEDIATE SAVE WHEN SELECTING IMAGE
                                            if (editingId) {
                                                await saveEdit(updatedForm);
                                            }
                                            setImagePickerOpen(false);
                                        }}
                                        className={cn(
                                            "aspect-square rounded-[1.5rem] overflow-hidden border-[6px] transition-all duration-500 hover:scale-110 active:scale-90 group relative shadow-lg",
                                            editForm.image === img ? "border-[#2563EB] ring-8 ring-blue-500/10 shadow-2xl z-10 scale-105" : "border-slate-50 dark:border-slate-800"
                                        )}
                                    >
                                        <img src={img} alt="Service" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" />
                                        <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <div className="bg-white p-2 rounded-full text-[#2563EB] shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-500">
                                                <Check className="w-6 h-6 font-black" />
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                
                                <button className="aspect-square rounded-[1.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-300 hover:text-[#2563EB] hover:bg-blue-50/50 hover:border-[#2563EB]/50 transition-all duration-300 gap-2 group shadow-inner">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-white transition-colors duration-300 shadow-sm">
                                        <ImageIcon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Subir</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                }
            `}</style>
        </div>
    );
}
