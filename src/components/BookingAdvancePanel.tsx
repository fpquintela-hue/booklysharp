'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/context/settings-context';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function BookingAdvancePanel() {
    const { settings, updateSettings } = useSettings();
    const [mode, setMode] = useState<'automatic' | 'manual'>('automatic');
    const [window, setWindow] = useState('1m');
    const [manualDate, setManualDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (settings.bookingAdvanceMode) setMode(settings.bookingAdvanceMode as 'automatic' | 'manual');
        if (settings.bookingAdvanceWindow) setWindow(settings.bookingAdvanceWindow);
        if (settings.bookingAdvanceDate) setManualDate(settings.bookingAdvanceDate);
    }, [settings]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateSettings({
                bookingAdvanceMode: mode,
                bookingAdvanceWindow: window,
                bookingAdvanceDate: manualDate
            });
            toast.success('Configuración de reservas guardada');
        } catch (error) {
            toast.error('Error al guardar la configuración');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 mt-8">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Apertura de Agenda (Portal Web)</h4>
            <p className="text-xs text-slate-500 mb-6">Configura con qué anticipación los clientes pueden agendar cita.</p>

            <div className="space-y-6">
                <div>
                    <Label className="text-sm font-semibold mb-3 block text-slate-700 dark:text-slate-300">Modo de Apertura</Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => setMode('automatic')}
                            className={cn(
                                "flex-1 p-3 rounded-xl border-2 transition-all text-sm font-medium text-left",
                                mode === 'automatic' 
                                    ? "border-primary bg-primary/5 text-primary shadow-sm" 
                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-500"
                            )}
                        >
                            Automático (Rolling)
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('manual')}
                            className={cn(
                                "flex-1 p-3 rounded-xl border-2 transition-all text-sm font-medium text-left",
                                mode === 'manual' 
                                    ? "border-primary bg-primary/5 text-primary shadow-sm" 
                                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-500"
                            )}
                        >
                            Manual
                        </button>
                    </div>
                </div>

                {mode === 'automatic' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="text-sm font-semibold mb-2 block text-slate-700 dark:text-slate-300">Límite de Anticipación</Label>
                        <Select value={window} onValueChange={setWindow}>
                            <SelectTrigger className="w-full sm:max-w-[250px] bg-white dark:bg-slate-800 rounded-xl">
                                <SelectValue placeholder="Selecciona margen..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="1w">1 Semana</SelectItem>
                                <SelectItem value="15d">15 Días</SelectItem>
                                <SelectItem value="1m">1 Mes</SelectItem>
                                <SelectItem value="2m">2 Meses</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-slate-400 mt-2">Los clientes solo podrán ver y reservar citas hasta este tiempo hacia adelante.</p>
                    </div>
                )}

                {mode === 'manual' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                        <Label className="text-sm font-semibold mb-2 block text-slate-700 dark:text-slate-300">Fecha Límite de Reserva</Label>
                        <input 
                            type="date" 
                            value={manualDate}
                            onChange={(e) => setManualDate(e.target.value)}
                            className="h-12 w-full sm:max-w-[250px] px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                        <p className="text-[10px] text-slate-400">En modo manual, las reservas web se cerrarán a partir de esta fecha inclusive.</p>
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <Button 
                        onClick={handleSave} 
                        disabled={loading || (mode === settings.bookingAdvanceMode && window === settings.bookingAdvanceWindow)}
                        className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary-light text-white font-bold h-11 px-8"
                    >
                        {loading ? 'Guardando...' : 'Aplicar Reglas'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

