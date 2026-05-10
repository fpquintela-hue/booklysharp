import { Appointment, Patient, User } from '@/types';

// Helper to fetch from our new API
export const apiFetch = async (endpoint: string, options?: RequestInit) => {
    const headers = new Headers(options?.headers || {});
    if (typeof window !== 'undefined') {
        try {
            const stored = localStorage.getItem('auth_session_user');
            if (stored) {
                const user = JSON.parse(stored);
                if (user && user.tenantId) {
                    headers.set('x-tenant-id', user.tenantId);
                }
            }
        } catch (e) {
            console.error('Failed to parse session', e);
        }
    }

    const res = await fetch(`/api/${endpoint}`, { ...options, headers });
    if (!res.ok) {
        const error = new Error(`API error: ${res.statusText}`);
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
};

export const appointmentService = {
    async getAppointments(): Promise<Appointment[]> {
        const raw = await apiFetch('appointments');
        return raw.map((a: any) => ({
            ...a,
            start: new Date(a.start),
            end: new Date(a.end)
        }));
    },

    async createAppointment(apt: Omit<Appointment, 'id'>): Promise<Appointment> {
        return apiFetch('appointments', {
            method: 'POST',
            body: JSON.stringify(apt),
            headers: { 'Content-Type': 'application/json' }
        });
    },

    async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
        return apiFetch(`appointments/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
            headers: { 'Content-Type': 'application/json' }
        });
    },

    async deleteAppointment(id: string): Promise<void> {
        await apiFetch(`appointments/${id}`, {
            method: 'DELETE'
        });
    }
};

export const patientService = {
    async getPatients(): Promise<Patient[]> {
        return apiFetch('patients');
    },

    async getPatientById(id: string): Promise<Patient | undefined> {
        const patients = await this.getPatients();
        return patients.find(p => p.id === id);
    },

    async searchPatients(query: string): Promise<Patient[]> {
        const patients = await this.getPatients();
        const lower = query.toLowerCase();
        return patients.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.phone.includes(query)
        );
    },

    async createPatient(patient: Omit<Patient, 'id' | 'history'>): Promise<Patient> {
        return apiFetch('patients', {
            method: 'POST',
            body: JSON.stringify(patient),
            headers: { 'Content-Type': 'application/json' }
        });
    },

    async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
        return apiFetch('patients', {
            method: 'POST',
            body: JSON.stringify({ id, ...updates }),
            headers: { 'Content-Type': 'application/json' }
        });
    },

    async importPatients(newPatients: Omit<Patient, 'id' | 'history'>[]): Promise<{ imported: number, skipped: number }> {
        const existingPatients = await this.getPatients();
        const existingEmails = new Set(existingPatients.map(p => p.email?.toLowerCase()).filter(Boolean));

        const toImport: Patient[] = [];
        let skipped = 0;

        newPatients.forEach(p => {
            if (p.email && existingEmails.has(p.email.toLowerCase())) {
                skipped++;
            } else {
                toImport.push({
                    ...p,
                    id: crypto.randomUUID(),
                    history: []
                });
            }
        });

        if (toImport.length > 0) {
            const updatedList = [...existingPatients, ...toImport];
            await apiFetch('patients', {
                method: 'POST',
                body: JSON.stringify(updatedList),
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return { imported: toImport.length, skipped };
    },

    async deletePatient(id: string): Promise<void> {
        await apiFetch(`patients?id=${id}`, {
            method: 'DELETE'
        });
    }
};

export const userService = {
    async login(email: string, password: string): Promise<User | null> {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            console.error(e);
        }

        return null;
    },

    async getUsers(): Promise<User[]> {
        return apiFetch('users');
    },

    async createUser(user: Omit<User, 'id'>): Promise<User> {
        return apiFetch('users', {
            method: 'POST',
            body: JSON.stringify(user),
            headers: { 'Content-Type': 'application/json' }
        });
    },

    async updateUser(id: string, updates: Partial<User>): Promise<User> {
        return apiFetch('users', {
            method: 'POST',
            body: JSON.stringify({ id, ...updates }),
            headers: { 'Content-Type': 'application/json' }
        });
    },

    async deleteUser(id: string): Promise<void> {
        await apiFetch(`users?id=${id}`, {
            method: 'DELETE'
        });
    }
};
