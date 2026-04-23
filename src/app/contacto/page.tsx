import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-primary/30 selection:text-primary-dark">
      <Navbar />
      <section className="container mx-auto px-4 pt-32 pb-24 max-w-3xl min-h-[80vh] flex flex-col justify-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 text-center">Plan a Medida</h1>
        <p className="text-lg text-slate-600 text-center mb-12">
          ¿Necesitas un plan personalizado con integraciones avanzadas? Déjanos tus datos y un especialista contactará contigo en breve para diseñar la solución perfecta.
        </p>
        
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-200">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Nombre completo</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:border-primary focus:ring-primary/20 outline-none transition-all" 
                  placeholder="Tu nombre" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Empresa / Franquicia</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:border-primary focus:ring-primary/20 outline-none transition-all" 
                  placeholder="Nombre de empresa" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Correo electrónico profesional</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:border-primary focus:ring-primary/20 outline-none transition-all" 
                placeholder="hola@tuempresa.com" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">¿Qué necesidades especiales tienes?</label>
              <textarea 
                rows={4} 
                 className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:border-primary focus:ring-primary/20 outline-none transition-all resize-none" 
                placeholder="Cuéntanos un poco sobre el volumen de tu negocio, integraciones requeridas, número de empleados..."
              ></textarea>
            </div>
            
            <Button className="w-full h-12 text-md mt-4" size="lg">Solicitar propuesta</Button>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}
