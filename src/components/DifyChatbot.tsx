import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

export function DifyChatbot({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            if (messages.length === 0) {
                // Initial greeting
                setMessages([
                    {
                        id: 'welcome',
                        role: 'assistant',
                        content: '¡Hola! Soy el Asistente Booklysharp. ¿En qué te puedo ayudar hoy?'
                    }
                ]);
            }
        }
    }, [isOpen, messages.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        
        const newMessage = {
            id: Date.now().toString(),
            role: 'user' as const,
            content: userMessage
        };

        setMessages(prev => [...prev, newMessage]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userMessage,
                    conversation_id: conversationId,
                    user: user?.email || 'booklysharp_user'
                })
            });

            if (!res.ok) throw new Error('Error al enviar mensaje');

            const data = await res.json();
            
            if (data.conversation_id && !conversationId) {
                setConversationId(data.conversation_id);
            }

            setMessages(prev => [...prev, {
                id: data.message_id || Date.now().toString() + '_resp',
                role: 'assistant',
                content: data.answer || 'Lo siento, no pude procesar tu solicitud.'
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString() + '_error',
                role: 'assistant',
                content: 'Hubo un error al intentar comunicar con el servidor de chat. Por favor, inténtalo más tarde.'
            }]);
        } finally {
            setIsLoading(false);
            scrollToBottom();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 left-24 w-[360px] h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden z-[100] animate-in slide-in-from-left-4 fade-in duration-300">
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center justify-between text-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-tight">Asistente Booklysharp</h3>
                        <p className="text-[10px] text-white/80 font-medium">Siempre en línea para ayudarte</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50 relative custom-scrollbar">
                {messages.map((msg) => (
                    <div 
                        key={msg.id}
                        className={cn(
                            "flex w-full",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "flex gap-2 max-w-[85%]",
                            msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                        )}>
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1",
                                msg.role === 'user' 
                                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light" 
                                    : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            )}>
                                {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                            </div>
                            <div className={cn(
                                "px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm",
                                msg.role === 'user'
                                    ? "bg-primary text-white rounded-tr-none"
                                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-100 dark:border-slate-700"
                            )}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-2 max-w-[85%] flex-row">
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex items-center justify-center shrink-0 mt-1">
                                <Bot className="w-3.5 h-3.5" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
