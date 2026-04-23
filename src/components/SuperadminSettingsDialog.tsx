'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Server, Mail, ShieldCheck, Lock, Eye, EyeOff, ShieldAlert, Key } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export function SuperadminSettingsDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // SMTP config state
    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState('');
    const [smtpUser, setSmtpUser] = useState('');
    const [smtpPass, setSmtpPass] = useState('');
    const [smtpFrom, setSmtpFrom] = useState('');
    const [smtpSecure, setSmtpSecure] = useState('ssl'); // ssl, starttls, none
    const [testEmail, setTestEmail] = useState('');

    // Change Password state
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [showPass, setShowPass] = useState(false);

    useEffect(() => {
        if (open) {
            fetchSettings();
        }
    }, [open]);

    const handleSendTestEmail = async () => {
        const payload = {
            to: testEmail,
            subject: 'Email de Prueba de Booklysharp',
            text: 'Este es un correo de prueba para verificar la configuración SMTP.',
            html: '<h1>Configuración Exitosa</h1><p>Si has recibido este correo, tu configuración SMTP es correcta.</p>'
        };

        setIsLoading(true);
        try {
            const res = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success('Correo de prueba enviado');
            } else {
                const data = await res.json();
                toast.error(`Error: ${data.error || 'Fallo en envío'}`);
            }
        } catch (e) {
            toast.error('Error al enviar test');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSmtpHost(data.GLOBAL_SMTP_HOST || '');
                setSmtpPort(data.GLOBAL_SMTP_PORT || '');
                setSmtpUser(data.GLOBAL_SMTP_USER || '');
                setSmtpPass(data.GLOBAL_SMTP_PASS || '');
                setSmtpFrom(data.GLOBAL_SMTP_FROM || '');
                setSmtpSecure(data.GLOBAL_SMTP_SECURE || 'ssl');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error cargando configuración global');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const newSettings = {
            GLOBAL_SMTP_HOST: smtpHost,
            GLOBAL_SMTP_PORT: smtpPort,
            GLOBAL_SMTP_USER: smtpUser,
            GLOBAL_SMTP_PASS: smtpPass,
            GLOBAL_SMTP_FROM: smtpFrom,
            GLOBAL_SMTP_SECURE: smtpSecure,
        };

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });

            if (res.ok) {
                toast.success('Configuración SMTP global guardada');
                setOpen(false);
            } else {
                toast.error('Error al guardar configuración');
            }
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            toast.error('Las contraseñas nuevas no coinciden');
            return;
        }
        if (newPass.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setIsChangingPass(true);
        try {
            const res = await fetch('/api/superadmin/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
            });

            if (res.ok) {
                toast.success('Contraseña actualizada con éxito');
                setCurrentPass('');
                setNewPass('');
                setConfirmPass('');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Error al cambiar contraseña');
            }
        } catch (error) {
            toast.error('Error del servidor');
        } finally {
            setIsChangingPass(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2 text-slate-700 bg-white">
                        <Settings className="w-4 h-4" /> Ajustes Globales
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                <DialogHeader className="p-8 bg-slate-900 text-white">
                    <DialogTitle className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                            <Server className="w-6 h-6 text-white" />
                        </div>
                        Configuración Sistema
                    </DialogTitle>
                    <p className="text-slate-400 text-sm mt-2 font-medium">
                        Ajustes globales de infraestructura y comunicaciones para todo el ecosistema.
                    </p>
                </DialogHeader>

                <div className="p-8 bg-white">
                    <form onSubmit={handleSave} className="space-y-8">
                        <div>
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500 mb-6 px-1">
                                <Mail className="w-4 h-4" /> Servidor de Correos (SMTP)
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Host SMTP</Label>
                                    <Input 
                                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                        placeholder="smtp.example.com" 
                                        value={smtpHost} 
                                        onChange={e => setSmtpHost(e.target.value)} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Puerto</Label>
                                    <Input 
                                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                        placeholder="465" 
                                        value={smtpPort} 
                                        onChange={e => setSmtpPort(e.target.value)} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Usuario</Label>
                                    <Input 
                                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                        placeholder="noreply@example.com" 
                                        value={smtpUser} 
                                        onChange={e => setSmtpUser(e.target.value)} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Contraseña</Label>
                                    <Input 
                                        type="password"
                                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                        placeholder="••••••••" 
                                        value={smtpPass} 
                                        onChange={e => setSmtpPass(e.target.value)} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 ml-1">
                                        Seguridad
                                    </Label>
                                    <Select value={smtpSecure} onValueChange={setSmtpSecure}>
                                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold">
                                            <SelectValue placeholder="Tipo connection" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200">
                                            <SelectItem value="ssl" className="rounded-xl">SSL/TLS (465)</SelectItem>
                                            <SelectItem value="starttls" className="rounded-xl">STARTTLS (587)</SelectItem>
                                            <SelectItem value="none" className="rounded-xl">Ninguna (Inseguro)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-1 space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre Remitente</Label>
                                    <Input 
                                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                        placeholder="BooklySharp" 
                                        value={smtpFrom} 
                                        onChange={e => setSmtpFrom(e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 px-1">
                                Test de Envío
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-2">
                                    <Input 
                                        placeholder="email@recibir-test.com" 
                                        value={testEmail} 
                                        onChange={e => setTestEmail(e.target.value)} 
                                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    />
                                </div>
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    onClick={handleSendTestEmail}
                                    disabled={isLoading || !testEmail}
                                    className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-slate-100 hover:bg-slate-200 px-6 active:scale-95 transition-all shadow-sm"
                                >
                                    Enviar Test
                                </Button>
                            </div>
                        </div>

                        <div className="pt-8 flex justify-end gap-4">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-14 rounded-2xl font-bold px-8 text-slate-400">
                                Descartar
                            </Button>
                            <Button type="submit" disabled={isLoading} className="h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[11px] px-10 active:scale-95 transition-all shadow-xl">
                                {isLoading ? 'Guardando...' : 'Guardar Configuración'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
