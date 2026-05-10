import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function TerminosServicio() {
  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-[800px] mx-auto text-slate-300">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-10 tracking-tight">
            Términos del <span className="text-[#748AFA]">Servicio</span>
          </h1>
          
          <div className="space-y-8 text-lg leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Objeto</h2>
              <p>
                BooklySharp es una plataforma SaaS de gestión de citas y reservas online.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Cuentas y Uso</h2>
              <p>
                Para usar el servicio debes ser mayor de 18 años. Eres responsable de mantener la confidencialidad de tus credenciales y de toda la actividad que ocurra bajo tu cuenta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Pagos y Suscripciones</h2>
              <p>
                Los planes de pago se cobran de forma mensual/anual por adelantado. BooklySharp no cobra comisiones por las reservas que recibes. Puedes cancelar tu suscripción en cualquier momento desde tu panel de control, y no se realizarán cargos adicionales, manteniendo el acceso hasta el fin del periodo pagado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Responsabilidad</h2>
              <p>
                BooklySharp hace todo lo posible por garantizar un uptime (disponibilidad) del 99%, pero no se hace responsable de pérdidas económicas derivadas de caídas puntuales del servidor, problemas de red de terceros (ej. caídas de WhatsApp) o mala configuración por parte del usuario.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Propiedad Intelectual</h2>
              <p>
                Todo el código, diseño y marca de BooklySharp son propiedad exclusiva de <span className="font-semibold text-white">Fernando Pérez Quintela</span>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
