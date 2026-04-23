'use client';
import { useEffect, useState, use } from 'react';
import { Appointment, Patient } from '@/types';
import { patientService, appointmentService } from '@/lib/mock-service';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge'; // Assuming badge exists or use simple span, actually I should add it first or use span. I'll use span for now to avoid errors or add it. Let's assume standard span with Tailwind.
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PatientDialog } from '@/components/PatientDialog';
import { Calendar as CalendarIcon, Phone, Mail, User as UserIcon, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter, useParams } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from '@/hooks/useTranslation';

export default function PatientDetailPage({ params }: { params: Promise<{ alias: string, id: string }> }) {
    const { t } = useTranslation();
    const { alias, id } = use(params);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const { user } = useAuth();
    const router = useRouter();
    const basePath = alias ? `/${alias}` : '';

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = () => {
        patientService.getPatientById(id).then(p => setPatient(p || null));
        appointmentService.getAppointments().then(all => {
            setAppointments(all.filter(a => a.patientId === id));
        });
    }

    const confirmDelete = async () => {
        if (patient) {
            await patientService.deletePatient(patient.id);
            setIsDeleteDialogOpen(false);
            router.push(`${basePath}/patients`);
        }
    };

    if (!patient) return <div className="p-8">Cargando...</div>;

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto antialiased">
            <Link href={`${basePath}/patients`}>
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent h-auto py-0 hover:underline text-[#596064] hover:text-[#005bc4] transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Panel: Client Profile */}
                <section className="lg:col-span-4 space-y-8">
                    <div className="bg-[#f0f4f7] rounded-xl p-8 flex flex-col items-center text-center relative overflow-hidden">
                        {/* Subtle background decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#005bc4]/5 rounded-full -mr-16 -mt-16"></div>
                        
                        {user?.role === 'ADMIN' && (
                            <div className="absolute top-4 left-4 z-20">
                                <button
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    className="p-2 text-[#596064]/40 hover:text-[#a83836] transition-colors rounded-full hover:bg-white/50"
                                    title="Eliminar usuario"
                                >
                                    <span className="material-symbols-outlined text-lg" data-icon="delete">delete</span>
                                </button>
                            </div>
                        )}

                        <div className="relative mb-6 z-10">
                            <div className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl flex items-center justify-center bg-white text-[#005bc4] text-4xl font-black uppercase">
                                {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <span className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#f0f4f7] rounded-full"></span>
                        </div>
                        <h2 className="text-2xl font-bold text-[#2c3437] tracking-tight mb-2 relative z-10">{patient.apellidos}, {patient.name}</h2>
                        
                        {patient.bloqueado ? (
                            <span className="relative z-10 inline-flex items-center px-3 py-1 rounded-full bg-[#fa746f]/20 text-[#a83836] text-[10px] font-black tracking-widest uppercase mb-6 animate-pulse">
                                Bloqueado
                            </span>
                        ) : (
                            <span className="relative z-10 inline-flex items-center px-3 py-1 rounded-full bg-[#005bc4]/10 text-[#005bc4] text-[10px] font-bold tracking-widest uppercase mb-6">
                                Cliente Registrado
                            </span>
                        )}

                        <div className="w-full space-y-4 text-left border-t border-[#acb3b7]/10 pt-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#004fad]">
                                    <span className="material-symbols-outlined text-sm" data-icon="call">call</span>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-[#596064] font-bold">Teléfono</p>
                                    <p className="text-sm font-medium text-[#2c3437]">{patient.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#004fad]">
                                    <span className="material-symbols-outlined text-sm" data-icon="mail">mail</span>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-[#596064] font-bold">Email</p>
                                    <p className="text-sm font-medium text-[#2c3437]">{patient.email || 'No proporcionado'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 w-full relative z-10">
                            <PatientDialog 
                                patient={patient} 
                                onPatientSaved={loadData}
                                customTrigger={
                                    <button className="w-full py-3 bg-white hover:bg-[#005bc4] hover:text-white text-[#005bc4] font-bold rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group">
                                        <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform" data-icon="edit">edit</span>
                                        Editar Perfil
                                    </button>
                                }
                            />
                        </div>
                    </div>

                    {/* Stats / Quick Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#f0f4f7] p-5 rounded-xl text-center">
                            <p className="text-2xl font-black text-[#005bc4]">{appointments.length}</p>
                            <p className="text-[10px] font-bold text-[#596064] uppercase tracking-tighter">Citas Totales</p>
                        </div>
                        <div className="bg-[#a589f8]/10 p-5 rounded-xl text-center">
                            <p className="text-2xl font-black text-[#684cb6]">{appointments.filter(a => (a as any).status === 'CANCELLED' || (a as any).status === 'NO_SHOW').length || 0}</p>
                            <p className="text-[10px] font-bold text-[#596064] uppercase tracking-tighter">Cancelaciones</p>
                        </div>
                    </div>
                </section>

                {/* Right Panel: Appointment History */}
                <section className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-bold tracking-tight text-[#2c3437]">Historial de Citas</h3>
                    </div>

                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-blue-900/5">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f0f4f7]">
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#596064]">Fecha</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#596064]">Hora</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#596064]">Profesional</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#596064]">Estado</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#596064] text-right">Notas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#acb3b7]/10">
                                {appointments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[#596064]">
                                            <span className="material-symbols-outlined text-4xl opacity-20 mb-2 block" data-icon="event_note">event_note</span>
                                            <p className="font-medium">No hay citas registradas.</p>
                                        </td>
                                    </tr>
                                ) : appointments.map((apt) => {
                                    const isPast = apt.start < new Date();
                                    const isCancelled = (apt as any).status === 'CANCELLED' || (apt as any).status === 'NO_SHOW';
                                    return (
                                        <tr key={apt.id} className="hover:bg-[#f0f4f7] transition-colors group">
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-semibold text-[#2c3437]">{apt.start.toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-[#596064] font-medium">
                                                {apt.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-5 text-sm font-semibold text-[#2c3437]">
                                                Sr Sergio
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase",
                                                    isPast 
                                                        ? "bg-green-100 text-green-700" 
                                                        : (isCancelled ? "bg-[#fa746f]/20 text-[#a83836]" : "bg-orange-100 text-orange-600")
                                                )}>
                                                    {isPast ? 'Finalizada' : (isCancelled ? 'Cancelada' : 'Pendiente')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-sm text-[#596064] max-w-xs truncate text-right" title={apt.notes}>
                                                {apt.notes || '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Bento Grid Details Section */}
                    {appointments.length > 0 && appointments[0].notes && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                            <div className="bg-[#d3e4fe]/20 p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="material-symbols-outlined text-[#506076]" data-icon="description">description</span>
                                    <h4 className="font-bold text-[#2c3437]">Última Observación</h4>
                                </div>
                                <p className="text-sm text-[#44546a] leading-relaxed">
                                    "{appointments[0].notes}"
                                </p>
                            </div>
                            <div className="bg-[#a589f8]/10 p-6 rounded-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="material-symbols-outlined text-[#684cb6]" data-icon="verified_user">verified_user</span>
                                    <h4 className="font-bold text-[#2c3437]">Plan de Tratamiento</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-[#684cb6] uppercase">Seguimiento</span>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <div className="flex items-center gap-2 text-[#a83836] mb-2">
                            <span className="material-symbols-outlined text-xl" data-icon="warning">warning</span>
                            <DialogTitle>Eliminar Cliente</DialogTitle>
                        </div>
                        <DialogDescription className="text-base pt-2 text-[#2c3437]">
                            ¿Estás seguro de que deseas eliminar permanentemente a <strong>{patient.apellidos}, {patient.name}</strong>?
                            Esta acción no se puede deshacer y también afectará a su historial.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl border-[#acb3b7]/30 text-[#2c3437]">Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete} className="bg-[#a83836] text-white hover:bg-[#67040d] rounded-xl">Eliminar definitivamente</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
