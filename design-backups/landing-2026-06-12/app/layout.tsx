import type { Metadata } from 'next';
import * as React from 'react';
import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'booklysharp',
  description: 'Gestión inteligente de reservas',
};

import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';

import { SettingsProvider } from '@/context/settings-context';
import { NavigationWrapper } from '@/components/NavigationWrapper';
import { Toaster } from 'sonner';

import { ThemeWrapper } from '@/components/ThemeWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans overflow-hidden h-[100dvh] bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <SettingsProvider>
              <NavigationWrapper>
                <ThemeWrapper>
                  {children}
                </ThemeWrapper>
              </NavigationWrapper>
              <Toaster position="top-right" richColors expand={false} />
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
