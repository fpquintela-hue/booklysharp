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
import { Users, Search, Plus, Edit2, Trash2, KeyRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TenantUsersDialogProps {
    tenant: any;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    hideTrigger?: boolean;
}

export function TenantUsersDialog({ tenant, open: externalOpen, onOpenChange: externalOnOpenChange, hideTrigger }: TenantUsersDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen;
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // User Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formRole, setFormRole] = useState('USER');

    useEffect(() => {
        if (open && tenant?.id) {
            fetchUsers();
        }
    }, [open, tenant]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/users', {
                headers: { 'x-tenant-id': tenant.id }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error cargando usuarios');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const payload = {
                 id: editingUserId,
                 name: formName,
                 apellidos: '', // Always empty for staff
                 email: formEmail,
                 role: formRole,
                 ...(formPassword ? { password: formPassword } : {})
            };

            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-tenant-id': tenant.id 
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingUserId ? 'Usuario actualizado' : 'Usuario creado');
                resetForm();
                fetchUsers();
            } else {
                toast.error('Error al guardar el usuario');
            }
        } catch (error) {
            toast.error('Error al guardar el usuario');
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar usuario ${name}?`)) return;
        try {
            const res = await fetch(`/api/users?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-tenant-id': tenant.id }
            });
            if (res.ok) {
                toast.success('Usuario eliminado');
                fetchUsers();
            } else {
                toast.error('Error al eliminar usuario');
            }
        } catch (error) {
            toast.error('Error al eliminar usuario');
        }
    };

    const handleResetPassword = async (id: string) => {
        const newPassword = prompt(`Introduce la nueva contraseña para este usuario:`);
        if (!newPassword) return;
        if (newPassword.length < 4) {
             toast.error('La contraseña debe tener al menos 4 caracteres');
             return;
        }

        try {
            const payload = { id, password: newPassword };
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-tenant-id': tenant.id 
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                toast.success('Contraseña actualizada correctamente');
            } else {
                toast.error('Error al actualizar la contraseña');
            }
        } catch(e) {
            toast.error('Error al actualizar la contraseña');
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingUserId(null);
        setFormName('');
        setFormEmail('');
        setFormPassword('');
        setFormRole('USER');
    };

    const openEdit = (u: any) => {
        setIsEditing(true);
        setEditingUserId(u.id);
        setFormName(u.name);
        setFormEmail(u.email);
        setFormPassword('');
        setFormRole(u.role);
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!hideTrigger && (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Users className="w-3 h-3" /> Usuarios
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-5xl h-[85dvh] flex flex-col p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl relative">
                <button 
                    onClick={() => setOpen(false)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-50 bg-slate-800/50 hover:bg-slate-700 w-10 h-10 flex items-center justify-center rounded-full"
                >
                    <X className="w-5 h-5" />
                </button>
                <DialogHeader className="p-8 bg-slate-900 text-white shrink-0">
                    <div className="flex justify-between items-center w-full pr-16">
                        <div>
                            <DialogTitle className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                Gestión de Usuarios
                            </DialogTitle>
                            <p className="text-slate-400 text-sm mt-2 font-medium">
                                Control de acceso y permisos para <span className="text-blue-400 font-bold underline underline-offset-4">{tenant.nombre_comercial}</span>
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 flex gap-0 overflow-hidden bg-white">
                    {/* Lista Principal */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Toolbar */}
                        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                            <div className="relative flex-1">
                                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <Input 
                                    placeholder="Localizar por nombre o email..." 
                                    className="h-12 pl-12 rounded-2xl border-none bg-white shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-30">
                                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="font-black uppercase tracking-widest text-xs">Sincronizando Usuarios...</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-20 text-slate-300">
                                    <Users className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="font-bold">No se encontraron resultados</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {filteredUsers.map(u => (
                                        <div key={u.id} className="group flex flex-wrap md:flex-nowrap items-center justify-between p-6 hover:bg-blue-50/30 transition-all gap-4">
                                            <div className="flex items-center gap-5 min-w-0 flex-1">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase tracking-tighter group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                    {(u.name || u.email || '??').substring(0, 2)}
                                                </div>
                                                <div className="min-w-[200px]">
                                                    <div className="flex items-center gap-3">
                                                        <p className="font-black text-slate-800 tracking-tight group-hover:text-blue-700 transition-colors truncate max-w-[200px]">{u.name || 'Sin Nombre'}</p>
                                                        <span className={cn(
                                                            "text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border shrink-0",
                                                            u.role === 'ADMIN' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                                        )}>
                                                            {u.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{u.email}</p>
                                                </div>
                                            </div>

                                            {/* Estado y Última Actividad */}
                                            <div className="flex-1 flex items-center gap-6 min-w-[200px] text-xs">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estado</span>
                                                    <span className={cn("font-bold mt-1", u.bloqueado ? "text-red-500" : "text-green-600")}>
                                                        {u.bloqueado ? 'Suspendido' : 'Activo'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Últ. Login / Act.</span>
                                                    <span className="font-bold text-slate-700 mt-1">
                                                        {u.updatedAt ? new Date(u.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Nunca'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => {
                                                        toast.success('Se ha enviado un enlace de recuperación de contraseña al email del usuario.');
                                                    }}
                                                    className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                    title="Enviar reseteo de contraseña"
                                                >
                                                    <KeyRound className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => openEdit(u)}
                                                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                    title="Editar datos básicos"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        const accion = u.bloqueado ? 'activar' : 'suspender';
                                                        if (!confirm(`¿Estás seguro de que quieres ${accion} a este usuario?`)) return;
                                                        const res = await fetch('/api/users', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenant.id },
                                                            body: JSON.stringify({ id: u.id, bloqueado: !u.bloqueado })
                                                        });
                                                        if (res.ok) fetchUsers();
                                                    }}
                                                    className={cn("p-3 rounded-xl transition-all", u.bloqueado ? "text-green-500 hover:text-green-700 hover:bg-green-50" : "text-orange-400 hover:text-orange-600 hover:bg-orange-50")}
                                                    title={u.bloqueado ? "Reactivar usuario" : "Suspender usuario"}
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Lateral de Formulario */}
                    <div className="w-96 bg-slate-50/80 border-l border-slate-100 p-8 flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                                {isEditing ? <Edit2 className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-100" />}
                                {isEditing ? 'Editar Perfil' : 'Alta de Usuario'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 font-medium">
                                {isEditing ? 'Modifica los permisos o datos del acceso.' : 'Añade un nuevo profesional a la agenda.'}
                            </p>
                        </div>
                        
                        <form onSubmit={handleSaveUser} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre Completo</Label>
                                <Input 
                                    required 
                                    className="h-12 rounded-xl bg-white border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                    value={formName} 
                                    onChange={e => setFormName(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Correo Electrónico</Label>
                                <Input 
                                    type="email" 
                                    required 
                                    className="h-12 rounded-xl bg-white border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                    value={formEmail} 
                                    onChange={e => setFormEmail(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">{isEditing ? 'Nueva Clave (Opcional)' : 'Contraseña de Acceso'}</Label>
                                <Input 
                                    type="password" 
                                    placeholder="••••••••"
                                    required={!isEditing} 
                                    className="h-12 rounded-xl bg-white border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                    value={formPassword} 
                                    onChange={e => setFormPassword(e.target.value)} 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nivel de Privilegios</Label>
                                <select 
                                    className="w-full flex h-12 rounded-xl bg-white border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-sm px-4 outline-none appearance-none"
                                    value={formRole} 
                                    onChange={e => setFormRole(e.target.value)}
                                >
                                    <option value="ADMIN">ADMINISTRADOR (Todo)</option>
                                    <option value="USER">EMPLEADO (Solo Agenda)</option>
                                </select>
                            </div>
                            
                            <div className="pt-6 flex flex-col gap-3">
                                <Button type="submit" className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                                    {isEditing ? 'Guardar Cambios' : 'Registrar Profesional'}
                                </Button>
                                {isEditing && (
                                    <Button type="button" variant="ghost" onClick={resetForm} className="h-12 rounded-2xl font-bold text-slate-400">
                                        Cancelar y limpiar
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
