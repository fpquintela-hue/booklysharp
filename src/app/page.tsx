import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { Problem } from '@/components/sections/Problem';
import { SocialProof } from '@/components/sections/SocialProof';
import { UseCases } from '@/components/sections/UseCases';
import { Features } from '@/components/sections/Features';
import { Pricing } from '@/components/sections/Pricing';
import { FAQ } from '@/components/sections/FAQ';
import { CTASection } from '@/components/sections/CTASection';
import { Testimonials } from '@/components/sections/Testimonials';
import { FAB } from '@/components/ui/FAB';
import { MaintenanceBanner } from '@/components/MaintenanceBanner';
import { getMaintenanceStatus } from '@/lib/global-settings';

// El aviso de mantenimiento se lee en cada visita para reflejar al instante
// los cambios que haga el superadmin.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const maintenance = await getMaintenanceStatus();

  return (
    <div className="font-headline min-h-screen bg-white text-slate-900 antialiased selection:bg-[#0c63ce]/20 selection:text-[#0a52ab]">
      <div className="sticky top-0 z-50">
        <Navbar />
        {maintenance.enabled && <MaintenanceBanner message={maintenance.message} />}
      </div>

      <Hero />
      <SocialProof /> {/* Sectores que ya lo usan */}
      <Problem />     {/* El dolor */}
      <UseCases />    {/* A quién va dirigido */}
      <Features />    {/* El valor del producto */}
      <Testimonials /> {/* Prueba social */}
      <Pricing />     {/* La venta */}
      <FAQ />         {/* Dudas finales */}
      <CTASection />  {/* Conversión final + bloque oscuro de cierre */}

      <FAB />         {/* Botón flotante de contacto */}

      <Footer />
    </div>
  );
}
