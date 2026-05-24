'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod/dist/zod';
import * as z from 'zod';
import { CalendarPlus, Info, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { appointmentService, apiFetch } from '@/lib/mock-service';
import { useScheduleRules } from '@/lib/useScheduleRules';
import { PatientSelector } from './PatientSelector';
import { useSettings } from '@/context/settings-context';
import { useTranslation } from '@/hooks/useTranslation';

const formSchema = z.object({
    patientId: z.string().optional(),
    patientName: z.string().optional(),
    date: z.string(), // YYYY-MM-DD
    time: z.string(), // HH:MM
    duration: z.string(), // minutes
    type: z.string(), // Use the name or ID which will be the value
    notes: z.string().optional(),
    professionalId: z.string().optional(),
    reminderType: z.string().optional(),
    reminderTime: z.string().optional(),
});

interface AppointmentFormProps {
    onSuccess: () => void;
    defaultSlot?: { start: Date, end: Date };
    activeProfessionalId?: string | null;
}

export function AppointmentForm({ onSuccess, defaultSlot, activeProfessionalId }: AppointmentFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showSelectionError, setShowSelectionError] = useState(false);
    const [step, setStep] = useState(1);
    const [appointmentTypes, setAppointmentTypes] = useState<any[]>([]);
    const [professionals, setProfessionals] = useState<any[]>([]);
    const { t } = useTranslation();
    const { settings, blockedDays } = useSettings();
    const { validateAppointment } = useScheduleRules(blockedDays, settings);

    const form = useForm<z.infer<typeof formSchema>>({
        // resolver: zodResolver(formSchema),
        defaultValues: {
            type: '',
            duration: defaultSlot ? Math.round((defaultSlot.end.getTime() - defaultSlot.start.getTime()) / 60000).toString() : '60',
            date: defaultSlot ? defaultSlot.start.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            time: defaultSlot ? defaultSlot.start.toTimeString().substring(0, 5) : '10:00',
            notes: '',
            patientId: '',
            patientName: '',
            professionalId: activeProfessionalId || '',
            reminderType: 'WHATSAPP',
            reminderTime: '1440',
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [types, profs] = await Promise.all([
                    apiFetch('appointment-types').catch(() => []),
                    apiFetch('professionals').catch(() => [])
                ]);

                setAppointmentTypes(types);
                if (types.length > 0 && !form.getValues('type')) {
                    form.setValue('type', types[0].name.toUpperCase());
                    if (!defaultSlot && types[0].duration > 0) {
                        form.setValue('duration', types[0].duration.toString());
                    }
                }

                setProfessionals(profs);
                if (profs.length > 0 && !form.getValues('professionalId')) {
                    const defaultProf = profs.find((p: any) => p.isActive) || profs[0];
                    if (defaultProf) {
                        form.setValue('professionalId', defaultProf.id);
                    }
                }
            } catch (e) {
                console.error('Error fetching form data:', e);
            }
        };

        fetchData();
    }, [form, defaultSlot]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!values.patientId) {
            setShowSelectionError(true);
            // Scroll to top to show error if needed
            return;
        }

        setIsLoading(true);
        try {
            const start = new Date(`${values.date}T${values.time}`);
            const end = new Date(start.getTime() + parseInt(values.duration) * 60000);

            // Validation Logic - now checking the full duration
            const validation = validateAppointment(start, values.type as any, values.professionalId === 'none' ? undefined : values.professionalId, end);
            if (!validation.valid) {
                form.setError('root', { message: validation.message });
                setIsLoading(false);
                return;
            }

            await appointmentService.createAppointment({
                patientId: values.patientId!,
                patientName: values.patientName!,
                start,
                end,
                type: values.type,
                status: 'SCHEDULED',
                notes: values.notes,
                professionalId: values.professionalId === 'none' ? undefined : (values.professionalId || (professionals.length === 1 ? professionals[0].id : undefined)),
                // Pass reminders to service
                reminderType: values.reminderType,
                reminderTime: values.reminderTime ? parseInt(values.reminderTime) : undefined,
            });
            form.reset();
            onSuccess();
            // Force full reload to see the new appointment across the app
            window.location.reload();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Left Sidebar */}
            <aside className={`w-full md:w-2/5 p-8 border-r border-border flex flex-col ${step === 2 ? 'hidden md:flex' : 'flex'} h-full bg-muted/20 dark:bg-slate-900/40`}>
                <div className="flex-1 flex flex-col h-full bg-transparent border-r border-border">
                    {/* Header step indication */}
                    <div className="px-8 pt-8 shrink-0">
                        <div className="flex items-center gap-1.5 mb-1.5 opacity-40">
                            <ChevronRight className="w-2.5 h-2.5 text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Seleccionar Cliente</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Nueva Cita</h1>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 py-6 bg-transparent">
                        <PatientSelector
                            value={form.watch('patientId')}
                            onSelect={(id, name) => {
                                form.setValue('patientId', id);
                                form.setValue('patientName', name);
                                form.clearErrors('patientId');
                                setShowSelectionError(false);
                                if (window.innerWidth < 768) setStep(2);
                            }}
                        />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 overflow-y-auto p-4 md:p-10 flex-col bg-background h-full custom-scrollbar ${step === 1 ? 'hidden md:flex' : 'flex'}`}>
                {/* Mobile back button */}
                <Button
                    type="button"
                    variant="ghost"
                    className="md:hidden -ml-2 -mt-2 mb-2 text-slate-500 font-bold self-start text-xs"
                    onClick={() => setStep(1)}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Volver a selección
                </Button>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6 flex flex-col h-full animate-in fade-in duration-300">
                        
                        {/* Selected User Indicator (mobile clarity or just visually confirming if not obvious in the list) */}
                        {showSelectionError && !form.watch('patientId') && (
                            <div className="p-3 md:p-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-xl border border-rose-200 animate-in shake-2 mb-2 md:mb-4">
                                <p className="text-xs md:text-sm font-semibold flex items-center gap-2"><Info className="w-4 h-4 md:w-5 md:h-5"/>{t('modal.select_user_warning')}</p>
                            </div>
                        )}

                        {/* Date and Time Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5 md:mb-1">Fecha</FormLabel>
                                        <FormControl>
                                            <Input className="w-full p-2 md:p-2.5 h-10 md:h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-[8px] focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-white text-sm" type="date" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="time"
                                render={({ field }) => {
                                    const [h, m] = (field.value || '10:00').split(':');
                                    const hours = Array.from({ length: 14 }, (_, i) => (i + 8).toString().padStart(2, '0'));
                                    const minutes = ['00', '15', '30', '45'];

                                    return (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5 md:mb-1">Hora</FormLabel>
                                            <div className="flex items-center gap-1 md:gap-2">
                                                <Select onValueChange={(val) => field.onChange(`${val}:${m}`)} value={h}>
                                                     <FormControl>
                                                         <SelectTrigger className="w-full p-2 md:p-2.5 h-10 md:h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-[8px] focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-white text-sm">
                                                             <SelectValue placeholder="HH" />
                                                         </SelectTrigger>
                                                     </FormControl>
                                                    <SelectContent>
                                                        {hours.map(hr => <SelectItem key={hr} value={hr}>{hr}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <span className="text-slate-400 font-bold">:</span>
                                                <Select onValueChange={(val) => field.onChange(`${h}:${val}`)} value={m}>
                                                     <FormControl>
                                                         <SelectTrigger className="w-full p-2 md:p-2.5 h-10 md:h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-[8px] focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-white text-sm">
                                                             <SelectValue placeholder="MM" />
                                                         </SelectTrigger>
                                                     </FormControl>
                                                    <SelectContent>
                                                        {minutes.map(min => <SelectItem key={min} value={min}>{min}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
                            />
                        </div>

                        {/* Type and Duration Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5 md:mb-1">Tipo</FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                const selectedType = appointmentTypes.find(t => t.name.toUpperCase() === val);
                                                if (selectedType && selectedType.duration > 0) {
                                                    form.setValue('duration', selectedType.duration.toString());
                                                }
                                            }}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="w-full p-2 md:p-2.5 h-10 md:h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-[8px] focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-white text-sm">
                                                    <SelectValue placeholder="Tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {appointmentTypes.map((t) => (
                                                    <SelectItem key={t.id} value={t.name.toUpperCase()}>{t.name}</SelectItem>
                                                ))}
                                                {appointmentTypes.length === 0 && (
                                                    <SelectItem value="ORDINARY">General</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5 md:mb-1">Duración</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full p-2 md:p-2.5 h-10 md:h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-[8px] focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-white text-sm">
                                                    <SelectValue placeholder="0 min" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {field.value && !['15','30','45','60','90','120'].includes(field.value) && (
                                                    <SelectItem value={field.value}>{field.value} min</SelectItem>
                                                )}
                                                <SelectItem value="15">15 min</SelectItem>
                                                <SelectItem value="30">30 min</SelectItem>
                                                <SelectItem value="45">45 min</SelectItem>
                                                <SelectItem value="60">60 min</SelectItem>
                                                <SelectItem value="90">90 min</SelectItem>
                                                <SelectItem value="120">120 min</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Professional Selection */}
                        <div className="flex flex-col w-full md:w-1/2 md:pr-3">
                            <FormField
                                control={form.control}
                                name="professionalId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5 md:mb-1">Profesional / Axenda</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || 'none'}>
                                            <FormControl>
                                                <SelectTrigger className="w-full p-2 md:p-2.5 h-10 md:h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[8px] focus:ring-2 focus:ring-primary shadow-sm text-sm">
                                                    <SelectValue placeholder="Cualquiera" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">Sin preferencia (Cualquiera)</SelectItem>
                                                {professionals.map((p) => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || '#3B82F6' }} />
                                                            {p.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Notice and Anticipation Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <FormField
                                control={form.control}
                                name="reminderType"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5 md:mb-1">Aviso</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || 'NONE'}>
                                            <FormControl>
                                                <SelectTrigger className="w-full p-2 md:p-2.5 h-10 md:h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[8px] focus:ring-2 focus:ring-primary shadow-sm text-sm">
                                                    <SelectValue placeholder="Aviso" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="NONE">Sin aviso</SelectItem>
                                                <SelectItem value="WHATSAPP">WhatsApp / SMS</SelectItem>
                                                <SelectItem value="EMAIL">Email</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.watch('reminderType') !== 'NONE' && (
                                <FormField
                                    control={form.control}
                                    name="reminderTime"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5 md:mb-1">Antelación</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || '1440'}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full p-2 md:p-2.5 h-10 md:h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[8px] focus:ring-2 focus:ring-primary shadow-sm text-sm">
                                                        <SelectValue placeholder="Antelación" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="15">15 Minutos antes</SelectItem>
                                                    <SelectItem value="60">1 Hora antes</SelectItem>
                                                    <SelectItem value="1440">1 Día antes</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* Notes */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem className="flex flex-col flex-grow min-h-[80px] md:min-h-[120px]">
                                    <FormLabel className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-0.5 md:mb-1">Notas</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            className="w-full flex-grow p-3 md:p-4 resize-none min-h-[80px] md:min-h-[120px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[8px] focus:ring-2 focus:ring-primary shadow-sm text-slate-900 dark:text-white text-sm"
                                            placeholder="Notas de la cita..."
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {form.formState.errors.root && (
                            <div className="text-rose-500 text-xs md:text-sm font-medium p-2 md:p-3 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200">
                                {form.formState.errors.root.message}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 md:pt-6 mt-auto pb-4 md:pb-0">
                            <Button 
                                type="submit" 
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 md:py-4 h-12 md:h-14 rounded-[8px] shadow-lg hover:shadow-xl transition-all text-sm md:text-lg" 
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-2" /> : null}
                                Guardar
                            </Button>
                        </div>
                    </form>
                </Form>
            </main>
        </>
    )
}
