'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, Settings, Activity, Trash2, Send, 
    RefreshCw, Terminal, Phone, CheckCircle2, XCircle, AlertCircle, CalendarDays,
    Server,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';

// Material Symbols Component (safely)
const MaterialIcon = ({ icon, className = "", fill = false }: { icon: string; className?: string; fill?: boolean }) => (
    <span className={cn("material-symbols-outlined", className)} style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}>
        {icon}
    </span>
);

export function EvolutionMonitor() {
    const [instances, setInstances] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Tabs state
    const [activeTab, setActiveTab] = useState<'instances' | 'config'>('instances');

    // Global Settings
    const [apiUrl, setApiUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [isSavingSettings, setIsSavingSettings] = useState(false);

    // Logs
    const [logs, setLogs] = useState('');
    const [logType, setLogType] = useState('pm2');
    const [logName, setLogName] = useState('booklysharp'); // Default process name or container name
    const [isFetchingLogs, setIsFetchingLogs] = useState(false);

    // Test Message
    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState('🔔 *Booklysharp*: Mensaje de prueba desde el monitor.');
    const [testImage, setTestImage] = useState('https://booklysharp.com/images/whatsapp-reminder-default.png');
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [selectedInstanceForTest, setSelectedInstanceForTest] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
        fetchInstances();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setApiUrl(data.GLOBAL_EVOLUTION_API_URL || process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'http://192.168.1.6:8080');
                setApiKey(data.GLOBAL_EVOLUTION_API_KEY || '');
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const saveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSettings(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    GLOBAL_EVOLUTION_API_URL: apiUrl,
                    GLOBAL_EVOLUTION_API_KEY: apiKey
                })
            });
            if (res.ok) {
                toast.success('Configuración de Evolution API guardada');
                fetchInstances(); // Refresh after changing URL/Key
            } else {
                toast.error('Error al guardar configuración');
            }
        } catch (error) {
            toast.error('Error al guardar configuración');
        } finally {
            setIsSavingSettings(false);
        }
    };

    const fetchInstances = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/superadmin/evolution');
            if (res.ok) {
                const data = await res.json();
                // Depending on the API version, it might return an array directly or an object
                if (Array.isArray(data)) {
                    setInstances(data);
                } else if (data && data.instances) {
                    setInstances(data.instances);
                } else {
                    setInstances([]);
                }
            } else {
                toast.error('Error al cargar instancias de Evolution');
            }
        } catch (error) {
            toast.error('Error de conexión con Evolution API');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLogs = async () => {
        setIsFetchingLogs(true);
        try {
            const res = await fetch(`/api/superadmin/evolution/logs?type=${logType}&name=${logName}&lines=200`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs || 'No logs available.');
            } else {
                toast.error('Error al obtener logs');
            }
        } catch (error) {
            toast.error('Error al conectar con el servidor de logs');
        } finally {
            setIsFetchingLogs(false);
        }
    };

    const handleAction = async (action: string, instanceName: string, data?: any) => {
        if (!instanceName || instanceName === 'Unknown') {
            toast.error('El nombre de la instancia es inválido o no se pudo determinar.');
            return;
        }

        try {
            const res = await fetch('/api/superadmin/evolution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, instanceName, data })
            });
            
            const result = await res.json();

            if (res.ok) {
                if (action === 'connectionState') {
                    const state = result.instance?.state || result.state || result.connectionStatus || 'Desconocido';
                    toast.info(`Estado: ${state}`);
                } else {
                    toast.success('Acción ejecutada correctamente');
                    if (action === 'logout' || action === 'delete') fetchInstances();
                }
            } else {
                toast.error(result.error || 'Error al ejecutar la acción');
            }
        } catch (error) {
            toast.error('Error de red al ejecutar acción');
        }
    };

    const sendTestMessage = async (e: React.FormEvent, type: 'text' | 'media') => {
        e.preventDefault();
        if (!selectedInstanceForTest || !testPhone) return;

        setIsSendingTest(true);
        try {
            const data = type === 'text' 
                ? { number: testPhone, text: testMessage }
                : { number: testPhone, caption: testMessage, media: testImage };

            const res = await fetch('/api/superadmin/evolution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: type === 'text' ? 'sendText' : 'sendMedia', instanceName: selectedInstanceForTest, data })
            });

            if (res.ok) {
                toast.success('Mensaje enviado con éxito');
            } else {
                const result = await res.json();
                toast.error(result.error || 'Error al enviar mensaje');
            }
        } catch (error) {
            toast.error('Error de red al enviar mensaje');
        } finally {
            setIsSendingTest(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <section className="flex justify-between items-end">
                <div className="space-y-2">
                    <h2 className="text-4xl font-extrabold tracking-tight font-headline text-[#191b23] flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-[#25d366]" />
                        Monitor WhatsApp
                    </h2>
                    <p className="text-[#434655] font-medium max-w-lg">
                        Supervisa, gestiona y depura todas las conexiones de WhatsApp (Evolution API) de los negocios.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={fetchInstances} variant="outline" className="h-12 px-6 rounded-2xl flex items-center gap-2 font-bold shadow-sm">
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                        Refrescar
                    </Button>
                </div>
            </section>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-slate-100/80 p-1 rounded-2xl w-max border border-slate-200/50">
                <button
                    onClick={() => setActiveTab('instances')}
                    className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2", 
                        activeTab === 'instances' ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-900/5" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")}
                >
                    <Activity className="w-4 h-4" />
                    Instancias Activas
                </button>
                <button
                    onClick={() => setActiveTab('config')}
                    className={cn("px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2", 
                        activeTab === 'config' ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-900/5" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")}
                >
                    <Server className="w-4 h-4" />
                    Configuración y Logs
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'instances' ? (
                    <motion.div 
                        key="instances"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                Instancias Activas ({instances.length})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Instancia / Tenant</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Estado</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Alta</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Teléfono</th>
                                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {instances.length > 0 ? instances.map((instance: any, idx) => {
                                        // Robust parsing to fix the "Unknown" issue from Evolution API responses
                                        const name = instance.name || instance.instanceName || instance.instance?.instanceName || instance.instance?.name || 'Unknown';
                                        const state = instance.connectionStatus || instance.status || instance.state || instance.instance?.status || instance.instance?.state || instance.instance?.connectionStatus || 'Unknown';
                                        const phone = instance.ownerJid || instance.phoneNumber || instance.instance?.ownerJid || instance.instance?.phoneNumber || '';
                                        const createdAtRaw = instance.createdAt || instance.instance?.createdAt || '';
                                        
                                        const isConnected = state.toLowerCase() === 'open' || state.toLowerCase() === 'connected' || state.toLowerCase() === 'online';

                                        const formattedDate = createdAtRaw ? new Date(createdAtRaw).toLocaleDateString('es-ES', {
                                            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        }) : 'No disponible';

                                        return (
                                            <tr key={name + idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-slate-800">{name}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                        isConnected ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                    )}>
                                                        {isConnected ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                        {state}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                                        <Clock className="w-4 h-4 text-slate-400" />
                                                        {formattedDate}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                        <Phone className="w-4 h-4 text-slate-400" />
                                                        {phone ? phone.split('@')[0] : 'No vinculado'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="icon"
                                                            title="Ver Estado Real"
                                                            onClick={() => handleAction('connectionState', name)}
                                                            className="w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700 border-none"
                                                            disabled={name === 'Unknown'}
                                                        >
                                                            <Activity className="w-4 h-4" />
                                                        </Button>

                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="icon"
                                                                    title="Enviar Mensaje Prueba"
                                                                    onClick={() => setSelectedInstanceForTest(name)}
                                                                    className="w-8 h-8 rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700 border-none"
                                                                    disabled={name === 'Unknown'}
                                                                >
                                                                    <Send className="w-4 h-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-md rounded-[2rem] p-8">
                                                                <DialogHeader>
                                                                    <DialogTitle className="text-xl font-black flex items-center gap-2">
                                                                        <MessageSquare className="w-5 h-5 text-green-500" />
                                                                        Test Mensajería ({name})
                                                                    </DialogTitle>
                                                                </DialogHeader>
                                                                <div className="space-y-6 pt-4">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-xs font-black uppercase text-slate-400">Teléfono Destino</Label>
                                                                        <Input 
                                                                            placeholder="34600123456" 
                                                                            value={testPhone}
                                                                            onChange={(e) => setTestPhone(e.target.value)}
                                                                            className="h-12 rounded-xl bg-slate-50"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-xs font-black uppercase text-slate-400">Texto del Mensaje</Label>
                                                                        <Input 
                                                                            value={testMessage}
                                                                            onChange={(e) => setTestMessage(e.target.value)}
                                                                            className="h-12 rounded-xl bg-slate-50"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-xs font-black uppercase text-slate-400">URL Imagen (Para Media)</Label>
                                                                        <Input 
                                                                            value={testImage}
                                                                            onChange={(e) => setTestImage(e.target.value)}
                                                                            className="h-12 rounded-xl bg-slate-50"
                                                                        />
                                                                    </div>
                                                                    <div className="flex gap-3 pt-2">
                                                                        <Button 
                                                                            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold h-12"
                                                                            disabled={isSendingTest}
                                                                            onClick={(e) => sendTestMessage(e, 'text')}
                                                                        >
                                                                            Test Texto
                                                                        </Button>
                                                                        <Button 
                                                                            className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 font-bold h-12"
                                                                            disabled={isSendingTest}
                                                                            onClick={(e) => sendTestMessage(e, 'media')}
                                                                        >
                                                                            Test Media (Reserva)
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>

                                                        <Button 
                                                            variant="outline" 
                                                            size="icon"
                                                            title="Eliminar Instancia Definitivamente"
                                                            onClick={() => {
                                                                if(confirm(`¿Eliminar COMPLEMENTE la instancia ${name}? (Esto la borrará de Evolution API)`)) {
                                                                    handleAction('delete', name);
                                                                }
                                                            }}
                                                            className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 border-none"
                                                            disabled={name === 'Unknown'}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                                                No hay instancias conectadas.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="config"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        {/* Settings Panel */}
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-900/5 lg:col-span-1 h-fit">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-blue-600" />
                                Configuración Global API
                            </h3>
                            <form onSubmit={saveSettings} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">URL Base Evolution API</Label>
                                    <Input 
                                        className="h-12 rounded-xl bg-slate-50 border-none font-medium" 
                                        placeholder="http://192.168.1.6:8080"
                                        value={apiUrl}
                                        onChange={(e) => setApiUrl(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Global API Key</Label>
                                    <Input 
                                        type="password"
                                        className="h-12 rounded-xl bg-slate-50 border-none font-medium" 
                                        placeholder="••••••••••••••••"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" disabled={isSavingSettings} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-bold transition-all mt-4">
                                    {isSavingSettings ? 'Guardando...' : 'Guardar Configuración'}
                                </Button>
                            </form>
                        </div>

                        {/* Logs Panel - Made larger by spanning 2 columns and increasing height */}
                        <div className="bg-[#0f111a] p-8 rounded-[2rem] border border-slate-800 shadow-2xl text-slate-300 lg:col-span-2 flex flex-col min-h-[600px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-green-400" />
                                    Visor de Logs del Servidor
                                </h3>
                                <Button onClick={fetchLogs} size="sm" variant="ghost" className="h-10 px-4 hover:bg-slate-800 text-slate-300 rounded-xl font-bold">
                                    <RefreshCw className={cn("w-4 h-4 mr-2", isFetchingLogs && "animate-spin")} />
                                    Actualizar Logs
                                </Button>
                            </div>
                            <div className="flex gap-3 mb-6 bg-slate-900/50 p-2 rounded-xl w-fit">
                                <select 
                                    className="bg-slate-800 border-none rounded-lg text-sm font-bold px-4 py-2 text-white outline-none cursor-pointer"
                                    value={logType}
                                    onChange={(e) => setLogType(e.target.value)}
                                >
                                    <option value="pm2">PM2</option>
                                    <option value="docker">Docker</option>
                                </select>
                                <Input 
                                    className="h-10 rounded-lg bg-slate-800 border-none text-sm font-bold text-white w-64 px-4" 
                                    placeholder="Nombre proceso/contenedor"
                                    value={logName}
                                    onChange={(e) => setLogName(e.target.value)}
                                />
                            </div>
                            <div className="bg-black rounded-2xl p-6 flex-1 overflow-y-auto font-mono text-xs leading-loose break-all border border-slate-800/50 relative shadow-inner">
                                {logs ? (
                                    <pre className="text-green-400/90 whitespace-pre-wrap">{logs}</pre>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-4">
                                        <Terminal className="w-12 h-12 opacity-20" />
                                        <p className="font-medium">Haz clic en actualizar para cargar logs</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
