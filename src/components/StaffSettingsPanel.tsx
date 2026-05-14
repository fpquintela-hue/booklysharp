'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';
import { userService } from '@/lib/mock-service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { UserEditDialog } from '@/components/UserEditDialog';
import { cn } from '@/lib/utils';
import {
    Trash2,
    ShieldCheck,
    User as UserIcon,
    Mail,
    Shield,
    AlertTriangle,
    UserCog,
    Loader2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function StaffSettingsPanel() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDeleteClick = (u: User) => {
        if (u.id === currentUser?.id) {
            return;
        }
        setUserToDelete(u);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            await userService.deleteUser(userToDelete.id);
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
            loadUsers();
        }
    };

    const isAdmin = currentUser?.role === 'ADMIN';

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto w-full space-y-12 p-4 md:p-8">
                {/* Header Section */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                            <UserCog className="w-3 h-3" />
                            Seguridad de Organización
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[0.9]">
                            Miembros del <span className="text-primary">Staff</span>
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                            Aquí configuras el acceso a la aplicación a los miembros de tu organización, definiendo sus roles y niveles de permiso.
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="shrink-0 pb-1">
                            <UserEditDialog onUserSaved={loadUsers} />
                        </div>
                    )}
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 animate-pulse">
                        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Sincronizando Accesos</span>
                    </div>
                ) : (
                    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                        {users.map(u => (
                            <div 
                                key={u.id} 
                                className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2"
                            >
                                {/* Role Badge */}
                                <div className="absolute top-8 right-8">
                                    {u.role === 'ADMIN' ? (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/10 text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                                            <ShieldCheck className="w-3 h-3" />
                                            Admin
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/5 border border-slate-500/10 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                            <UserIcon className="w-3 h-3" />
                                            Staff
                                        </div>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 border border-slate-100 dark:border-slate-700 shadow-inner">
                                            <UserIcon className="w-10 h-10 text-slate-400 dark:text-slate-600 group-hover:text-primary transition-colors" />
                                        </div>
                                        {u.id === currentUser?.id && (
                                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-4 border-white dark:border-slate-900 shadow-lg">
                                                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                                            {u.name}
                                        </h3>
                                        <p className="text-sm font-medium text-slate-400 flex items-center justify-center gap-2">
                                            <Mail className="w-3.5 h-3.5" />
                                            {u.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Metadata & Actions */}
                                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Identificador</span>
                                        <code className="text-[10px] font-mono text-slate-400 mt-1 opacity-70 truncate max-w-[120px]">
                                            {u.id.substring(0, 12)}...
                                        </code>
                                    </div>

                                    {isAdmin && (
                                        <div className="flex items-center gap-2">
                                            <UserEditDialog user={u} onUserSaved={loadUsers} />
                                            {u.id !== currentUser?.id && (
                                                <button
                                                    onClick={() => handleDeleteClick(u)}
                                                    className="p-2 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all active:scale-90"
                                                    title="Eliminar Acceso"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {u.id === currentUser?.id && (
                                    <div className="mt-6 py-2 px-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-bold text-emerald-600 text-center uppercase tracking-widest">
                                        Sesión Activa
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            }
            </div>

            {/* Modal de Confirmación de Borrado */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px] glass-panel border-white/10 dark:bg-slate-900/95 backdrop-blur-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-destructive mb-2">
                            <AlertTriangle className="w-6 h-6" />
                            <DialogTitle className="text-xl font-bold">Eliminar Usuario</DialogTitle>
                        </div>
                        <DialogDescription className="text-base pt-2 text-muted-foreground">
                            ¿Estás seguro de que deseas eliminar permanentemente a <strong>{userToDelete?.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 font-medium">
                        Esta acción retirará el acceso al sistema de este usuario de forma inmediata. No se puede deshacer.
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl font-bold">
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl font-bold px-6">
                            Eliminar Acceso
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
