'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, ArrowRight, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTranslation } from '@/hooks/useTranslation';
import { apiFetch } from '@/lib/mock-service';
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog';

export function SubscriptionSettingsPanel() {
    const { user, updateUser } = useAuth();
    const { t } = useTranslation();

    // In a real scenario, this data would come from the user's tenant object or an API call.
    // For now we map it directly from user's tenant information.
    const planName = user?.tenantPlan || 'Trial';
    const status = user?.tenantSubscriptionStatus || 'trial'; // active, expired, trial
    
    // Resolve Expiration Date
    let resolvedExpiresAt = user?.tenantExpiresAt ? new Date(user.tenantExpiresAt) : null;
    if (!resolvedExpiresAt && user?.tenantCreatedAt) {
        const createdAt = new Date(user.tenantCreatedAt);
        resolvedExpiresAt = new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 days default
    }

    // Parse billing info if available
    let initialBilling = { name: '', cif: '', address: '' };
    try {
        if (user?.tenantBillingInfo) initialBilling = JSON.parse(user.tenantBillingInfo);
    } catch(e) {}

    // Parse payment method if available
    let defaultPaymentMethod = { last4: '4242', exp: '12/28' };
    try {
        if (user?.tenantPaymentMethods) {
            const parsedPMs = JSON.parse(user.tenantPaymentMethods);
            if (Array.isArray(parsedPMs) && parsedPMs.length > 0) defaultPaymentMethod = parsedPMs[0];
        }
    } catch(e) {}

    // UI states
    const [autoRenew, setAutoRenew] = useState(user?.tenantAutoRenew ?? true);
    const [billingInfo, setBillingInfo] = useState(initialBilling);
    const [isSaving, setIsSaving] = useState(false);
    const [isTogglingRenew, setIsTogglingRenew] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const isExpired = status === 'expired' || (resolvedExpiresAt && new Date() > resolvedExpiresAt);

    const handleSaveBilling = async () => {
        setIsSaving(true);
        try {
            const body = { billing_info: JSON.stringify(billingInfo) };
            await apiFetch('tenant/me', {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }
            });
            updateUser({ tenantBillingInfo: body.billing_info });
        } catch (e) {
            console.error('Error saving billing info', e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleAutoRenew = async (newVal: boolean) => {
        setIsTogglingRenew(true);
        try {
            await apiFetch('tenant/me', {
                method: 'PUT',
                body: JSON.stringify({ auto_renew: newVal }),
                headers: { 'Content-Type': 'application/json' }
            });
            setAutoRenew(newVal);
            updateUser({ tenantAutoRenew: newVal });
        } catch (e) {
            console.error('Error toggling auto renew', e);
        } finally {
            setIsTogglingRenew(false);
        }
    };
    
    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
            <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                    Suscripción y Pagos
                </h3>
                <p className="text-slate-500 font-medium">
                    Gestiona tu plan activo, métodos de pago y datos de facturación.
                </p>
            </div>

            {/* ERROR / EXPIRED BANNER */}
            {isExpired && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
                    <div>
                        <h4 className="text-red-800 dark:text-red-200 font-bold mb-1">
                            Tu {status === 'trial' ? 'periodo de prueba' : 'suscripción'} ha finalizado
                        </h4>
                        <p className="text-sm text-red-600 dark:text-red-300">
                            Has perdido acceso a las herramientas operativas y la reserva de citas online está desactivada. Por favor, selecciona o renueva tu plan para continuar operando.
                        </p>
                    </div>
                </div>
            )}

            {/* STATUS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                            Plan Actual
                        </p>
                        <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                            {planName}
                        </h4>
                        <div className="flex flex-col gap-2 mb-6">
                            <div className="flex items-center gap-2 text-sm">
                                {isExpired ? (
                                    <span className="flex items-center gap-1.5 text-red-600 font-bold bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
                                        <XCircle className="w-4 h-4" /> Expirado
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-green-600 font-bold bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">
                                        <CheckCircle2 className="w-4 h-4" /> Activo
                                    </span>
                                )}
                            </div>
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Su suscripción {planName} {isExpired ? 'finalizó el' : (autoRenew ? 'se renovará el' : 'finaliza el')} {resolvedExpiresAt ? resolvedExpiresAt.toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                    <div>
                        {isExpired || !autoRenew ? (
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleToggleAutoRenew(true)} 
                                    disabled={isTogglingRenew}
                                    className="w-full py-2.5 bg-[#004ac6] hover:bg-[#003899] disabled:bg-slate-400 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
                                    {isTogglingRenew && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isExpired ? 'Seleccionar Plan' : 'Renovar Suscripción'}
                                </button>
                                {!isExpired && !autoRenew && (
                                     <p className="text-xs text-center text-slate-400">
                                        Tu suscripción se cancelará al finalizar el periodo actual.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <button 
                                    disabled={isTogglingRenew}
                                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-50 font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
                                    onClick={() => setIsCancelDialogOpen(true)}>
                                    {isTogglingRenew && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Anular Suscripción
                                </button>
                                <p className="text-xs text-center text-slate-400">
                                    Si anulas, mantendrás el acceso hasta el final del periodo.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* PAYMENT METHODS */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                        Método de Pago
                    </h4>
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
                        <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded-md flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                •••• •••• •••• {defaultPaymentMethod.last4}
                            </p>
                            <p className="text-xs text-slate-500">Expira {defaultPaymentMethod.exp}</p>
                        </div>
                    </div>
                    <button className="text-sm font-bold text-[#004ac6] hover:underline flex items-center gap-1">
                        Añadir método de pago <ArrowRight className="w-4 h-4 mt-0.5" />
                    </button>
                    <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                        Pagos procesados de forma segura por Stripe. No almacenamos datos de tarjeta en nuestros servidores.
                    </p>
                </div>
            </div>

            {/* BILLING FORM (Placeholder view) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">
                    Datos de Facturación
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nombre / Razón Social</label>
                        <input
                            type="text"
                            value={billingInfo.name}
                            onChange={(e) => setBillingInfo({...billingInfo, name: e.target.value})}
                            placeholder="*** S.L."
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004ac6] text-slate-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">CIF / NIF</label>
                        <input
                            type="text"
                            value={billingInfo.cif}
                            onChange={(e) => setBillingInfo({...billingInfo, cif: e.target.value})}
                            placeholder="***45678"
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004ac6] text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Dirección Fiscal</label>
                        <input
                            type="text"
                            value={billingInfo.address}
                            onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                            placeholder="Calle Principal ***, *** Madrid"
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#004ac6] text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleSaveBilling}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 dark:bg-white dark:hover:bg-slate-100 dark:disabled:bg-slate-500 dark:text-slate-900 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                        {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Guardar Datos Fiscales
                    </button>
                </div>
            </div>

            {/* PLAN SELECTOR (Placeholder view) */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-6 text-center">
                    Mejora tu Plan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Gratuito', 'Individual', 'Profesional'].map(plan => (
                        <div key={plan} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col">
                            <h5 className="font-black text-lg mb-2 text-slate-900 dark:text-white">{plan}</h5>
                            <p className="text-2xl font-bold text-[#004ac6] mb-4">
                                {plan === 'Gratuito' ? '0€' : plan === 'Individual' ? '29€/mes' : '59€/mes'}
                            </p>
                            <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2 mb-6 flex-1">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#004ac6] flex-shrink-0" /> Funciones básicas
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#004ac6] flex-shrink-0" /> Soporte por email
                                </li>
                                {plan !== 'Gratuito' && (
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#004ac6] flex-shrink-0" /> Informes avanzados
                                    </li>
                                )}
                            </ul>
                            <button className={`w-full py-2 font-bold rounded-lg border ${
                                planName === plan 
                                ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed dark:bg-slate-800 dark:text-slate-500' 
                                : 'bg-transparent text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-[#004ac6]'} transition-colors`
                            } disabled={planName === plan}>
                                {planName === plan ? 'Plan Actual' : 'Cambiar Plan'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <CancelSubscriptionDialog 
                open={isCancelDialogOpen}
                onOpenChange={setIsCancelDialogOpen}
                onConfirm={() => {
                    setIsCancelDialogOpen(false);
                    handleToggleAutoRenew(false);
                }}
            />
        </div>
    );
}
