'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertCircle, Calendar, User, MessageCircle, Mail, X } from 'lucide-react';
import { Appointment } from '@/types';
import { appointmentService } from '@/lib/mock-service';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AppointmentDetailsDialog } from './AppointmentDetailsDialog';
import { useAuth } from '@/context/auth-context';

export function NotificationBell() {
    const [errorAppointments, setErrorAppointments] = useState<Appointment[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const { user } = useAuth();

    const fetchErrors = async () => {
        if (!user) return;
        const all = await appointmentService.getAppointments();
        const errors = all.filter(a => a.notifiedWAError || a.notifiedEmailError);
        setErrorAppointments(errors.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()));
    };

    useEffect(() => {
        fetchErrors();
        const interval = setInterval(fetchErrors, 30000); // Poll every 30s
        window.addEventListener('refreshAppointments', fetchErrors);
        return () => {
            clearInterval(interval);
            window.removeEventListener('refreshAppointments', fetchErrors);
        };
    }, []);

    const handleOpenDetails = (apt: Appointment) => {
        setSelectedAppointment(apt);
        setDetailsOpen(true);
    };

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    <button className="relative p-2.5 text-slate-500 hover:text-primary transition-all rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 group">
                        <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        {errorAppointments.length > 0 && (
                            <span className="absolute top-2 right-2.5 w-4 h-4 bg-rose-500 text-[10px] font-black text-white rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center animate-bounce shadow-lg shadow-rose-500/20">
                                {errorAppointments.length}
                            </span>
                        )}
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 rounded-[2rem] overflow-hidden border-slate-100 dark:border-slate-800 shadow-2xl mr-4" align="end">
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-800">
                        <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                            Errores de Notificación
                        </h4>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                        {errorAppointments.length > 0 ? (
                            <div className="space-y-1">
                                {errorAppointments.map((apt) => (
                                    <div 
                                        key={apt.id} 
                                        className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                                        onClick={() => handleOpenDetails(apt)}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-black text-slate-800 dark:text-slate-100 capitalize">
                                                {(format as any)(new Date(apt.start), "eeee d, HH:mm", { locale: es })}
                                            </span>
                                            <div className="flex gap-1">
                                                {apt.notifiedWAError && <MessageCircle className="w-3 h-3 text-rose-500" />}
                                                {apt.notifiedEmailError && <Mail className="w-3 h-3 text-rose-500" />}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                <User className="w-3 h-3 text-slate-500" />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">{apt.patientName}</span>
                                        </div>
                                        <div className="bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-100/50 dark:border-rose-900/30">
                                            <p className="text-[9px] font-black text-rose-600 dark:text-rose-400 leading-tight uppercase">
                                                {apt.notifiedWAError || apt.notifiedEmailError}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 px-4 text-center opacity-40">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Bell className="w-6 h-6" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Sin errores pendientes por gestionar</p>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            <AppointmentDetailsDialog 
                appointment={selectedAppointment} 
                open={detailsOpen} 
                onOpenChange={setDetailsOpen} 
                onDeleted={() => {
                    setDetailsOpen(false);
                    fetchErrors();
                }} 
            />
        </>
    );
}
