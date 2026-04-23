'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Lock, XCircle, Activity } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addDays, isSameMonth, isToday, addMonths, subMonths, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { es, gl } from 'date-fns/locale';
import { appointmentService } from '@/lib/mock-service';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';
import { AppointmentDetailsDialog } from './AppointmentDetailsDialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/context/settings-context';
import { useAuth } from '@/context/auth-context';
import { ProfessionalSelector } from './ProfessionalSelector';

interface DashboardWidgetsProps {
    visibleProfessionalIds: string[];
    onVisibleProfessionalIdsChange: (ids: string[]) => void;
    activeProfessionalId: string | null;
    onActiveProfessionalIdChange: (id: string) => void;
}

export function DashboardWidgets({
    visibleProfessionalIds,
    onVisibleProfessionalIdsChange,
    activeProfessionalId,
    onActiveProfessionalIdChange
}: DashboardWidgetsProps) {
    const { t, lang } = useTranslation();
    const { settings, blockedDays } = useSettings();
    const { user } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [viewedDate, setViewedDate] = useState(new Date());

    const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

    const fetchAppointments = async () => {
        if (!user) return;
        const all = await appointmentService.getAppointments();
        setAllAppointments(all);
        const today = new Date();
        const filtered = all.filter(app => isSameDay(new Date(app.start), today));
        // Sort by time
        filtered.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        setTodaysAppointments(filtered);
    };

    useEffect(() => {
        fetchAppointments();

        const handleDateChange = (e: any) => {
            setViewedDate(e.detail.date);
            // Also ensure the mini calendar shows the month of the viewed date
            setCurrentMonth(e.detail.date);
        };

        window.addEventListener('refreshAppointments', fetchAppointments);
        window.addEventListener('calendar-date-updated', handleDateChange);
        return () => {
            window.removeEventListener('refreshAppointments', fetchAppointments);
            window.removeEventListener('calendar-date-updated', handleDateChange);
        };
    }, []);

    // Sustituir eachDayOfInterval por buele manual
    const s = (startOfWeek as any)(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const e = (endOfWeek as any)(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const days = [];
    let curr = s;
    while (curr <= e) {
        days.push(curr);
        curr = addDays(curr, 1);
    }

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const viewMode = user?.calendarViewMode || settings.calendarViewMode || 'vista1';
    const isClassic = viewMode === 'vista2';

    if (!isClassic) {
        const upcomingApps = todaysAppointments.filter(a => new Date(a.start) >= new Date() || a.status !== 'COMPLETED');
        const upcomingCount = upcomingApps.length;
        const totalToday = todaysAppointments.length;
        const capacityPct = Math.min(Math.round((totalToday / 15) * 100), 100);

        return (
            <div className="chunkipunki-theme chunkipunki-sidebar hidden lg:flex flex-col flex-shrink-0 overflow-y-auto">
                {/* Profesional Seleccionado Card */}
                <div className="cp-prof-card relative shrink-0">
                    {/* Compact selector overlaid or at top */}
                    <div className="w-full mb-4">
                        <ProfessionalSelector
                            onVisibleChange={onVisibleProfessionalIdsChange}
                            onActiveChange={onActiveProfessionalIdChange}
                            activeId={activeProfessionalId}
                            isClassic={isClassic}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 w-full gap-3 mt-4">
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-left">
                            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Citas hoy</span>
                            <span className="text-lg font-bold cp-text-on-surface">{totalToday}</span>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-left">
                            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Pendientes</span>
                            <span className="text-lg font-bold cp-text-primary">{upcomingCount}</span>
                        </div>
                    </div>
                </div>

                {/* Mini Calendar Widget */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold font-headline text-slate-900 dark:text-white capitalize">
                            {(format as any)(currentMonth, 'MMMM yyyy', { locale: lang === 'gl' ? gl : es })}
                        </p>
                        <div className="flex gap-1">
                            <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                                <ChevronLeft className="h-4 w-4 text-slate-400" />
                            </button>
                            <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-y-2 text-center">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                            <span key={i} className="text-[10px] font-bold text-slate-400 opacity-40 uppercase">{d}</span>
                        ))}
                        {days.map((day, idx) => {
                            const isCurrentMonth = isSameMonth(day, currentMonth);
                            const isTodayDate = isToday(day);
                            const isViewedDate = isSameDay(day, viewedDate);
                            return (
                                <span
                                    key={idx}
                                    onClick={() => {
                                        setViewedDate(day);
                                        window.dispatchEvent(new (window as any).CustomEvent('calendar-navigate', { detail: { date: day, view: 'day' } }));
                                    }}
                                    className={cn(
                                        "text-xs font-medium py-1.5 rounded-lg cursor-pointer transition-all",
                                        !isCurrentMonth && "text-slate-300 opacity-40",
                                        isTodayDate && !isViewedDate && "text-primary font-bold ring-1 ring-primary/30",
                                        isViewedDate ? "bg-primary text-white font-bold shadow-md shadow-primary/20" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {format(day, 'd')}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Próximos Eventos */}
                <div className="cp-cal-card flex flex-col flex-1 min-h-[250px] shrink-0">
                    <h3 className="font-headline text-sm font-bold cp-text-on-surface mb-4 uppercase tracking-wider">Próximos Eventos</h3>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {todaysAppointments.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">{t('app.no_appointments_today')}</p>
                        ) : (
                            todaysAppointments.map(app => (
                                <div key={app.id} onClick={() => { setSelectedAppointment(app); setDetailDialogOpen(true); }} className="flex gap-4 group cursor-pointer">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-white shadow-sm shrink-0 border border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{format(new Date(app.start), 'MMM', { locale: lang === 'gl' ? gl : es })}</span>
                                        <span className="text-lg font-bold cp-text-primary leading-none">{format(new Date(app.start), 'd')}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold cp-text-on-surface group-hover:text-blue-600 transition-colors truncate">{app.patientName}</h4>
                                        <p className="text-xs text-slate-500">{format(new Date(app.start), 'HH:mm')} • {Math.round((new Date(app.end).getTime() - new Date(app.start).getTime()) / 60000)} min</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Capacidad Semanal */}
                <div className="cp-cap-card shrink-0">
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-white uppercase tracking-widest mb-1">Capacidad Semanal</p>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl font-extrabold text-white">{capacityPct}%</span>
                            <span className="text-xs font-medium text-white/80 mb-1">ocupación</span>
                        </div>
                        <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-white h-full rounded-full" style={{ width: `${capacityPct}%` }}></div>
                        </div>
                    </div>
                    <Activity className="absolute -right-4 -bottom-4 text-white/10 w-24 h-24" />
                </div>

                <AppointmentDetailsDialog
                    appointment={selectedAppointment}
                    open={detailDialogOpen}
                    onOpenChange={setDetailDialogOpen}
                    onDeleted={fetchAppointments}
                />
            </div>
        );
    }

    return (
        <div className={cn(
            "hidden lg:flex flex-col w-72 flex-shrink-0 overflow-y-auto",
            isClassic ? "gap-0 border-l border-slate-200 dark:border-slate-800" : "gap-4 w-80"
        )}>
            <div className={cn("h-fit w-full", isClassic ? "glass-panel p-4 border-none rounded-none shadow-none" : "bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm")}>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-primary dark:text-primary-light capitalize font-headline">
                        {(format as any)(currentMonth, 'MMMM yyyy', { locale: lang === 'gl' ? gl : es })}
                    </span>
                    <div className="flex gap-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                        <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[9px] mb-2 text-slate-400 font-bold uppercase tracking-wider">
                    <div>{t('app.mon')}</div>
                    <div>{t('app.tue')}</div>
                    <div>{t('app.wed')}</div>
                    <div>{t('app.thu')}</div>
                    <div>{t('app.fri')}</div>
                    <div>{t('app.sat')}</div>
                    <div>{t('app.sun')}</div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-600 dark:text-gray-300">
                    {days.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isTodayDate = isToday(day);
                        const isViewedDate = isSameDay(day, viewedDate);

                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isBlockedGlobal = blockedDays?.[dateStr] === true;
                        const isBlockedForProf = activeProfessionalId && activeProfessionalId !== 'all' ? blockedDays?.[`${dateStr}_${activeProfessionalId}`] === true : false;
                        const isDayLocked = isBlockedGlobal || isBlockedForProf;

                        const visibleApps = allAppointments.filter(app =>
                            isSameDay(new Date(app.start), day) &&
                            (visibleProfessionalIds.length === 0 || !app.professionalId || visibleProfessionalIds.includes(app.professionalId))
                        );
                        const appCount = visibleApps.length;

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "relative p-1.5 rounded cursor-pointer transition-all flex justify-center items-center min-h-[32px] select-none",
                                    !isCurrentMonth && "opacity-30",
                                    isTodayDate && "ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900 z-10",
                                    isViewedDate && "bg-primary text-white shadow-md shadow-primary/30 scale-105 z-20",
                                    !isViewedDate && !isTodayDate && "hover:bg-slate-100 dark:hover:bg-slate-800",
                                    isDayLocked && !isTodayDate && !isViewedDate && "text-red-500 font-bold", // Added clear red for locked days
                                    !isDayLocked && appCount > 0 && !isTodayDate && !isViewedDate && "font-bold text-slate-900 dark:text-slate-100"
                                )}
                                onClick={() => {
                                    setViewedDate(day);
                                    window.dispatchEvent(new (window as any).CustomEvent('calendar-navigate', { detail: { date: day, view: 'day' } }));
                                }}
                            >
                                {isDayLocked && <Lock className="absolute top-1 left-1 w-2.5 h-2.5 text-red-500/50" />}
                                <span>{format(day, 'd')}</span>
                                {appCount > 0 && (
                                    <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-white dark:ring-slate-900 transform translate-x-1 -translate-y-1 z-10">
                                        {appCount}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Professional Selector Widget */}
            <div className={cn(isClassic ? "p-4 border-none rounded-none shadow-none" : "")}>
                <ProfessionalSelector
                    onVisibleChange={onVisibleProfessionalIdsChange}
                    onActiveChange={onActiveProfessionalIdChange}
                    activeId={activeProfessionalId}
                    isClassic={isClassic}
                />
            </div>

            {/* Upcoming/Waiting Room -> Usuarios del día */}
            <div className={cn("flex-1 flex flex-col min-h-[200px]", isClassic ? "bg-transparent p-4 border-none rounded-none shadow-none" : "bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm")}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('app.todays_users')}</h3>
                    <span 
                        className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: 'rgba(var(--primary-rgb, 0, 74, 198), 0.1)', color: 'var(--color-primary, #004ac6)' }}
                    >
                        {todaysAppointments.filter(a => a.status !== 'COMPLETED').length} Pendientes
                    </span>
                </div>
                <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
                    {todaysAppointments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">{t('app.no_appointments_today')}</p>
                    ) : (
                        todaysAppointments.map(app => {
                            const isCompleted = app.status === 'COMPLETED';
                            const isNoShow = app.status === 'NO_SHOW';

                            return (
                                <div
                                    key={app.id}
                                    onClick={() => {
                                        setSelectedAppointment(app);
                                        setDetailDialogOpen(true);
                                    }}
                                    className={cn(
                                        "p-3 rounded-xl shadow-sm border transition-all flex items-center gap-3 cursor-pointer",
                                        isClassic ? "bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800" : "bg-white dark:bg-slate-800 border-transparent hover:border-primary/20",
                                        (isCompleted || isNoShow) && "opacity-60"
                                    )}
                                >
                                    <div className={cn(
                                        "w-1 h-8 rounded-full shrink-0",
                                        isCompleted ? "bg-green-500" : isNoShow ? "bg-red-500" : "bg-primary"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                            {app.patientName}
                                        </h4>
                                        <p className="text-[10px] text-slate-500">
                                            {format(new Date(app.start), 'HH:mm')} - {format(new Date(app.end), 'HH:mm')}
                                        </p>
                                    </div>
                                    {isCompleted ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                    ) : isNoShow ? (
                                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                                    ) : (
                                        <Clock className="h-4 w-4 text-slate-300 shrink-0" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <AppointmentDetailsDialog
                appointment={selectedAppointment}
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                onDeleted={fetchAppointments}
            />
        </div>
    );
}
