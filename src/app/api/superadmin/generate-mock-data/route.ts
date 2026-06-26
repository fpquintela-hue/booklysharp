import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const firstNames = ['Carlos', 'María', 'José', 'Ana', 'Luis', 'Laura', 'Javier', 'Carmen', 'David', 'Marta', 'Sergio', 'Lucía', 'Jorge', 'Paula', 'Diego', 'Fernando', 'Elena'];
const lastNames = ['García', 'Martínez', 'López', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Álvarez', 'Romero'];

const professionalData = [
  { name: 'Álex Tijeras', color: '#3b82f6' },
  { name: 'Sonia Estilos', color: '#ec4899' },
  { name: 'Dani Barbero', color: '#10b981' },
  { name: 'Cris Color', color: '#8b5cf6' },
  { name: 'Javi Navaja', color: '#f59e0b' }
];

const serviceData = [
  { name: 'Corte Clásico', duration: 30, price: 15.0, color: '#3b82f6', description: 'Corte de pelo tradicional a tijera o máquina.' },
  { name: 'Corte y Lavado', duration: 45, price: 20.0, color: '#10b981', description: 'Incluye lavado relajante y corte de pelo.' },
  { name: 'Arreglo de Barba', duration: 30, price: 12.0, color: '#f59e0b', description: 'Perfilado y arreglo de barba con navaja.' },
  { name: 'Corte Premium + Barba', duration: 60, price: 28.0, color: '#8b5cf6', description: 'Servicio completo de corte de pelo y arreglo de barba con toalla caliente.' },
  { name: 'Tinte Capilar', duration: 60, price: 35.0, color: '#ef4444', description: 'Coloración capilar con productos de primera.' },
  { name: 'Corte Niño', duration: 30, price: 12.0, color: '#ec4899', description: 'Corte especial para menores de 12 años.' }
];

const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const generatePhone = () => `6${Math.floor(Math.random() * 900000000 + 10000000)}`;

export async function POST(req: Request) {
  try {
    const { tenantId } = await req.json();

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID es requerido' }, { status: 400 });
    }

    // Check if tenant exists
    const tenant = await (prisma as any).tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant no encontrado' }, { status: 404 });
    }

    // 1. Create Professionals respecting maxProfessionals
    let existingProfessionals = await (prisma as any).professional.findMany({ where: { tenantId } });
    const professionalsToCreate = Math.min(getRandomInt(3, 5), Math.max(0, tenant.maxProfessionals - existingProfessionals.length));
    
    let createdProfCount = 0;
    for (let i = 0; i < professionalsToCreate; i++) {
      const p = professionalData[i % professionalData.length];
      const prof = await (prisma as any).professional.create({
        data: {
          name: p.name,
          color: p.color,
          tenantId: tenantId,
          isActive: true
        }
      });
      existingProfessionals.push(prof);
      createdProfCount++;
    }

    if (existingProfessionals.length === 0) {
      return NextResponse.json({ error: 'El negocio no tiene límite para crear profesionales. No se pueden generar citas.' }, { status: 400 });
    }

    // 2. Create Appointment Types respecting maxAppointmentTypes
    let existingServices = await (prisma as any).appointmentType.findMany({ where: { tenantId } });
    const servicesToCreate = Math.min(getRandomInt(4, 6), Math.max(0, tenant.maxAppointmentTypes - existingServices.length));
    
    let createdServCount = 0;
    for (let i = 0; i < servicesToCreate; i++) {
      const s = serviceData[i % serviceData.length];
      const existing = existingServices.find((e: any) => e.name === s.name);
      
      if (!existing) {
        const serv = await (prisma as any).appointmentType.create({
          data: {
            name: s.name,
            duration: s.duration,
            price: s.price,
            color: s.color,
            description: s.description,
            tenantId: tenantId
          }
        });
        existingServices.push(serv);
        createdServCount++;
      }
    }

    if (existingServices.length === 0) {
      return NextResponse.json({ error: 'El negocio no tiene límite para crear servicios. No se pueden generar citas.' }, { status: 400 });
    }

    // 3. Create Patients (Clients)
    const createdPatients = [];
    for (let i = 0; i < getRandomInt(15, 25); i++) {
      const name = getRandomElement(firstNames);
      const apellidos = `${getRandomElement(lastNames)} ${getRandomElement(lastNames)}`;
      const patient = await (prisma as any).patient.create({
        data: {
          name,
          apellidos,
          phone: generatePhone(),
          email: `${name.toLowerCase()}.${apellidos.split(' ')[0].toLowerCase()}@example.com`,
          tenantId: tenantId
        }
      });
      createdPatients.push(patient);
    }

    // 4. Create Appointments
    // We'll generate appointments for the last 15 days and next 15 days.
    const now = new Date();
    const daysToGenerate = 30;
    
    // We get gridStep from settings or default to 30
    const settingGrid = await (prisma as any).setting.findFirst({
        where: { tenantId, key: 'gridStep' }
    });
    const gridStep = settingGrid ? parseInt(settingGrid.value) : 30;

    let appointmentsCount = 0;
    for (let i = -15; i <= 15; i++) {
      // Generate 2-5 appointments per day
      const dailyAppointments = getRandomInt(2, 5);
      
      for (let j = 0; j < dailyAppointments; j++) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + i);
        
        // Random hour between 9 and 19
        const hour = getRandomInt(9, 19);
        // Random minute based on gridStep
        const minuteOptions = gridStep === 60 ? [0] : [0, 30];
        const minute = getRandomElement(minuteOptions);
        
        targetDate.setHours(hour, minute, 0, 0);

        const service = getRandomElement(existingServices);
        const professional = getRandomElement(existingProfessionals);
        const patient = getRandomElement(createdPatients);

        const endTargetDate = new Date(targetDate.getTime() + service.duration * 60000);

        // Simple collision check
        const conflict = await (prisma as any).appointment.findFirst({
            where: {
                tenantId,
                professionalId: professional.id,
                OR: [
                    { start: { lt: endTargetDate }, end: { gt: targetDate } }
                ]
            }
        });

        if (!conflict) {
            // Check if status should be completed (past) or scheduled (future)
            const status = targetDate < now ? 'COMPLETED' : 'SCHEDULED';
            
            await (prisma as any).appointment.create({
                data: {
                    start: targetDate,
                    end: endTargetDate,
                    type: service.name,
                    status: status,
                    tenantId: tenantId,
                    professionalId: professional.id,
                    patientId: patient.id
                }
            });
            appointmentsCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Datos generados correctamente. ${createdProfCount} profesionales, ${createdServCount} servicios, ${createdPatients.length} clientes, y ${appointmentsCount} citas creadas.`
    });

  } catch (error: any) {
    console.error('Error generating mock data:', error);
    return NextResponse.json({
      error: 'Error al generar los datos simulados',
      details: error.message || String(error)
    }, { status: 500 });
  }
}
