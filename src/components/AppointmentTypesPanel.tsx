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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

const CATEGORY_ICONS: Record<string, {id: string, name: string, svg: (props: any) => JSX.Element}[]> = {
  Peluquería: [
    { id: 'peluqueria-1', name: 'Tijeras', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg> },
    { id: 'peluqueria-2', name: 'Peine', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="6" width="16" height="12" rx="2"/><path d="M4 12h16"/><path d="M8 12v6"/><path d="M12 12v6"/><path d="M16 12v6"/></svg> },
    { id: 'peluqueria-3', name: 'Secador', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 6c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h2l2 4c.4.8 1.5.8 1.9 0l2-4h2c1.1 0 2-.9 2-2V6z"/><path d="M19 8h3"/><path d="M19 12h3"/></svg> },
    { id: 'peluqueria-4', name: 'Navaja', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 14l12-12 4 4-12 12-4-4z"/><path d="M14 4l6 6"/><path d="M4 20h4v-4"/></svg> },
    { id: 'peluqueria-5', name: 'Espejo', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="10" r="6"/><path d="M12 16v6"/><path d="M9 22h6"/></svg> }
  ],
  Uñas: [
    { id: 'unas-1', name: 'Esmalte', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="8" y="10" width="8" height="12" rx="2"/><path d="M10 2h4v8h-4z"/></svg> },
    { id: 'unas-2', name: 'Lima', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="6" y="2" width="12" height="20" rx="6"/><path d="M10 8h4"/><path d="M10 12h4"/><path d="M10 16h4"/></svg> },
    { id: 'unas-3', name: 'Mano', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V5a2 2 0 0 0-4 0v8"/><path d="M6 14v-1a2 2 0 0 0-4 0v5.5A7.5 7.5 0 0 0 9.5 22H13a7.5 7.5 0 0 0 7.5-7.5V13a2 2 0 0 0-4 0v-2z"/></svg> },
    { id: 'unas-4', name: 'Lámpara', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 20h16"/><path d="M4 16c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M12 8V4"/></svg> },
    { id: 'unas-5', name: 'Alicate', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 18h12v-4a6 6 0 0 0-12 0v4z"/><path d="M12 14v-6c0-1.1-.9-2-2-2H8"/><path d="M8 6h4"/></svg> }
  ],
  Consulta: [
    { id: 'consulta-1', name: 'Esteto', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 2v4"/><path d="M11 12v4"/><path d="M16 4v16a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V4"/><circle cx="11" cy="8" r="2"/></svg> },
    { id: 'consulta-2', name: 'Médica', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z"/></svg> },
    { id: 'consulta-3', name: 'Historia', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h6"/><path d="M9 18h6"/><path d="M9 10h.01"/></svg> },
    { id: 'consulta-4', name: 'Corazón', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
    { id: 'consulta-5', name: 'Píldora', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.5 20.5 4 14l9-9 6.5 6.5-9 9z"/><path d="M14 6.5 7.5 13"/></svg> }
  ],
  Tattoo: [
    { id: 'tattoo-1', name: 'Máquina', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4 12h4"/><path d="M16 12h4"/><circle cx="12" cy="12" r="4"/><path d="M22 2l-6 6"/><path d="M2 22l6-6"/></svg> },
    { id: 'tattoo-2', name: 'Tinta', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> },
    { id: 'tattoo-3', name: 'Aguja', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 22l6-6"/><path d="M14 10l6-6"/><circle cx="10" cy="14" r="2"/><circle cx="20" cy="4" r="2"/></svg> },
    { id: 'tattoo-4', name: 'Rayo', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> },
    { id: 'tattoo-5', name: 'Rosa', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="8" r="6"/><path d="M12 14v8"/><path d="M12 18h4"/><path d="M12 20H8"/></svg> }
  ],
  Freelance: [
    { id: 'freelance-1', name: 'Portátil', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/></svg> },
    { id: 'freelance-2', name: 'Café', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 4v1"/><path d="M10 4v1"/><path d="M14 4v1"/></svg> },
    { id: 'freelance-3', name: 'Idea', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="9" r="6"/><path d="M12 21v-3"/><path d="M9 18h6"/></svg> },
    { id: 'freelance-4', name: 'Maletín', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg> },
    { id: 'freelance-5', name: 'Pluma', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg> }
  ],
  Oficina: [
    { id: 'oficina-1', name: 'Edificio', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg> },
    { id: 'oficina-2', name: 'Escrito', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 10h20"/><path d="M4 10v10"/><path d="M20 10v10"/><path d="M14 10v6h6"/><path d="M14 16v4"/></svg> },
    { id: 'oficina-3', name: 'Gráfico', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v18h18"/><path d="M18 9l-5 5-3-3-5 5"/></svg> },
    { id: 'oficina-4', name: 'Silla', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 14h12"/><path d="M8 14v6"/><path d="M16 14v6"/><path d="M8 14V4h8v10"/><path d="M12 14v8"/></svg> },
    { id: 'oficina-5', name: 'Clip', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> }
  ],
  Técnico: [
    { id: 'tecnico-1', name: 'Llave', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
    { id: 'tecnico-2', name: 'Engranaje', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
    { id: 'tecnico-3', name: 'Destornilla', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M7 11l5-5-2-2-5 5a2 2 0 0 0 0 2.8c.8.8 2 .8 2 0z"/><path d="M11 7l9 9c.8.8.8 2 0 2.8a2 2 0 0 1-2.8 0l-9-9"/></svg> },
    { id: 'tecnico-4', name: 'Plano', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg> },
    { id: 'tecnico-5', name: 'Casco', svg: (props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 18a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2"/><path d="M12 4a8 8 0 0 0-8 8v4h16v-4a8 8 0 0 0-8-8z"/></svg> }
  ]
};

const renderIcon = (iconId: string | null | undefined, className = "w-8 h-8") => {
    if (!iconId) return <Scissors className={className} />;
    if (iconId.startsWith('http') || iconId.startsWith('/')) {
        return <img src={iconId} alt="Service" className={cn("object-cover rounded-full", className)} />;
    }
    for (const cat in CATEGORY_ICONS) {
        const found = CATEGORY_ICONS[cat].find(i => i.id === iconId);
        if (found) return found.svg({ className });
    }
    return <Scissors className={className} />;
};

export function AppointmentTypesPanel() {
    const { settings, refreshSettings } = useSettings();
    const [types, setTypes] = useState<AppointmentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<AppointmentType>>({});
    const [typeToDelete, setTypeToDelete] = useState<AppointmentType | null>(null);
    const [limits, setLimits] = useState({ maxAppointmentTypes: 4 });
    const [iconPickerOpen, setIconPickerOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Peluquería');
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

    useEffect(() => {
        fetchTypes();
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
        setEditForm({ ...type }); 
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
                if (!dataToSave) cancelEdit(); 
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
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">Servicios</h1>
                    <p className="text-slate-500 font-medium mt-2 max-w-lg">Desde esta sección puedes configurar tus servicios. Define la duración, el precio, el color representativo para tu calendario y el icono que se mostrará a tus clientes en la página de reservas.</p>
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
                                                    className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover/card:scale-110 shadow-lg shadow-black/5 overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                                                    style={{ color: type.color }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEdit(type); 
                                                        setIconPickerOpen(true);
                                                    }}
                                                >
                                                    {renderIcon(type.image)}
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

            <Dialog open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                <DialogContent className="sm:max-w-3xl rounded-[2.5rem] p-0 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
                    <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Seleccionar icono</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Elige un icono que represente tu servicio.</p>
                        </div>
                        
                        <div className="w-full sm:w-[250px]">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full rounded-2xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-inner">
                                    <SelectValue placeholder="Categoría" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-xl">
                                    {Object.keys(CATEGORY_ICONS).map(cat => (
                                        <SelectItem key={cat} value={cat} className="rounded-xl font-bold py-3">{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="p-8 h-[450px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900 custom-scrollbar">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {CATEGORY_ICONS[selectedCategory]?.map(icon => (
                                <button
                                    key={icon.id}
                                    onClick={async () => {
                                        const updatedForm = { ...editForm, image: icon.id };
                                        setEditForm(updatedForm);
                                        if (editingId) {
                                            await saveEdit(updatedForm);
                                        }
                                        setIconPickerOpen(false);
                                    }}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 gap-4 group bg-white dark:bg-slate-800 shadow-sm",
                                        editForm.image === icon.id 
                                            ? "border-[#2563EB] bg-blue-50/50 dark:bg-blue-900/20 ring-4 ring-blue-500/10 scale-105" 
                                            : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg hover:-translate-y-1"
                                    )}
                                >
                                    <div className={cn(
                                        "transition-all duration-300",
                                        editForm.image === icon.id ? "text-[#2563EB] scale-110" : "text-slate-400 group-hover:text-[#2563EB] group-hover:scale-110"
                                    )}>
                                        {icon.svg({ className: "w-10 h-10 stroke-[1.5px]" })}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest text-center transition-colors",
                                        editForm.image === icon.id ? "text-[#2563EB]" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                    )}>
                                        {icon.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
            `}</style>
        </div>
    );
}
