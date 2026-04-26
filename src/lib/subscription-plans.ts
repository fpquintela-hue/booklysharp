/**
 * subscription-plans.ts
 * ─────────────────────────────────────────────────────────────
 * FUENTE DE VERDAD ÚNICA para los planes de suscripción de BooklySharp.
 *
 * CÓMO AÑADIR UNA CARACTERÍSTICA NUEVA:
 *  1. Añade el campo a la interfaz `SubscriptionPlan`.
 *  2. Rellena el valor en cada plan dentro de `SUBSCRIPTION_PLANS`.
 *  3. Los componentes que consumen este fichero se actualizarán automáticamente.
 *
 * CÓMO AÑADIR UN PLAN NUEVO:
 *  1. Añade un nuevo valor al enum `PlanId`.
 *  2. Añade el objeto al array `SUBSCRIPTION_PLANS`.
 * ─────────────────────────────────────────────────────────────
 */

// ── 1. Identificadores canónicos de plan ─────────────────────────────────────
export type PlanId = 'gratis' | 'individual' | 'profesional';

// ── 2. Interfaz completa de un plan ──────────────────────────────────────────
export interface SubscriptionPlan {
  /** Identificador único interno (usado en BD y lógica de negocio) */
  id: PlanId;

  /** Nombre visible al usuario */
  name: string;

  /** Descripción corta para tarjetas de marketing */
  description: string;

  // ── Precios ────────────────────────────────────────────────────────────────
  /** Precio mensual en euros (número puro, sin símbolo) */
  monthlyPrice: number;

  /** Precio anual en euros (número puro). null = no disponible aún */
  yearlyPrice: number | null;

  /** Descuento anual en porcentaje (p.ej. 20 = 20 %). 0 si no aplica */
  yearlyDiscountPercent: number;

  // ── Límites operativos ─────────────────────────────────────────────────────
  /** Número máximo de profesionales/calendarios. null = ilimitado */
  maxProfessionals: number | null;

  /** Número máximo de tipos de cita distintos. null = ilimitado */
  maxAppointmentTypes: number | null;

  /** Meses de historial de citas que se conservan. null = ilimitado */
  historyMonths: number | null;

  // ── Funcionalidades (feature flags) ───────────────────────────────────────
  /** Integración y recordatorios automáticos por WhatsApp */
  whatsappReminders: boolean;

  /** Cobro anticipado de citas vía Stripe */
  stripePayments: boolean;

  /** Sincronización bidireccional con Google Calendar / Apple Calendar */
  calendarSync: boolean;

  /** Informes y estadísticas avanzadas del negocio */
  advancedStats: boolean;

  /** Gestión de roles y permisos para el equipo */
  rolesAndPermissions: boolean;

  /** Exportación de datos (CSV, PDF) */
  dataExport: boolean;

  /** Asistente de IA integrado en el panel */
  aiAssistant: boolean;

  // ── Soporte ────────────────────────────────────────────────────────────────
  /** Nivel de soporte: 'email' | 'priority' | 'dedicated' */
  supportLevel: 'email' | 'priority' | 'dedicated';

  // ── UI / Marketing ────────────────────────────────────────────────────────
  /** Lista de características formateadas para mostrar en tarjetas de precios */
  features: string[];

  /** Marcar como el plan más popular en la UI */
  highlighted: boolean;

  /** Etiqueta badge opcional encima de la tarjeta (p.ej. "Más popular") */
  badgeLabel?: string;

  /** Periodo de prueba gratuita en días (0 = sin trial) */
  trialDays: number;

  /** Número máximo de recordatorios configurables. 0 = no disponible */
  maxReminders: number;
}

// ── 3. Definición de los planes ───────────────────────────────────────────────
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'gratis',
    name: 'Gratis',
    description: 'Para probar y empezar a digitalizarte sin coste.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    yearlyDiscountPercent: 0,
    maxProfessionals: 1,
    maxAppointmentTypes: 2,
    historyMonths: 1,
    whatsappReminders: false,
    stripePayments: false,
    calendarSync: false,
    advancedStats: false,
    rolesAndPermissions: false,
    dataExport: false,
    aiAssistant: false,
    supportLevel: 'email',
    features: [
      '1 profesional / calendario',
      '2 tipos de cita',
      '1 mes de historial',
      'Link de reserva básico',
      'Soporte por email',
    ],
    highlighted: false,
    trialDays: 14,
    maxReminders: 0,
  },
  {
    id: 'individual',
    name: 'Plan Individual',
    description: 'Ideal para autónomos que quieren automatizar su agenda.',
    monthlyPrice: 12.70,
    yearlyPrice: 121.92,        // 12.70 × 12 × 0.80 → 20 % descuento
    yearlyDiscountPercent: 20,
    maxProfessionals: 1,
    maxAppointmentTypes: null,  // ilimitado
    historyMonths: null,        // ilimitado
    whatsappReminders: true,
    stripePayments: true,
    calendarSync: true,
    advancedStats: false,
    rolesAndPermissions: false,
    dataExport: true,
    aiAssistant: false,
    supportLevel: 'email',
    features: [
      '1 profesional / calendario',
      'Tipos de cita ilimitados',
      'Historial ilimitado',
      '1 recordatorio automático (WhatsApp/Email)',
      'Cobros anticipados (Stripe)',
      'Sync Google / Apple Calendar',
      'Exportación de datos',
      'Soporte por email',
    ],
    highlighted: true,
    badgeLabel: 'Más popular',
    trialDays: 14,
    maxReminders: 1,
  },
  {
    id: 'profesional',
    name: 'Plan Profesional',
    description: 'Para centros con varios profesionales y funciones avanzadas.',
    monthlyPrice: 29.00,
    yearlyPrice: 278.40,        // 29 × 12 × 0.80 → 20 % descuento
    yearlyDiscountPercent: 20,
    maxProfessionals: null,     // ilimitado
    maxAppointmentTypes: null,  // ilimitado
    historyMonths: null,        // ilimitado
    whatsappReminders: true,
    stripePayments: true,
    calendarSync: true,
    advancedStats: true,
    rolesAndPermissions: true,
    dataExport: true,
    aiAssistant: true,
    supportLevel: 'priority',
    features: [
      'Todo lo del Plan Individual',
      'Profesionales ilimitados',
      'Hasta 3 recordatorios automáticos',
      'Roles y permisos de equipo',
      'Estadísticas avanzadas',
      'Asistente IA integrado',
      'Soporte prioritario',
    ],
    highlighted: false,
    trialDays: 14,
    maxReminders: 3,
  },
];

// ── 4. Helpers de acceso rápido ───────────────────────────────────────────────

/** Devuelve un plan por su id canónico. Lanza si no existe. */
export function getPlanById(id: PlanId): SubscriptionPlan {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Plan desconocido: "${id}"`);
  return plan;
}

/**
 * Normaliza cualquier nombre de plan legacy (como los guardados en la BD)
 * al `PlanId` canónico.
 *
 * @example  normalizePlanId('Plan Individual') → 'individual'
 */
export function normalizePlanId(raw: string | undefined | null): PlanId {
  if (!raw) return 'gratis';
  const lower = raw.toLowerCase().trim();
  if (lower.includes('profesional') || lower.includes('professional')) return 'profesional';
  if (lower.includes('individual')) return 'individual';
  return 'gratis';
}

/** Formatea el precio mensual para mostrar en UI: "12,70 €/mes" */
export function formatMonthlyPrice(plan: SubscriptionPlan): string {
  if (plan.monthlyPrice === 0) return 'Gratis';
  return `${plan.monthlyPrice.toFixed(2).replace('.', ',')} €/mes`;
}

/** Formatea el precio anual para mostrar en UI: "121,92 €/año" */
export function formatYearlyPrice(plan: SubscriptionPlan): string {
  if (!plan.yearlyPrice || plan.yearlyPrice === 0) return 'Gratis';
  return `${plan.yearlyPrice.toFixed(2).replace('.', ',')} €/año`;
}
