'use client';

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface LogoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function LogoutDialog({ open, onOpenChange, onConfirm }: LogoutDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent showCloseButton={false} className="sm:max-w-md bg-transparent border-none shadow-none p-0 overflow-hidden flex items-center justify-center">
                <div className="relative z-10 w-full bg-[#ffffff] shadow-[0_12px_40px_rgba(0,91,196,0.06)] rounded-xl overflow-hidden border border-[#acb3b7]/10">
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#4388fd] via-[#005bc4] to-[#004fad]"></div>
                    <div className="p-8 md:p-12 flex flex-col items-center text-center">
                        <div className="mb-8 flex items-center justify-center w-20 h-20 rounded-full bg-[#4388fd]/10">
                            <span className="material-symbols-outlined text-4xl text-[#005bc4]" data-icon="logout">logout</span>
                        </div>
                        <DialogTitle className="font-headline text-2xl font-extrabold tracking-tight text-[#2c3437] mb-3 uppercase">
                            CERRAR SESIÓN
                        </DialogTitle>
                        <DialogDescription className="text-[#596064] font-body text-lg leading-relaxed mb-10 max-w-[280px]">
                            ¿De verdad quieres salir ahora?
                        </DialogDescription>
                        <button onClick={onConfirm} className="w-full py-4 px-6 bg-[#005bc4] text-white font-headline font-bold text-base rounded-lg shadow-lg shadow-[#005bc4]/20 hover:bg-[#004fad] transition-all active:scale-[0.98] mb-6">
                            Salir de la Agenda
                        </button>
                        <button onClick={() => onOpenChange(false)} className="text-[#596064] outline-none font-body font-medium text-sm hover:text-[#005bc4] transition-colors flex items-center gap-2 group">
                            <span className="material-symbols-outlined text-base group-hover:translate-x-[-2px] transition-transform" data-icon="arrow_back">arrow_back</span>
                            Cancelar y volver
                        </button>
                    </div>
                    <div className="bg-[#e3e9ed]/50 py-4 px-8 border-t border-[#acb3b7]/10 flex justify-center">
                        <div className="flex items-center gap-2 opacity-40">
                            <span className="font-headline font-extrabold text-[10px] tracking-widest text-[#005bc4] uppercase">Clinical Atelier</span>
                            <div className="w-1 h-1 rounded-full bg-[#acb3b7]"></div>
                            <span className="font-label text-[10px] tracking-widest text-[#596064] uppercase">Atelier Medical</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
