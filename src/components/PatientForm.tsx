'use client';

import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod/dist/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { patientService, apiFetch, appointmentService } from '@/lib/mock-service';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Patient, Appointment } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import { useAuth } from '@/context/auth-context';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PatientFormProps {
    patient?: Patient;
    onSuccess: (patient: Patient) => void;
}

export function PatientForm({ patient, onSuccess }: PatientFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [patientHistory, setPatientHistory] = useState<Appointment[]>([]);
    const { t } = useTranslation();
    const { user } = useAuth();

    useEffect(() => {
        if (patient) {
            appointmentService.getAppointments().then(all => {
                const history = all.filter(a => a.patientId === patient.id)
                    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
                setPatientHistory(history);
            });
        }
    }, [patient]);

    const formSchema = z.object({
        name: z.string().min(1, t('validation.required')),
        apellidos: z.string().min(1, t('validation.required')),
        phone: z.string().min(5, t('validation.required')),
        email: z.string().email(t('validation.invalid_email')).optional().or(z.literal('')),
        notes: z.string().optional(),
        bloqueado: z.boolean(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        // resolver: zodResolver(formSchema),
        defaultValues: {
            name: patient?.name || '',
            apellidos: patient?.apellidos || '',
            phone: patient?.phone || '',
            email: patient?.email || '',
            notes: patient?.notes || '',
            bloqueado: patient?.bloqueado || false
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const dataToSave = patient ? { id: patient.id, ...values } : values;
            await apiFetch('patients', {
                method: 'POST',
                body: JSON.stringify(dataToSave),
                headers: { 'Content-Type': 'application/json' }
            });

            onSuccess({ id: patient?.id || 'new', ...values } as any);
        } catch (error) {
            console.error(error);
            form.setError('root', { message: t('modal.save_error') });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('modal.patient_name')}</FormLabel>
                                        <FormControl>
                                            <Input className="h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-primary rounded-2xl text-slate-900 dark:text-white" placeholder="Ej. Florentino" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="apellidos"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('modal.apellidos')}</FormLabel>
                                        <FormControl>
                                            <Input className="h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-primary rounded-2xl text-slate-900 dark:text-white" placeholder="Ej. Pérez" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => {
                                const countryCodes = [
                                    { code: '+34', flag: '🇪🇸', name: 'España' },
                                    { code: '+351', flag: '🇵🇹', name: 'Portugal' },
                                    { code: '+52', flag: '🇲🇽', name: 'México' },
                                    { code: '+54', flag: '🇦🇷', name: 'Argentina' },
                                    { code: '+56', flag: '🇨🇱', name: 'Chile' },
                                    { code: '+57', flag: '🇨🇴', name: 'Colombia' },
                                    { code: '+51', flag: '🇵🇪', name: 'Perú' },
                                    { code: '+1', flag: '🇺🇸', name: 'EE.UU.' },
                                    { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
                                    { code: '+33', flag: '🇫🇷', name: 'Francia' }
                                ];
                                
                                // Parse value
                                const valStr = field.value || '';
                                let initialCode = '+34';
                                let initialNum = valStr;
                                for (const c of countryCodes) {
                                    if (valStr.startsWith(c.code)) {
                                        initialCode = c.code;
                                        initialNum = valStr.substring(c.code.length).trim();
                                        break;
                                    }
                                }

                                const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                                    field.onChange(`${initialCode} ${e.target.value}`);
                                };

                                const handleCodeChange = (newCode: string) => {
                                    field.onChange(`${newCode} ${initialNum}`);
                                };

                                return (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('modal.phone')}</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2">
                                                <div className="w-[110px] sm:w-[130px] shrink-0">
                                                    <Select value={initialCode} onValueChange={handleCodeChange}>
                                                        <SelectTrigger className="h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-slate-900 dark:text-white">
                                                            <SelectValue placeholder="+34" />
                                                        </SelectTrigger>
                                                        <SelectContent className="max-h-[250px]">
                                                            {countryCodes.map(c => (
                                                                <SelectItem key={c.code} value={c.code} className="cursor-pointer">
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{c.flag}</span>
                                                                        <span className="font-mono text-xs">{c.code}</span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Input 
                                                    className="h-12 flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-primary rounded-2xl text-slate-900 dark:text-white" 
                                                    placeholder="123 456 789" 
                                                    value={initialNum}
                                                    onChange={handleNumberChange}
                                                    onBlur={field.onBlur}
                                                    name={field.name}
                                                    ref={field.ref}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">{t('modal.email')}</FormLabel>
                                    <FormControl>
                                        <Input className="h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-primary rounded-2xl text-slate-900 dark:text-white" placeholder="ejemplo@correo.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Notas / Historial Clínico</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            className="min-h-[100px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-primary rounded-2xl text-slate-900 dark:text-white resize-none" 
                                            placeholder="Alergias, antecedentes, objetivos generales..." 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {user?.role === 'ADMIN' && patient && (
                            <FormField
                                control={form.control}
                                name="bloqueado"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/30 dark:bg-slate-900/30">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {t('modal.bloqueado')}
                                            </FormLabel>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                                                {t('modal.is_blocked')}
                                            </p>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}

                        <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary-light text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {isLoading ? t('settings.saving') : (patient ? t('modal.update_user') : t('modal.create_user'))}
                        </Button>
                    </form>
                </Form>
            </div>

            {patient && (
                <div className="flex-1 border-l border-slate-100 dark:border-slate-800 pl-8 min-h-[400px] flex flex-col">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        Historial de Visitas
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar border rounded-2xl border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                        {patientHistory.length > 0 ? (
                            <table className="w-full text-left text-[11px] border-collapse">
                                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 shadow-sm">
                                    <tr>
                                        <th className="py-3 px-3 font-black uppercase text-slate-400 tracking-wider">Fecha</th>
                                        <th className="py-3 px-1 font-black uppercase text-slate-400 tracking-wider">Hora</th>
                                        <th className="py-3 px-3 font-black uppercase text-slate-400 tracking-wider">Profesional</th>
                                        <th className="py-3 px-3 font-black uppercase text-slate-400 tracking-wider">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {patientHistory.map((apt) => (
                                        <React.Fragment key={apt.id}>
                                            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-3 px-3 font-bold text-slate-700 dark:text-slate-300">
                                                    {format(new Date(apt.start), "dd/MM/yyyy")}
                                                </td>
                                                <td className="py-3 px-1 font-mono font-bold text-primary">
                                                    {format(new Date(apt.start), "HH:mm")}
                                                </td>
                                                <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                                                    {apt.professionalName}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-tight px-2 py-1 rounded-full",
                                                        apt.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                                        apt.status === 'NO_SHOW' ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" :
                                                        "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                                    )}>
                                                        {apt.status === 'COMPLETED' ? 'OK' : apt.status === 'NO_SHOW' ? 'Fallo' : 'Pend.'}
                                                    </span>
                                                </td>
                                            </tr>
                                            {apt.notes && (
                                                <tr className="bg-slate-50/30 dark:bg-slate-900/30">
                                                    <td colSpan={4} className="py-2 px-4 pb-4">
                                                        <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                                            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 mb-1 block">Notas de sesión:</span>
                                                            <div className="whitespace-pre-wrap">{apt.notes}</div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                                <p className="text-xs font-bold uppercase tracking-widest">Sin visitas registradas</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
