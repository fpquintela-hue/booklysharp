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
        <div className="flex flex-col gap-1 mb-1 pt-0.5 md:hidden">
            {/* View Selector & Add Action */}
            <div className="flex items-center gap-2">
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
                <AppointmentDialog
                    customTrigger={
                        <button className="h-[36px] w-[36px] shrink-0 bg-primary hover:bg-primary-light text-white rounded-full flex items-center justify-center shadow-md shadow-primary/30 transition-all active:scale-95 border-none">
                            <Plus className="h-5 w-5" />
                        </button>
                    }
                />
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between glass-effect px-2 py-1.5 rounded-xl border border-border shadow-sm min-h-[40px]">
                <h2 className="text-base font-bold text-primary capitalize">
                    {/* Custom formatter for cleaner look on mobile */}
                    {view === Views.MONTH && (format as any)(date, 'MMMM yyyy', { locale: dateLocale })}
                    {view === Views.DAY && (format as any)(date, 'd MMMM yyyy', { locale: dateLocale })}
                    {view === Views.WEEK && label}
                </h2>

                <div className="flex items-center gap-1">
                    <button onClick={() => onNavigate('PREV')} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg border border-border">
                        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => onNavigate('TODAY')} className="px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 rounded-lg border border-border text-foreground">
                        {t('app.today')}
                    </button>
                    <button onClick={() => onNavigate('NEXT')} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg border border-border">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>
            </div>
        </div>
    );
}
