import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PoliticaCookies() {
  return (
    <div className="bg-[#0f172a] min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-6">
        <div className="max-w-[800px] mx-auto text-slate-300">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-10 tracking-tight">
            Política de <span className="text-[#748AFA]">Cookies</span>
          </h1>
          
          <div className="space-y-8 text-lg leading-relaxed">
            <p>
              En BooklySharp utilizamos cookies para el correcto funcionamiento de la plataforma y para entender cómo interactúas con ella.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">¿Qué son las cookies?</h2>
              <p>
                Son pequeños archivos de texto que se descargan en tu navegador al visitar nuestra web.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">¿Qué tipos usamos?</h2>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <span className="font-semibold text-white">Técnicas (Estrictamente necesarias):</span> Permiten el login, la seguridad y el funcionamiento de la app. No requieren consentimiento y no se pueden desactivar.
                </li>
                <li>
                  <span className="font-semibold text-white">Analíticas (Ej. Google Analytics):</span> Nos ayudan a medir el tráfico y mejorar la web. Solo se instalan si haces clic en "Aceptar" en nuestro banner.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">¿Cómo desactivarlas?</h2>
              <p>
                Puedes configurar o retirar tu consentimiento en cualquier momento a través de nuestro panel de configuración de cookies, o directamente desde los ajustes de tu navegador (Chrome, Safari, Firefox, etc.).
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
