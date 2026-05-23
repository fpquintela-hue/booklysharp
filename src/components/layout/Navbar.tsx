'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import NextImage from 'next/image';

import { useAuth } from '@/context/auth-context';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-50 bg-white/75 backdrop-blur-[8px] shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="/booklysharp_logo.png?v=1" 
            alt="BooklySharp Logo" 
            className="h-8 w-auto"
          />
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-900">
          <Link href="#funciones" className="hover:text-primary transition-colors">Funciones</Link>
          <Link href="#precios" className="hover:text-primary transition-colors">Precios</Link>
          <Link href="#faq" className="hover:text-primary transition-colors">FAQ</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button onClick={logout} className="hidden sm:block text-sm font-medium text-slate-900 hover:text-red-600 transition-colors">
                Cerrar sesión
              </button>
              <Button variant="accent" asChild>
                <Link href={user.role === 'SUPERADMIN' ? '/superadminlogin' : (user.tenantAlias ? `/${user.tenantAlias}` : '/registro')}>
                  Ir al panel
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-900 hover:text-[#0c63ce] transition-colors">
                Iniciar sesión
              </Link>
              <Button variant="accent" asChild>
                <Link href="/registro">Empezar ahora</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
