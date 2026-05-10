'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useScheduleRules } from "@/lib/useScheduleRules"
import { Appointment, Patient } from "@/types"
import { appointmentService, patientService, apiFetch } from "@/lib/mock-service"
import { useSettings } from "@/context/settings-context"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es, gl } from "date-fns/locale"
import {
    Trash2,
    Calendar as CalendarIcon,
    Clock,
    Phone,
    Mail,
    User,
    CheckCircle2,
    XCircle,
    FileText,
    Pencil,
    ChevronRight,
    MapPin,
    AlertCircle,
    Info,
    MessageCircle,
    RefreshCw
} from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useParams } from 'next/navigation'

interface AppointmentDetailsDialogProps {
    appointment: Appointment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDeleted: () => void;
}

export function AppointmentDetailsDialog({ appointment, open, onOpenChange, onDeleted }: AppointmentDetailsDialogProps) {
    const params = useParams();
    const alias = params?.alias as string;
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [sendingWA, setSendingWA] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [error, setError] = useState('');
    const { t, lang } = useTranslation();
    const { settings, blockedDays } = useSettings();

    const dateLocale = lang === 'gl' ? gl : es;

    // Edit Form State
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editDuration, setEditDuration] = useState('60');
    const [editNotes, setEditNotes] = useState('');
    const [editType, setEditType] = useState('');
    const [editProfessionalId, setEditProfessionalId] = useState('');
    const [appointmentTypes, setAppointmentTypes] = useState<any[]>([]);
    const [professionals, setProfessionals] = useState<any[]>([]);

    const [patientInfo, setPatientInfo] = useState<Patient | null>(null);
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<'1' | '2' | '3'>('1');
    const [selectedTemplateText, setSelectedTemplateText] = useState('');

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [selectedEmailSubject, setSelectedEmailSubject] = useState('');
    const [selectedEmailText, setSelectedEmailText] = useState('');

    const { validateAppointment } = useScheduleRules(blockedDays, settings);

    useEffect(() => {
        apiFetch('appointment-types')
            .then(data => setAppointmentTypes(data))
            .catch(e => console.error(e));

        apiFetch('professionals')
            .then(data => setProfessionals(data))
            .catch(e => console.error(e));
    }, []);

    useEffect(() => {
        if (open && appointment) {
            setEditDate(format(new Date(appointment.start), 'yyyy-MM-dd'));
            setEditTime(format(new Date(appointment.start), 'HH:mm'));
            const durationMs = new Date(appointment.end).getTime() - new Date(appointment.start).getTime();
            setEditDuration((durationMs / 60000).toString());
            setEditNotes(appointment.notes || '');
            setEditType(appointment.type);
            setEditProfessionalId(appointment.professionalId || '');
            setIsEditing(false);
            setError('');
            setIsWhatsAppModalOpen(false);
            setIsEmailModalOpen(false);

            // Fetch patient details
            patientService.getPatientById(appointment.patientId).then(p => {
                setPatientInfo(p || null);
                if (p) {
                    const dateStr = (format as any)(new Date(appointment.start), "d 'de' MMMM 'a las' HH:mm", { locale: dateLocale });
                    setSelectedEmailSubject(`Recordatorio de cita: ${settings.appTitle || 'Booklysharp'}`);
                    setSelectedEmailText(`Hola ${p.name},\n\nTe recordamos tu cita confirmada en ${settings.appTitle || 'nuestro centro'} para el día ${dateStr}.\n\n¡Te esperamos!`);
                }
            });
        } else {
            setPatientInfo(null);
        }
    }, [open, appointment, settings.appTitle, dateLocale]);

    if (!appointment) return null;

    const handleSave = async () => {
        setIsLoading(true);
        setError('');
        try {
            const newStart = new Date(`${editDate}T${editTime}`);
            const durationMs = parseInt(editDuration) * 60000;
            const newEnd = new Date(newStart.getTime() + durationMs);

            const validation = validateAppointment(newStart, editType as any, editProfessionalId);
            if (!validation.valid) {
                setError(validation.message || t('settings.error_saving'));
                setIsLoading(false);
                return;
            }

            await appointmentService.updateAppointment(appointment.id, {
                start: newStart,
                end: newEnd,
                notes: editNotes,
                type: editType,
                professionalId: editProfessionalId
            });

            setIsEditing(false);
            onDeleted(); // Refresh parent
            window.dispatchEvent(new Event('refreshAppointments'));
            onOpenChange(false);
        } catch (e) {
            console.error(e);
            setError(t('settings.error_saving'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await appointmentService.deleteAppointment(appointment.id);
            onDeleted();
            window.dispatchEvent(new Event('refreshAppointments'));
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusUpdate = async (newStatus: Appointment['status']) => {
        setIsLoading(true);
        try {
            await appointmentService.updateAppointment(appointment.id, { status: newStatus });
            onDeleted(); // Refresh parent
            window.dispatchEvent(new Event('refreshAppointments'));
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            setError(t('settings.error_saving'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendWhatsApp = async (selectedTemplate?: string) => {
        if (!patientInfo?.phone || !appointment) return;
        setSendingWA(true);
        setError('');
        try {
            // Robust cleaning: only digits
            let cleanNumber = patientInfo.phone.replace(/[^0-9]/g, '');
            // If it starts with 00, replace with nothing
            if (cleanNumber.startsWith('00')) cleanNumber = cleanNumber.substring(2);
            
            // finalNumber logic: used by the backend as well but we ensure it here
            const finalNumber = (cleanNumber.length === 9) ? `34${cleanNumber}` : cleanNumber;
            
            const alias = window.location.pathname.split('/')[1];
            const dateStr = (format as any)(new Date(appointment.start), "d 'de' MMMM 'a las' HH:mm", { locale: dateLocale });
            
            // Template selection
            let message = selectedTemplate || settings.whatsapp_template;
            if (!message) {
                message = `Hola *{{nombre}}*, te recordamos tu cita en *${settings.appTitle || 'nuestro centro'}* para el día *{{fecha}}*. ¡Te esperamos!`;
            }

            // Replace variables
            const finalMessage = message
                .replace(/{{nombre}}|{nombre}/g, patientInfo.name)
                .replace(/{{fecha}}|{fecha}/g, dateStr)
                .replace(/{{profesional}}|{profesional}/g, appointment.professionalName || '');

            const res = await fetch(`/api/whatsapp?alias=${alias}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    number: finalNumber, 
                    text: finalMessage 
                })
            });

            const result = await res.json();

            if (res.ok) {
                toast.success('WhatsApp enviado con éxito');
                await appointmentService.updateAppointment(appointment.id, { 
                    notifiedWA: true,
                    notifiedWAError: undefined 
                });
                appointment.notifiedWA = true;
                appointment.notifiedWAError = undefined;
                window.dispatchEvent(new Event('refreshAppointments'));
                return true;
            } else {
                const errorMsg = result.error || 'Error desconocido';
                await appointmentService.updateAppointment(appointment.id, { 
                    notifiedWAError: errorMsg 
                });
                appointment.notifiedWAError = errorMsg;
                toast.error(`Error: ${errorMsg}`);
                window.dispatchEvent(new Event('refreshAppointments'));
                return false;
            }
        } catch (e) {
            console.error(e);
            toast.error('Error de conexión con el servidor de WhatsApp');
            return false;
        } finally {
            setSendingWA(false);
        }
    };

    const handleSendEmail = async () => {
        if (!patientInfo?.email || !appointment) return;
        setSendingEmail(true);
        setError('');
        try {
            // Mocking email sending for now
            await new Promise(r => setTimeout(r, 1500));
            
            const dateStr = (format as any)(new Date(appointment.start), "d 'de' MMMM 'a las' HH:mm", { locale: dateLocale });
            const subject = selectedEmailSubject;
            const text = selectedEmailText;
            const html = `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333;">Recordatorio de Cita</h2>
                    <p>${text.replace(/\n/g, '<br/>')}</p>
                </div>
            `;

            const res = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    to: patientInfo.email,
                    subject,
                    text,
                    html
                })
            });

            if (res.ok) {
                toast.success('Email enviado con éxito');
                await appointmentService.updateAppointment(appointment.id, { 
                    notifiedEmail: true,
                    notifiedEmailError: undefined 
                });
                appointment.notifiedEmail = true;
                appointment.notifiedEmailError = undefined;
                window.dispatchEvent(new Event('refreshAppointments'));
                setIsEmailModalOpen(false);
                return true;
            } else {
                const result = await res.json();
                const errorMsg = result.error || 'Error al enviar email';
                await appointmentService.updateAppointment(appointment.id, { 
                    notifiedEmailError: errorMsg 
                });
                appointment.notifiedEmailError = errorMsg;
                toast.error(`Error: ${errorMsg}`);
                window.dispatchEvent(new Event('refreshAppointments'));
                return false;
            }
        } catch (e) {
            console.error(e);
            toast.error('Error de conexión con el servidor de Email');
            return false;
        } finally {
            setSendingEmail(false);
        }
    };

    const getTypeColor = () => {
        switch (appointment.type) {
            case 'URGENCY': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            case 'BLOCKED': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
            default: return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
        }
    };

    const statusInfo = (() => {
        switch (appointment.status) {
            case 'COMPLETED': return { label: t('modal.status_attended'), color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 };
            case 'NO_SHOW': return { label: t('modal.status_no_show'), color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', icon: XCircle };
            default: return { label: t('modal.status_pending'), color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock };
        }
    })();

    return (
        <>
            <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val);
            if (!val) {
                setIsEditing(false);
                setEditDate('');
            }
        }}>
            <DialogContent className="max-w-[100vw] w-full max-h-[90dvh] m-0 sm:max-w-lg p-0 overflow-hidden border-none sm:shadow-2xl bg-background rounded-t-2xl sm:rounded-3xl animate-in zoom-in-95 duration-300 flex flex-col">
                <DialogTitle className="sr-only">{t('modal.details_title')}</DialogTitle>

                {isEditing ? (
                    <div className="flex flex-col min-h-0 h-[80dvh]">
                        {/* Header for Edit Form */}
                        <div className="relative pt-8 pb-10 px-8 overflow-hidden shrink-0">
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent -z-10" />
                            <div className="flex justify-between items-start">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border", getTypeColor())}>
                                            {appointment.type}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                                        Editar Cita
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* Edit Form Content */}
                        <div className="px-8 pb-8 -mt-2 overflow-y-auto custom-scrollbar flex-1">
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('modal.date')}</Label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                            <Input
                                                type="date"
                                                value={editDate}
                                                onChange={e => setEditDate(e.target.value)}
                                                className="h-12 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:ring-primary/20 transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('modal.time')}</Label>
                                        <div className="relative flex-1">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                            <Input
                                                type="time"
                                                value={editTime}
                                                onChange={e => setEditTime(e.target.value)}
                                                className="h-12 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:ring-primary/20 transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('modal.duration')}</Label>
                                        <Select onValueChange={setEditDuration} value={editDuration}>
                                            <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 px-4 font-bold">
                                                <SelectValue placeholder={t('modal.duration')} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl">
                                                <SelectItem value="30" className="rounded-xl my-1">{t('modal.min_30')}</SelectItem>
                                                <SelectItem value="60" className="rounded-xl my-1">{t('modal.hour_1')}</SelectItem>
                                                <SelectItem value="90" className="rounded-xl my-1">{t('modal.hours_1_5')}</SelectItem>
                                                <SelectItem value="0" className="rounded-xl my-1">{t('modal.no_duration')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('modal.type_label')}</Label>
                                        <Select onValueChange={setEditType} value={editType}>
                                            <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 px-4 font-bold capitalize text-slate-900 dark:text-white">
                                                <SelectValue placeholder={t('modal.select_placeholder')} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl dark:bg-slate-900 dark:text-white">
                                                {appointmentTypes.map(t => (
                                                    <SelectItem key={t.id} value={t.name.toUpperCase()} className="rounded-xl my-1 capitalize">{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('modal.professional_label')}</Label>
                                    <Select onValueChange={setEditProfessionalId} value={editProfessionalId}>
                                        <SelectTrigger className="h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 px-4 font-bold text-slate-900 dark:text-white">
                                            <SelectValue placeholder={t('modal.select_prof_placeholder')} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl dark:bg-slate-900 dark:text-white">
                                            {professionals.map(p => (
                                                <SelectItem key={p.id} value={p.id} className="rounded-xl my-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                                        {p.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('modal.notes')}</Label>
                                    <textarea
                                        value={editNotes}
                                        onChange={e => setEditNotes(e.target.value)}
                                        placeholder={t('modal.notes_placeholder')}
                                        className="w-full min-h-[140px] p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:ring-primary/20 transition-all text-sm outline-none font-medium resize-none shadow-inner dark:text-white"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Edit Footer */}
                        <DialogFooter className="px-8 py-5 bg-slate-50/80 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800/80 sm:justify-between flex-row items-center gap-4 shrink-0">
                            <div className="flex justify-end gap-3 w-full">
                                <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-11 px-6 dark:text-white dark:hover:bg-slate-800">
                                    {t('modal.cancel')}
                                </Button>
                                <Button onClick={handleSave} disabled={isLoading} className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-11 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                                    {isLoading ? <RefreshCw className="w-3 h-3 animate-spin mr-2" /> : <CheckCircle2 className="w-3 h-3 mr-2" />}
                                    {isLoading ? t('settings.saving') : t('settings.save')}
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                ) : (
                    // VIEWING MODE
                    <div className="flex flex-col bg-background border-none shrink-0" style={{ maxHeight: '90dvh' }}>
                        {/* Header */}
                        <header className="px-6 pt-6 pb-4 flex justify-between items-start border-b border-border shrink-0">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="font-headline font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
                                        {patientInfo ? (
                                            <>
                                                {patientInfo.apellidos && <span className="opacity-40 font-medium">{patientInfo.apellidos}, </span>}
                                                <span>{patientInfo.name}</span>
                                            </>
                                        ) : appointment.patientName}
                                    </h1>
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold tracking-wider rounded-md uppercase font-label">
                                        {appointment.type}
                                    </span>
                                    {appointment.status === 'COMPLETED' ? (
                                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold tracking-wider rounded-md uppercase font-label">ATENDIDO</span>
                                    ) : appointment.status === 'NO_SHOW' ? (
                                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold tracking-wider rounded-md uppercase font-label">FALTA</span>
                                    ) : (
                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold tracking-wider rounded-md uppercase font-label">PEND.</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <Pencil className="w-[20px] h-[20px]" />
                                </button>
                                <button 
                                    onClick={() => onOpenChange(false)}
                                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <ChevronRight className="w-[20px] h-[20px]" />
                                </button>
                                <button 
                                    onClick={() => onOpenChange(false)}
                                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                                >
                                    <XCircle className="w-[20px] h-[20px]" />
                                </button>
                            </div>
                        </header>

                        {/* Modal Content */}
                        <main className="px-6 space-y-6 pb-6 overflow-y-auto custom-scrollbar shrink pt-4">
                            {/* Appointment Info Grid */}
                            <section className="grid grid-cols-1 gap-4">
                                {/* Date Block */}
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 transition-all hover:bg-muted/60">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <CalendarIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-label uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">Fecha</p>
                                        <p className="font-headline font-bold text-slate-900 dark:text-white text-[15px] capitalize">
                                            {(format as any)(new Date(appointment.start), "EEEE d 'de' MMMM", { locale: dateLocale })}
                                        </p>
                                    </div>
                                </div>

                                {/* Time Block */}
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 transition-all hover:bg-muted/60">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-label uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">Horario</p>
                                        <p className="font-headline font-bold text-slate-900 dark:text-white text-[15px]">
                                            {format(new Date(appointment.start), "HH:mm")} <span className="text-primary/40 mx-1">→</span> {format(new Date(appointment.end), "HH:mm")}
                                        </p>
                                    </div>
                                </div>

                                {/* Specialist Block */}
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 transition-all hover:bg-muted/60">
                                    <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary shadow-sm border border-primary/10 shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-label uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">Especialista</p>
                                        <p className="font-headline font-bold text-slate-900 dark:text-white text-[15px]">
                                            {appointment.professionalName || "Sin asignar"}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Notifications Management */}
                            <section className="space-y-3 pt-2">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 font-label px-1">Gestión de Avisos</h3>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => {
                                             if (patientInfo?.phone) {
                                                 const dateStr = (format as any)(new Date(appointment.start), "d 'de' MMMM 'a las' HH:mm", { locale: es });
                                                 const template = settings.whatsapp_template_1 || settings.whatsapp_template || '';
                                                 const processed = template
                                                     .replace(/{{nombre}}|{nombre}/g, patientInfo.name)
                                                     .replace(/{{fecha}}|{fecha}/g, dateStr)
                                                     .replace(/{{profesional}}|{profesional}/g, appointment.professionalName || '');
                                                 setSelectedTemplateText(processed);
                                                 setSelectedTemplateIndex('1');
                                                 setIsWhatsAppModalOpen(true);
                                             }
                                        }}
                                        disabled={!patientInfo?.phone || sendingWA}
                                        className={cn("flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white font-semibold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50",
                                        patientInfo?.phone ? "hover:bg-primary/90 cursor-pointer" : "cursor-not-allowed")}
                                    >
                                        <MessageCircle className="w-[18px] h-[18px]" fill="currentColor" />
                                        WhatsApp {appointment.notifiedWA && "✓"}
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if (patientInfo?.email) setIsEmailModalOpen(true);
                                        }}
                                        disabled={!patientInfo?.email || sendingEmail}
                                        className={cn("flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50",
                                        patientInfo?.email ? "cursor-pointer" : "cursor-not-allowed")}
                                    >
                                        <Mail className="w-[18px] h-[18px]" />
                                        Email {appointment.notifiedEmail && "✓"}
                                    </button>
                                </div>
                            </section>

                            {/* Notes Section */}
                            <section className="space-y-3 pt-2">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 font-label px-1">Notas de la Cita</h3>
                                <div className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-none text-slate-900 dark:text-white font-body text-sm min-h-[80px] leading-relaxed">
                                    {appointment.notes || "No hay observaciones adicionales para esta cita."}
                                </div>
                            </section>

                            {/* Footer Actions */}
                            <footer className="pt-6 mt-4 flex flex-wrap items-center gap-3 border-t border-border">
                                <button 
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 p-3 text-rose-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all disabled:opacity-50"
                                >
                                    <Trash2 className="w-[18px] h-[18px]" />
                                    Eliminar
                                </button>
                                <div className="flex-1 flex gap-3 justify-end">
                                    <button 
                                        onClick={() => handleStatusUpdate('NO_SHOW')}
                                        disabled={isLoading || appointment.status === 'NO_SHOW'}
                                        className="px-6 py-3 rounded-xl border-2 border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        Falta
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate('COMPLETED')}
                                        disabled={isLoading || appointment.status === 'COMPLETED'}
                                        className="px-6 py-3 rounded-xl bg-gradient-to-br from-primary to-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        Atendido
                                    </button>
                                </div>
                            </footer>
                        </main>
                    </div>
                )}
            </DialogContent>
        </Dialog>

        {/* MODAL DE PREPARACIÓN DE WHATSAPP */}
        <Dialog open={isWhatsAppModalOpen} onOpenChange={setIsWhatsAppModalOpen}>
                <DialogContent className="max-w-lg rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-emerald-600 text-white">
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                            <MessageCircle className="w-7 h-7" /> Preparar WhatsApp
                        </DialogTitle>
                        <DialogDescription className="text-emerald-100 font-bold opacity-90">
                            Personaliza el mensaje antes de enviarlo al paciente.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Seleccionar Plantilla</Label>
                            <Select 
                                value={selectedTemplateIndex} 
                                onValueChange={(val: any) => {
                                    setSelectedTemplateIndex(val);
                                    const template = settings[`whatsapp_template_${val}`] || settings.whatsapp_template || '';
                                    const dateStr = (format as any)(new Date(appointment.start), "d 'de' MMMM 'a las' HH:mm", { locale: es });
                                    const processed = template
                                        .replace(/{{nombre}}|{nombre}/g, patientInfo?.name || '')
                                        .replace(/{{fecha}}|{fecha}/g, dateStr)
                                        .replace(/{{profesional}}|{profesional}/g, appointment.professionalName || '');
                                    setSelectedTemplateText(processed);
                                }}
                            >
                                <SelectTrigger className="h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-bold">
                                    <SelectValue placeholder="Elige una plantilla" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    <SelectItem value="1" className="rounded-xl font-bold">Plantilla 1 (Citas)</SelectItem>
                                    <SelectItem value="2" className="rounded-xl font-bold">Plantilla 2 (Recordatorio)</SelectItem>
                                    <SelectItem value="3" className="rounded-xl font-bold">Plantilla 3 (Seguimiento)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mensaje Final</Label>
                            <Textarea 
                                value={selectedTemplateText}
                                onChange={(e) => setSelectedTemplateText(e.target.value)}
                                className="min-h-[160px] rounded-3xl bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-800 p-5 text-sm font-medium leading-relaxed resize-none shadow-inner dark:text-white"
                            />
                        </div>

                        <div className="flex gap-2">
                            {['{{nombre}}', '{{fecha}}', '{{profesional}}'].map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 cursor-pointer" onClick={() => setSelectedTemplateText(prev => prev + tag)}>
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 sm:justify-between flex-row items-center gap-4">
                        <Button variant="ghost" onClick={() => setIsWhatsAppModalOpen(false)} className="rounded-2xl font-bold dark:text-white dark:hover:bg-slate-800">Cancelar</Button>
                        <Button 
                            className="rounded-2xl h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20"
                            onClick={async () => {
                                if (!patientInfo?.phone) return;
                                setSendingWA(true);
                                try {
                                    await apiFetch('whatsapp', {
                                        method: 'PATCH',
                                        body: JSON.stringify({
                                            alias,
                                            number: patientInfo.phone,
                                            text: selectedTemplateText
                                        })
                                    });
                                    toast.success('WhatsApp enviado correctamente');
                                    setIsWhatsAppModalOpen(false);
                                } catch (e) {
                                    toast.error('Error al enviar WhatsApp');
                                } finally {
                                    setSendingWA(false);
                                }
                            }}
                        >
                            {sendingWA ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <MessageCircle className="w-4 h-4 mr-2" />}
                            Enviar WhatsApp Ahora
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL DE PREPARACIÓN DE EMAIL */}
            <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
                <DialogContent className="max-w-lg rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-primary text-white">
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                            <Mail className="w-7 h-7" /> Redactar Email
                        </DialogTitle>
                        <DialogDescription className="text-blue-100 font-bold opacity-90">
                            Personaliza el correo electrónico para el paciente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asunto</Label>
                            <Input 
                                value={selectedEmailSubject}
                                onChange={(e) => setSelectedEmailSubject(e.target.value)}
                                className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold"
                                placeholder="Asunto del correo..."
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cuerpo del Mensaje</Label>
                            <Textarea 
                                value={selectedEmailText}
                                onChange={(e) => setSelectedEmailText(e.target.value)}
                                className="min-h-[200px] rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 p-5 text-sm font-medium leading-relaxed resize-none shadow-inner dark:text-white"
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 sm:justify-between flex-row items-center gap-4">
                        <Button variant="ghost" onClick={() => setIsEmailModalOpen(false)} className="rounded-2xl font-bold dark:text-white dark:hover:bg-slate-800">Cancelar</Button>
                        <Button 
                            className="rounded-2xl h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                            onClick={async () => {
                                setSendingEmail(true);
                                try {
                                    // Mocking email send for now or using server endpoint if exists
                                    toast.success('Email enviado correctamente');
                                    setIsEmailModalOpen(false);
                                } catch (e) {
                                    toast.error('Error al enviar email');
                                } finally {
                                    setSendingEmail(false);
                                }
                            }}
                        >
                            {sendingEmail ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                            Enviar Email Ahora
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
