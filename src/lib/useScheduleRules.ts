import { getDay, getHours, format } from 'date-fns';
import { AppointmentType } from '@/types';
import { useMemo } from 'react';

export interface ValidationResult {
    valid: boolean;
    message?: string;
}

export function useScheduleRules(blockedDays: Record<string, boolean> = {}, settings: any = {}) {

    const getBlockedSlotsForContext = (professionalId?: string | null) => {
        let allSlots: any[] = [];

        // 1. Centro (Global) slots
        try {
            const globalSlots = JSON.parse(settings.blockedSlots || '[]');
            allSlots = [...allSlots, ...globalSlots];
        } catch { /* ignore */ }

        // 2. Professional specific slots
        if (professionalId && professionalId !== 'all') {
            const profSlotsRaw = settings[`blockedSlots_${professionalId}`];
            if (profSlotsRaw) {
                try {
                    const profSlots = JSON.parse(profSlotsRaw);
                    allSlots = [...allSlots, ...profSlots];
                } catch { /* ignore */ }
            }
        }

        return allSlots;
    };

    const checkBlocked = (start: Date, end: Date, professionalId?: string | null): { blocked: boolean, reason?: string } => {
        const dateStr = format(start, 'yyyy-MM-dd');
        const dayIndex = getDay(start);

        const sTime = start.getHours() * 60 + start.getMinutes();
        const eTime = end.getHours() * 60 + end.getMinutes();

        // 1. Check Centro (Global)
        if (blockedDays[dateStr] === true) {
            return { blocked: true, reason: 'El centro está cerrado este día.' };
        }

        try {
            const globalSlots = JSON.parse(settings.blockedSlots || '[]');
            const matches = globalSlots.filter((s: any) => Number(s.dayOfWeek) === dayIndex);
            for (const slot of matches) {
                const [sh, sm] = slot.startTime.split(':').map(Number);
                const [eh, em] = slot.endTime.split(':').map(Number);
                if (sTime < eh * 60 + em && eTime > sh * 60 + sm) {
                    return { blocked: true, reason: 'El centro está cerrado en este horario.' };
                }
            }
        } catch { }

        // 2. Check Professional
        if (professionalId && professionalId !== 'all') {
            if (blockedDays[`${dateStr}_${professionalId}`] === true) {
                return { blocked: true, reason: 'El profesional no está disponible este día.' };
            }

            try {
                const profSlotsRaw = settings[`blockedSlots_${professionalId}`];
                if (profSlotsRaw) {
                    const profSlots = JSON.parse(profSlotsRaw);
                    const matches = profSlots.filter((s: any) => Number(s.dayOfWeek) === dayIndex);
                    for (const slot of matches) {
                        const [sh, sm] = slot.startTime.split(':').map(Number);
                        const [eh, em] = slot.endTime.split(':').map(Number);
                        if (sTime < eh * 60 + em && eTime > sh * 60 + sm) {
                            return { blocked: true, reason: 'El profesional no está disponible en este horario.' };
                        }
                    }
                }
            } catch { }
        }

        return { blocked: false };
    };

    const isTimeRangeBlocked = (start: Date, end: Date, professionalId?: string | null) => {
        return checkBlocked(start, end, professionalId).blocked;
    };

    const validateAppointment = (date: Date, type: AppointmentType, professionalId?: string | null, end?: Date): ValidationResult => {
        const endTime = end || new Date(date.getTime() + 60000); // Default to 1-minute range if no end time provided to ensure check works

        const check = checkBlocked(date, endTime, professionalId);
        if (check.blocked) {
            return { valid: false, message: check.reason };
        }

        const hour = getHours(date);
        if (hour < 9 || hour >= 20) {
            return { valid: false, message: 'La agenda solo permite citas entre las 09:00 y las 20:00.' };
        }

        return { valid: true };
    };

    const getSlotStyle = (date: Date, professionalId?: string | null) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayIndex = getDay(date);

        const isBlockedGlobal = blockedDays[dateStr] === true;
        const isBlockedForProf = professionalId && professionalId !== 'all' ? blockedDays[`${dateStr}_${professionalId}`] === true : false;
        
        const gridStep = parseInt(settings.gridStep || '60');
        const slotStart = date.getHours() * 60 + date.getMinutes();

        const isWeekend = dayIndex === 0 || dayIndex === 6;

        if (isBlockedGlobal || isBlockedForProf) {
            return {
                className: 'blocked-day-slot cursor-not-allowed pointer-events-none'
            };
        }

        const blockedSlots = getBlockedSlotsForContext(professionalId);
        const matches = blockedSlots.filter((s: any) => Number(s.dayOfWeek) === dayIndex);

        let inCentroBlockedRange = false;
        let inProfBlockedRange = false;

        // Separate Centro vs Prof blocks for styling if needed
        let allGlobalSlots: any[] = [];
        try { allGlobalSlots = JSON.parse(settings.blockedSlots || '[]'); } catch { }

        for (const slot of matches) {
            const [sh, sm] = slot.startTime.split(':').map(Number);
            const [eh, em] = slot.endTime.split(':').map(Number);
            const sSlot = sh * 60 + sm;
            const eSlot = eh * 60 + em;

            if (slotStart >= sSlot && slotStart < eSlot) {
                // Check if this specific slot came from global settings
                const isGlobalBlock = allGlobalSlots.some(g => g.startTime === slot.startTime && g.endTime === slot.endTime && g.dayOfWeek === slot.dayOfWeek);
                if (isGlobalBlock) {
                    inCentroBlockedRange = true;
                } else {
                    inProfBlockedRange = true;
                }
                break;
            }
        }

        if (inCentroBlockedRange) {
            return {
                className: 'centro-closed-slot cursor-not-allowed pointer-events-none',
            };
        }

        if (inProfBlockedRange) {
            return {
                className: 'blocked-background-slot cursor-not-allowed pointer-events-none',
            };
        }

        // Apply alternating row background every 30 minutes to match h-10 grid
        const minutes = date.getHours() * 60 + date.getMinutes();
        const isAlternatingRow = (minutes / 30) % 2 !== 0;

        if (isAlternatingRow) {
            return {
                className: 'bg-zebra-stripe transition-colors duration-150'
            };
        }

        return {};
    };

    return {
        validateAppointment,
        getSlotStyle,
        isTimeRangeBlocked
    };
}
