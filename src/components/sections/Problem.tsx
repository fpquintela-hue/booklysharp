'use client';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, CalendarX } from 'lucide-react';

export function Problem() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-slate-900">
            Gestionar tu agenda a mano te está costando dinero (y salud mental)
          </h2>
          <p className="text-lg text-slate-600">
            Sabemos cómo es tu día a día. Estás atendiendo a un cliente y el teléfono no para de sonar.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><MessageCircle size={100} /></div>
            <div className="text-red-500 mb-4 bg-red-50 w-12 h-12 flex items-center justify-center rounded-xl"><MessageCircle /></div>
            <h3 className="text-xl font-bold mb-3">Mensajes a las 11 PM</h3>
            <p className="text-slate-600">Clientes escribiendo por WhatsApp a deshoras esperando respuestas inmediatas para reservar.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><CalendarX size={100} /></div>
            <div className="text-red-500 mb-4 bg-red-50 w-12 h-12 flex items-center justify-center rounded-xl"><CalendarX /></div>
            <h3 className="text-xl font-bold mb-3">Los "No-Shows"</h3>
            <p className="text-slate-600">Ese cliente que no aparece y no avisa, dejándote un hueco en la agenda que no puedes cobrar.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Clock size={100} /></div>
            <div className="text-red-500 mb-4 bg-red-50 w-12 h-12 flex items-center justify-center rounded-xl"><Clock /></div>
            <h3 className="text-xl font-bold mb-3">Tiempo perdido</h3>
            <p className="text-slate-600">Horas a la semana cruzando mensajes de "qué día te viene bien", "el jueves a las 5 no puedo".</p>
          </div>
        </div>
      </div>
    </section>
  );
}
