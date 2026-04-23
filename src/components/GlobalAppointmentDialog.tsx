'use client';

import { useState, useEffect } from "react"
import { AppointmentDialog } from "./AppointmentDialog"

export function GlobalAppointmentDialog() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setOpen(true);
        window.addEventListener('openGlobalAppointmentDialog', handleOpen);
        return () => window.removeEventListener('openGlobalAppointmentDialog', handleOpen);
    }, []);

    return (
        <AppointmentDialog
            open={open}
            onOpenChange={setOpen}
            hideTrigger={true}
            onAppointmentCreated={() => {
                // The AppointmentDialog already dispatches 'refreshAppointments', 
                // but we might want to ensure the calendar updates.
            }}
        />
    )
}
