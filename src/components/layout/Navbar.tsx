'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { useAuth } from '@/context/auth-context';

const NAV_LINKS = [
  { href: '#funciones', label: 'Funciones' },
  { href: '#precios', label: 'Precios' },
  { href: '#faq', label: 'FAQ' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const reduce = useReducedMotion();

  return (
    <motion.header
      className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md"
      initial={reduce ? false : { y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <img src="/booklysharp_logo.png?v=1" alt="BooklySharp" className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-9 text-sm font-semibold text-slate-700 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-[#0c63ce]">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={logout}
                className="hidden text-sm font-semibold text-slate-700 transition-colors hover:text-red-600 sm:block"
              >
                Cerrar sesión
              </button>
              <Button
                asChild
                className="rounded-full bg-[#0c63ce] px-5 font-semibold text-white transition-all hover:bg-[#0a52ab] active:scale-[0.98]"
              >
                <Link href={user.role === 'SUPERADMIN' ? '/superadminlogin' : user.tenantAlias ? `/${user.tenantAlias}` : '/registro'}>
                  Ir al panel
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-semibold text-slate-700 transition-colors hover:text-[#0c63ce] sm:block"
              >
                Iniciar sesión
              </Link>
              <Button
                asChild
                className="rounded-full bg-[#0c63ce] px-5 font-semibold text-white transition-all hover:bg-[#0a52ab] active:scale-[0.98]"
              >
                <Link href="/registro">Empezar ahora</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
