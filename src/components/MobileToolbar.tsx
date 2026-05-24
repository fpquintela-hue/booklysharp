'use client';

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { View, Views } from 'react-big-calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es, gl } from 'date-fns/locale';
import { AppointmentDialog } from './AppointmentDialog';
import { useTranslation } from '@/hooks/useTranslation';

interface MobileToolbarProps {
    date: Date;
    view: View;
    onView: (view: View) => void;
    onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
    label: string;
}

export function MobileToolbar({ date, view, onView, onNavigate, label }: MobileToolbarProps) {
    const { t, lang } = useTranslation();
    const dateLocale = lang === 'gl' ? gl : es;
    const viewOptions: { label: string; value: View }[] = [
        { label: t('app.month'), value: Views.MONTH },
        { label: t('app.week'), value: Views.WEEK },
        { label: t('app.day'), value: Views.DAY },
    ];
    return (
        <div className="flex items-center gap-2 mb-2 pt-1 md:hidden">
            {/* View Selector */}
            <div className="bg-slate-100/80 dark:bg-slate-800/80 p-1 flex-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 flex shadow-sm">
                {viewOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onView(option.value)}
                        className={cn(
                            "flex-1 py-1 text-sm rounded-lg transition-all",
                            view === option.value
                                ? "bg-primary text-white shadow-sm font-bold"
                                : "text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-700 dark:hover:text-slate-200"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <button onClick={() => onNavigate('PREV')} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-slate-500 dark:text-slate-400">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => onNavigate('TODAY')} className="px-2 py-1 text-[11px] font-bold uppercase hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-slate-500 dark:text-slate-400 tracking-wider">
                    {t('app.today')}
                </button>
                <button onClick={() => onNavigate('NEXT')} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-slate-500 dark:text-slate-400">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
