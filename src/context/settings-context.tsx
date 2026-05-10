"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/mock-service';

type SettingsContextType = {
    settings: Record<string, string>;
    blockedDays: Record<string, boolean>; // key format: "YYYY-MM-DD" or "YYYY-MM-DD_profId"
    isNotFound: boolean;
    refreshSettings: (alias?: string) => Promise<void>;
    updateSettings: (newSettings: Record<string, string>) => Promise<void>;
    toggleBlockDay: (dateStr: string, forceStatus?: boolean, professionalId?: string | null) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType>({
    settings: {},
    blockedDays: {},
    isNotFound: false,
    refreshSettings: async () => { },
    updateSettings: async () => { },
    toggleBlockDay: async () => { },
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [blockedDays, setBlockedDays] = useState<Record<string, boolean>>({});
    const [isNotFound, setIsNotFound] = useState(false);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const root = document.documentElement;
            const primaryColor = settings.primaryColor || '#005bc4';
            root.style.setProperty('--primary', primaryColor);
            
            // Hex to RGB for opacity usage
            const hex = primaryColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                root.style.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
            }
        }
    }, [settings.primaryColor]);

    const refreshSettings = async (alias?: string) => {
        // Only try to fetch if we have a session OR an alias for branding
        const hasSession = typeof window !== 'undefined' && !!localStorage.getItem('auth_session_user');
        if (!hasSession && !alias) return;

        try {
            const settingsUrl = alias ? `settings?alias=${alias}` : 'settings';
            const configsUrl = alias ? `dayconfigs?alias=${alias}` : 'dayconfigs';

            const settingsData = await apiFetch(settingsUrl);
            const configsData = await apiFetch(configsUrl);

            setIsNotFound(false); // Reset if success

            if (settingsData && !settingsData.error) {
                setSettings(settingsData);
            }

            if (configsData && !configsData.error) {
                setBlockedDays(configsData);
            }
        } catch (error: any) {
            if (error.status === 404) {
                setIsNotFound(true);
            } else if (error.status === 401) {
                // Silently ignore 401, as it's expected when not in a tenant context
                setSettings({});
            } else {
                console.error('Failed to fetch settings/configs:', error);
            }
        }
    };

    const toggleBlockDay = async (dateStr: string, forceStatus?: boolean, professionalId?: string | null) => {
        const key = professionalId && professionalId !== 'all' ? `${dateStr}_${professionalId}` : dateStr;
        const isCurrentlyBlocked = !!blockedDays[key];
        const newBlockedStatus = forceStatus !== undefined ? forceStatus : !isCurrentlyBlocked;

        try {
            const data = await apiFetch('dayconfigs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: dateStr, isBlocked: newBlockedStatus, professionalId }),
            });
            if (data && !data.error) {
                setBlockedDays(prev => ({ ...prev, [key]: newBlockedStatus }));
            }
        } catch (error) {
            console.error('Failed to toggle block day:', error);
        }
    };

    const updateSettings = async (newSettings: Record<string, string>) => {
        try {
            const data = await apiFetch('settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings),
            });
            if (data && !data.error) {
                setSettings(prev => ({ ...prev, ...newSettings }));
            } else {
                throw new Error('Failed to update settings');
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw error;
        }
    };

    useEffect(() => {
        // Function to extract alias and refresh settings
        const handleRouteBranding = () => {
            if (typeof window !== 'undefined') {
                const pathParts = window.location.pathname.split('/').filter(Boolean);
                const aliasFromUrl = pathParts[0];

                if (aliasFromUrl && aliasFromUrl !== 'registro' && aliasFromUrl !== 'login' && aliasFromUrl !== 'register' && aliasFromUrl !== 'superadmin' && aliasFromUrl !== 'superadminlogin' && aliasFromUrl !== 'api') {
                    refreshSettings(aliasFromUrl);
                } else {
                    refreshSettings();
                }
            }
        };

        handleRouteBranding();
    }, [typeof window !== 'undefined' ? window.location.pathname : '']);

    return (
        <SettingsContext.Provider value={{ settings, blockedDays, isNotFound, refreshSettings, updateSettings, toggleBlockDay }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
