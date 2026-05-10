'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit2, Trash2, KeyRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TenantUsersDialogProps {
    tenant: any;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    hideTrigger?: boolean;
}

export function TenantUsersDialog({ tenant, open, onOpenChange }: TenantUsersDialogProps) {
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
                 apellidos: '',
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

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-5xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative"
            >
                <button 
                    onClick={() => onOpenChange?.(false)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors z-50 bg-slate-800/50 hover:bg-slate-700 w-10 h-10 flex items-center justify-center rounded-full"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="p-8 bg-slate-900 text-white shrink-0">
                    <div className="flex justify-between items-center w-full pr-16">
                        <div>
                            <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                Gestión de Usuarios
                            </h2>
                            <p className="text-slate-400 text-sm mt-2 font-medium">
                                Control de acceso y permisos para <span className="text-blue-400 font-bold underline underline-offset-4">{tenant?.nombre_comercial}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex gap-0 overflow-hidden bg-white">
                    {/* Lista Principal */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                            <div className="relative flex-1">
                                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    placeholder="Localizar por nombre o email..." 
                                    className="h-12 pl-12 w-full rounded-2xl border-none bg-white shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all font-medium outline-none"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-30">
                                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
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
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Últ. Act.</span>
                                                    <span className="font-bold text-slate-700 mt-1">
                                                        {u.updatedAt ? new Date(u.updatedAt).toLocaleDateString('es-ES') : 'Nunca'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => toast.success('Enlace de recuperación enviado.')}
                                                    className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                                                >
                                                    <KeyRound className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => openEdit(u)}
                                                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={async () => {
                                                        const accion = u.bloqueado ? 'activar' : 'suspender';
                                                        if (!confirm(`¿${accion} este usuario?`)) return;
                                                        const res = await fetch('/api/users', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenant.id },
                                                            body: JSON.stringify({ id: u.id, bloqueado: !u.bloqueado })
                                                        });
                                                        if (res.ok) fetchUsers();
                                                    }}
                                                    className={cn("p-3 rounded-xl transition-all", u.bloqueado ? "text-green-500 hover:bg-green-50" : "text-orange-400 hover:bg-orange-50")}
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
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
                        </div>
                        
                        <form onSubmit={handleSaveUser} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nombre Completo</label>
                                <input required className="w-full h-12 rounded-xl bg-white border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 px-4" value={formName} onChange={e => setFormName(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Correo Electrónico</label>
                                <input type="email" required className="w-full h-12 rounded-xl bg-white border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 px-4" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{isEditing ? 'Nueva Clave (Opcional)' : 'Contraseña de Acceso'}</label>
                                <input type="password" placeholder="••••••••" required={!isEditing} className="w-full h-12 rounded-xl bg-white border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 px-4" value={formPassword} onChange={e => setFormPassword(e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nivel de Privilegios</label>
                                <select className="w-full h-12 rounded-xl bg-white border-none shadow-sm focus:ring-4 focus:ring-blue-500/10 px-4" value={formRole} onChange={e => setFormRole(e.target.value)}>
                                    <option value="ADMIN">ADMINISTRADOR</option>
                                    <option value="USER">EMPLEADO</option>
                                </select>
                            </div>
                            
                            <div className="pt-6 flex flex-col gap-3">
                                <button type="submit" className="h-14 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                                    {isEditing ? 'Guardar Cambios' : 'Registrar Profesional'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={resetForm} className="h-12 w-full rounded-2xl font-bold text-slate-400 hover:bg-slate-100">
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
