'use client';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  return (
    <section id="precios" className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Planes simples, sin sorpresas</h2>
          <p className="text-slate-600 mb-8">Empieza gratis, mejora cuando tu negocio crezca. Cero comisiones por reserva.</p>
          
          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
              Pago Mensual
            </span>
            <button 
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#748AFA] focus:ring-offset-2"
              style={{ backgroundColor: isYearly ? '#748AFA' : '#e2e8f0' }}
              aria-pressed={isYearly}
            >
              <span 
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'}`}
              />
            </button>
            <span className={`flex items-center gap-2 text-sm font-medium transition-colors ${isYearly ? 'text-slate-900' : 'text-slate-500'}`}>
              Pago Anual
              <span className="inline-block rounded-full bg-[#748AFA]/10 text-[#748AFA] px-2.5 py-0.5 text-xs font-bold border border-[#748AFA]/20">
                Ahorra un 20%
              </span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`p-8 rounded-3xl ${
                plan.highlighted
                  ? 'bg-slate-900 text-white shadow-2xl scale-105 border-[#0c63ce] border-2'
                  : 'bg-white border text-slate-900'
              }`}
            >
              {plan.badgeLabel && (
                <div className="text-[#0c63ce] text-sm font-bold tracking-widest uppercase mb-4">
                  {plan.badgeLabel}
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={`mb-6 text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                {plan.description}
              </p>
              <div className="text-4xl font-extrabold mb-6">
                {plan.monthlyPrice === 0 ? (
                  'Gratis'
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-baseline">
                      {isYearly && plan.yearlyPrice 
                        ? plan.yearlyPrice.toFixed(2).replace('.', ',')
                        : plan.monthlyPrice.toFixed(2).replace('.', ',')} €
                      <span className="text-lg font-normal text-slate-500 ml-1">
                        {isYearly ? '/año' : '/mes'}
                      </span>
                    </div>
                    {isYearly && plan.yearlyPrice && (
                      <div className="text-sm font-medium text-emerald-600 mt-1">
                        (Equivale a {(plan.yearlyPrice / 12).toFixed(2).replace('.', ',')} €/mes)
                      </div>
                    )}
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <CheckCircle2
                      className={`w-5 h-5 ${plan.highlighted ? 'text-[#0c63ce]' : 'text-green-500'}`}
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.highlighted
                    ? 'bg-[#0c63ce] hover:bg-[#0c63ce]/90 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
                size="lg"
              >
                Elegir {plan.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
