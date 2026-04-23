'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, onCheckedChange, ...props }, ref) => {
        return (
            <div className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                props.checked ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
            )}>
                <input
                    type="checkbox"
                    className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    ref={ref}
                    onChange={(e) => {
                        onCheckedChange?.(e.target.checked);
                        if (props.onChange) {
                            props.onChange(e);
                        }
                    }}
                    {...props}
                />
                <div className="absolute inset-0 rounded-full transition-colors pointer-events-none" />
                <span
                    className={cn(
                        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform peer-checked:translate-x-5 translate-x-1 absolute left-0 top-0.5"
                    )}
                />
            </div>
        );
    }
);
Switch.displayName = 'Switch';

export { Switch };
