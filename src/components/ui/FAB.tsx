import { MessageCircle } from 'lucide-react';

export function FAB() {
  return (
    <button 
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#0c63ce] text-white shadow-2xl shadow-[#0c63ce]/40 hover:bg-[#0a52ab] transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c63ce]"
      aria-label="Contacto"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  );
}
