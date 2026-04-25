'use client';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const plans = [
  { 
    name: 'Gratis', 
    description: 'Para probar y empezar a digitalizarte.',
    monthlyPrice: '0€', 
    features: ['1 calendario', '1 mes de historial de citas', 'Link de reserva básico', 'Soporte por email'] 
  },
  { 
    name: 'Plan Individual', 
    description: 'Ideal para autónomos que quieren automatizar todo.',
    monthlyPrice: '12.70€', 
    highlighted: true, 
    features: ['Calendarios ilimitados', 'Pagos por adelantado (Stripe)', 'Recordatorios por WhatsApp', 'Sincronización con Google/Apple', 'Historial ilimitado'] 
  },
  { 
    name: 'Profesional', 
    description: 'Para centros con varios empleados.',
    monthlyPrice: '19.00€', 
    features: ['Todo lo del plan Individual', 'Gestión de equipos (hasta 5)', 'Roles y permisos', 'Estadísticas avanzadas', 'Soporte prioritario'] 
  }
];

export function Pricing() {
  return (
    <section id="precios" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Planes simples, sin sorpresas</h2>
          <p className="text-slate-600">Empieza gratis, mejora cuando tu negocio crezca. Cero comisiones por reserva.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, i) => (
            <div key={i} className={`p-8 rounded-3xl ${plan.highlighted ? 'bg-slate-900 text-white shadow-2xl scale-105 border-[#0c63ce] border-2' : 'bg-white border text-slate-900'}`}>
              {plan.highlighted && <div className="text-[#0c63ce] text-sm font-bold tracking-widest uppercase mb-4">Más popular</div>}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={`mb-6 text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>
              <div className="text-4xl font-extrabold mb-6">{plan.monthlyPrice}<span className="text-lg font-normal text-slate-500">/mes</span></div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <CheckCircle2 className={`w-5 h-5 ${plan.highlighted ? 'text-[#0c63ce]' : 'text-green-500'}`} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Button className={`w-full ${plan.highlighted ? 'bg-[#0c63ce] hover:bg-[#0c63ce]/90 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`} size="lg">
                Elegir {plan.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
