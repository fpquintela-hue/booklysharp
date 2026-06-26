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
    <main className="min-h-screen bg-slate-50 selection:bg-primary/30 selection:text-primary-dark">
      {maintenance.enabled && <MaintenanceBanner message={maintenance.message} />}
      <Navbar />
      
      <Hero />
      <SocialProof /> {/* Los logos de empresas que ya lo usan */}
      <Problem />     {/* Agitamos el dolor */}
      <UseCases />    {/* Segmentamos al cliente */}
      <Features />    {/* Demostramos el valor técnico */}
      <Testimonials /> {/* Social proof extra */}
      <Pricing />     {/* Cerramos la venta */}
      <FAQ />         {/* Eliminamos dudas finales */}
      <CTASection />  {/* Última oportunidad de conversión */}
      
      <FAB />         {/* Botón flotante de contacto */}
      
      <Footer />
    </main>
  );
}
