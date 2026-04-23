'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Navbar() {
  return (
    <motion.header
      className="fixed top-0 inset-x-0 z-50 bg-white/75 backdrop-blur-[8px] shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-2xl tracking-tight flex items-center font-[Inter]">
            <span className="text-black">Bookly</span><span className="text-[#2563EB]">Sharp</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-900">
          <Link href="#funciones" className="hover:text-primary transition-colors">Funciones</Link>
          <Link href="#precios" className="hover:text-primary transition-colors">Precios</Link>
          <Link href="#recursos" className="hover:text-primary transition-colors">Recursos</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="http://192.168.1.6/login" className="hidden sm:block text-sm font-medium text-slate-900 hover:text-primary transition-colors">
            Iniciar sesión
          </Link>
          <Button asChild>
            <Link href="/registro">Empezar ahora</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
