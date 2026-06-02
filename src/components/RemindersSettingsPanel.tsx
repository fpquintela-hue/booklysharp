'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import { 
    Bell, 
    Plus, 
    Trash2, 
    MessageCircle, 
    Mail, 
    Smartphone, 
    Clock, 
    Calendar,
    Save,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/context/settings-context';
import { useAuth } from '@/context/auth-context';
import { normalizePlanId, getPlanById } from '@/lib/subscription-plans';
import { cn } from '@/lib/utils';

type ReminderMethod = 'CLIENT_PREFERENCE' | 'WHATSAPP' | 'EMAIL';
type ReminderTime = '7_DAYS' | '2_DAYS' | '1_DAY' | '1_HOUR' | '30_MINUTES' | 'CUSTOM';

interface ReminderEntry {
    id: string;
    time: ReminderTime;
    customMinutes?: number;
    method: ReminderMethod;
}

export function RemindersSettingsPanel() {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettings();
    const { user } = useAuth();
    const [reminders, setReminders] = useState<ReminderEntry[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Compute plan limits
    const plan = getPlanById(normalizePlanId(user?.tenantPlan));
    const maxReminders = plan.maxReminders;
    const canUseReminders = plan.whatsappReminders;

    // Initial load from settings
    useEffect(() => {
        if (settings.reminders_config) {
            try {
                const config = typeof settings.reminders_config === 'string' 
                    ? JSON.parse(settings.reminders_config) 
                    : settings.reminders_config;
                if (Array.isArray(config)) {
                    setReminders(config);
                }
            } catch (e) {
                console.error('Error parsing reminders config:', e);
                setReminders([]);
            }
        }
    }, [settings.reminders_config]);

    const addReminder = () => {
        if (!canUseReminders) {
            toast.error('Tu plan actual no incluye recordatorios automáticos. Actualiza tu suscripción.');
            return;
        }
        if (reminders.length >= maxReminders) {
            toast.error(`Tu plan permite un máximo de ${maxReminders} recordatorio${maxReminders !== 1 ? 's' : ''}`);
            return;
        }
        const newReminder: ReminderEntry = {
            id: Math.random().toString(36).substring(2, 11),
            time: '1_DAY',
            method: 'CLIENT_PREFERENCE'
        };
        setReminders([...reminders, newReminder]);
    };

    const removeReminder = (id: string) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    const updateReminder = (id: string, updates: Partial<ReminderEntry>) => {
        setReminders(reminders.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettings({
                reminders_config: JSON.stringify(reminders)
            });
            toast.success('Configuración de recordatorios guardada');
        } catch (e) {
            toast.error('Error al guardar la configuración');
        } finally {
            setIsSaving(false);
        }
    };

    const getTimeLabel = (time: ReminderTime) => {
        switch (time) {
            case '7_DAYS': return '7 Días antes';
            case '2_DAYS': return '2 Días antes';
            case '1_DAY': return '1 Día antes';
            case '1_HOUR': return '1 Hora antes';
            case '30_MINUTES': return '30 Minutos antes';
            case 'CUSTOM': return 'Personalizado';
            default: return '';
        }
    };

    const getMethodIcon = (method: ReminderMethod) => {
        switch (method) {
            case 'WHATSAPP': return <MessageCircle className="w-4 h-4 text-emerald-500" />;
            case 'EMAIL': return <Mail className="w-4 h-4 text-blue-500" />;
            case 'CLIENT_PREFERENCE': return <Smartphone className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <div className="max-w-4xl space-y-10 animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-8 border-b border-slate-100 dark:border-slate-800 mb-10">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                        <Bell className="w-3 h-3" />
                        {t('settings.panel_reminders_badge')}
                    </div>
                    <h1 className="text-2xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[0.9]">
                        {t('settings.panel_reminders_title1')} <span className="text-primary">{t('settings.panel_reminders_title2')}</span>
                    </h1>
                    <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                        {t('settings.panel_reminders_desc')}
                    </p>
                </div>
                <Button 
                    onClick={addReminder} 
                    disabled={reminders.length >= maxReminders || !canUseReminders}
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all active:scale-95 group"
                >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    <span className="uppercase tracking-widest text-xs">Añadir Recordatorio</span>
                </Button>
            </header>

            {reminders.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-sm mb-6">
                        <Bell className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">No hay recordatorios activos</h3>
                    <p className="text-slate-500 max-w-xs font-medium">Pulsa el botón superior para añadir tu primer aviso automático.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reminders.map((reminder, index) => (
                        <Card key={reminder.id} className="rounded-3xl border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row items-stretch">
                                    <div className="w-2 bg-primary dark:bg-blue-600 hidden md:block" />
                                    <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                        
                                        <div className="md:col-span-1 flex justify-center md:justify-start">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black">
                                                {index + 1}
                                            </div>
                                        </div>

                                        <div className="md:col-span-5 space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> Tiempo de antelación
                                            </Label>
                                            <Select 
                                                value={reminder.time} 
                                                onValueChange={(val: ReminderTime) => updateReminder(reminder.id, { time: val })}
                                            >
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold bg-white dark:bg-slate-900">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl">
                                                    <SelectItem value="7_DAYS" className="font-bold">7 Días antes</SelectItem>
                                                    <SelectItem value="2_DAYS" className="font-bold">2 Días antes</SelectItem>
                                                    <SelectItem value="1_DAY" className="font-bold">1 Día antes</SelectItem>
                                                    <SelectItem value="1_HOUR" className="font-bold">1 Hora antes</SelectItem>
                                                    <SelectItem value="30_MINUTES" className="font-bold">30 Minutos antes</SelectItem>
                                                    <SelectItem value="CUSTOM" className="font-bold">Personalizado (minutos)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {reminder.time === 'CUSTOM' && (
                                                <div className="pt-2">
                                                    <input 
                                                        type="number"
                                                        placeholder="Minutos..."
                                                        className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm"
                                                        value={reminder.customMinutes || ''}
                                                        onChange={(e) => updateReminder(reminder.id, { customMinutes: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="md:col-span-4 space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                                                <Smartphone className="w-3 h-3" /> Canal de envío
                                            </Label>
                                            <Select 
                                                value={reminder.method} 
                                                onValueChange={(val: ReminderMethod) => updateReminder(reminder.id, { method: val })}
                                            >
                                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 font-bold bg-white dark:bg-slate-900">
                                                    <div className="flex items-center gap-2">
                                                        {getMethodIcon(reminder.method)}
                                                        <SelectValue />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl">
                                                    <SelectItem value="CLIENT_PREFERENCE" className="font-bold">Preferencia del cliente</SelectItem>
                                                    <SelectItem value="WHATSAPP" className="font-bold">Solo WhatsApp</SelectItem>
                                                    <SelectItem value="EMAIL" className="font-bold">Solo Email</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="md:col-span-2 flex justify-center md:justify-end">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => removeReminder(reminder.id)}
                                                className="h-12 w-12 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors text-slate-400"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>

                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="pt-10 flex flex-col md:flex-row items-center justify-between p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 gap-6">
                <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-slate-100 dark:border-slate-800">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Estado del sistema</p>
                        <p className="text-sm font-bold text-slate-600 dark:text-white leading-tight max-w-md">
                            Los recordatorios se enviarán automáticamente según la zona horaria del centro de reserva.
                        </p>
                    </div>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full md:w-auto rounded-2xl h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                >
                    {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Guardar Configuración
                </Button>
            </div>
        </div>
    );
}
