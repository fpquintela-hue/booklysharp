'use client';
import { useEffect, useState, useRef } from 'react';
import { Appointment, Patient } from '@/types';
import { patientService, appointmentService } from '@/lib/mock-service';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PatientDialog } from '@/components/PatientDialog';
import { Calendar, Clock, FileSpreadsheet, Upload, Trash2, AlertTriangle, LayoutGrid, List, Users } from 'lucide-react';
import { exportToExcel } from '@/lib/export-utils';
import { useAuth } from '@/context/auth-context';
import { usePathname, useParams } from 'next/navigation';
import ExcelJS from 'exceljs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils'; // Assuming cn utility is available
import { useTranslation } from '@/hooks/useTranslation';

export default function PatientsPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const params = useParams();
    const alias = params?.alias as string || '';
    const basePath = alias ? `/${alias}` : '';
    const [patients, setPatients] = useState<Patient[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [search, setSearch] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [showBlocked, setShowBlocked] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [viewMode, setViewMode] = useState<'cards' | 'list'>('list');

    const handleExport = () => {
        exportToExcel(patients, 'clientes');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const buffer = evt.target?.result;
            if (!buffer) return;
            
            const wb = new ExcelJS.Workbook();
            await wb.xlsx.load(buffer as ArrayBuffer);
            const ws = wb.worksheets[0];
            
            const data: any[] = [];
            const headers: string[] = [];
            
            ws.eachRow((row, rowNumber) => {
                if (rowNumber === 1) {
                    row.eachCell((cell, colNumber) => {
                        headers[colNumber] = cell.value?.toString() || '';
                    });
                } else {
                    const rowData: any = {};
                    row.eachCell((cell, colNumber) => {
                        if (headers[colNumber]) {
                            rowData[headers[colNumber]] = cell.value;
                        }
                    });
                    data.push(rowData);
                }
            });

            // Map data and filter to match name, phone, email
            const newPatients = data.map(row => {
                const fullName = row.name || row.Nombre || '';
                const parts = fullName.trim().split(' ');
                const name = parts[0] || '';
                const apellidosFallback = parts.slice(1).join(' ') || '';

                return {
                    name: name,
                    apellidos: row.apellidos || row.Apellidos || apellidosFallback,
                    phone: String(row.phone || row.Telefono || row.Teléfono || ''),
                    email: row.email || row.Email || '',
                    bloqueado: false
                };
            }).filter(p => (p.name || p.apellidos) && p.phone);

            if (newPatients.length > 0) {
                const result = await patientService.importPatients(newPatients as Omit<Patient, 'id' | 'history'>[]);
                alert(`Importación completada: ${result.imported} nuevos usuarios. ${result.skipped} omitidos por email duplicado.`);
                refreshData();
            } else {
                alert('No se encontraron datos válidos en el archivo. El Excel debe tener columnas: name, phone, email.');
            }
        };
        reader.readAsArrayBuffer(file);

        // Reset input
        e.target.value = '';
    };

    const refreshData = async () => {
        const [patientsData, appointmentsData] = await Promise.all([
            search.trim() ? patientService.searchPatients(search) : patientService.getPatients(),
            appointmentService.getAppointments()
        ]);

        // Sorting by surname (alphabetically)
        const sortedPatients = [...patientsData].sort((a, b) => {
            const getSurname = (name: string) => {
                const parts = name.trim().split(' ');
                return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : name.toLowerCase();
            };
            return getSurname(a.name).localeCompare(getSurname(b.name));
        });

        const filteredBlocked = sortedPatients.filter(p => showBlocked || !p.bloqueado);
        setPatients(filteredBlocked);
        setAppointments(appointmentsData);
    };

    useEffect(() => {
        refreshData();
    }, [search, showBlocked]);

    const getPatientStats = (patientId: string) => {
        const patientAppointments = appointments.filter(a => a.patientId === patientId);
        const now = new Date();
        const pending = patientAppointments.filter(a => a.start > now);
        const noShows = patientAppointments.filter(a => a.status === 'NO_SHOW');

        return {
            total: patientAppointments.length,
            pending: pending.length,
            noShows: noShows.length
        };
    };

    const handleDeleteClick = (patient: Patient) => {
        const stats = getPatientStats(patient.id);
        setPatientToDelete({ ...patient, hasPending: stats.pending > 0 } as any);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (patientToDelete) {
            await patientService.deletePatient(patientToDelete.id);
            setIsDeleteDialogOpen(false);
            setPatientToDelete(null);
            refreshData();
        }
    };

    return (
        <div className="p-8 md:p-12 min-h-[calc(100vh-76px)] transition-colors bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            {/* Action Header Section */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                <div>
                    <span className="text-xs font-bold tracking-[0.1em] text-primary dark:text-blue-400 uppercase font-label">Listado Histórico</span>
                    <h2 className="text-4xl font-extrabold tracking-tight font-headline text-slate-900 dark:text-white mt-1">Clientes</h2>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".xlsx, .xls"
                        className="hidden"
                    />
                    {user?.role === 'ADMIN' && (
                        <button onClick={handleImportClick} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined text-[20px]" data-icon="file_upload">file_upload</span>
                            Importar Excel
                        </button>
                    )}
                    <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined text-[20px]" data-icon="file_download">file_download</span>
                        Exportar Excel
                    </button>
                    <PatientDialog 
                        onPatientSaved={refreshData} 
                        customTrigger={
                            <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                <span className="material-symbols-outlined text-[20px]" data-icon="add">add</span>
                                + Nuevo Cliente
                            </button>
                        }
                    />
                </div>
            </section>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
                <div className="md:col-span-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-slate-100 dark:border-slate-800">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Clientes Activos</p>
                        <p className="text-5xl font-black font-headline text-primary dark:text-blue-400">{patients.length}</p>
                    </div>
                    <div className="flex gap-12">
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Nuevos (Mes)</p>
                            <p className="text-2xl font-bold font-headline text-slate-900 dark:text-white">+{patients.filter(p => new Date((p as any).createdAt || new Date()).getMonth() === new Date().getMonth()).length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Fidelidad</p>
                            <p className="text-2xl font-bold font-headline text-slate-900 dark:text-white">94%</p>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-4 bg-primary text-white rounded-[2rem] p-8 relative overflow-hidden group shadow-md dark:shadow-none">
                    <div className="relative z-10">
                        <p className="text-sm font-medium opacity-80">Próximas Citas</p>
                        <p className="text-4xl font-black font-headline mt-1">{appointments.filter(a => a.start > new Date()).length}</p>
                        <Link href={`${basePath}/`} className="text-xs mt-4 font-semibold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                            Ver agenda completa <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
                        </Link>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[140px]" data-icon="event_note">event_note</span>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Cliente</th>
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Contacto</th>
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">Citas Totales</th>
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">Inasistencias</th>
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">Pendientes</th>
                            <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {patients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(patient => {
                            const stats = getPatientStats(patient.id);
                            
                            const rawId = patient.id.charCodeAt(patient.id.length - 1) % 4;
                            const badgeColors = [
                                "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                                "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                                "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            ];

                            return (
                                <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm uppercase ${badgeColors[rawId]}`}>
                                                {(patient.name?.[0] || '')}{(patient.apellidos?.[0] || '')}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{patient.name} {patient.apellidos}</p>
                                                    {patient.bloqueado && (
                                                        <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Bloqueado</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">ID: {patient.id.substring(0, 8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{patient.phone}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{patient.email || '-'}</p>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{stats.total}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${stats.noShows > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{stats.noShows}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${stats.pending > 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{stats.pending}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`${basePath}/patients/${patient.id}`}>
                                                <button className="px-4 py-1.5 text-xs font-bold text-primary bg-primary/10 dark:text-blue-400 dark:bg-blue-500/10 rounded-lg hover:bg-primary/20 transition-colors">Ver Perfil</button>
                                            </Link>
                                            {user?.role === 'ADMIN' && (
                                                <button onClick={() => handleDeleteClick(patient)} className="p-2 text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors">
                                                    <span className="material-symbols-outlined text-lg" data-icon="delete">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                {patients.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-slate-300 dark:text-slate-700 mb-4">
                            <span className="material-symbols-outlined text-4xl">group_off</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">No se encontraron clientes para tu búsqueda.</p>
                    </div>
                )}
                
                {patients.length > 0 && (
                    <div className="px-8 py-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500 gap-4">
                        <p>Mostrando {Math.min(currentPage * itemsPerPage, patients.length)} de {patients.length} clientes en total</p>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg transition-all ${currentPage === 1 ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <span className="material-symbols-outlined text-xl" data-icon="chevron_left">chevron_left</span>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold">{currentPage}</button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(patients.length / itemsPerPage), prev + 1))}
                                disabled={currentPage >= Math.ceil(patients.length / itemsPerPage)}
                                className={`p-2 rounded-lg transition-all ${currentPage >= Math.ceil(patients.length / itemsPerPage) ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <span className="material-symbols-outlined text-xl" data-icon="chevron_right">chevron_right</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Confirmación de Borrado */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent showCloseButton={false} className="sm:max-w-md bg-transparent border-none shadow-none p-0 overflow-hidden flex items-center justify-center">
                    <div className="relative z-10 w-full bg-white dark:bg-slate-900 shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="h-1.5 w-full bg-gradient-to-r from-rose-400 via-red-500 to-rose-700"></div>
                        <div className="p-8 md:p-12 flex flex-col items-center text-center">
                            <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-900/20">
                                <span className="material-symbols-outlined text-4xl text-red-500" data-icon="delete">delete</span>
                            </div>
                            <DialogTitle className="font-headline text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3 uppercase">
                                ELIMINAR CLIENTE
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 dark:text-slate-400 font-body text-base leading-relaxed mb-8 max-w-[280px]">
                                {(patientToDelete as any)?.hasPending ? (
                                    <span className="text-sm bg-rose-50 dark:bg-rose-950/50 text-red-600 dark:text-red-400 p-3 rounded-lg text-left inline-block">
                                        <strong>No se puede eliminar:</strong>
                                        <span className="mt-1 opacity-90 block">El cliente tiene citas pendientes. Debes cancelar o completar sus citas primero.</span>
                                    </span>
                                ) : (
                                    <>
                                        ¿Seguro que deseas eliminar a <strong>{patientToDelete?.name}</strong>? Esta acción no se puede deshacer.
                                    </>
                                )}
                            </DialogDescription>
                            {!(patientToDelete as any)?.hasPending && (
                                <button onClick={confirmDelete} className="w-full py-4 px-6 bg-red-600 text-white font-headline font-bold text-base rounded-lg shadow-lg hover:bg-red-700 transition-all active:scale-[0.98] mb-6">
                                    Eliminar definitivamente
                                </button>
                            )}
                            <button onClick={() => setIsDeleteDialogOpen(false)} className="text-slate-500 dark:text-slate-400 outline-none font-body font-medium text-sm hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-2 group">
                                <span className="material-symbols-outlined text-base group-hover:translate-x-[-2px] transition-transform" data-icon="arrow_back">arrow_back</span>
                                {(patientToDelete as any)?.hasPending ? 'Cerrar' : 'Cancelar y volver'}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
