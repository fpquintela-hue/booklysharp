import Link from 'next/link';
import NextImage from 'next/image';

export function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <NextImage 
                src="/booklysharp_logotb.png" 
                alt="BooklySharp Logo" 
                width={150} 
                height={28} 
                className="h-7 w-auto" 
              />
            </Link>
            <p className="text-sm text-slate-400 mb-6">
              La plataforma de reservas online que automatiza tu agenda y multiplica tus ingresos sin comisiones abusivas.
            </p>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} BooklySharp. <br className="hidden md:block"/>Todos los derechos reservados.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Producto</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#funciones" className="hover:text-primary transition-colors">Funciones</Link></li>
              <li><Link href="#precios" className="hover:text-primary transition-colors">Precios</Link></li>
              <li><Link href="#integraciones" className="hover:text-primary transition-colors">Integraciones</Link></li>
              <li><Link href="#actualizaciones" className="hover:text-primary transition-colors">Actualizaciones</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Sectores</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/peluquerias" className="hover:text-primary transition-colors">Peluquerías y Barberías</Link></li>
              <li><Link href="/centros-estetica" className="hover:text-primary transition-colors">Centros de Estética</Link></li>
              <li><Link href="/salud-bienestar" className="hover:text-primary transition-colors">Salud y Bienestar</Link></li>
              <li><Link href="/freelancers" className="hover:text-primary transition-colors">Freelancers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/politica-de-privacidad" className="hover:text-primary transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/politica-de-cookies" className="hover:text-primary transition-colors">Política de Cookies</Link></li>
              <li><Link href="/terminos-del-servicio" className="hover:text-primary transition-colors">Términos del Servicio</Link></li>
              <li className="pt-4 mt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Sistemas operativos 100%
              </li>
            </ul>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
