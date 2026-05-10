export type AppointmentType = string;
export type AppointmentStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'USER';

export interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    phone?: string;
    start: Date;
    end: Date;
    type: AppointmentType;
    notes?: string;
    status: AppointmentStatus;
    patientBloqueado?: boolean;
    professionalId?: string;
    professionalColor?: string;
    professionalName?: string;
    reminderType?: string;
    reminderTime?: number;
    notifiedWA?: boolean;
    notifiedWAError?: string;
    notifiedEmail?: boolean;
    notifiedEmailError?: string;
    color?: string;
}

export interface Patient {
    id: string; // Num Expediente
    name: string;
    apellidos: string;
    phone: string;
    email?: string;
    bloqueado: boolean;
    history: string[]; // Appointment IDs
    notes?: string;
    treatmentPlan?: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    apellidos: string;
    role: UserRole;
    password?: string;
    theme?: string;
    language?: string;
    calendarViewMode?: string;
    primaryColor?: string;
    bloqueado: boolean;
    tenantId?: string | null;
    tenantAlias?: string;
    tenantExpiresAt?: string | null;
    tenantSubscriptionStatus?: string | null;
    tenantPlan?: string | null;
    tenantSubscriptionPlan?: string | null;
    tenantAutoRenew?: boolean;
    tenantCreatedAt?: string | null;
    tenantBillingInfo?: string | null;
    tenantPaymentMethods?: string | null;
    first_login_completed?: boolean;
    is_verified?: boolean;
}
