'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileSpreadsheet, Loader2, Calendar } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { appointmentService } from '@/lib/mock-service';
import { exportToExcel } from '@/lib/export-utils';
import { toast } from 'sonner';
import { format, startOfDay, endOfDay } from 'date-fns';

export function ExportDialog() {
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isExporting, setIsExporting] = useState(false);
    const { t } = useTranslation();

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const appointments = await appointmentService.getAppointments();

            const startStr = startOfDay(new Date(startDate));
            const endStr = endOfDay(new Date(endDate));

            const filtered = appointments.filter(app => {
                const appDate = new Date(app.start);
                return appDate >= startStr && appDate <= endStr;
            });

            if (filtered.length === 0) {
                toast.error(t('export.no_data'));
                return;
            }

            // Mapear campos requeridos por el usuario:
            // dia, hora inicio, hora fin, tipo, estado, notas, patientName, patientbloqueado y profesionalName
            const dataToExport = filtered.map(app => ({
                'Día': format(new Date(app.start), 'yyyy-MM-dd'),
                'Hora Inicio': format(new Date(app.start), 'HH:mm'),
                'Hora Fin': format(new Date(app.end), 'HH:mm'),
                'Tipo': app.type,
                'Estado': app.status || 'Pendiente',
                'Notas': app.notes || '',

                'Nombre Paciente': app.patientName,
                'Paciente Bloqueado': app.patientBloqueado ? 'Sí' : 'No',
                'Profesional': app.professionalName
            }));

            exportToExcel(dataToExport, `${t('export.filename')}_${startDate}_${endDate}`);
            toast.success(t('settings.save_success'));
            setOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(t('settings.error_saving'));
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setOpen(true)}
                className="hidden sm:flex h-11 px-5 rounded-xl border-emerald-500/30 bg-emerald-50/50 hover:bg-emerald-500 hover:text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-500 transition-all shadow-sm hover:shadow-emerald-500/20 group"
            >
                <div className="bg-emerald-500/10 p-1 rounded-lg mr-2 group-hover:bg-white/20 transition-colors">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:text-white" />
                </div>
                <span className="font-bold">Excel</span>
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px] glass-panel dark:bg-slate-900/95 backdrop-blur-xl border-white/10 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl font-black italic text-primary dark:text-primary-light uppercase tracking-tighter">
                            <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600">
                                <FileSpreadsheet className="w-6 h-6" />
                            </div>
                            {t('export.title')}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium italic pt-1">
                            {t('export.desc')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 border-y border-slate-100 dark:border-slate-800/50 my-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase tracking-widest font-black text-primary pl-1 flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-emerald-500" />
                                    {t('export.start_date')}
                                </Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-10 bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl font-bold transition-all focus:ring-2 focus:ring-emerald-500/20 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase tracking-widest font-black text-primary pl-1 flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-emerald-500" />
                                    {t('export.end_date')}
                                </Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-10 bg-slate-50/50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl font-bold transition-all focus:ring-2 focus:ring-emerald-500/20 text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="rounded-xl font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl h-12 px-8 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
                        >
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                            {t('export.button')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
