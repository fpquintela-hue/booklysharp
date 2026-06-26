'use client';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="precios" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Planes simples, sin sorpresas
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Empieza gratis y mejora cuando tu negocio crezca. Cero comisiones por reserva.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm font-semibold transition-colors ${!isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
              Mensual
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0c63ce] focus:ring-offset-2"
              style={{ backgroundColor: isYearly ? '#0c63ce' : '#e2e8f0' }}
              aria-pressed={isYearly}
              aria-label="Cambiar entre pago mensual y anual"
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
            <span className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isYearly ? 'text-slate-900' : 'text-slate-400'}`}>
              Anual
              <span className="rounded-full border border-[#0c63ce]/20 bg-[#0c63ce]/10 px-2.5 py-0.5 text-xs font-bold text-[#0c63ce]">
                Ahorra 20%
              </span>
            </span>
          </div>
        </div>

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 items-center gap-8 md:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const highlighted = plan.highlighted;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 transition-all ${
                  highlighted
                    ? 'bg-slate-900 text-white shadow-2xl md:scale-105'
                    : 'border border-slate-200 bg-white text-slate-900 shadow-sm'
                }`}
              >
                {plan.badgeLabel && (
                  <div className="mb-4 text-sm font-bold uppercase tracking-widest text-[#3b82f6]">
                    {plan.badgeLabel}
                  </div>
                )}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className={`mt-2 text-sm ${highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                  {plan.description}
                </p>

                <div className="mt-6 text-4xl font-extrabold">
                  {plan.monthlyPrice === 0 ? (
                    'Gratis'
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-baseline">
                        {isYearly && plan.yearlyPrice
                          ? plan.yearlyPrice.toFixed(2).replace('.', ',')
                          : plan.monthlyPrice.toFixed(2).replace('.', ',')}{' '}
                        €
                        <span className={`ml-1 text-lg font-normal ${highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                          {isYearly ? '/año' : '/mes'}
                        </span>
                      </div>
                      {isYearly && plan.yearlyPrice && (
                        <div className="mt-1 text-sm font-medium text-emerald-500">
                          Equivale a {(plan.yearlyPrice / 12).toFixed(2).replace('.', ',')} €/mes
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <Check className={`h-5 w-5 shrink-0 ${highlighted ? 'text-[#3b82f6]' : 'text-[#0c63ce]'}`} />
                      <span className={highlighted ? 'text-slate-200' : 'text-slate-700'}>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`mt-8 w-full rounded-full font-semibold transition-all active:scale-[0.98] ${
                    highlighted
                      ? 'bg-[#0c63ce] text-white hover:bg-[#0a52ab]'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Elegir {plan.name}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
