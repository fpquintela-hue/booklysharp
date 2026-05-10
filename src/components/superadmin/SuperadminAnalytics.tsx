'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, AreaChart, Area, BarChart, Bar, 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { Calendar, Users, Briefcase, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SuperadminAnalytics = ({ tenants }: { tenants: any[] }) => {
    const [dateRange, setDateRange] = useState('6m');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [kpis, setKpis] = useState<any>({
        totalTenants: 0, newTenantsTrend: 0, currentMRR: 0, appointmentsThisMonth: 0, appointmentsTrend: 0, churnRate: 0
    });

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        fetch(`/api/superadmin/analytics?range=${dateRange}`)
            .then(res => res.json())
            .then(resData => {
                if(isMounted) {
                    if (resData.chartData) setData(resData.chartData);
                    if (resData.kpis) setKpis(resData.kpis);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error(err);
                if(isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, [dateRange]);

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header y Filtros */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tight font-headline text-[#191b23]">Health Analytics</h2>
                    <p className="text-[#434655] font-medium mt-1">Monitorización global de adopción, ingresos y retención.</p>
                </div>
                <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {['7d', '30d', '3m', '6m', '1y'].map(range => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={cn(
                                "px-4 py-2 text-xs font-bold transition-colors uppercase tracking-widest",
                                dateRange === range 
                                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" 
                                    : "text-slate-500 hover:bg-slate-50"
                            )}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard 
                    title="Total Negocios" 
                    value={loading ? "..." : kpis.totalTenants} 
                    trend={loading ? "..." : `${kpis.newTenantsTrend > 0 ? '+' : ''}${kpis.newTenantsTrend} este mes`} 
                    icon={<Briefcase />} 
                    positive={kpis.newTenantsTrend >= 0} 
                />
                <KPICard 
                    title="MRR (Ingresos Recurrentes)" 
                    value={loading ? "..." : `$${kpis.currentMRR}`} 
                    trend={loading ? "..." : "Suscripciones Activas"} 
                    icon={<DollarSign />} 
                    positive={true} 
                />
                <KPICard 
                    title="Citas Totales (Mes)" 
                    value={loading ? "..." : kpis.appointmentsThisMonth.toLocaleString()} 
                    trend={loading ? "..." : `${kpis.appointmentsTrend > 0 ? '+' : ''}${kpis.appointmentsTrend} vs anterior`} 
                    icon={<Calendar />} 
                    positive={kpis.appointmentsTrend >= 0} 
                />
                <KPICard 
                    title="Churn Rate" 
                    value={loading ? "..." : `${kpis.churnRate}%`} 
                    trend={loading ? "..." : "Cancelaciones recientes"} 
                    icon={<Users />} 
                    positive={kpis.churnRate < 5} 
                />
            </div>

            {/* Gráficas Principales */}
            <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6 transition-opacity duration-300", loading ? "opacity-50" : "opacity-100")}>
                
                {/* 1. Evolución de Negocios */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Evolución de Negocios</h3>
                        <p className="text-xs text-slate-400 font-medium">Comparativa de nuevas altas vs el total activo.</p>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600', marginTop: '10px' }} />
                                <Line yAxisId="left" type="monotone" name="Nuevas Altas" dataKey="altas" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" name="Total Activos" dataKey="totalTenants" stroke="#0ea5e9" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Evolución de Ingresos */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Crecimiento de MRR</h3>
                        <p className="text-xs text-slate-400 font-medium">Ingresos recurrentes mensuales generados.</p>
                    </div>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val}`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value: any) => [`$${value}`, 'MRR']}
                                />
                                <Area type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMrr)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Uso del Sistema (Citas Totales) */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col lg:col-span-2">
                    <div className="mb-6 flex justify-between items-end">
                        <div>
                            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" /> Citas Totales en el Ecosistema
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">North Star Metric: Mide el uso real del SaaS por los clientes finales.</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="citas" name="Citas Procesadas" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};

const KPICard = ({ title, value, trend, icon, positive }: any) => (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 group hover:shadow-md transition-shadow cursor-default">
        <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
            positive ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" : "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white"
        )}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
            <p className={cn("text-[10px] font-bold mt-2", positive ? "text-green-500" : "text-red-500")}>
                {trend}
            </p>
        </div>
    </div>
);
