'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    UserPlus,
    Trash2,
    Edit2,
    Check,
    X,
    Search,
    User,
    Mail,
    Phone,
    Palette,
    Loader2,
    CalendarPlus,
    Users,
    Info,
    ShieldCheck,
    CheckCircle2,
    Plus,
    Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/settings-context';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/mock-service';

export function ProfessionalsPanel() {
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [limits, setLimits] = useState({ maxProfessionals: 3 });

    const { t } = useTranslation();
    const { user } = useAuth();

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#10b981');

    const fetchProfessionals = async () => {
        setIsLoading(true);
        try {
            const [profsData, limitsData] = await Promise.all([
                apiFetch('professionals'),
                apiFetch('tenant/me')
            ]);

            if (profsData && !profsData.error) {
                setProfessionals(Array.isArray(profsData) ? profsData : []);
            }
            if (limitsData && !limitsData.error) {
                setLimits(limitsData);
            }
        } catch (error) {
            console.error('Error fetching professionals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfessionals();
    }, []);

    const { settings, refreshSettings } = useSettings();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSaving(true);

        try {
            const url = editingId ? `professionals/${editingId}` : 'professionals';
            const method = editingId ? 'PUT' : 'POST';

            const data = await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, color, description }),
            });

            if (data && !data.error) {
                toast.success(editingId ? t('prof.success_updated') : t('prof.success_added'));
                setEditingId(null);
                setShowAddForm(false);
                resetForm();
                fetchProfessionals();
                // Trigger global refresh for calendar and other components
                window.dispatchEvent(new CustomEvent('refreshAppointments'));
                // Force full reload
                setTimeout(() => window.location.reload(), 500);
            } else {
                toast.error(data.error || t('prof.error_saving'));
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || t('prof.error_connection'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;

        if (professionals.length <= 1) {
            toast.error(t('prof.error_min_one'));
            setDeleteConfirmId(null);
            return;
        }

        setIsDeleting(true);
        try {
            const data = await apiFetch(`professionals/${deleteConfirmId}`, { method: 'DELETE' });
            if (data && !data.error) {
                toast.success(t('prof.success_deleted'));
                setDeleteConfirmId(null);
                fetchProfessionals();
                window.dispatchEvent(new CustomEvent('refreshAppointments'));
            } else {
                toast.error(data?.error || t('prof.error_deleting'));
            }
        } catch (error: any) {
            toast.error(error.message || t('prof.error_deleting'));
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (p: any) => {
        setEditingId(p.id);
        setName(p.name);
        setEmail(p.email || '');
        setPhone(p.phone || '');
        setDescription(p.description || '');
        setColor(p.color || '#10b981');
        setShowAddForm(true);
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setDescription('');
        setColor('#10b981');
    };

    const COLORS = [
        '#10b981', '#3b82f6', '#ef4444', '#f59e0b',
        '#8b5cf6', '#ec4899', '#a3e635', '#000000',
        '#7e1b2f'
    ];

    const handleImageUpload = async (professionalId: string, file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await fetch(`/api/professionals/${professionalId}/image`, {
                method: 'POST',
                headers: { 
                    'x-tenant-id': user?.tenantId || settings.tenantId || '' 
                },
                body: formData
            });
            if (res.ok) {
                toast.success('Imagen actualizada');
                fetchProfessionals();
            } else {
                const errorData = await res.json();
                toast.error(errorData.error || 'Error al subir la imagen');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto w-full">
            {/* Header / Top Bar like layout */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight uppercase italic">Configuración de Elección</h2>
                    <p className="text-slate-500 font-medium text-sm">Gestiona cómo tus clientes interactúan con tus especialistas durante el proceso de reserva.</p>
                </div>
                {!showAddForm && (
                     <Button
                         onClick={() => {
                             if (professionals.length >= limits.maxProfessionals) {
                                 toast.error(`Has alcanzado el límite máximo de ${limits.maxProfessionals} profesionales.`);
                                 return;
                             }
                             setShowAddForm(true); setEditingId(null); resetForm();
                         }}
                         className="bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95"
                     >
                         <Plus className="w-5 h-5" />
                         Añadir Profesional
                     </Button>
                )}
            </div>

            {/* Professionals List Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight italic">
                        Profesionales configurados
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest border border-slate-200 dark:border-slate-700">
                            {professionals.length} / {limits.maxProfessionals} especialistas
                        </span>
                    </h3>
                </div>

                {showAddForm && (
                     <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
                         <div className="flex items-center justify-between">
                             <h4 className="font-black text-primary uppercase tracking-widest italic">
                                 {editingId ? 'Editar Especialista' : 'Nuevo Especialista'}
                             </h4>
                             <button type="button" onClick={() => { setShowAddForm(false); setEditingId(null); }} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                                 <X className="w-5 h-5" />
                             </button>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Nombre Completo</Label>
                                 <Input
                                     value={name}
                                     onChange={(e) => setName(e.target.value)}
                                     className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold"
                                     placeholder="Ej: Sr. Sergio"
                                     required
                                 />
                             </div>
                             <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Correo Electrónico</Label>
                                 <Input
                                     type="email"
                                     value={email}
                                     onChange={(e) => setEmail(e.target.value)}
                                     className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold"
                                     placeholder="ejemplo@clinic.com"
                                 />
                             </div>
                             <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Descripción / Especialidad</Label>
                                 <Input
                                     value={description}
                                     onChange={(e) => setDescription(e.target.value)}
                                     className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold"
                                     placeholder="Ej: Odontólogo General"
                                 />
                             </div>
                             <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Teléfono</Label>
                                 <Input
                                     value={phone}
                                     onChange={(e) => setPhone(e.target.value)}
                                     className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold"
                                     placeholder="600 000 000"
                                 />
                             </div>
                             <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Color Identificativo</Label>
                                 <div className="flex flex-wrap gap-3 p-1">
                                     {COLORS.map(c => (
                                         <button
                                             key={c}
                                             type="button"
                                             onClick={() => setColor(c)}
                                             className={cn(
                                                 "w-8 h-8 rounded-full border-4 transition-all scale-90",
                                                 color === c ? "border-primary scale-110 shadow-lg" : "border-transparent hover:scale-100"
                                             )}
                                             style={{ backgroundColor: c }}
                                         />
                                     ))}
                                     <div className="relative">
                                         <button
                                             type="button"
                                             className={cn(
                                                 "w-8 h-8 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center hover:border-primary transition-all",
                                                 !COLORS.includes(color) && "border-primary bg-primary/10"
                                             )}
                                             onClick={() => document.getElementById('custom-color-prof')?.click()}
                                         >
                                             <Palette className="w-4 h-4 text-slate-400" />
                                         </button>
                                         <input id="custom-color-prof" type="color" className="hidden" value={color} onChange={(e) => setColor(e.target.value)} />
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <div className="pt-4 flex gap-4">
                             <Button disabled={isSaving} type="submit" className="flex-1 h-12 bg-primary hover:bg-primary-container text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95">
                                 {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
                                 {editingId ? 'Actualizar Profesional' : 'Guardar Nuevo Profesional'}
                             </Button>
                             <Button type="button" variant="ghost" onClick={() => { setShowAddForm(false); setEditingId(null); }} className="h-12 px-8 rounded-2xl font-bold text-slate-400 hover:text-slate-600">
                                 Descartar
                             </Button>
                         </div>
                     </form>
                )}

                <div className="grid gap-4">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Cargando especialistas...</p>
                        </div>
                    ) : professionals.length === 0 ? (
                        <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center text-center">
                             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 mb-6 font-black italic">!</div>
                             <p className="text-slate-500 font-medium">No hay profesionales configurados aún.</p>
                        </div>
                    ) : (
                        professionals.map(p => (
                            <div key={p.id} className="group bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 transition-all flex flex-col sm:flex-row items-center gap-8 shadow-sm hover:shadow-xl hover:shadow-slate-100 dark:hover:shadow-none hover:-translate-y-1">
                                <div className="relative">
                                    <label className="cursor-pointer block">
                                        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-900 shadow-md group-hover:shadow-xl transition-all relative">
                                            {p.image ? (
                                                <img src={p.image.startsWith('/img/') ? p.image.replace('/img/', '/api/img/') : p.image} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl" style={{ backgroundColor: p.color || '#3b82f6' }}>
                                                    {p.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {/* Photo Overlay */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Camera className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleImageUpload(p.id, file);
                                            }}
                                        />
                                    </label>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
                                </div>

                                <div className="flex-1 text-center sm:text-left space-y-1">
                                    <h4 className="font-black text-xl text-slate-900 dark:text-white leading-tight italic uppercase tracking-tight">{p.name}</h4>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
                                        <span className="text-xs font-bold text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 lowercase">
                                            <Mail className="w-3.5 h-3.5" />
                                            {p.email || 'sin email'}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 flex items-center justify-center sm:justify-start gap-1.5 uppercase tracking-tighter italic">
                                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                            {p.description || 'Especialista Activo'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {p.googleAccessToken ? (
                                        <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Calendar Conectado
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => window.location.href = `/api/integrations/google/auth?professionalId=${p.id}&tenantId=${p.tenantId}`}
                                            variant="outline"
                                            className="h-10 px-5 rounded-2xl border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary hover:bg-primary/5 font-bold text-[10px] uppercase tracking-widest transition-all"
                                        >
                                            <CalendarPlus className="w-4 h-4 mr-2" />
                                            Vincular Google Calendar
                                        </Button>
                                    )}
                                    <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-1 hidden sm:block"></div>
                                    <button onClick={() => handleEdit(p)} className="p-3 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-95">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setDeleteConfirmId(p.id)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl transition-all active:scale-95">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Empty State / Hint */}
                {!showAddForm && (
                    <div 
                        className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all group"
                        onClick={() => {
                            if (professionals.length >= limits.maxProfessionals) return;
                            setShowAddForm(true); setEditingId(null); resetForm();
                        }}
                    >
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 group-hover:text-primary transition-all">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <p className="text-slate-500 font-bold text-base mb-1">¿Necesitas añadir a alguien más?</p>
                        <p className="text-primary font-black uppercase tracking-widest text-[10px] italic">Haz clic para vincular nuevo especialista</p>
                    </div>
                )}
            </section>

            <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
                <DialogContent className="max-w-[400px] rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-500">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            {t('common.confirm_delete')}
                        </DialogTitle>
                        <DialogDescription className="py-4 text-slate-500 dark:text-slate-400 font-medium">
                            {professionals.length <= 1
                                ? t('prof.error_delete_last')
                                : t('prof.confirm_delete_desc')
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmId(null)}
                            className="rounded-xl font-bold border-slate-200 dark:border-slate-800"
                        >
                            {t('common.cancel')}
                        </Button>
                        {professionals.length > 1 && (
                            <Button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold px-6"
                            >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {t('common.delete')}
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
