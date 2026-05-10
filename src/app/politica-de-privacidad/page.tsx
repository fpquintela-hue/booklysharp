import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PoliticaPrivacidad() {
  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-[800px] mx-auto text-slate-300">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-10 tracking-tight">
            Política de <span className="text-[#748AFA]">Privacidad</span>
          </h1>
          
          <div className="space-y-8 text-lg leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Responsable del tratamiento</h2>
              <p>
                Fernando Pérez Quintela, con CIF/DNI/NIE <span className="font-semibold text-white">35465460N</span>, 
                y domicilio en <span className="font-semibold text-white">Avda. Rodrigo de Mendoza 62, 3D Vilagarcía de Arousa, Pontevedra</span>. 
                Correo de contacto: <a href="mailto:legal@booklysharp.com" className="text-[#748AFA] hover:underline">legal@booklysharp.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Finalidad del tratamiento</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestionar tu alta y proporcionarte el servicio del software SaaS BooklySharp.</li>
                <li>Procesar tus pagos a través de plataformas seguras (Stripe/PayPal).</li>
                <li>Enviarte comunicaciones técnicas, de soporte o mejoras del servicio.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Legitimación</h2>
              <p>
                La base legal es la ejecución de un contrato (al crear tu cuenta y aceptar los términos) y tu consentimiento explícito.
              </p>
            </section>

            <section className="bg-slate-800/50 p-6 rounded-2xl border border-[#748AFA]/20">
              <h2 className="text-2xl font-bold text-[#748AFA] mb-4">Rol de BooklySharp (Importante)</h2>
              <p>
                En relación a los datos de los clientes finales que reservan a través de la plataforma, el Usuario (profesional/empresa) es el Responsable del Tratamiento. 
                <span className="font-semibold text-white"> BooklySharp actúa únicamente como Encargado del Tratamiento</span>, limitándose a almacenar y procesar la información según las instrucciones del Usuario para el correcto funcionamiento de la agenda, comprometiéndose a no usar estos datos para fines propios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Destinatarios</h2>
              <p>
                No cederemos tus datos a terceros, salvo obligación legal o para el uso de proveedores necesarios para el servicio (ej. servidores de hosting ubicados en AWS Irlanda, pasarelas de pago).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Tus derechos</h2>
              <p>
                Puedes ejercer tus derechos de Acceso, Rectificación, Supresión, Limitación, Portabilidad y Oposición enviando un email a <a href="mailto:legal@booklysharp.com" className="text-[#748AFA] hover:underline">legal@booklysharp.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
