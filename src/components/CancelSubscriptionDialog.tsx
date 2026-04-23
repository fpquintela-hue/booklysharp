'use client';

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { HelpCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

interface CancelSubscriptionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function CancelSubscriptionDialog({ open, onOpenChange, onConfirm }: CancelSubscriptionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-md bg-transparent border-none shadow-none p-0 overflow-hidden flex items-center justify-center">
                <div className="relative z-10 w-full bg-[#ffffff] shadow-[0_12px_40px_rgba(0,91,196,0.06)] rounded-xl overflow-hidden border border-[#acb3b7]/10 animate-in zoom-in duration-200">
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#4388fd] via-[#005bc4] to-[#004fad]"></div>
                    <div className="p-8 md:p-12 flex flex-col items-center text-center">
                        <div className="mb-8 flex items-center justify-center w-20 h-20 rounded-full bg-[#ef4444]/10">
                            <span className="material-symbols-outlined text-4xl text-[#ef4444]" data-icon="cancel_schedule_send">cancel_schedule_send</span>
                        </div>
                        <DialogTitle className="font-headline text-2xl font-extrabold tracking-tight text-[#2c3437] mb-3 uppercase">
                            ANULAR SUSCRIPCIÓN
                        </DialogTitle>
                        <DialogDescription className="text-[#596064] font-body text-lg leading-relaxed mb-6 max-w-[320px]">
                            ¿Estás seguro de que quieres anular tu suscripción? 
                        </DialogDescription>
                        
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50 mb-10 w-full">
                            <div className="flex items-start gap-4 text-left">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-[#005bc4]" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-blue-900 uppercase tracking-widest">Tus Datos están Seguros</p>
                                    <p className="text-sm text-blue-700/70 font-medium leading-relaxed">
                                        Al anular, <span className="font-bold underline text-blue-800">no borraremos tus datos</span>. Los guardaremos para que puedas retomarlos en el futuro.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={onConfirm} 
                            className="w-full py-4 px-6 bg-[#ef4444] text-white font-headline font-bold text-base rounded-lg shadow-lg shadow-[#ef4444]/20 hover:bg-[#dc2626] transition-all active:scale-[0.98] mb-6 uppercase tracking-wider"
                        >
                            SÍ, ANULAR SUSCRIPCIÓN
                        </button>
                        <button onClick={() => onOpenChange(false)} className="text-[#596064] outline-none font-body font-medium text-sm hover:text-[#005bc4] transition-colors flex items-center gap-2 group">
                            <span className="material-symbols-outlined text-base group-hover:translate-x-[-2px] transition-transform" data-icon="arrow_back">arrow_back</span>
                            Cancelar y volver
                        </button>
                    </div>
                    <div className="bg-[#e3e9ed]/50 py-4 px-8 border-t border-[#acb3b7]/10 flex justify-center">
                        <div className="flex items-center gap-2 opacity-40">
                             <span className="font-headline font-extrabold text-[10px] tracking-widest text-[#005bc4] uppercase">BooklySharp</span>
                            <div className="w-1 h-1 rounded-full bg-[#acb3b7]"></div>
                            <span className="font-label text-[10px] tracking-widest text-[#596064] uppercase">Gestión de Suscripción</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
