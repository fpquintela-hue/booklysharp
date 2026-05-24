'use client';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { es, gl } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './chunkipunki-calendar.css';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Appointment } from '@/types';
import { useSettings } from '@/context/settings-context';
import { appointmentService, apiFetch } from '@/lib/mock-service';
import { AppointmentDetailsDialog } from './AppointmentDetailsDialog';
import { AppointmentDialog } from './AppointmentDialog';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/context/auth-context';
import { useScheduleRules } from '@/lib/useScheduleRules';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MobileToolbar } from './MobileToolbar';
import { cn } from '@/lib/utils';
import {
    ChevronLeft,
    ChevronRight,
    Lock,
    Unlock,
} from 'lucide-react';

const DragAndDropCalendar = withDragAndDrop(Calendar) as any;

const locales = {
    'es': es,
    'gl': gl,
};

const localizer = dateFnsLocalizer({
    format: (date: any, formatStr: any, options: any) => (format as any)(date, formatStr, options),
    parse: (str: any, formatStr: any, options: any) => (parse as any)(str, formatStr, options),
    startOfWeek: (date: any, options: any) => (startOfWeek as any)(date, options),
    getDay,
    locales,
});

interface CalendarViewProps {
    searchQuery?: string;
    visibleProfessionalIds: string[];
    activeProfessionalId: string | null;
}

export default function CalendarView({
    searchQuery = '',
    visibleProfessionalIds,
    activeProfessionalId
}: CalendarViewProps) {
    const [events, setEvents] = useState<Appointment[]>([]);
    const [view, setView] = useState<View>(Views.WEEK);
    const [date, setDate] = useState(new Date());
    const [appointmentTypes, setAppointmentTypes] = useState<{ name: string, color: string }[]>([]);
    const [professionals, setProfessionals] = useState<{ id: string, name: string, color: string }[]>([]);

    const { settings, blockedDays, toggleBlockDay } = useSettings();
    const { user } = useAuth();
    const { t, lang } = useTranslation();

    const dateLocale = lang === 'gl' ? gl : es;

    const startTimeStr = settings.startTime || '09:00';
    const endTimeStr = settings.endTime || '20:00';
    const gridStep = parseInt(settings.gridStep || '30');
    const viewMode = user?.calendarViewMode || settings.calendarViewMode || 'vista1';

    const [startHour, startMin] = startTimeStr.split(':').map(Number);
    const [endHour, endMin] = endTimeStr.split(':').map(Number);

    const minDate = new Date(0, 0, 0, isNaN(startHour) ? 9 : startHour, isNaN(startMin) ? 0 : startMin, 0);
    const maxDate = new Date(0, 0, 0, isNaN(endHour) ? 20 : endHour, isNaN(endMin) ? 0 : endMin, 0);

    // Memoized parsed blocked slots for performance (avoids JSON.parse on every slot render)
    const parsedBlockedSlots = useMemo(() => {
        try { return JSON.parse(settings.blockedSlots || '[]'); } catch { return []; }
    }, [settings.blockedSlots]);

    const filteredEvents = useMemo(() => {
        let result = events;
        if (visibleProfessionalIds.length > 0) {
            result = result.filter(event =>
                !event.professionalId || visibleProfessionalIds.includes(event.professionalId)
            );
        }
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(event =>
                event.patientName.toLowerCase().includes(lowerQuery) ||
                (event.notes && event.notes.toLowerCase().includes(lowerQuery))
            );
        }
        return result;
    }, [events, searchQuery, visibleProfessionalIds]);

    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
    const [moveData, setMoveData] = useState<{ event: Appointment, start: Date, end: Date } | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [createSlotData, setCreateSlotData] = useState<{ start: Date, end: Date } | null>(null);
    const [dayToToggle, setDayToToggle] = useState<string | null>(null);
    const [toolbarPortalNode, setToolbarPortalNode] = useState<HTMLElement | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    const { validateAppointment, getSlotStyle, isTimeRangeBlocked } = useScheduleRules(blockedDays, settings);

    const currentResources = useMemo(() => {
        if (view !== Views.DAY) return undefined;
        return professionals.map(p => ({
            id: p.id,
            title: p.name,
            image: (p as any).image,
            color: (p as any).color,
            description: (p as any).description
        }));
    }, [view, professionals]);

    const allEvents = useMemo(() => {
        return filteredEvents.map(e => ({
            ...e,
            resourceId: e.professionalId
        }));
    }, [filteredEvents]);

    const calendarFormats = useMemo(() => ({
        timeGutterFormat: (date: Date, culture: string | undefined, localizer: any) =>
            localizer.format(date, 'HH:mm', culture),
    }), []);

    const loadEvents = useCallback(() => {
        if (!user) return; // Prevent 401s if session isn't ready
        
        appointmentService.getAppointments()
            .then(setEvents)
            .catch((e) => console.warn("Error cargando citas:", e.message));
        apiFetch('appointment-types')
            .then(setAppointmentTypes)
            .catch((e: Error) => console.warn("Tipos de cita no cargados:", e.message));
        apiFetch('professionals')
            .then(setProfessionals)
            .catch(console.error);
    }, [user]);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        window.dispatchEvent(new (window as any).CustomEvent('calendar-date-updated', { detail: { date } }));
    }, [date]);

    useEffect(() => {
        loadEvents();
        setToolbarPortalNode(document.getElementById('calendar-toolbar-portal'));

        const handleNavigate = (e: any) => {
            setDate(e.detail.date);
            setView(e.detail.view);
        };

        window.addEventListener('refreshAppointments', loadEvents);
        window.addEventListener('calendar-navigate', handleNavigate);
        const handleOpenCreate = () => {
            setCreateSlotData({ start: new Date(), end: new Date() });
            setIsCreateDialogOpen(true);
        };
        window.addEventListener('open-new-appointment', handleOpenCreate);

        const interval = setInterval(loadEvents, 10000);
        return () => {
            clearInterval(interval);
            window.removeEventListener('refreshAppointments', loadEvents);
            window.removeEventListener('calendar-navigate', handleNavigate);
            window.removeEventListener('open-new-appointment', handleOpenCreate);
        };
    }, [loadEvents]);

    const onSelectEvent = (event: Appointment) => {
        setSelectedAppointment(event);
        setIsDetailsOpen(true);
    };

    const onEventDrop = async ({ event, start, end }: any) => {
        if (
            new Date(event.start).getTime() === new Date(start).getTime() &&
            new Date(event.end).getTime() === new Date(end).getTime()
        ) return;
        setMoveData({ event, start, end });
        setIsMoveDialogOpen(true);
    };

    const confirmMove = async () => {
        if (!moveData) return;
        const { event, start, end } = moveData;
        const appointment = event as Appointment;
        const validation = validateAppointment(start as Date, appointment.type as any, appointment.professionalId, end as Date);
        if (!validation.valid) {
            toast.warning(validation.message || t('calendar.error_blocked_range'));
            setMoveData(null);
            setIsMoveDialogOpen(false);
            return;
        }
        const updatedEvents = events.map(e =>
            e.id === appointment.id ? { ...e, start, end } : e
        );
        setEvents(updatedEvents);
        setIsMoveDialogOpen(false);
        try {
            await appointmentService.updateAppointment(appointment.id, { start: start as Date, end: end as Date });
            setMoveData(null);
        } catch (error) {
            console.error('Failed to move event', error);
            loadEvents();
            setMoveData(null);
        }
    };

    const onEventResize = async ({ event, start, end }: any) => {
        if (
            new Date(event.start).getTime() === new Date(start).getTime() &&
            new Date(event.end).getTime() === new Date(end).getTime()
        ) return;
        setMoveData({ event, start, end });
        setIsMoveDialogOpen(true);
    };

    const onSelectSlot = ({ start, end, action }: { start: Date, end: Date, action: 'select' | 'click' | 'doubleClick' }) => {
        if (action === 'select') {
            const validation = validateAppointment(start, 'CONSULTA' as any, activeProfessionalId === 'all' ? null : activeProfessionalId, end);
            if (!validation.valid) {
                toast.warning(validation.message || t('calendar.error_blocked_range'));
                return;
            }
            setCreateSlotData({ start, end });
            setIsCreateDialogOpen(true);
        }
    };

    // ─── Event Colour Logic ───────────────────────────────────────────────────
    const eventStyleGetter = (event: Appointment) => {
        const typeConfig = appointmentTypes.find(t => t.name.toUpperCase() === event.type.toUpperCase());
        const baseColor = event.color || typeConfig?.color || '#3b82f6';

        // Determine if this is the 2nd in a run of same-type appointments (softer shade)
        const dayEvents = events
            .filter(e =>
                e.start.getFullYear() === event.start.getFullYear() &&
                e.start.getMonth() === event.start.getMonth() &&
                e.start.getDate() === event.start.getDate()
            )
            .sort((a, b) => a.start.getTime() - b.start.getTime());

        const currentIdx = dayEvents.findIndex(e => e.id === event.id);
        const prevEvent = currentIdx > 0 ? dayEvents[currentIdx - 1] : null;
        const isSoft = !!(prevEvent && prevEvent.type === event.type);

        // Parse hex → rgb for alpha backgrounds
        const hexVal = baseColor.replace('#', '');
        const r = parseInt(hexVal.substring(0, 2), 16);
        const g = parseInt(hexVal.substring(2, 4), 16);
        const b = parseInt(hexVal.substring(4, 6), 16);

        const prof = professionals.find(p => p.id === event.professionalId);
        const profColor = event.professionalColor || prof?.color || baseColor;

        return {
            style: {
                backgroundColor: `rgba(${r},${g},${b}, 0.15)`, /* Soft color bubble based on service */
                borderLeft: `4px solid ${profColor}`,          /* Solid left bar based on professional */
                color: 'var(--text-main)',
                borderTopLeftRadius: '4px',
                borderBottomLeftRadius: '4px',
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                padding: '0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            }
        };
    };

    // ─── Custom Event Cell ────────────────────────────────────────────────────
    const CustomEvent = ({ event }: { event: Appointment }) => {
        const durationMin = (new Date(event.end).getTime() - new Date(event.start).getTime()) / 60000;
        const isCompact = durationMin <= 20;
        const startStr = format(new Date(event.start), 'HH:mm');
        const endStr = format(new Date(event.end), 'HH:mm');

        // Get professional color for the top badge
        const prof = professionals.find(p => p.id === event.professionalId);
        const typeConfig = appointmentTypes.find(t => t.name.toUpperCase() === event.type?.toUpperCase());
        const accentColor = typeConfig?.color || prof?.color || '#3b82f6';

        return (
            <div className="flex flex-col h-full overflow-hidden pl-2 pr-1 py-0.5 gap-0">
                {/* Time badge — only show when space allows */}
                {!isCompact && (
                    <span
                        className="text-[9px] font-semibold tracking-tight leading-none mb-0.5 mt-0.5"
                        style={{ color: 'white', opacity: 0.75 }}
                    >
                        {startStr} — {endStr}
                    </span>
                )}
                {/* Patient name */}
                <span className="font-bold text-[11px] leading-tight text-white line-clamp-1">
                    {event.patientName.includes(',')
                        ? event.patientName.split(',').reverse().map(s => s.trim()).join(' ')
                        : event.patientName}
                </span>
                {/* Professional name — only when has space */}
                {!isCompact && prof && (
                    <span className="text-[9px] font-medium leading-none mt-0.5 truncate" style={{ color: 'white', opacity: 0.8 }}>
                        {prof.name}
                    </span>
                )}
            </div>
        );
    };

    // ─── Custom Month Event Cell (Chunkipunki Style) ───────────────────────────
    const CustomMonthEvent = ({ event }: { event: Appointment }) => {
        const typeConfig = appointmentTypes.find(t => t.name.toUpperCase() === event.type?.toUpperCase());
        const isBlocked = event.type === 'BLOCKED' || event.patientBloqueado;
        const isUrgency = event.type === 'URGENCY' || event.notes?.toLowerCase()?.includes('urgencia');
        
        let customClass = "cp-event-pill";
        if (isBlocked) customClass += " cp-event-blocked";
        else if (isUrgency) customClass += " cp-event-urgency";

        return (
            <div className={customClass} title={`${format(new Date(event.start), 'HH:mm')} - ${event.patientName}`}>
                {event.patientName.includes(',')
                    ? event.patientName.split(',').reverse().map(s => s.trim()).join(' ')
                    : event.patientName}
            </div>
        );
    };

    // ─── Custom Week/Day Event Card (Chunkipunki Style) ────────────────────────
    const CustomWeekEvent = ({ event }: { event: Appointment }) => {
        const typeConfig = appointmentTypes.find(t => t.name.toUpperCase() === event.type?.toUpperCase());
        const isBlocked = event.type === 'BLOCKED' || event.patientBloqueado;
        const isUrgency = event.type === 'URGENCY' || event.notes?.toLowerCase()?.includes('urgencia');
        
        let containerClass = "cp-week-event-card";
        if (isBlocked) containerClass += " cp-week-event-blocked";
        else if (isUrgency) containerClass += " cp-week-event-urgency";

        const baseColor = event.color || typeConfig?.color || '#3b82f6';
        
        const h = baseColor.replace('#', '');
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        const softBg = isBlocked ? 'rgba(239, 68, 68, 0.1)' : isUrgency ? 'rgba(104, 76, 182, 0.1)' : `rgba(${r},${g},${b}, 0.12)`;
        
        const prof = professionals.find(p => p.id === event.professionalId);
        const profColor = event.professionalColor || prof?.color || baseColor;
        const solidBar = isBlocked ? '#ef4444' : isUrgency ? '#684cb6' : profColor;

        return (
            <div className={containerClass} 
                 style={{ 
                    backgroundColor: softBg, 
                    borderLeft: `${isMobile ? '3px' : '5px'} solid ${solidBar}`,
                    borderRadius: isMobile ? '4px' : '8px',
                    borderTopLeftRadius: '2px',
                    borderBottomLeftRadius: '2px',
                    height: isMobile ? '100%' : 'calc(100% - 4px)',
                    margin: isMobile ? '0' : '2px',
                    padding: isMobile ? '2px 4px' : '4px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: isMobile ? '0' : '2px'
                 }}>
                {!isMobile && (
                    <div className="cp-week-time" style={{ color: solidBar, fontWeight: 800, fontSize: '0.65rem' }}>
                        {format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}
                    </div>
                )}
                <div className="cp-week-patient overflow-visible whitespace-normal break-words leading-tight" style={{ color: solidBar, fontWeight: 800, fontSize: isMobile ? '0.7rem' : '0.92rem' }}>
                    {event.patientName.includes(',')
                        ? event.patientName.split(',').reverse().map(s => s.trim()).join(' ')
                        : event.patientName}
                </div>
            </div>
        );
    };

    // ─── Week/Day Column Header ───────────────────────────────────────────────
    const CustomHeader = ({ date }: { date: Date }) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayName = (format as any)(date, 'eee', { locale: dateLocale }).toUpperCase();
        const dayNumber = format(date, 'd');
        const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
        const dayIndex = getDay(date);

        const isBlockedGlobal = blockedDays[dateStr] === true;
        const profCheckKey = `${dateStr}_${activeProfessionalId}`;
        const isBlockedForProf = activeProfessionalId && activeProfessionalId !== 'all' ? blockedDays[profCheckKey] === true : false;
        const isBlocked = isBlockedGlobal || isBlockedForProf;

        return (
            <div className={cn(
                "group h-[85px] flex flex-col items-center justify-center relative w-full bg-transparent"
            )}>
                <span className={cn(
                    "text-[0.65rem] md:text-[0.75rem] uppercase tracking-[0.05em] font-bold font-inter",
                    isToday ? "text-primary dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                )}>
                    {dayName}
                </span>

                <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); toggleBlockDay(dateStr, undefined, activeProfessionalId === 'all' ? null : activeProfessionalId); }}
                    className={cn(
                        "p-1 rounded-md transition-all duration-200 z-[10] cursor-pointer flex items-center justify-center bg-transparent my-0.5 hover:bg-slate-100 dark:hover:bg-slate-800",
                        isBlocked
                            ? "text-red-500 opacity-100"
                            : "text-slate-300 dark:text-slate-600 hover:text-primary dark:hover:text-blue-400 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    )}
                >
                    {isBlocked ? <Lock className="w-3 h-3 md:w-4 md:h-4" /> : <Unlock className="w-3 h-3 md:w-4 md:h-4" />}
                </div>

                {isToday ? (
                     <div key={`cal-today-${dayNumber}`} className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg bg-primary"
                          style={{ boxShadow: '0 8px 16px -4px rgba(0, 91, 196, 0.5)' }}>
                         <span className="font-headline text-lg md:text-xl font-bold text-white mb-[1px]">
                            {dayNumber}
                         </span>
                     </div>
                ) : (
                    <span className="font-headline text-lg md:text-xl font-bold text-slate-700 dark:text-slate-300">
                        {dayNumber}
                    </span>
                )}
            </div>
        );
    };

    // ─── Month View: Day-of-week headers ─────────────────────────────────────
    const CustomMonthHeader = ({ date }: { date: Date }) => {
        const dayName = (format as any)(date, 'eee', { locale: dateLocale }).toUpperCase();
        const dayIndex = getDay(date);
        const isWeekendFlag = dayIndex === 0 || dayIndex === 6;
        return (
            <div className="flex flex-col items-center py-2">
                <span className={cn(
                    "text-[10px] font-bold tracking-widest transition-colors",
                    isWeekendFlag ? "text-[var(--color-primary)] dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                )}>
                    {dayName}
                </span>
            </div>
        );
    };

    // ─── Month View: Date cell header ─────────────────────────────────────────
    const CustomDateHeader = ({ label, date, isOffRange }: any) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
        const dayIndex = getDay(date);
        const isWeekendFlag = dayIndex === 0 || dayIndex === 6;
        const isBlockedGlobal = blockedDays[dateStr] === true;
        const profCheckKey = `${dateStr}_${activeProfessionalId}`;
        const isBlockedForProf = activeProfessionalId && activeProfessionalId !== 'all' ? blockedDays[profCheckKey] === true : false;
        const isBlocked = isBlockedGlobal || isBlockedForProf;
        return (
            <div className="flex items-center justify-between w-full px-1 group/date h-full min-h-[1.5rem] relative">
                <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); toggleBlockDay(dateStr, undefined, activeProfessionalId === 'all' ? null : activeProfessionalId); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); toggleBlockDay(dateStr, undefined, activeProfessionalId === 'all' ? null : activeProfessionalId); } }}
                    className={cn(
                        "p-1 rounded-md transition-all duration-200 absolute left-0.5 top-0.5 z-20 cursor-pointer flex items-center justify-center",
                        isBlocked
                            ? "bg-red-50 text-red-500 shadow-sm"
                            : "text-slate-200 hover:text-slate-400 group-hover/date:opacity-100 opacity-0"
                    )}
                >
                    {isBlocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </div>
                <div className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full ml-auto mr-1 font-bold text-xs",
                    isToday ? "bg-[var(--color-primary)] text-white shadow-md shadow-primary/20"
                        : isOffRange ? "text-slate-300"
                            : isWeekendFlag ? "text-[var(--color-primary)]/70"
                                : "text-slate-600"
                )}>
                    {label}
                </div>
            </div>
        );
    };

    // ─── Resource header (Day view with multiple professionals) ───────────────
    const CustomResourceHeader = ({ label, resource }: any) => {
        const profImage = resource?.image;
        const profColor = resource?.color || '#3b82f6';
        const finalImageUrl = profImage?.startsWith('/img/') ? profImage.replace('/img/', '/api/img/') : profImage;
        const specialty = resource?.description || 'ESPECIALISTA'; // Fallback so it always looks nice visually
        
        return (
            <div className="flex flex-col items-center justify-center py-4 px-2 gap-2 h-full min-h-[130px]">
                <div className="relative">
                    {/* Contenedor central de la foto con bordes redondeados (clase 2xl) y algo de sombra perimetral de la foto */}
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex items-center justify-center bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/50">
                        {finalImageUrl
                            ? <img src={finalImageUrl} alt={label} className="w-full h-full object-cover shrink-0" />
                            : <div className="w-full h-full flex items-center justify-center text-white font-black text-xl md:text-2xl" style={{ backgroundColor: profColor }}>{label.charAt(0).toUpperCase()}</div>
                        }
                    </div>
                    {/* Botón color identificativo redondo inferior derecho */}
                    <div 
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-white dark:border-slate-900 z-10 shadow-sm" 
                        style={{ backgroundColor: profColor }}
                    />
                </div>
                
                <div className="flex flex-col items-center mt-1">
                    <span className="text-[14px] md:text-[15px] font-headline font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-tight text-center truncate w-full px-1">{label}</span>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-[0.15em] text-slate-400 mt-1">{specialty}</span>
                </div>
            </div>
        );
    };

    // ─── Toolbar (portaled into top header) ───────────────────────────────────
    const CalendarToolbar = (props: any) => {
        if (!toolbarPortalNode) return null;

        // Build the date range label like "Marzo 23 – 29"
        const weekStart = (startOfWeek as any)(props.date, { locale: dateLocale, weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        const monthName = (format as any)(props.date, 'MMMM', { locale: dateLocale });
        const capitalMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

        let label = props.label;
        const tenantName = settings.appTitle || settings.company_name || user?.tenantAlias || 'BooklySharp';
        if (view === Views.WEEK) {
            const weekNum = (format as any)(props.date, 'w', { locale: dateLocale });
            label = `${tenantName} - ${capitalMonth} ${format(weekStart, 'd')} – ${format(weekEnd, 'd')} | Semana ${weekNum}`;
        } else if (view === Views.DAY) {
            label = (format as any)(props.date, "d 'de' MMMM", { locale: dateLocale });
            label = `${tenantName} - ` + label.charAt(0).toUpperCase() + label.slice(1);
        } else if (view === Views.MONTH) {
            label = `${tenantName} - ${capitalMonth} ${format(props.date, 'yyyy')}`;
        }

        const viewLabels: Record<string, string> = {
            day: t('app.day'),
            week: t('app.week'),
            month: t('app.month'),
        };

        return createPortal(
            <div className="flex items-center justify-between w-full h-full gap-4 min-h-[44px]">
                {/* Date label */}
                <h2 
                    className="text-[15px] font-bold font-headline whitespace-nowrap text-primary dark:text-blue-400"
                >
                    {label}
                </h2>

                {/* View switcher — pill tabs */}
                <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl p-1.5 border border-slate-200/30 dark:border-slate-700/50">
                    {(['day', 'week', 'month'] as const).map(v => (
                        <button
                            key={v}
                            onClick={() => props.onView(v)}
                            className={cn(
                                "text-[13px] font-bold px-4 py-1.5 rounded-xl transition-all",
                                props.view === v
                                    ? "bg-white dark:bg-slate-700 shadow-sm text-primary dark:text-blue-400"
                                    : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                            )}
                        >
                            {viewLabels[v]}
                        </button>
                    ))}
                </div>

                {/* Navigation arrows + Today */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                    <button
                        onClick={() => props.onNavigate('PREV')}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => props.onNavigate('TODAY')}
                        className="text-[12px] font-semibold px-3 h-8 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 transition-colors"
                    >
                        {t('calendar.today')}
                    </button>
                    <button
                        onClick={() => props.onNavigate('NEXT')}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>,
            toolbarPortalNode
        );
    };

    // ─── Shared Calendar Props ─────────────────────────────────────────────────
    const sharedComponents = {
        event: CustomEvent,
        resourceHeader: CustomResourceHeader,
        header: CustomHeader,
        month: {
            event: CustomMonthEvent,
            header: CustomMonthHeader,
            dateHeader: CustomDateHeader
        },
        week: { 
            header: CustomHeader,
            event: CustomWeekEvent
        },
        day: { 
            header: CustomHeader,
            event: CustomWeekEvent
        },
        toolbar: CalendarToolbar,
    };

    const sharedMessages = {
        next: t('calendar.next'),
        previous: t('calendar.previous'),
        today: t('calendar.today'),
        month: t('calendar.month'),
        week: t('calendar.week'),
        day: t('calendar.day'),
        agenda: t('calendar.agenda'),
        date: t('modal.fecha'),
        time: t('modal.time'),
        event: t('app.title'),
        noEventsInRange: t('calendar.no_events'),
        showMore: (total: number) => `+ ${total} ${t('calendar.show_more')}`
    };
    return (
        <div className={cn(
            "h-full w-full flex flex-col relative overflow-hidden chunkipunki-theme",
            viewMode !== 'vista1' && "classic-mode",
            `grid-step-${gridStep}`
        )}>
            <MobileToolbar
                date={date}
                view={view}
                onView={setView}
                onNavigate={(action) => {
                    const newDate = new Date(date);
                    if (action === 'TODAY') { setDate(new Date()); return; }
                    const amount = action === 'NEXT' ? 1 : -1;
                    if (view === Views.MONTH) newDate.setMonth(newDate.getMonth() + amount);
                    if (view === Views.WEEK) newDate.setDate(newDate.getDate() + (amount * 7));
                    if (view === Views.DAY) newDate.setDate(newDate.getDate() + amount);
                    setDate(newDate);
                }}
                label={`${(format as any)((startOfWeek as any)(date, { locale: dateLocale, weekStartsOn: 1 }), 'MMMM dd', { locale: dateLocale })} - ${(format as any)(addDays((startOfWeek as any)(date, { locale: dateLocale, weekStartsOn: 1 }), 6), 'dd', { locale: dateLocale })}`}
            />

            <DragAndDropCalendar
                className="h-full custom-scrollbar"
                localizer={localizer}
                culture={lang}
                events={allEvents}
                startAccessor={(event: any) => new Date(event.start)}
                endAccessor={(event: any) => new Date(event.end)}
                style={{ height: '100%' }}
                components={sharedComponents}
                view={view}
                onView={setView}
                date={date}
                selectable={view !== Views.MONTH}
                onSelectSlot={onSelectSlot}
                onNavigate={setDate}
                eventPropGetter={eventStyleGetter}
                titleAccessor="patientName"
                resources={currentResources}
                resourceIdAccessor="id"
                resourceTitleAccessor="title"
                onEventDrop={onEventDrop}
                onEventResize={onEventResize}
                draggableAccessor={(event: Appointment) => event.type !== 'BLOCKED'}
                resizable={false}
                views={['month', 'week', 'day']}
                messages={sharedMessages}
                min={minDate}
                max={maxDate}
                step={gridStep}
                timeslots={1}
                allDaySlot={false}
                formats={calendarFormats}
                slotPropGetter={(date: Date, resourceId?: string | number) =>
                    getSlotStyle(date, resourceId ? String(resourceId) : (activeProfessionalId === 'all' ? null : activeProfessionalId))
                }
                onSelectEvent={onSelectEvent}
                scrollToTime={new Date(new Date().setHours(new Date().getHours() - 4))}
            />

            <AppointmentDetailsDialog
                appointment={selectedAppointment}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                onDeleted={loadEvents}
            />
            <AppointmentDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                defaultSlot={createSlotData || undefined}
                hideTrigger={true}
                onAppointmentCreated={loadEvents}
                activeProfessionalId={activeProfessionalId}
            />

            {/* Move confirmation dialog */}
            <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirmar movimiento de cita</DialogTitle>
                        <DialogDescription asChild>
                            <div>
                                {moveData && (
                                    <p>¿Desea mover la cita de <strong>{moveData.event.patientName}</strong> al{' '}
                                        <strong>{(format as any)(moveData.start, "EEEE d 'de' MMMM", { locale: es })}</strong> a las{' '}
                                        <strong>{(format as any)(moveData.start, 'HH:mm', { locale: es })}</strong>?
                                    </p>
                                )}
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsMoveDialogOpen(false); loadEvents(); }}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={confirmMove}>Aceptar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Block/Unblock Day dialog */}
            <Dialog open={!!dayToToggle} onOpenChange={(open) => !open && setDayToToggle(null)}>
                <DialogContent className="dark:bg-slate-900 border-none">
                    <DialogHeader>
                        <DialogTitle className="dark:text-white">{dayToToggle && (blockedDays[dayToToggle] ? 'Desbloquear' : 'Bloquear')} Día</DialogTitle>
                        <DialogDescription className="dark:text-slate-400">
                            ¿Estás seguro de que quieres {dayToToggle && (blockedDays[dayToToggle] ? 'desbloquear' : 'bloquear')} el día {dayToToggle}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDayToToggle(null)} className="dark:border-slate-800 dark:text-white dark:hover:bg-slate-800">{t('common.cancel')}</Button>
                        <Button
                            variant={dayToToggle && blockedDays[dayToToggle] ? "default" : "destructive"}
                            onClick={() => {
                                if (dayToToggle) {
                                    toggleBlockDay(dayToToggle, !blockedDays[dayToToggle]);
                                    setDayToToggle(null);
                                }
                            }}
                        >
                            Aceptar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
