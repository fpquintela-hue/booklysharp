'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { userService } from '@/lib/mock-service';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Pencil, UserPlus, Key, Shield, Mail, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

interface UserEditDialogProps {
    user?: User;
    onUserSaved: () => void;
}

export function UserEditDialog({ user, onUserSaved }: UserEditDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [apellidos, setApellidos] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>('USER');
    const [password, setPassword] = useState('');
    const [bloqueado, setBloqueado] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open && user) {
            setName(user.name);
            setApellidos(user.apellidos || '');
            setEmail(user.email);
            setRole(user.role);
            setBloqueado(user.bloqueado || false);
            setPassword(''); // Don't show existing password
        } else if (open) {
            setName('');
            setApellidos('');
            setEmail('');
            setRole('USER');
            setBloqueado(false);
            setPassword('');
        }
        setError('');
    }, [open, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            if (user) {
                // Edit mode
                const updates: Partial<User> = { name, apellidos: '', email, role, bloqueado };
                if (password) {
                    updates.password = password;
                }
                await userService.updateUser(user.id, updates);
            } else {
                // Create mode
                if (!password) {
                    setError('La contraseña es obligatoria para nuevos usuarios');
                    setIsSubmitting(false);
                    return;
                }
                await userService.createUser({
                    name,
                    apellidos: '',
                    email,
                    role,
                    password,
                    bloqueado
                } as any);
            }
            onUserSaved();
            setOpen(false);
        } catch (err: any) {
            setError(err.message || 'Error al guardar el usuario');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {user ? (
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-all">
                        <Pencil className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button className="bg-primary hover:bg-primary-light text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Nuevo Usuario
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] glass-panel border-white/10 dark:bg-slate-900/95 backdrop-blur-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-primary dark:text-primary-light flex items-center gap-2">
                        {user ? <Pencil className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                        {user ? 'Editar Usuario' : 'Crear Usuario'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium">
                        {user ? 'Modifica los datos del usuario seleccionado.' : 'Añade un nuevo usuario al sistema para gestionar Axenda Igualdade.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-muted-foreground ml-1 tracking-widest">Cuenta</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 w-4 h-4 text-primary opacity-50" />
                                <Input
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ej: Florentino"
                                    required
                                    className="bg-white/50 dark:bg-slate-800/50 border-white/10 rounded-xl pl-10 h-11 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        {user && (
                            <div className="flex items-center justify-between p-3 bg-slate-100/50 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-700/30">
                                <div className="space-y-0.5">
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Bloqueado</label>
                                    <p className="text-[10px] text-slate-500">Impide que el usuario acceda al sistema</p>
                                </div>
                                <Switch
                                    checked={bloqueado}
                                    onCheckedChange={setBloqueado}
                                />
                            </div>
                        )}


                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-muted-foreground ml-1 tracking-widest">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-primary opacity-50" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="usuario@ejemplo.com"
                                    required
                                    className="bg-white/50 dark:bg-slate-800/50 border-white/10 rounded-xl pl-10 h-11 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-muted-foreground ml-1 tracking-widest">Rol del Usuario</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-3 w-4 h-4 text-primary opacity-50 z-10" />
                                <Select value={role} onValueChange={(val: UserRole) => setRole(val)}>
                                    <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 border-white/10 rounded-xl pl-10 h-11 focus:ring-primary/20">
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                    <SelectContent className="glass-panel border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg">
                                        <SelectItem value="USER">Usuario (Estándar)</SelectItem>
                                        <SelectItem value="ADMIN">Administrador (Total)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-white/5">
                            <label className="text-[10px] uppercase font-black text-muted-foreground ml-1 tracking-widest flex items-center gap-1">
                                <Key className="w-3 h-3" />
                                {user ? 'Nueva Contraseña (opcional)' : 'Contraseña Inicial'}
                            </label>
                            <Input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={user ? "Deja en blanco para no cambiar" : "••••••••"}
                                required={!user}
                                className="bg-white/50 dark:bg-slate-800/50 border-white/10 rounded-xl h-11 focus:ring-primary/20"
                            />
                            {user && <p className="text-[10px] text-muted-foreground/60 italic px-1">Solo rellena este campo si deseas cambiar la contraseña del usuario.</p>}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <DialogFooter className="pt-4 flex !justify-between items-center bg-muted/50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg border-t border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="rounded-xl font-bold bg-white/5 hover:bg-white/10 text-foreground"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary-light text-white font-black rounded-xl px-8 min-w-[120px] transition-all"
                        >
                            {isSubmitting ? 'GUARDANDO...' : user ? 'ACTUALIZAR' : 'CREAR'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
