'use client';

import { useState } from 'react';
import { 
    Palette, 
    Lock, 
    Fingerprint, 
    CalendarDays, 
    Calendar, 
    Users, 
    Bell, 
    MessageCircle,
    ChevronLeft,
    Mail,
    CreditCard
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
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SettingsPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const params = useParams();
    const alias = params?.alias as string;
    
    // Check if expired to automatically open subscription panel
    const status = user?.tenantSubscriptionStatus;
    const expiresAt = user?.tenantExpiresAt ? new Date(user.tenantExpiresAt) : null;
    const isExpired = status === 'expired' || (expiresAt && new Date() > expiresAt);

    const [activeTab, setActiveTab] = useState<'appearance' | 'security' | 'app' | 'horarios' | 'citas' | 'profesionais' | 'email' | 'whatsapp' | 'reminders' | 'subscription'>(isExpired ? 'subscription' : 'appearance');

    const menuItems = [
        { id: 'appearance', label: t('settings.tab_appearance'), icon: Palette },
        { id: 'security', label: t('settings.tab_security'), icon: Lock },
        ...(user?.role === 'ADMIN' ? [
            { id: 'subscription', label: 'Suscripción', icon: CreditCard },
            { id: 'app', label: t('settings.tab_app'), icon: Fingerprint },
            { id: 'citas', label: t('settings.tab_citas'), icon: CalendarDays },
            { id: 'horarios', label: t('settings.tab_horarios'), icon: Calendar },
            { id: 'profesionais', label: t('settings.tab_professionals'), icon: Users },
            { id: 'reminders', label: 'Recordatorios', icon: Bell },
            { id: 'email', label: 'Email', icon: Mail },
            { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
        ] : []),
    ];

    return (
        <div className="flex h-full w-full bg-white dark:bg-slate-900">
            {/* Secondary Sidebar (Settings Menu) */}
            <aside className="w-64 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/${alias}`} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                            <ChevronLeft className="w-4 h-4 text-slate-400" />
                        </Link>
                        <h2 className="text-xl font-black text-primary tracking-tight uppercase">{t('settings.header_title')}</h2>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {menuItems.map((item) => {
                        const isOperationalTab = !['appearance', 'security', 'subscription'].includes(item.id);
                        const disabled = isExpired && isOperationalTab;
                        
                        return (
                            <button
                                key={item.id}
                                disabled={!!disabled}
                                onClick={() => !disabled && setActiveTab(item.id as any)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                    disabled ? "opacity-50 cursor-not-allowed text-slate-400" :
                                    activeTab === item.id
                                        ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                        : "text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                                {disabled && <Lock className="w-3 h-3 ml-auto opacity-50" />}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 p-8 md:p-12">
                <div className="w-full">
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
                </div>
            </main>
        </div>
    );
}
