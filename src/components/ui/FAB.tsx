import { MessageCircle } from 'lucide-react';

export function FAB() {
  return (
    <button 
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#748AFA] text-white shadow-2xl shadow-[#748AFA]/40 hover:bg-[#5c73df] transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#748AFA]"
      aria-label="Contacto"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  );
}
