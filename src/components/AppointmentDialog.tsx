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
import { AppointmentForm } from "./AppointmentForm"
import * as React from 'react';
import { useState } from "react"
import { Plus, CalendarPlus } from "lucide-react"
import { useTranslation } from '@/hooks/useTranslation';

export function AppointmentDialog({
    onAppointmentCreated,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    hideTrigger,
    defaultSlot,
    customTrigger,
    activeProfessionalId
}: {
    onAppointmentCreated?: () => void,
    open?: boolean,
    onOpenChange?: (open: boolean) => void,
    hideTrigger?: boolean,
    defaultSlot?: { start: Date, end: Date },
    customTrigger?: React.ReactNode,
    activeProfessionalId?: string | null
}) {
    const [internalOpen, setInternalOpen] = useState(false);
    const { t } = useTranslation();
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

    const handleSuccess = () => {
        setOpen(false);
        if (onAppointmentCreated) onAppointmentCreated();
        window.dispatchEvent(new Event('refreshAppointments'));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!hideTrigger && (
                <DialogTrigger asChild>
                    {customTrigger || (
                        <Button className="bg-primary hover:bg-primary-light text-white font-bold px-6 h-11 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] group">
                            <div className="bg-white/20 p-1 rounded-lg mr-2 group-hover:bg-white/30 transition-colors">
                                <Plus className="h-4 w-4" />
                            </div>
                            {t('app.new_appointment')}
                        </Button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-[100vw] w-full max-h-[100dvh] h-full sm:h-[760px] sm:max-h-[90vh] m-0 sm:max-w-[960px] p-0 overflow-hidden border-none sm:shadow-2xl bg-background rounded-none sm:rounded-[8px] flex flex-col">
                <DialogTitle className="sr-only">Nueva Cita</DialogTitle>
                <div className="bg-background h-full flex flex-col md:flex-row w-full overflow-hidden">
                    <AppointmentForm
                        onSuccess={handleSuccess}
                        defaultSlot={defaultSlot}
                        activeProfessionalId={activeProfessionalId}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
