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

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-primary/30 selection:text-primary-dark">
      <Navbar />
      
      <Hero />
      <SocialProof /> {/* Los logos de empresas que ya lo usan */}
      <Problem />     {/* Agitamos el dolor */}
      <UseCases />    {/* Segmentamos al cliente */}
      <Features />    {/* Demostramos el valor técnico */}
      <Pricing />     {/* Cerramos la venta */}
      <FAQ />         {/* Eliminamos dudas finales */}
      <CTASection />  {/* Última oportunidad de conversión */}
      
      <Footer />
    </main>
  );
}
