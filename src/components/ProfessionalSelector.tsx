'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { apiFetch } from '@/lib/mock-service';

interface Professional {
    id: string;
    name: string;
    color: string;
    isActive: boolean;
}

interface ProfessionalSelectorProps {
    onVisibleChange: (ids: string[]) => void;
    onActiveChange: (id: string) => void;
    activeId: string | null;
    isClassic?: boolean;
}

export function ProfessionalSelector({ onVisibleChange, onActiveChange, activeId, isClassic }: ProfessionalSelectorProps) {
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [visibleIds, setVisibleIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { lang, t } = useTranslation();

    const fetchProfessionals = async () => {
        try {
            const data = await apiFetch('professionals');
            if (data && Array.isArray(data)) {
                const activeProfs = data.filter((p: any) => p.isActive);
                setProfessionals(activeProfs);

                // By default, everyone is visible and the first one is active
                const ids = activeProfs.map((p: any) => p.id);
                setVisibleIds(ids);
                onVisibleChange(ids);

                if (activeProfs.length > 0 && !activeId) {
                    onActiveChange(activeProfs[0].id);
                }
            }
        } catch (error) {
            console.error('Error fetching professionals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfessionals();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleVisibility = (id: string) => {
        const next = visibleIds.includes(id)
            ? visibleIds.filter(v => v !== id)
            : [...visibleIds, id];
        setVisibleIds(next);
        onVisibleChange(next);
    };

    if (isLoading) return <div className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">{t('common.loading')}</div>;

    const activeProf = professionals.find(p => p.id === activeId) || professionals[0];
    const textSeleccionar = 'PROFESIONAL SELECCIONADO';

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                {textSeleccionar}
            </h3>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group",
                    isClassic ? "rounded-lg" : "rounded-2xl"
                )}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold shadow-sm transition-transform group-hover:scale-105"
                            style={{ backgroundColor: activeProf?.color || '#3b82f6' }}
                        >
                            {activeProf?.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" />
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                        <span className="font-black text-sm text-slate-900 dark:text-slate-100 truncate leading-none">
                            {activeProf?.name || '---'}
                        </span>
                    </div>
                </div>
                <ChevronDown className={cn(
                    "w-4 h-4 text-slate-300 transition-transform duration-300 group-hover:text-primary shrink-0",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown Content */}
            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar px-2 space-y-1">
                        {professionals.map((p) => (
                            <div
                                key={p.id}
                                className={cn(
                                    "group flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer",
                                    activeId === p.id
                                        ? "bg-slate-50 dark:bg-slate-800 ring-1 ring-slate-100 dark:ring-slate-700"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                )}
                                onClick={() => {
                                    onActiveChange(p.id);
                                    setIsOpen(false);
                                }}
                            >
                                <div
                                    className="relative flex items-center justify-center shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleVisibility(p.id);
                                    }}
                                >
                                    <div
                                        className={cn(
                                            "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center cursor-pointer shadow-sm",
                                            visibleIds.includes(p.id)
                                                ? "border-transparent text-white"
                                                : "border-slate-200 dark:border-slate-700 bg-transparent text-transparent"
                                        )}
                                        style={{ backgroundColor: visibleIds.includes(p.id) ? p.color : 'transparent' }}
                                    >
                                        <Check className={cn("w-4 h-4", !visibleIds.includes(p.id) && "opacity-0")} />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-sm font-bold truncate transition-colors",
                                        activeId === p.id ? "text-primary flex items-center gap-2" : "text-slate-600 dark:text-slate-300"
                                    )}>
                                        {p.name}
                                        {activeId === p.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </p>
                                </div>

                                {activeId === p.id && (
                                    <div className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
                                        Activo
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
