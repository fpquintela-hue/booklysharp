'use client';
import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Apply 'classic-mode' class globally if user has 'vista2' selected
  const isClassicMode = user?.calendarViewMode === 'vista2';
  
  return (
    <div className={cn("h-full w-full", isClassicMode && "classic-mode")}>
      {children}
    </div>
  );
}
