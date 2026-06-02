'use client';

import { useState } from 'react';
import { 
    Palette, 
    Lock, 
    Fingerprint, 
    CalendarDays, 
    Calendar, 
    Users, 
    UserCog,
    Bell, 
    MessageCircle,
    ChevronLeft,
    Mail,
    CreditCard,
    Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/hooks/useTranslation';
import { AppSettingsPanel } from '@/components/AppSettingsPanel';
import { AppointmentTypesPanel } from '@/components/AppointmentTypesPanel';
import { ProfessionalsPanel } from '@/components/ProfessionalsPanel';
import { ScheduleSettingsPanel } from '@/components/ScheduleSettingsPanel';
import { CustomNotificationsPanel } from '@/components/CustomNotificationsPanel';
import { WhatsAppSettingsPanel } from '@/components/WhatsAppSettingsPanel';
import { AppearanceSettingsPanel } from '@/components/AppearanceSettingsPanel';
import { SecuritySettingsPanel } from '@/components/SecuritySettingsPanel';
import { RemindersSettingsPanel } from '@/components/RemindersSettingsPanel';
import { SubscriptionSettingsPanel } from '@/components/SubscriptionSettingsPanel';
import { StaffSettingsPanel } from '@/components/StaffSettingsPanel';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

export default function SettingsPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const params = useParams();
    const alias = params?.alias as string;
    
    // Check if expired to automatically open subscription panel
    const status = user?.tenantSubscriptionStatus;
    const expiresAt = user?.tenantExpiresAt ? new Date(user.tenantExpiresAt) : null;
    const isExpired = status === 'expired' || (expiresAt && new Date() > expiresAt);

    const searchParams = useSearchParams();
    const queryTab = searchParams?.get('tab');
    const [activeTab, setActiveTab] = useState<'appearance' | 'security' | 'app' | 'horarios' | 'citas' | 'profesionais' | 'email' | 'whatsapp' | 'reminders' | 'subscription' | 'staff'>(
        isExpired ? 'subscription' : (queryTab as any) || 'appearance'
    );
    const [isMobileMenuExpanded, setIsMobileMenuExpanded] = useState(false);

    const menuItems = [
        { id: 'appearance', label: t('settings.tab_appearance'), icon: Palette },
        { id: 'security', label: t('settings.tab_security'), icon: Lock },
        ...(user?.role === 'ADMIN' ? [
            { id: 'subscription', label: 'Suscripción', icon: CreditCard },
            { id: 'app', label: t('settings.tab_app'), icon: Fingerprint },
            { id: 'citas', label: 'Servicios', icon: CalendarDays },
            { id: 'horarios', label: t('settings.tab_horarios'), icon: Calendar },
            { id: 'profesionais', label: 'Profesionales', icon: Users },
            { id: 'staff', label: 'Staff', icon: UserCog },
            { id: 'reminders', label: 'Recordatorios', icon: Bell },
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
        ] : []),
    ];

    return (
        <div className="flex flex-row h-full w-full bg-white dark:bg-slate-900 overflow-hidden relative">
            {/* Mobile backdrop */}
            {isMobileMenuExpanded && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/20 z-10" 
                    onClick={() => setIsMobileMenuExpanded(false)} 
                />
            )}

            {/* Dummy placeholder to prevent content shift when aside becomes absolute */}
            <div className={cn("shrink-0 md:hidden transition-all duration-300", isMobileMenuExpanded ? "w-[60px]" : "w-0 hidden")} />

            {/* Secondary Sidebar (Settings Menu) */}
            <aside className={cn(
                "border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col shrink-0 h-full transition-all duration-300",
                isMobileMenuExpanded ? "w-64 absolute left-0 top-0 z-20" : "w-[60px] md:w-64 relative z-10"
            )}>
                <div className={cn(
                    "p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center",
                    isMobileMenuExpanded ? "justify-between" : "justify-center md:justify-start"
                )}>
                    <div className={cn("flex items-center gap-2", !isMobileMenuExpanded && "hidden md:flex")}>
                        <Link href={`/${alias}`} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ChevronLeft className="w-4 h-4 text-slate-400" />
                        </Link>
                        <h2 className="text-lg md:text-xl font-black text-primary tracking-tight uppercase truncate">{t('settings.header_title')}</h2>
                    </div>
                    {/* Toggle button for mobile */}
                    <button 
                        className="md:hidden p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuExpanded(!isMobileMenuExpanded)}
                    >
                        {isMobileMenuExpanded ? <ChevronLeft className="w-5 h-5 text-slate-500" /> : <Menu className="w-5 h-5 text-slate-500" />}
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isOperationalTab = !['appearance', 'security', 'subscription'].includes(item.id);
                        const disabled = isExpired && isOperationalTab;
                        
                        return (
                            <button
                                key={item.id}
                                disabled={!!disabled}
                                onClick={() => {
                                    if (!disabled) {
                                        setActiveTab(item.id as any);
                                        setIsMobileMenuExpanded(false);
                                    }
                                }}
                                title={item.label}
                                className={cn(
                                    "flex items-center rounded-xl text-sm font-bold transition-all",
                                    isMobileMenuExpanded ? "w-full px-4 py-3 gap-3" : "w-10 h-10 justify-center mx-auto md:w-full md:px-4 md:py-3 md:gap-3",
                                    disabled ? "opacity-50 cursor-not-allowed text-slate-400" :
                                    activeTab === item.id
                                        ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                        : "text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                                )}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                <span className={cn("truncate", !isMobileMenuExpanded && "hidden md:block")}>
                                    {item.label}
                                </span>
                                {disabled && <Lock className="w-3 h-3 ml-auto opacity-50 shrink-0" />}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 p-4 sm:p-8 md:p-12 w-full">
                <div className="w-full max-w-full overflow-x-hidden">
                    {activeTab === 'appearance' && <AppearanceSettingsPanel />}
                    {activeTab === 'security' && <SecuritySettingsPanel />}
                    {activeTab === 'subscription' && <SubscriptionSettingsPanel />}
                    {activeTab === 'app' && <AppSettingsPanel onClose={() => {}} />}
                    {activeTab === 'citas' && <AppointmentTypesPanel />}
                    {activeTab === 'horarios' && <ScheduleSettingsPanel />}
                    {activeTab === 'profesionais' && <ProfessionalsPanel />}
                    {activeTab === 'reminders' && <RemindersSettingsPanel />}
                    {activeTab === 'email' && <CustomNotificationsPanel />}
                    {activeTab === 'whatsapp' && <WhatsAppSettingsPanel />}
                    {activeTab === 'staff' && <StaffSettingsPanel />}
                </div>
            </main>
        </div>
    );
}
