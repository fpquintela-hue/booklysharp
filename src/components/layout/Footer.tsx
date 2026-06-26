import Link from 'next/link';
import NextImage from 'next/image';

const COLUMNS = [
  {
    title: 'Producto',
    links: [
      { href: '#funciones', label: 'Funciones' },
      { href: '#precios', label: 'Precios' },
      { href: '#integraciones', label: 'Integraciones' },
      { href: '#actualizaciones', label: 'Actualizaciones' },
    ],
  },
  {
    title: 'Sectores',
    links: [
      { href: '/peluquerias', label: 'Peluquerías y Barberías' },
      { href: '/centros-estetica', label: 'Centros de Estética' },
      { href: '/salud-bienestar', label: 'Salud y Bienestar' },
      { href: '/freelancers', label: 'Freelancers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/politica-de-privacidad', label: 'Política de Privacidad' },
      { href: '/politica-de-cookies', label: 'Política de Cookies' },
      { href: '/terminos-del-servicio', label: 'Términos del Servicio' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-16 text-slate-300">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:gap-12">
          <div>
            <Link href="/" className="mb-4 flex items-center">
              <NextImage src="/booklysharp_logotb.png" alt="BooklySharp" width={150} height={28} className="h-7 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              La plataforma de reservas online que automatiza tu agenda y multiplica tus
              ingresos, sin comisiones abusivas.
            </p>
            <p className="mt-6 text-sm text-slate-500">
              © {new Date().getFullYear()} BooklySharp. Todos los derechos reservados.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 font-semibold text-white">{col.title}</h4>
              <ul className="space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-slate-400 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
