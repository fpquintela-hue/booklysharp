'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, AlertCircle, CheckCircle2, QrCode, LogOut, RefreshCw as RefreshIcon, Save, Info, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { useSettings } from '@/context/settings-context';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function WhatsAppSettingsPanel() {
    const params = useParams();
    const alias = params?.alias as string;
    const { settings, updateSettings } = useSettings();
    
    const [status, setStatus] = useState<'loading' | 'disconnected' | 'qr_ready' | 'connected'>('loading');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [instanceInfo, setInstanceInfo] = useState<{ number?: string; state?: string } | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    
    const [templates, setTemplates] = useState({
        template1: '',
        template2: '',
        template3: '',
        templateReserva: ''
    });
    const [selectedTemplate, setSelectedTemplate] = useState<'template1' | 'template2' | 'template3' | 'templateReserva'>('templateReserva');
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setTemplates({
            template1: settings.whatsapp_template_1 || settings.whatsapp_template || 'Hola *{{nombre}}*, te recordamos tu cita para el día *{{fecha}}*. ¡Te esperamos!',
            template2: settings.whatsapp_template_2 || '',
            template3: settings.whatsapp_template_3 || '',
            templateReserva: settings.whatsapp_template_reserva_automatica || 'Hola *{{nombre}}* has realizado la reserva para el dia *{{fecha}}*. Te esperamos.'
        });
    }, [settings.whatsapp_template, settings.whatsapp_template_1, settings.whatsapp_template_2, settings.whatsapp_template_3, settings.whatsapp_template_reserva_automatica]);

    const getPreviewText = () => {
        const text = templates[selectedTemplate] || '';
        return text
            .replace(/{{nombre}}/g, 'Juan Pérez')
            .replace(/{{fecha}}/g, '20 de Marzo a las 10:00')
            .replace(/{{profesional}}/g, 'Dra. García');
    };

    const fetchStatus = async () => {
        try {
            const res = await fetch(`/api/whatsapp?alias=${alias}`);
            const data = await res.json();
            
            if (data.connected) {
                if (status === 'qr_ready') {
                    if (data.number && data.number !== 'Desconocido') {
                         await triggerSuccessMessage(data.number);
                    }
                }
                setStatus('connected');
                setInstanceInfo({ number: data.number, state: data.state });
                stopPolling();
            } else {
                if (status !== 'qr_ready') {
                    setStatus('disconnected');
                }
            }
        } catch (error) {
            console.error('Error fetching WA status:', error);
        }
    };

    const triggerSuccessMessage = async (number: string) => {
        try {
            await fetch('/api/whatsapp', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alias, number, text: "✅ *Booklysharp*: Conexión realizada con éxito. Este terminal está listo para recibir notificaciones automáticas." })
            });
        } catch (e) {
            console.error('Failed to send welcome message');
        }
    };

    useEffect(() => {
        fetchStatus();
        return () => stopPolling();
    }, [alias]);

    const startPolling = () => {
        if (pollInterval.current) return;
        pollInterval.current = setInterval(fetchStatus, 5000);
    };

    const stopPolling = () => {
        if (pollInterval.current) {
            clearInterval(pollInterval.current);
            pollInterval.current = null;
        }
    };

    const handleConnect = async () => {
        setIsActionLoading(true);
        setStatus('loading');
        try {
            const res = await fetch('/api/whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alias })
            });
            const data = await res.json();
            
            if (data.qr) {
                setQrCode(data.qr);
                setStatus('qr_ready');
                startPolling();
                toast.info('Escanea el código QR con tu aplicación de WhatsApp');
            } else {
                toast.error('No se pudo generar el código QR');
                setStatus('disconnected');
            }
        } catch (error) {
            toast.error('Error al iniciar vinculación');
            setStatus('disconnected');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('¿Estás seguro de que deseas desconectar WhatsApp? Se eliminará la instancia del servidor.')) return;
        
        setIsActionLoading(true);
        try {
            const res = await fetch(`/api/whatsapp?alias=${alias}`, { method: 'DELETE' });
            if (res.ok) {
                setStatus('disconnected');
                setInstanceInfo(null);
                setQrCode(null);
                toast.success('WhatsApp desconectado correctamente');
            } else {
                toast.error('Error al desconectar');
            }
        } catch (error) {
            toast.error('Error en el servidor');
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="space-y-8 font-body">
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white border border-blue-100/50 rounded-2xl p-4 flex items-center justify-between shadow-sm shadow-blue-500/5">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${status === 'connected' ? 'bg-[#00a884] shadow-[#00a884]/20' : 'bg-[#acb3b7] shadow-[#acb3b7]/20'}`}>
                            <span className="material-symbols-outlined text-2xl" data-icon="chat">chat</span>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold font-headline text-[#2c3437]">Estado del Servicio</span>
                                {status === 'connected' ? (
                                    <span className="bg-[#e7fce3] text-[#00a884] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#00a884]/10 uppercase tracking-wider">En línea</span>
                                ) : (
                                    <span className="bg-[#f0f4f7] text-[#596064] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#acb3b7]/20 uppercase tracking-wider">Desconectado</span>
                                )}
                            </div>
                            <p className="text-xs text-[#596064] font-medium">
                                {status === 'connected' ? (
                                    <>Vinculado con el número: <span className="text-[#005bc4] font-semibold">{instanceInfo?.number || ''}</span></>
                                ) : (
                                    'Conecta tu cuenta para enviar recordatorios automáticos.'
                                )}
                            </p>
                        </div>
                    </div>
                    {status === 'connected' ? (
                        <button onClick={handleDisconnect} disabled={isActionLoading} className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-[#596064] hover:text-[#a83836] hover:bg-[#a83836]/5 rounded-lg transition-all tracking-widest uppercase">
                            DESCONECTAR TERMINAL
                            <span className="material-symbols-outlined text-lg" data-icon="logout">logout</span>
                        </button>
                    ) : (
                        <button onClick={handleConnect} disabled={isActionLoading} className="flex items-center gap-2 px-4 py-2 text-[11px] font-bold text-[#005bc4] hover:bg-[#005bc4]/5 rounded-lg transition-all tracking-widest uppercase">
                            {isActionLoading ? 'INICIANDO...' : 'VINCULAR TERMINAL'}
                            <span className="material-symbols-outlined text-lg" data-icon="qr_code">qr_code</span>
                        </button>
                    )}
                </div>
            </div>

            {status === 'qr_ready' && qrCode && (
                <div className="max-w-7xl mx-auto mb-8 bg-white border border-blue-100/50 rounded-2xl p-8 flex flex-col items-center justify-center shadow-sm">
                    <h5 className="text-xl font-bold font-headline mb-2 text-[#2c3437]">Escanea el código QR</h5>
                    <p className="text-[#596064] text-sm mb-6">Abre WhatsApp en tu teléfono → Dispositivos vinculados → Vincular un dispositivo</p>
                    <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 rounded-xl border border-[#dce4e8]" />
                </div>
            )}

            {status === 'loading' && (
                <div className="max-w-7xl mx-auto mb-8 flex flex-col items-center justify-center py-12">
                    <span className="material-symbols-outlined text-4xl text-[#005bc4] animate-spin" data-icon="refresh">refresh</span>
                    <p className="mt-4 text-[10px] font-bold tracking-[0.2em] uppercase text-[#596064]">Verificando conexión...</p>
                </div>
            )}

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                <section className="lg:col-span-7 space-y-8">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-extrabold font-headline tracking-tight text-[#2c3437]">Personalización de Avisos</h2>
                        <p className="text-[#596064] font-body">Edita tus plantillas transaccionales para mejorar la comunicación con tus pacientes.</p>
                    </div>

                    <div className="bg-[#ffffff] rounded-xl p-8 space-y-8 shadow-sm border border-[#acb3b7]/10">
                        <div className="space-y-4">
                            <label className="text-xs font-bold uppercase tracking-widest text-[#596064] font-label">Seleccionar Plantilla</label>
                            <div className="relative">
                                <select 
                                    value={selectedTemplate} 
                                    onChange={(e: any) => setSelectedTemplate(e.target.value)}
                                    className="w-full bg-[#f0f4f7] border-none rounded-xl py-4 px-5 text-[#2c3437] font-body appearance-none focus:ring-2 focus:ring-[#005bc4]/20"
                                >
                                    <option value="templateReserva">Reserva Automática (Confirmación)</option>
                                    <option value="template1">Recordatorio 24h</option>
                                    <option value="template2">Cancelación de Cita</option>
                                    <option value="template3">Seguimiento Post-Consulta</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#596064] pointer-events-none" data-icon="expand_more">expand_more</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase tracking-widest text-[#596064] font-label">Contenido del Mensaje</label>
                                <span className="text-[10px] bg-[#4388fd]/10 text-[#005bc4] font-bold px-2 py-1 rounded">WHATSAPP / SMS</span>
                            </div>
                            <div className="bg-[#f0f4f7] rounded-xl p-1 focus-within:ring-2 focus-within:ring-[#005bc4]/20 transition-all">
                                <textarea 
                                    value={templates[selectedTemplate]}
                                    onChange={(e) => setTemplates(prev => ({ ...prev, [selectedTemplate]: e.target.value }))}
                                    className="w-full bg-transparent border-none focus:ring-0 text-[#2c3437] font-body p-4 leading-relaxed resize-none" 
                                    placeholder="Escribe tu mensaje aquí..." 
                                    rows={6}
                                />
                                <div className="p-3 border-t border-[#acb3b7]/10 flex flex-wrap gap-2">
                                    {['{{nombre}}', '{{fecha}}', '{{profesional}}', '{{clinica}}'].map(tag => (
                                        <button 
                                            key={tag}
                                            onClick={() => setTemplates(prev => ({ ...prev, [selectedTemplate]: prev[selectedTemplate] + tag }))}
                                            className="px-3 py-1.5 bg-[#ffffff] border border-[#acb3b7]/30 text-[#2c3437] text-xs font-semibold rounded-lg hover:border-[#005bc4] hover:text-[#005bc4] transition-all flex items-center gap-1.5"
                                        >
                                            <span className="material-symbols-outlined text-sm" data-icon="add">add</span>{tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={async () => {
                                    setIsSavingTemplate(true);
                                    try {
                                        await updateSettings({ 
                                            whatsapp_template_1: templates.template1,
                                            whatsapp_template_2: templates.template2,
                                            whatsapp_template_3: templates.template3,
                                            whatsapp_template_reserva_automatica: templates.templateReserva
                                        });
                                        toast.success('Plantillas guardadas correctamente');
                                    } catch (e) {
                                        toast.error('Error al guardar las plantillas');
                                    } finally {
                                        setIsSavingTemplate(false);
                                    }
                                }}
                                disabled={isSavingTemplate}
                                className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-3 shadow-lg transition-transform active:scale-95"
                                style={{ background: 'rgba(0, 91, 196, 0.85)', backdropFilter: 'blur(24px)', boxShadow: '0 10px 15px -3px rgba(0, 91, 196, 0.2)' }}
                            >
                                <span className={`material-symbols-outlined ${isSavingTemplate ? 'animate-spin' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }} data-icon={isSavingTemplate ? "refresh" : "save"}>{isSavingTemplate ? "refresh" : "save"}</span>
                                Guardar Plantilla
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-6 flex items-start gap-4">
                        <div className="bg-[#e0f2fe] p-2 rounded-lg text-[#005bc4]">
                            <span className="material-symbols-outlined text-xl" data-icon="security">security</span>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-[#0c4a6e] font-headline">Control de Seguridad</h4>
                            <p className="text-xs text-[#075985]/80 font-body leading-relaxed">
                                Todos los mensajes corporativos son enviados desde números verificados para garantizar la entrega. El uso de variables dinámicas asegura que cada comunicación sea personalizada y segura.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="lg:col-span-5 flex flex-col items-center justify-center">
                    <div className="flex flex-col relative w-full max-w-[320px] aspect-[9/19] rounded-[3rem] bg-slate-900 overflow-hidden border-[8px] border-slate-800" style={{ boxShadow: '0 0 0 12px #1e293b, 0 0 0 15px #334155, 0 30px 60px rgba(0,0,0,0.3)' }}>
                        <div className="h-32 bg-slate-100 w-full relative overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center px-4 pt-10 pb-4 bg-white/80 backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#005bc4] text-xl" data-icon="arrow_back">arrow_back</span>
                                    <div className="w-8 h-8 rounded-full bg-[#005bc4] flex items-center justify-center text-white text-[10px] font-bold">{(settings?.company_name || alias || 'AX').trim().split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}</div>
                                    <div>
                                        <h5 className="text-[11px] font-bold leading-none text-[#2c3437]">{settings?.company_name || alias}</h5>
                                        <span className="text-[8px] text-[#00a884] font-medium">En línea</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 text-[#005bc4]">
                                    <span className="material-symbols-outlined text-[18px]" data-icon="videocam">videocam</span>
                                    <span className="material-symbols-outlined text-[18px]" data-icon="call">call</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-[#e5ddd5] p-4 space-y-4 relative" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuArf2wUCQwzB6z7NTdXUBIpurAziehlXLxyLY0HAtVPCC7dI-AuQ4oX9UhfOHidjZTBZvbuUackCy1idVIesHlFLln-_veikVyD6TBT_n_8Y_mjc7FHIVPeQ68UBPIY_4aJTcstn57enJlqZYTS_GTimdyYaKQRstWEv_PkdOFf2671con1rEX1xJ7VDpYqV4H07RFVXJ7B7e60yVLinGp_d2y2Wx0VEVL_hFKGCt___4X9VVOT58KaEHCDqFjRMaUKDkB3w2hTGrWL')", backgroundSize: 'cover', backgroundBlendMode: 'overlay' }}>
                            <div className="flex justify-center">
                                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] uppercase font-bold text-[#596064] tracking-wider shadow-sm">Hoy</span>
                            </div>

                            <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-none p-3 shadow-sm relative">
                                <p className="text-[12px] leading-relaxed text-[#2c3437] font-body whitespace-pre-wrap">
                                    {getPreviewText() || 'Hola Maria García...'}
                                </p>
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-[9px] text-[#acb3b7]">14:22</span>
                                    <span className="material-symbols-outlined text-[14px] text-[#4388fd]" style={{ fontVariationSettings: "'FILL' 1" }} data-icon="done_all">done_all</span>
                                </div>
                            </div>

                            <div className="flex justify-center mt-6">
                                <div className="bg-[#fef3c7]/90 border border-[#fde68a] p-3 rounded-lg flex items-start gap-2 max-w-[90%]">
                                    <span className="material-symbols-outlined text-[#d97706] text-sm" data-icon="lock">lock</span>
                                    <p className="text-[8px] text-[#92400e] font-medium text-center leading-tight">Los mensajes y las llamadas están cifrados de extremo a extremo.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#acb3b7]" data-icon="add">add</span>
                            <div className="flex-1 bg-white rounded-full px-4 py-1.5 border border-slate-200">
                                <div className="w-full h-4"></div>
                            </div>
                            <span className="material-symbols-outlined text-[#acb3b7]" data-icon="photo_camera">photo_camera</span>
                            <span className="material-symbols-outlined text-[#acb3b7]" data-icon="mic">mic</span>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                        <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full border-2 border-[#f7f9fb] bg-[#005bc4] text-white flex items-center justify-center text-[10px] font-bold">V</div>
                            <div className="w-8 h-8 rounded-full border-2 border-[#f7f9fb] bg-[#4388fd] text-white flex items-center justify-center text-[10px] font-bold">S</div>
                        </div>
                        <p className="text-[11px] font-medium text-[#596064] font-body">Canal verificado vía <span className="font-bold text-[#005bc4]">Meta Business</span></p>
                    </div>
                </section>
            </div>
        </div>
    );
}
