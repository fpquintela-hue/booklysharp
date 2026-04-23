'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useSettings } from '@/context/settings-context';
import { Mail, MessageCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export function CustomNotificationsPanel() {
    const { settings, updateSettings } = useSettings();
    const [isLoading, setIsLoading] = useState(false);
    
    // SMTP state
    const [useCustomSmtp, setUseCustomSmtp] = useState(false);
    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState('');
    const [smtpUser, setSmtpUser] = useState('');
    const [smtpPass, setSmtpPass] = useState('');
    const [smtpFrom, setSmtpFrom] = useState('');
    const [smtpSecure, setSmtpSecure] = useState('ssl'); // ssl, tls, starttls, none

    // WhatsApp Evolution API state
    const [useCustomWa, setUseCustomWa] = useState(false);
    const [waInstance, setWaInstance] = useState('');
    const [waToken, setWaToken] = useState('');

    useEffect(() => {
        setUseCustomSmtp(settings.useCustomSmtp === 'true');
        setSmtpHost(settings.smtpHost || '');
        setSmtpPort(settings.smtpPort || '');
        setSmtpUser(settings.smtpUser || '');
        setSmtpPass(settings.smtpPass || '');
        setSmtpFrom(settings.smtpFrom || '');
        setSmtpSecure(settings.smtpSecure || 'ssl');

        setUseCustomWa(settings.useCustomWa === 'true');
        setWaInstance(settings.waInstance || '');
        setWaToken(settings.waToken || '');
    }, [settings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const newSettings = {
            useCustomSmtp: useCustomSmtp.toString(),
            smtpHost,
            smtpPort,
            smtpUser,
            smtpPass,
            smtpFrom,
            smtpSecure,
            useCustomWa: useCustomWa.toString(),
            waInstance,
            waToken,
        };

        try {
            await updateSettings(newSettings);
            toast.success('Configuración de notificaciones guardada');
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="space-y-8 pb-10">
            {/* EMAIL CONFIGURATION */}
            <div className="space-y-5 bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" /> Correo Electrónico (Email)
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                            Usa tu propio servidor SMTP para enviar notificaciones de citas. Si está desactivado, se usará el servidor global del sistema.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="use-custom-smtp" className="text-sm font-bold truncate">Servidor Propio</Label>
                        <Switch
                            id="use-custom-smtp"
                            checked={useCustomSmtp}
                            onCheckedChange={setUseCustomSmtp}
                        />
                    </div>
                </div>

                {useCustomSmtp && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <Label>Servidor SMTP (Host)</Label>
                            <Input placeholder="smtp.tudominio.com" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Puerto</Label>
                            <Input placeholder="465" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Usuario / Email</Label>
                            <Input placeholder="citas@tudominio.com" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Contraseña</Label>
                            <Input type="password" placeholder="••••••••••••" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Cifrado / Seguridad
                            </Label>
                            <Select value={smtpSecure} onValueChange={setSmtpSecure}>
                                <SelectTrigger className="bg-white dark:bg-slate-800">
                                    <SelectValue placeholder="Tipo de conexión" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                                    <SelectItem value="ssl" className="rounded-lg">SSL/TLS (Recomendado)</SelectItem>
                                    <SelectItem value="starttls" className="rounded-lg">STARTTLS</SelectItem>
                                    <SelectItem value="none" className="rounded-lg">Ninguno (No seguro)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label>Remitente (From)</Label>
                            <Input placeholder="Tu Negocio <citas@tudominio.com>" value={smtpFrom} onChange={e => setSmtpFrom(e.target.value)} />
                        </div>
                    </div>
                )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full font-bold h-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]">
                {isLoading ? 'Guardando...' : 'Guardar Configuración de Correo'}
            </Button>
        </form>
    );
}
