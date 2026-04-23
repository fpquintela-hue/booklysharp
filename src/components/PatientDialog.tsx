'use client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PatientForm } from "./PatientForm"
import * as React from 'react';
import { useState } from "react"
import { Plus, Pencil, UserCircle } from "lucide-react"
import { Patient } from "@/types"
import { useTranslation } from "@/hooks/useTranslation"

interface PatientDialogProps {
    patient?: Patient;
    onPatientSaved?: (patient: Patient) => void;
    customTrigger?: React.ReactNode;
}

export function PatientDialog({ patient, onPatientSaved, customTrigger }: PatientDialogProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const handleSuccess = (savedPatient: Patient) => {
        setOpen(false);
        if (onPatientSaved) {
            onPatientSaved(savedPatient);
        } else {
            window.location.reload();
        }
    };

    const isEditing = !!patient;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {customTrigger ? customTrigger : (
                    isEditing ? (
                        <Button variant="outline" size="sm" className="rounded-lg border-slate-200 dark:border-slate-700">
                            <Pencil className="mr-2 h-4 w-4" /> {t('modal.edit')}
                        </Button>
                    ) : (
                        <Button className="bg-primary hover:bg-primary-light text-white font-bold px-6 h-11 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] group w-full flex justify-center items-center">
                            <div className="bg-white/20 p-1 rounded-lg mr-2 group-hover:bg-white/30 transition-colors">
                                <Plus className="h-4 w-4" />
                            </div>
                            {t('modal.new_user')}
                        </Button>
                    )
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90dvh] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl sm:rounded-[24px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200 p-8">
                <DialogHeader className="mb-6">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-full text-blue-500">
                            <UserCircle className="w-6 h-6" />
                        </div>
                        {isEditing ? t('modal.edit_user') : t('modal.new_user')}
                    </DialogTitle>
                    <DialogDescription className="text-slate-900 dark:text-slate-400 text-sm mt-1 ml-[52px]">
                        {isEditing ? t('modal.edit_user_desc') : t('modal.new_user_desc')}
                    </DialogDescription>
                </DialogHeader>
                <div className="pt-2">
                    <PatientForm patient={patient} onSuccess={handleSuccess} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
