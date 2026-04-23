'use client';

import { useState } from 'react';
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
import { Lock, Eye, EyeOff, Key } from 'lucide-react';
import { toast } from 'sonner';

export function SuperadminPasswordDialog({ trigger }: { trigger?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [isChangingPass, setIsChangingPass] = useState(false);
    const [showPass, setShowPass] = useState(false);

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
                setOpen(false);
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
                    <Button variant="outline" className="gap-2 text-red-600 bg-white border-red-100 hover:bg-red-50">
                        <Lock className="w-4 h-4" /> Cambiar Contraseña
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl">
                <DialogHeader className="p-8 bg-red-600 text-white">
                    <DialogTitle className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                            <Key className="w-6 h-6 text-white" />
                        </div>
                        Seguridad Maestro
                    </DialogTitle>
                    <p className="text-red-100 text-sm mt-2 font-medium">
                        Actualiza las credenciales de acceso al portal de administración global.
                    </p>
                </DialogHeader>

                <div className="p-8 bg-white">
                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Contraseña Actual</Label>
                                <div className="relative">
                                    <Input 
                                        type={showPass ? "text" : "password"}
                                        placeholder="••••••••" 
                                        value={currentPass} 
                                        onChange={e => setCurrentPass(e.target.value)} 
                                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus:ring-4 focus:ring-red-500/10 transition-all"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nueva Contraseña</Label>
                                    <Input 
                                        type="password"
                                        placeholder="Mín. 6 carac." 
                                        value={newPass} 
                                        onChange={e => setNewPass(e.target.value)} 
                                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus:ring-4 focus:ring-red-500/10 transition-all font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Confirmar</Label>
                                    <Input 
                                        type="password"
                                        placeholder="Repetir..." 
                                        value={confirmPass} 
                                        onChange={e => setConfirmPass(e.target.value)} 
                                        className="h-14 rounded-2xl bg-slate-50 border-none px-6 focus:ring-4 focus:ring-red-500/10 transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <Button 
                                type="submit" 
                                disabled={isChangingPass || !currentPass || !newPass || !confirmPass}
                                className="h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                            >
                                {isChangingPass ? 'Actualizando Seguridad...' : 'Actualizar Acceso Global'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-14 rounded-2xl font-bold text-slate-400">
                                Cancelar y salir
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
