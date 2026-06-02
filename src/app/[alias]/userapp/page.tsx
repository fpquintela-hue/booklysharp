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

export default function UserAppPage() {
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
            alert("No puedes eliminar tu propio usuario.");
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
        <div className="flex-1 flex flex-col h-full bg-background transition-colors duration-300">
            <div className="max-w-6xl mx-auto w-full space-y-8 p-4 sm:p-8 pt-16 sm:pt-8">
                <header className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                            <UserCog className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-primary dark:text-primary-light uppercase leading-none">
                                Staff de la App
                            </h1>
                            <p className="text-muted-foreground text-sm font-medium mt-1 uppercase tracking-widest">
                                Gestión de accesos y permisos
                            </p>
                        </div>
                    </div>
                    {isAdmin && (
                        <UserEditDialog onUserSaved={loadUsers} />
                    )}
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                        <p className="text-muted-foreground font-bold tracking-widest text-[10px] uppercase">Cargando Usuarios...</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {users.map(u => (
                            <Card key={u.id} className="glass-panel border-white/10 hover:shadow-xl transition-all relative overflow-hidden group hover:-translate-y-1 duration-300">
                                {/* Accent stripe */}
                                <div className={cn(
                                    "absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity",
                                    u.role === 'ADMIN' ? "bg-primary" : "bg-slate-400"
                                )} />

                                <CardContent className="pt-8">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/5 p-2 rounded-xl">
                                                <UserIcon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <div className="text-xl font-black text-foreground group-hover:text-primary transition-colors">
                                                    {u.name}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    {u.role === 'ADMIN' ? (
                                                        <div className="flex items-center gap-1 text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                            <ShieldCheck className="w-3 h-3" />
                                                            Administrador
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded-full">
                                                            <Shield className="w-3 h-3" />
                                                            Usuario
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {isAdmin && (
                                            <div className="flex gap-1">
                                                <UserEditDialog user={u} onUserSaved={loadUsers} />
                                                {u.id !== currentUser?.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteClick(u)}
                                                        className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-white/5 mt-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium text-slate-600 dark:text-slate-400 truncate">
                                                {u.email}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                            <span className="opacity-50">ID:</span> {u.id}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="bg-white/50 dark:bg-white/5 rounded-xl p-3 text-xs font-semibold text-center text-muted-foreground border border-white/5 italic">
                                            {u.id === currentUser?.id ? 'Tu sesión actual' : 'Usuario registrado'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
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
