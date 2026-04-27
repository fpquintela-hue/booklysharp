'use client';

import Link from 'next/link';
import { LogOut, Calendar, MessageCircle, CalendarDays, Lock, Globe, RefreshCcw } from 'lucide-react';

export function OnboardingGuide({ alias, onClose }: { alias: string, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-r from-[#005bc4] to-[#4388fd] p-8 text-white relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-black/10 hover:bg-black/20 p-2 rounded-full">
                    <LogOut className="w-5 h-5" />
                </button>
                <h2 className="text-3xl font-extrabold mb-2">¡Bienvenido a tus primeros pasos!</h2>
                <p className="text-blue-100 text-sm max-w-lg leading-relaxed">
                  Configura estos aspectos básicos para que tu portal de reservas empiece a funcionar perfectamente y se adapte a las necesidades de tu negocio.
                </p>
            </div>
            
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href={`/${alias}/settings?tab=horarios`} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#005bc4] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#2c3437] text-sm mb-1">1. Modificar tu horario</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Configura tus horas de trabajo, pausas y disponibilidad general.</p>
                        </div>
                    </Link>

                    <Link href={`/${alias}/settings?tab=whatsapp`} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-green-200 hover:bg-green-50/50 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#2c3437] text-sm mb-1">2. Vincular WhatsApp</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Conecta tu cuenta para enviar recordatorios automáticos.</p>
                        </div>
                    </Link>

                    <Link href={`/${alias}/settings?tab=citas`} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#2c3437] text-sm mb-1">3. Crear tipos de cita</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Añade más servicios, define duraciones y precios de tus consultas.</p>
                        </div>
                    </Link>

                    <Link href={`/${alias}/settings?tab=horarios`} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#2c3437] text-sm mb-1">4. Bloquear días o cerrar</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Cierra tu agenda por días festivos o ausencias programadas desde el calendario o ajustes.</p>
                        </div>
                    </Link>
                    
                    <Link href={`/${alias}/settings?tab=app`} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#2c3437] text-sm mb-1">5. Abrir/Cerrar Portal</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Habilita o deshabilita la página pública de reservas para tus clientes.</p>
                        </div>
                    </Link>

                    <Link href={`/${alias}/settings?tab=profesionais`} className="flex gap-4 p-4 rounded-2xl border border-slate-100 hover:border-red-200 hover:bg-red-50/50 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <RefreshCcw className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#2c3437] text-sm mb-1">6. Vincular Google Calendar</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Sincroniza tus citas bidireccionalmente con tu cuenta de Google.</p>
                        </div>
                    </Link>
                </div>
                
                <div className="mt-8 flex justify-center">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                        ¡Entendido, ir al calendario!
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
