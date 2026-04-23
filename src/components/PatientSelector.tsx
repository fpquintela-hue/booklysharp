'use client';

import * as React from "react"
import { Check, ChevronsUpDown, UserPlus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Patient } from "@/types";
import { patientService } from "@/lib/mock-service";
import { PatientDialog } from "./PatientDialog";
import { useTranslation } from "@/hooks/useTranslation";

interface PatientSelectorProps {
    value?: string; // patientId
    onSelect: (patientId: string, patientName: string) => void;
    refreshTrigger?: number; // Add trigger to force reload
}

export function PatientSelector({ value, onSelect, refreshTrigger }: PatientSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [patients, setPatients] = React.useState<Patient[]>([]);
    const { t } = useTranslation();

    React.useEffect(() => {
        patientService.getPatients().then(setPatients);
    }, [refreshTrigger]); // Reload on trigger change

    const sortedAndFilteredPatients = React.useMemo(() => {
        return patients
            .filter(p => p.bloqueado !== true)
            .sort((a, b) => {
                const apellidosA = a.apellidos || "";
                const apellidosB = b.apellidos || "";
                if (apellidosA < apellidosB) return -1;
                if (apellidosA > apellidosB) return 1;
                return a.name.localeCompare(b.name);
            });
    }, [patients]);

    const selectedPatient = patients.find((p) => p.id === value);

    return (
        <Command className="w-full flex-1 bg-transparent border-none flex flex-col min-h-0 overflow-visible">
            {/* Search Input */}
            <div className="relative mt-2 mb-4 group">
                <CommandInput
                    placeholder="Buscar cliente..."
                    wrapperClassName="border border-blue-200 dark:border-slate-800 bg-background rounded-[8px] px-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all h-[46px]"
                    className="h-full w-full bg-transparent outline-none border-none py-0 focus:ring-0 text-sm"
                />
            </div>

            <div className="mb-6">
                <PatientDialog
                    customTrigger={
                        <button className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-[8px] flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg">
                            <Plus className="h-5 w-5" />
                            Nuevo Cliente
                        </button>
                    }
                    onPatientSaved={(newPatient) => {
                        const fullName = newPatient.apellidos ? `${newPatient.apellidos}, ${newPatient.name}`.trim() : newPatient.name.trim();
                        onSelect(newPatient.id, fullName);
                        patientService.getPatients().then(setPatients);
                    }}
                />
            </div>

            <div className="flex-grow flex flex-col min-h-0">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Clientes Registrados</h2>
                <div className="flex-1 min-h-0 overflow-hidden">
                    <CommandList className="h-full max-h-none overflow-y-auto custom-scrollbar pr-2 space-y-2" onWheel={(e) => e.stopPropagation()}>
                        <CommandEmpty>
                            <div className="p-8 flex flex-col items-center justify-center text-center opacity-50">
                                <p className="text-sm font-medium">{t('app.not_found')}.</p>
                            </div>
                        </CommandEmpty>

                        <CommandGroup className="px-0 py-0 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                            {sortedAndFilteredPatients.map((patient) => (
                                <CommandItem
                                    key={patient.id}
                                    value={patient.apellidos ? `${patient.apellidos}, ${patient.name}` : patient.name}
                                    onSelect={() => {
                                        onSelect(patient.id, patient.apellidos ? `${patient.apellidos}, ${patient.name}`.trim() : patient.name.trim());
                                    }}
                                    className={cn(
                                        "cursor-pointer flex items-center gap-4 group transition-colors py-2 px-2 rounded-[8px]",
                                        value === patient.id
                                            ? "bg-slate-100 dark:bg-slate-800"
                                            : "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-[8px] bg-blue-100 dark:bg-blue-900/40 text-primary dark:text-blue-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {((patient.apellidos?.[0] || '') + patient.name[0]).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-primary transition-colors truncate">
                                            {patient.apellidos ? `${patient.apellidos}, ${patient.name}` : patient.name}
                                        </div>
                                        <div className="text-xs text-slate-400 truncate mt-0.5">
                                            # {patient.phone || 'Sin teléfono'}
                                        </div>
                                    </div>
                                    {value === patient.id && (
                                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </div>
            </div>
        </Command>
    )
}
