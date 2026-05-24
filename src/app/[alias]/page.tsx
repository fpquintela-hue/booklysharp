'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// ── Existing app infrastructure ─────────────────────────────────────────────
import { useAuth } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { appointmentService, apiFetch } from '@/lib/mock-service';
import { Appointment } from '@/types';
import { LogoutDialog } from '@/components/LogoutDialog';
import { AppointmentDetailsDialog } from '@/components/AppointmentDetailsDialog';
import CalendarView from '@/components/CalendarView';
import { Sidebar } from '@/components/Sidebar';
import { OnboardingGuide } from '@/components/OnboardingGuide';

// ── Lucide icons (same set as Sidebar.tsx) ──────────────────────────────────
  CalendarDays, Users, LayoutDashboard, BarChart3, Globe,
  Settings, LogOut, Search, Bell, Plus, ChevronLeft, ChevronRight, HelpCircle,
  RefreshCw, CheckCircle2, XCircle, Menu

// ── date-fns ─────────────────────────────────────────────────────────────────
import {
  format, isToday, isSameDay, addDays,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  isSameMonth, addMonths, subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';

// ─── helpers ─────────────────────────────────────────────────────────────────
function initials(name: string) {
  if (!name) return '??';
  const p = name.trim().split(' ');
  return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : name.slice(0, 2)).toUpperCase();
}

interface Professional {
  id: string; name: string; color: string; description?: string; isActive: boolean;
}

function buildCalendarDays(month: Date): Date[] {
  const s = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const e = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days: Date[] = [];
  let cur = s;
  while (cur <= e) { days.push(cur); cur = addDays(cur, 1); }
  return days;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TenantCalendarPage() {
  const { alias } = useParams() as { alias: string };
  const router = useRouter();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const base = `/${alias}`;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  // FASE 5: Preparación para Onboarding Tips
  const [showTips, setShowTips] = useState(false);

  // Mobile responsive states
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileRightbarOpen, setMobileRightbarOpen] = useState(false);

  useEffect(() => {
    if (user && user.first_login_completed === false) {
      // Also verify we haven't dismissed it this session fallback
      if (!sessionStorage.getItem('tips_dismissed')) {
        setShowTips(true);
        sessionStorage.setItem('tips_dismissed', 'true');
      }
    }
  }, [user]);

  const handleCloseTips = async () => {
    setShowTips(false);
    sessionStorage.setItem('tips_dismissed', 'true');
    if (user?.id) {
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': settings?.id || ''
          },
          body: JSON.stringify({
            id: user.id,
            first_login_completed: true
          })
        });
        // We could also update the context if we exported an updateUser function,
        // but sessionstorage and db update covers standard use cases.
      } catch (err) {
        console.error('Error closing tips:', err);
      }
    }
  };

  // ── Nav items (same as Sidebar.tsx, filtered by role) ────────────────────
  const navLinks = [
    { href: base,               icon: CalendarDays,    title: 'Calendario',   always: true  },
    { href: `${base}/patients`, icon: Users,           title: 'Pacientes',    always: true  },
    { href: `${base}/userapp`,  icon: LayoutDashboard, title: 'Staff',        admin: true   },
    { href: `${base}/stats`,    icon: BarChart3,       title: 'Estadísticas', admin: true   },
    { href: `${base}/portal`,   icon: Globe,           title: 'Portal web',   admin: true   },
  ];

  // ── Professionals ─────────────────────────────────────────────────────────
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [activeProfId, setActiveProfId]   = useState<string | null>(null);
  const [profDropOpen, setProfDropOpen]   = useState(false);
  const profDropRef = useRef<HTMLDivElement>(null);

  // shared state passed down to CalendarView
  const [visibleProfIds, setVisibleProfIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    apiFetch('professionals')
      .then((data: Professional[]) => {
        if (!Array.isArray(data)) return;
        const active = data.filter(p => p.isActive);
        setProfessionals(active);
        if (active.length > 0 && !activeProfId) {
          if (active.length === 1) {
            setActiveProfId(active[0].id);
            setVisibleProfIds([active[0].id]);
          } else {
            setActiveProfId('all');
            setVisibleProfIds(active.map(p => p.id));
          }
        }
      })
      .catch(() => {});
  }, [user, activeProfId]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (profDropRef.current && !profDropRef.current.contains(e.target as Node))
        setProfDropOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const activeProf = professionals.find(p => p.id === activeProfId);

  // Paywall Redirect Check
  useEffect(() => {
    if (!user) return;
    const status = user.tenantSubscriptionStatus;
    const expiresAt = user.tenantExpiresAt ? new Date(user.tenantExpiresAt) : null;
    const isExpired = status === 'expired' || (expiresAt && new Date() > expiresAt);
    if (isExpired) {
       router.push(`/${alias}/settings`);
    }
  }, [user, alias, router]);

  // ── Appointments (for today's list + mini-cal dots) ───────────────────────
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const fetchAppts = useCallback(async () => {
    if (!user) return;
    try { setAppointments(await appointmentService.getAppointments()); } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    fetchAppts();
    window.addEventListener('refreshAppointments', fetchAppts);
    return () => window.removeEventListener('refreshAppointments', fetchAppts);
  }, [fetchAppts]);

  const todayAppts = appointments
    .filter(a => isSameDay(new Date(a.start), new Date()))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  // count per day (for mini-cal)
  const apptCountByDay = (day: Date) =>
    appointments.filter(a => isSameDay(new Date(a.start), day) && a.status !== 'CANCELLED').length;

  // stats for selected prof (calculated for the current week)
  const now = new Date();
  const startOfCurrWeek = startOfWeek(now, { weekStartsOn: 1 });
  const endOfCurrWeek = endOfWeek(now, { weekStartsOn: 1 });
  
  const weekAppts = appointments.filter(a => {
    const d = new Date(a.start);
    return d >= startOfCurrWeek && d <= endOfCurrWeek;
  });

  const profApptsForWeek = (activeProfId && activeProfId !== 'all') 
    ? weekAppts.filter(a => a.professionalId === activeProfId) 
    : weekAppts;
  // Use a realistic capacity (e.g., 40 appointments/week) to calculate actual occupancy
  const weeklyCapacity = (activeProfId && activeProfId !== 'all') ? 40 : (professionals.length * 40);
  const occupancy = Math.min(100, Math.round((profApptsForWeek.filter(a => a.status !== 'CANCELLED').length / Math.max(weeklyCapacity, 1)) * 100));

  // ── Mini-calendar ─────────────────────────────────────────────────────────
  const [miniMonth, setMiniMonth] = useState(new Date());
  const miniDays = buildCalendarDays(miniMonth);

  // ── Search ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');

  // ── Logout dialog ─────────────────────────────────────────────────────────
  const [logoutOpen, setLogoutOpen] = useState(false);

  // ── Sidebar appointment detail dialog ────────────────────────────────────
  const [sidebarAppt, setSidebarAppt] = useState<Appointment | null>(null);
  const [sidebarDetailOpen, setSidebarDetailOpen] = useState(false);

  // ── "Nueva Cita" fires the existing global event ──────────────────────────
  const openNuevaCita = () =>
    window.dispatchEvent(new CustomEvent('open-new-appointment'));

  // ── Colour helper for today's patient list ────────────────────────────────
  const PALETTE = [
    { bg: 'rgba(var(--primary-rgb, 0, 91, 196),.12)',  text: 'var(--primary)' },
    { bg: 'rgba(165,137,248,.12)', text: '#684cb6' },
    { bg: 'rgba(250,116,111,.12)', text: '#a83836' },
    { bg: 'rgba(80,96,118,.12)',   text: '#506076' },
    { bg: 'rgba(22,163,74,.12)',   text: '#16a34a' },
    { bg: 'rgba(234,179,8,.12)',   text: '#ca8a04' },
  ];
  const col = (i: number) => PALETTE[i % PALETTE.length];

  const viewMode = user?.calendarViewMode || settings?.calendarViewMode || 'vista1';
  const isClassic = viewMode !== 'vista1';

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', background: 'var(--bg-main, #f0f4f7)', fontFamily: 'Inter, sans-serif', color: 'var(--text-main, #2c3437)' }}>

      {/* ══════════════════════════════════════════════
          SIDEBAR — Lucide icons, same style as Sidebar.tsx
      ══════════════════════════════════════════════ */}
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* ══════════════════════════════════════════════
          MAIN AREA
      ══════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">

        <header
          className="hidden md:flex flex-shrink-0 justify-between items-center px-6 py-3 z-40 transition-colors"
          style={{ background: 'var(--bg-surface, rgba(255,255,255,.92))', backdropFilter: 'blur(20px)', boxShadow: 'var(--card-shadow, 0 12px 40px rgba(0,0,0,.06))', borderBottom: '1px solid var(--border-color)', minHeight: 56 }}>

          {/* Left: calendar toolbar portal  (CalendarView injects its toolbar here) */}
          <div id="calendar-toolbar-portal" className="flex items-center gap-4 flex-1 mr-12" />

          {/* Right */}
          <div className="flex items-center gap-6 flex-shrink-0">
            {/* Search */}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                className="border-none rounded-full pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] w-52 transition-colors placeholder-slate-400"
                style={{ background: 'var(--cal-slot-alt-bg)', color: 'var(--text-main)' }}
                placeholder="Buscar citas…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              
              {/* Dropdown Resultados de Búsqueda */}
              {search.trim().length > 0 && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-64 max-h-80 overflow-y-auto rounded-xl z-50 p-2 animate-in fade-in slide-in-from-top-2"
                     style={{ background: 'var(--bg-surface)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)' }}>
                  {(() => {
                    const filtered = appointments.filter(a => 
                      a.patientName.toLowerCase().includes(search.toLowerCase()) || 
                      (a.notes && a.notes.toLowerCase().includes(search.toLowerCase()))
                    );
                    
                    if (filtered.length === 0) {
                      return <div className="text-xs font-semibold text-slate-400 text-center py-4">No se encontraron citas</div>;
                    }
                    
                    return filtered.slice(0, 10).map(appt => (
                      <div key={appt.id}
                           onClick={() => { setSidebarAppt(appt); setSidebarDetailOpen(true); setSearch(''); }}
                           className="flex flex-col gap-0.5 p-2 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>{appt.patientName}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                          {format(new Date(appt.start), "d MMM, HH:mm", { locale: es })} · {appt.type || 'Consulta'}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* Bell */}
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              <Bell className="h-5 w-5" />
            </button>

            {/* Nueva Cita */}
            <button
              onClick={openNuevaCita}
              className="flex items-center gap-2 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary))', opacity: 0.9, boxShadow: '0 4px 16px rgba(var(--primary-rgb),.22)' }}>
              <Plus className="h-4 w-4" />
              Nueva Cita
            </button>
          </div>
        </header>

        {/* ── CALENDAR + RIGHT SIDEBAR ─────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* CalendarView — full drag&drop, day/week/month, all dialogs */}
          <div className="flex-1 min-w-0 overflow-hidden" style={{ padding: isClassic ? '0px' : '15px' }}>
            <CalendarView
              searchQuery={search}
              visibleProfessionalIds={visibleProfIds}
              activeProfessionalId={activeProfId}
            />
          </div>

          {/* ══════════════════════════════════════════
              RIGHT SIDEBAR
          ══════════════════════════════════════════ */}
          {mobileRightbarOpen && (
            <div className="md:hidden fixed inset-0 bg-black/20 z-40" onClick={() => setMobileRightbarOpen(false)} />
          )}
          <aside
            className={`w-72 flex-shrink-0 flex-col gap-6 overflow-y-auto p-5 transition-colors bg-[var(--bg-main)] z-50 ${
              mobileRightbarOpen ? "flex fixed right-0 top-0 bottom-0 shadow-2xl" : "hidden md:flex"
            }`}
            style={{ borderLeft: '1px solid var(--border-color)' }}>

            {/* ── Mini-calendar ─────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm capitalize" style={{ fontFamily: 'Manrope,sans-serif', color: 'var(--text-main)' }}>
                  {format(miniMonth, 'MMMM yyyy', { locale: es })}
                </h3>
                <div className="flex gap-1">
                  <button onClick={() => setMiniMonth(m => subMonths(m, 1))}
                    className="p-1 rounded-lg hover:bg-white transition-colors">
                    <ChevronLeft className="h-4 w-4 text-slate-400" />
                  </button>
                  <button onClick={() => setMiniMonth(m => addMonths(m, 1))}
                    className="p-1 rounded-lg hover:bg-white transition-colors">
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-y-1 text-center">
                {['L','M','X','J','V','S','D'].map((d, i) => (
                  <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{d}</span>
                ))}
                {miniDays.map((day, i) => {
                  const inMonth = isSameMonth(day, miniMonth);
                  const todayFlag = isToday(day);
                  const count = apptCountByDay(day);
                  return (
                    <div key={i} style={{ position: 'relative' }} className="flex flex-col items-center">
                      {/* appointment count badge — above day number */}
                      {count > 0 && inMonth && (
                        <span
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -2,
                            background: 'var(--primary)',
                            color: '#fff',
                            fontSize: 8,
                            fontWeight: 800,
                            lineHeight: 1,
                            minWidth: 13,
                            height: 13,
                            borderRadius: 999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            padding: '0 2px',
                          }}>
                          {count}
                        </span>
                      )}
                      <span
                        onClick={() => window.dispatchEvent(new CustomEvent('calendar-navigate', { detail: { date: day, view: 'day' } }))}
                        className="text-xs py-1 w-7 rounded-full cursor-pointer transition-all flex items-center justify-center"
                        style={{
                          color: !inMonth ? 'var(--text-muted)' : todayFlag ? '#ffffff' : 'var(--text-main)',
                          background: todayFlag ? 'var(--primary)' : 'transparent',
                          fontWeight: todayFlag || count > 0 ? '700' : '400',
                        }}>
                        {format(day, 'd')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── Professional dropdown ──────────────── */}
            <section>
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400 mb-2">
                Profesional Seleccionado
              </p>
              <div className="rounded-xl p-4 flex flex-col gap-3 transition-colors" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--card-shadow)' }}>

                <div className="relative" ref={profDropRef}>
                  <button
                    onClick={() => setProfDropOpen(o => !o)}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
                    style={{ background: 'var(--border-color)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: activeProf?.color ?? '#005bc4' }}>
                      {activeProf ? initials(activeProf.name) : <RefreshCw className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-bold truncate" style={{ fontFamily: 'Manrope,sans-serif', color: 'var(--text-main)' }}>
                        {activeProfId === 'all' ? 'Todos los profesionales' : activeProf?.name}
                      </p>
                      {activeProfId === 'all' ? (
                        <p className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: 'var(--primary)' }}>
                          Vista Clínica Completa
                        </p>
                      ) : activeProf?.description && (
                        <p className="text-[10px] font-bold uppercase tracking-wider truncate" style={{ color: 'var(--primary)' }}>
                          {activeProf.description}
                        </p>
                      )}
                    </div>
                    <ChevronLeft
                      className="h-4 w-4 text-slate-400 transition-transform duration-200"
                      style={{ transform: profDropOpen ? 'rotate(90deg)' : 'rotate(-90deg)' }} />
                  </button>

                  {profDropOpen && (
                    <div className="absolute top-[calc(100%+6px)] left-0 right-0 rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
                      style={{ background: 'var(--bg-surface)', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)' }}>
                      
                      <div 
                        onClick={() => { setActiveProfId('all'); setVisibleProfIds(professionals.map(p => p.id)); setProfDropOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800"
                        style={{ background: activeProfId === 'all' ? 'var(--border-color)' : 'transparent' }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: 'var(--primary)' }}>
                          <RefreshCw className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-semibold flex-1 truncate" style={{ color: '#2c3437' }}>Todos los profesionales</span>
                      </div>

                      {professionals.map(p => (
                        <div key={p.id}
                          onClick={() => { setActiveProfId(p.id); setVisibleProfIds([p.id]); setProfDropOpen(false); }}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                          style={{ background: p.id === activeProfId ? 'var(--border-color)' : 'transparent' }}>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: p.color }}>
                            {initials(p.name)}
                          </div>
                          <span className="text-sm font-semibold flex-1 truncate" style={{ color: '#2c3437' }}>{p.name}</span>
                          {p.id === activeProfId && (
                            <div className="w-2 h-2 rounded-full" style={{ background: 'var(--primary)' }} />
                          )}
                        </div>
                      ))}

                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex justify-around pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <div className="text-center">
                    <p className="font-bold text-base" style={{ fontFamily: 'Manrope,sans-serif', color: 'var(--text-main)' }}>{profApptsForWeek.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Citas</p>
                  </div>
                  <div className="w-px bg-slate-100 dark:bg-slate-800" />
                  <div className="text-center">
                    <p className="font-bold text-base" style={{ fontFamily: 'Manrope,sans-serif', color: 'var(--text-main)' }}>{occupancy}%</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ocup.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Clientes de hoy ───────────────────── */}
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Clientes de hoy</p>
                <Link href={`${base}/patients`} className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
                  Ver todos
                </Link>
              </div>

              {todayAppts.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  No hay citas para hoy
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {todayAppts.map((appt, i) => {
                    const c = col(i);
                    return (
                      <div key={appt.id}
                        onClick={() => { setSidebarAppt(appt); setSidebarDetailOpen(true); }}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:bg-primary/10"
                        style={{ background: 'var(--bg-surface)' }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{ background: c.bg, color: c.text }}>
                          {initials(appt.patientName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-main)' }}>{appt.patientName}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {format(new Date(appt.start), 'HH:mm')} · {appt.type || 'Consulta'}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {appt.status === 'COMPLETED' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : appt.status === 'NO_SHOW' ? (
                            <XCircle className="h-5 w-5 text-rose-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>

      {/* ── Logout dialog ────────────────────────────────────────────────────── */}
      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} onConfirm={logout} />

      {/* ── Sidebar patient detail dialog ────────────────────────────────────── */}
      <AppointmentDetailsDialog
        appointment={sidebarAppt}
        open={sidebarDetailOpen}
        onOpenChange={setSidebarDetailOpen}
        onDeleted={fetchAppts}
      />

      {/* ── FASE 5: Onboarding Tips Placeholder ────────────────────────────── */}
      {showTips && (
        <OnboardingGuide alias={alias} onClose={handleCloseTips} />
      )}

      {/* ── Mobile Floating Buttons ────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-6 left-6 z-30 flex flex-col gap-4">
        <button 
          onClick={() => setMobileSidebarOpen(true)}
          className="w-14 h-14 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-[var(--primary)] border border-slate-100 transition-transform active:scale-95"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <div className="md:hidden fixed bottom-6 right-6 z-30 flex flex-col gap-4">
        <button 
          onClick={() => setMobileRightbarOpen(true)}
          className="w-14 h-14 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-[var(--primary)] border border-slate-100 transition-transform active:scale-95"
          aria-label="Abrir información"
        >
          <Users className="w-6 h-6" />
        </button>
        {/* Mobile quick add appointment button */}
        <button 
          onClick={openNuevaCita}
          className="w-14 h-14 text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.22)] flex items-center justify-center transition-transform active:scale-95"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary))' }}
          aria-label="Nueva Cita"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
