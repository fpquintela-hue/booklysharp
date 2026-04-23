'use client';

import { useState, useEffect, useMemo } from 'react';
import { appointmentService, apiFetch } from '@/lib/mock-service';
import { Appointment } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/context/settings-context';
import { format, startOfDay, startOfMonth, endOfMonth, isSameDay, isSameMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { es, gl } from 'date-fns/locale';
import { BarChart3, CalendarDays, CheckCircle2, TrendingUp, CalendarCheck, AlertTriangle, Clock, Filter, User, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

export default function StatsPage() {
    const { t, lang } = useTranslation();
    const { settings } = useSettings();
    const { user } = useAuth();

    // Auth Check
    if (user?.role !== 'ADMIN') return null;

    const dateLocale = lang === 'gl' ? gl : es;
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [professionals, setProfessionals] = useState<any[]>([]);
    const [appointmentTypes, setAppointmentTypes] = useState<any[]>([]);
    const [selectedProfId, setSelectedProfId] = useState<string>('all');
    const [timeRange, setTimeRange] = useState<'month' | 'lastMonth' | 'year' | 'all'>('month');

    useEffect(() => {
        appointmentService.getAppointments().then(setAppointments);
        apiFetch('professionals').then(setProfessionals).catch(console.error);
        apiFetch('appointment-types').then(setAppointmentTypes).catch(console.error);
    }, []);

    const stats = useMemo(() => {
        const today = new Date();

        // Time Filter setup
        let startDate: Date;
        let endDate: Date;
        if (timeRange === 'month') {
            startDate = startOfMonth(today);
            endDate = endOfMonth(today);
        } else if (timeRange === 'lastMonth') {
            const lastM = subMonths(today, 1);
            startDate = startOfMonth(lastM);
            endDate = endOfMonth(lastM);
        } else if (timeRange === 'year') {
            startDate = startOfYear(today);
            endDate = endOfYear(today);
        } else {
            startDate = new Date(2000, 0, 1);
            endDate = new Date(2100, 0, 1);
        }

        // Filter by Professional and Time
        const filteredApps = appointments.filter((app: any) => {
            const appDate = new Date(app.start);
            const inRange = appDate >= startDate && appDate <= endDate;
            const profMatch = selectedProfId === 'all' || app.professionalId === selectedProfId;
            return inRange && profMatch;
        });

        let totalCount = filteredApps.length;
        let attendedCount = 0;
        let absentCount = 0;
        let totalScheduledMinutes = 0;
        let totalRevenue = 0;

        // By Type
        const typeStats: Record<string, { id: string, count: number, minutes: number, revenue: number, color: string, name: string }> = {};
        // By Prof
        const profStats: Record<string, { id: string, count: number, attendanceCount: number, revenue: number, name: string, color: string }> = {};

        filteredApps.forEach((app: any) => {
            const aType = appointmentTypes.find((t: any) => t.id === app.type);
            const duration = aType?.duration && aType.duration > 0 ? aType.duration : 30;
            const price = aType?.price || 0;

            if (app.status === 'COMPLETED') {
                attendedCount++;
                totalRevenue += price;
            }
            if (app.status === 'NO_SHOW' || app.status === 'CANCELLED') absentCount++;

            totalScheduledMinutes += duration;

            // Type stats
            const tId = app.type || 'unknown';
            if (!typeStats[tId]) {
                typeStats[tId] = { id: tId, count: 0, minutes: 0, revenue: 0, color: aType?.color || '#ccc', name: aType?.name || 'Otro' };
            }
            typeStats[tId].count++;
            typeStats[tId].minutes += duration;
            if (app.status === 'COMPLETED') typeStats[tId].revenue += price;

            // Prof Stats
            const rawProfId = app.professionalId;
            const profId = (rawProfId && rawProfId.trim() !== '') ? rawProfId : 'unassigned';

            if (!profStats[profId]) {
                const p = professionals.find((p: any) => p.id === profId);
                profStats[profId] = { id: profId, count: 0, attendanceCount: 0, revenue: 0, name: p?.name || 'Sin Asignar', color: p?.color || '#64748b' };
            }
            profStats[profId].count++;
            if (app.status === 'COMPLETED') {
                profStats[profId].attendanceCount++;
                profStats[profId].revenue += price;
            }
        });

        // Tracking by YYYY-MM for the last 12 months
        const startOfThisMonth = startOfMonth(today);
        const last12 = Array.from({ length: 12 }).map((_, i) => {
            const date = subMonths(startOfThisMonth, 11 - i);
            return {
                key: format(date, 'yyyy-MM'),
                label: (format as any)(date, 'MMM', { locale: dateLocale }),
                count: 0,
                revenue: 0
            };
        });

        appointments.filter((app: any) => selectedProfId === 'all' || app.professionalId === selectedProfId).forEach((app: any) => {
            const appDate = new Date(app.start);
            const key = format(appDate, 'yyyy-MM');
            const found = last12.find(m => m.key === key);
            if (found) {
                found.count++;
                if (app.status === 'COMPLETED') {
                    const aType = appointmentTypes.find((t: any) => t.id === app.type);
                    found.revenue += (aType?.price || 0);
                }
            }
        });

        const maxCount = Math.max(...last12.map(m => m.count), 1);
        const maxRevenue = Math.max(...last12.map(m => m.revenue), 1);

        const typeStatsArray = Object.entries(typeStats)
            .filter(([id]) => appointmentTypes.some((t: any) => t.id === id))
            .map(([_, data]) => data)
            .sort((a, b) => b.count - a.count);

        const profStatsArray = Object.values(profStats).sort((a: any, b: any) => b.count - a.count);

        return {
            totalCount,
            attendedCount,
            absentCount,
            totalScheduledMinutes,
            totalRevenue,
            typeStats: typeStatsArray,
            profStats: profStatsArray,
            last12,
            maxCount,
            maxRevenue
        };
    }, [appointments, dateLocale, timeRange, selectedProfId, appointmentTypes, professionals]);

    const viewMode = user?.calendarViewMode || settings.calendarViewMode || 'vista1';
    const isClassic = viewMode === 'vista2';

    return (
        <div className={cn(
            "flex-1 flex flex-col h-full relative overflow-hidden bg-background",
            isClassic && "view-mode-classic bg-white dark:bg-slate-900"
        )}>
            {/* Background Decor (Blobs) */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0"></div>

            <header className={cn(
                "glass-panel mx-4 md:mx-6 mt-6 md:mt-6 mb-4 md:mb-4 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 justify-between shrink-0 shadow-sm transition-all z-10",
                isClassic && "mx-0 md:mx-0 mt-0 md:mt-0 mb-0 md:mb-0 top-0 rounded-none border-x-0 border-t-0 shadow-none bg-white dark:bg-slate-900 border-b border-solid border-slate-300 dark:border-slate-800 backdrop-blur-none"
            )}>
                <div className="flex items-center gap-4">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase">
                        {t('stats.title')}
                    </h1>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center shrink-0">
                        <User className="w-4 h-4 text-slate-500 mx-2" />
                        <select
                            className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-0 outline-none pr-4 cursor-pointer"
                            value={selectedProfId}
                            onChange={(e) => setSelectedProfId(e.target.value)}
                        >
                            <option value="all">Todos los Profesionales</option>
                            {professionals.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center shrink-0">
                        <Filter className="w-4 h-4 text-slate-500 mx-2" />
                        <select
                            className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-0 outline-none pr-4 cursor-pointer"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                        >
                            <option value="month">Este Mes</option>
                            <option value="lastMonth">Mes Anterior</option>
                            <option value="year">Este Año</option>
                            <option value="all">Histórico Completo</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className={cn(
                "flex-1 overflow-y-auto px-4 md:px-6 pb-6 z-10 custom-scrollbar space-y-6",
                isClassic && "px-4 md:px-6 pb-0"
            )}>
                {/* Stats Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
                    {/* Card: Total Revenue */}
                    <div className={cn(
                        "glass-panel rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group border-2 border-emerald-500/20",
                        isClassic && "border border-slate-200 dark:border-slate-800 shadow-none border-l-4 border-l-emerald-600"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                                {t('stats.revenue') || 'Ingresos'}
                            </h3>
                        </div>
                        <div className="mt-2 flex items-end justify-between">
                            <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                                {stats.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€
                            </span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/5 rounded-full group-hover:scale-110 transition-transform"></div>
                    </div>

                    {/* Card: Total Appointments */}
                    <div className={cn(
                        "glass-panel rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group",
                        isClassic && "border border-slate-200 dark:border-slate-800 shadow-none border-l-4 border-l-primary"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                                <CalendarDays className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                                Total Citas
                            </h3>
                        </div>
                        <div className="mt-2 flex items-end justify-between">
                            <span className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                                {stats.totalCount}
                            </span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-110 transition-transform"></div>
                    </div>

                    {/* Card: Attendance Rate */}
                    <div className={cn(
                        "glass-panel rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group",
                        isClassic && "border border-slate-200 dark:border-slate-800 shadow-none border-l-4 border-l-green-500"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-green-500/10 text-green-500">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                                Asistencia
                            </h3>
                        </div>
                        <div className="mt-2 flex items-end justify-between">
                            <span className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                                {stats.totalCount > 0 ? Math.round((stats.attendedCount / stats.totalCount) * 100) : 0}%
                            </span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-green-500/5 rounded-full group-hover:scale-110 transition-transform"></div>
                    </div>

                    {/* Card: Absent Appointments */}
                    <div className={cn(
                        "glass-panel rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group",
                        isClassic && "border border-slate-200 dark:border-slate-800 shadow-none border-l-4 border-l-red-500"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                                Ausencias
                            </h3>
                        </div>
                        <div className="mt-2 flex items-end justify-between">
                            <span className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                                {stats.absentCount}
                            </span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-500/5 rounded-full group-hover:scale-110 transition-transform"></div>
                    </div>
                </div>

                {/* Main Content: Chart & Activity */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6 mt-6">
                    {/* Bar Chart Panel */}
                    <div className={cn(
                        "xl:col-span-3 glass-panel rounded-xl p-6 flex flex-col min-h-[400px]",
                        isClassic && "border border-slate-200 dark:border-slate-800 shadow-none"
                    )}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary" />
                                Ingresos y Actividad Mensual
                            </h3>
                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 bg-primary rounded-sm"></div>
                                    <span className="text-slate-500">Citas</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                                    <span className="text-slate-500">Ingresos (€)</span>
                                </div>
                            </div>
                        </div>

                        {/* Custom CSS Bar Chart */}
                        <div className="flex-1 flex items-end gap-2 md:gap-4 relative pt-10">
                            {/* Horizontal guide lines */}
                            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between pointer-events-none z-0">
                                {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => (
                                    <div key={i} className="w-full flex items-center border-b border-slate-200/50 dark:border-slate-700/50 flex-1 border-dashed">
                                        <span className="-ml-6 text-[10px] text-slate-400 absolute">
                                            {Math.round(tick * stats.maxCount)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Bars */}
                            {stats.last12.map((month: any, idx: number) => {
                                const heightCount = stats.maxCount > 0 ? (month.count / stats.maxCount) * 100 : 0;
                                const heightRev = stats.maxRevenue > 0 ? (month.revenue / stats.maxRevenue) * 100 : 0;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full z-10 group mt-auto">

                                        {/* Value Tooltip pop up on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-black px-2 py-1.5 rounded-lg mb-2 whitespace-nowrap shadow-xl flex flex-col items-center gap-0.5 z-20">
                                            <span>{month.count} CITAS</span>
                                            <span className="text-emerald-400">{month.revenue.toFixed(2)}€</span>
                                        </div>

                                        <div className="w-full relative flex justify-center h-[85%] items-end gap-0.5">
                                            <div
                                                className="w-full max-w-[12px] bg-primary rounded-t-sm transition-all duration-700 ease-out group-hover:brightness-110"
                                                style={{ height: `${heightCount}%` }}
                                            />
                                            <div
                                                className="w-full max-w-[12px] bg-emerald-500 rounded-t-sm transition-all duration-700 ease-out group-hover:brightness-110"
                                                style={{ height: `${heightRev}%`, transitionDelay: '100ms' }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 mt-3 uppercase tracking-tighter">
                                            {month.label.substring(0, 3)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Secondary Metrics / Info */}
                    <div className={cn(
                        "xl:col-span-1 glass-panel rounded-xl p-6 flex flex-col gap-8 custom-scrollbar min-h-[400px] overflow-y-auto",
                        isClassic && "border border-slate-200 dark:border-slate-800 shadow-none"
                    )}>
                        {/* Types Breakdown */}
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-primary" />
                                Tipos de Cita
                            </h3>
                            <div className="flex flex-col gap-4">
                                {stats.typeStats.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No hay datos en este periodo.</p>
                                ) : (
                                    stats.typeStats.map((ts: any) => (
                                        <div key={ts.id} className="space-y-2">
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ts.color }}></span>
                                                    {ts.name}
                                                </span>
                                                <span className="text-slate-900 dark:text-slate-100 font-bold">
                                                    {ts.count} ({ts.revenue.toFixed(2)}€)
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${stats.totalCount > 0 ? (ts.count / stats.totalCount) * 100 : 0}%`, backgroundColor: ts.color }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] text-slate-500">
                                                <span>{Math.round(ts.minutes / 60)}h estimadas</span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{(ts.revenue / (ts.revenue || 1) * 100).toFixed(0)}% Fact.</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Profs Breakdown */}
                        <div>
                            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Por Profesional
                            </h3>
                            <div className="flex flex-col gap-4">
                                {stats.profStats.length === 0 ? (
                                    <p className="text-sm text-slate-500 italic">No hay datos en este periodo.</p>
                                ) : (
                                    stats.profStats.map((ps: any) => (
                                        <div key={ps.id} className="space-y-2">
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span className="text-slate-600 dark:text-slate-300 flex items-center flex-1 gap-2 truncate">
                                                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: ps.color }}></span>
                                                    <span className="truncate">{ps.name}</span>
                                                </span>
                                                <span className="text-slate-900 dark:text-slate-100 font-bold shrink-0 ml-2 text-right">
                                                    {ps.count} citas<br/>
                                                    <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">{ps.revenue.toFixed(2)}€</span>
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-[10px] text-slate-500">
                                                <span>Asistencia: {ps.count > 0 ? Math.round((ps.attendanceCount / ps.count) * 100) : 0}%</span>
                                                <span className="font-black text-slate-400">{(ps.count > 0 ? ps.revenue / ps.count : 0).toFixed(1)}€/cita</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
