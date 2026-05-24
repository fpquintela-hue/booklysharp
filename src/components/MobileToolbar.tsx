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
        <div className="flex items-center gap-2 mb-1 pt-0.5 md:hidden">
            {/* View Selector */}
            <div className="glass-effect p-1 flex-1 rounded-xl border border-border flex shadow-sm">
                {viewOptions.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onView(option.value)}
                        className={cn(
                            "flex-1 py-1 text-sm font-medium rounded-lg transition-all",
                            view === option.value
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1 glass-effect p-1 rounded-xl border border-border shadow-sm">
                <button onClick={() => onNavigate('PREV')} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-muted-foreground">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={() => onNavigate('TODAY')} className="px-2 py-1 text-[11px] font-bold uppercase hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-foreground">
                    {t('app.today')}
                </button>
                <button onClick={() => onNavigate('NEXT')} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-muted-foreground">
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
