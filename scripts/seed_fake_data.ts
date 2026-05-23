import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Cargar variables de entorno antes de importar Prisma o usar claves
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- INLINE ENCRYPTION HELPER (Evita fallos de rutas ESM de ts-node) ---
const ACTIVE_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_needs_32_bytes_!';

const getKey = () => {
    return crypto.createHash('sha256').update(String(ACTIVE_KEY)).digest('base64').substring(0, 32);
};

const encrypt = (text: string | null | undefined): string | null => {
    if (text === null || text === undefined) return null;
    if (text === '') return '';
    if (text.startsWith('ENC:')) return text;

    try {
        const iv = crypto.randomBytes(12); // GCM standard
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(getKey()), iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        return `ENC:${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Encryption failed.');
    }
};
// ----------------------------------------------------------------------

async function main() {
    console.log('🚀 Iniciando siembra de datos falsos para capturas de pantalla...');

    const alias = 'clinica-lumina';

    // 1. Asegurar que existe el Tenant ficticio
    let tenant = await prisma.tenant.findUnique({ where: { alias } });
    if (tenant) {
        console.log(`⚠️ Tenant '${alias}' ya existe. Eliminando datos anteriores para reiniciar siembra limpia...`);
        // Eliminar citas, pacientes, profesionales, usuarios y tipos de citas anteriores de este tenant
        await prisma.appointment.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.patient.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.user.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.professional.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.appointmentType.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.tenant.delete({ where: { id: tenant.id } });
    }

    tenant = await prisma.tenant.create({
        data: {
            alias,
            nombre_comercial: 'Clínica Lumina',
            telefono: '981 123 456',
            subscription_plan: 'profesional',
            subscription_status: 'active',
            maxAppointmentTypes: 10,
            maxProfessionals: 5,
            pais: 'España',
            provincia: 'A Coruña',
            ciudad: 'A Coruña',
            calle: 'Rúa Real',
            numero: '42',
            codigo_postal: '15003',
        }
    });
    console.log(`✅ Tenant '${tenant.nombre_comercial}' creado con ID: ${tenant.id}`);

    // 1.5 Crear Usuario Administrador para poder iniciar sesión
    const adminEmail = 'admin@lumina.com';
    const adminPlainPassword = '1234admin';
    const hashedAdminPassword = await bcrypt.hash(adminPlainPassword, 10);

    const adminUser = await prisma.user.create({
        data: {
            email: adminEmail,
            name: 'Administrador',
            apellidos: 'Lumina',
            role: 'ADMIN',
            password: hashedAdminPassword,
            is_verified: true,
            theme: 'light',
            language: 'es',
            tenantId: tenant.id,
        }
    });
    console.log(`👤 Usuario Administrador creado: ${adminEmail} (Contraseña: ${adminPlainPassword})`);

    // 2. Crear Profesionales (Staff) con colores estéticos
    const profData = [
        {
            name: 'Dra. Sofía Alarcón',
            email: 'sofia.alarcon@clinicalumina.com',
            phone: '600111222',
            color: '#10b981', // Emerald
            description: 'Especialista en Medicina Estética y Nutrición',
            isActive: true,
        },
        {
            name: 'Dr. Mateo Espinosa',
            email: 'mateo.espinosa@clinicalumina.com',
            phone: '600222333',
            color: '#6366f1', // Indigo
            description: 'Fisioterapeuta y Osteópata Deportivo',
            isActive: true,
        },
        {
            name: 'Dra. Valentina Ortiz',
            email: 'valentina.ortiz@clinicalumina.com',
            phone: '600333444',
            color: '#ec4899', // Pink
            description: 'Dermatóloga y Cirugía Menor',
            isActive: true,
        }
    ];

    const professionals = [];
    for (const p of profData) {
        const created = await prisma.professional.create({
            data: {
                ...p,
                tenantId: tenant.id,
            }
        });
        professionals.push(created);
    }
    console.log(`✅ ${professionals.length} Profesionales creados.`);

    // 3. Crear Tipos de Citas (Servicios)
    const typeData = [
        { name: 'Consulta Médica General', duration: 30, color: '#3b82f6', price: 50.00, description: 'Consulta inicial de evaluación o seguimiento médico.' },
        { name: 'Fisioterapia Avanzada', duration: 60, color: '#6366f1', price: 70.00, description: 'Sesión individual de rehabilitación u osteopatía.' },
        { name: 'Evaluación Nutricional', duration: 45, color: '#f59e0b', price: 60.00, description: 'Estudio de composición corporal y dieta personalizada.' },
        { name: 'Tratamiento Estético Premium', duration: 90, color: '#ec4899', price: 120.00, description: 'Tratamiento facial o corporal avanzado con aparatología.' }
    ];

    const appointmentTypes = [];
    for (const t of typeData) {
        const created = await prisma.appointmentType.create({
            data: {
                ...t,
                tenantId: tenant.id,
            }
        });
        appointmentTypes.push(created);
    }
    console.log(`✅ ${appointmentTypes.length} Tipos de citas creados.`);

    // 4. Crear Pacientes ficticios (datos encriptados)
    const nombres = ['Alejandro', 'Laura', 'Javier', 'María', 'Carlos', 'Carmen', 'David', 'Ana', 'Manuel', 'Isabel', 'Daniel', 'Cristina', 'José', 'Marta', 'Pablo', 'Paula', 'Diego', 'Lucía', 'Hugo', 'Sara', 'Marcos', 'Alba', 'Álvaro', 'Elena', 'Adrian', 'Irene', 'Rubén', 'Sandra', 'Sergio', 'Raquel', 'Jorge', 'Silvia', 'Ivan', 'Beatriz', 'Raúl', 'Alicia', 'Víctor', 'Patricia', 'Ramón', 'Gloria'];
    const apellidos = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Molina', 'Morales', 'Suárez', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Núñez'];

    const patients = [];
    console.log('🔐 Cifrando y creando pacientes...');
    for (let i = 0; i < nombres.length; i++) {
        const rawName = nombres[i];
        const rawApellidos = apellidos[i];
        const rawPhone = `6${Math.floor(10000000 + Math.random() * 90000000)}`;
        const rawEmail = `${rawName.toLowerCase()}.${rawApellidos.toLowerCase().replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n')}@ejemplo.com`;

        const created = await prisma.patient.create({
            data: {
                name: encrypt(rawName) || '',
                apellidos: encrypt(rawApellidos) || '',
                phone: encrypt(rawPhone) || '',
                email: encrypt(rawEmail),
                notes: encrypt('Historial de ejemplo para visualización en capturas de pantalla.'),
                treatmentPlan: 'Plan de tratamiento estético y de salud integral',
                tenantId: tenant.id,
            }
        });
        patients.push(created);
    }
    console.log(`✅ ${patients.length} Pacientes encriptados y guardados en la BD.`);

    // 5. Generar historial pasado (Últimos 12 meses para poblar estadísticas)
    console.log('📈 Generando historial pasado (400+ citas) para estadísticas...');
    const now = new Date();
    const appointmentsToCreate = [];

    // Generar citas para los últimos 12 meses (de Mayo 2025 a Mayo 2026)
    for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
        const targetMonthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
        
        const baseVolume = 25 + Math.floor((11 - monthOffset) * 2.2);
        const randomBonus = Math.floor(Math.random() * 8) - 4;
        const monthlyAppointmentsCount = baseVolume + randomBonus;

        for (let j = 0; j < monthlyAppointmentsCount; j++) {
            const day = 1 + Math.floor(Math.random() * 28);
            const hour = 9 + Math.floor(Math.random() * 11); // 9:00 a 19:00
            const minute = Math.random() > 0.5 ? 0 : 30;

            const start = new Date(targetMonthDate.getFullYear(), targetMonthDate.getMonth(), day, hour, minute);
            if (start >= now) continue;

            const type = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
            const end = new Date(start.getTime() + type.duration * 60 * 1000);

            const professional = professionals[Math.floor(Math.random() * professionals.length)];
            const patient = patients[Math.floor(Math.random() * patients.length)];

            const rand = Math.random();
            let status = 'COMPLETED';
            if (rand > 0.85 && rand <= 0.95) {
                status = 'NO_SHOW';
            } else if (rand > 0.95) {
                status = 'CANCELLED';
            }

            appointmentsToCreate.push({
                start,
                end,
                type: type.id,
                status,
                notes: encrypt(`Revisión regular completada. Todo correcto en estado ${status}.`),
                patientId: patient.id,
                professionalId: professional.id,
                tenantId: tenant.id
            });
        }
    }

    // 6. Generar reservas para la SEMANA QUE VIENE (de lunes a domingo)
    console.log('📅 Generando reservas programadas para la semana que viene...');
    
    const startOfWeek = new Date(2026, 4, 25, 0, 0, 0); // 2026-05-25 (Lunes)
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDay = new Date(startOfWeek.getTime() + dayOffset * 24 * 60 * 60 * 1000);
        
        const isWeekend = dayOffset === 5 || dayOffset === 6;
        const dailyCount = isWeekend ? (dayOffset === 5 ? 4 : 0) : (6 + Math.floor(Math.random() * 4));

        if (dailyCount === 0) continue;

        const hours = [9, 10, 11, 12, 13, 16, 17, 18, 19];
        const shuffledHours = hours.sort(() => 0.5 - Math.random()).slice(0, dailyCount);

        for (const hour of shuffledHours) {
            const minute = Math.random() > 0.5 ? 0 : 30;
            const start = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), hour, minute);
            
            const type = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
            const end = new Date(start.getTime() + type.duration * 60 * 1000);

            const professional = professionals[Math.floor(Math.random() * professionals.length)];
            const patient = patients[Math.floor(Math.random() * patients.length)];

            appointmentsToCreate.push({
                start,
                end,
                type: type.id,
                status: 'SCHEDULED',
                notes: encrypt('Cita reservada. Paciente confirmado telefónicamente.'),
                patientId: patient.id,
                professionalId: professional.id,
                tenantId: tenant.id
            });
        }
    }

    console.log(`💾 Guardando ${appointmentsToCreate.length} citas en la base de datos...`);
    
    await prisma.appointment.createMany({
        data: appointmentsToCreate
    });

    console.log('✨ Siembra de datos completada con éxito.');
    console.log(`
📊 RESUMEN GENERADO:
---------------------------------------------
🏥 Tenant Ficticio:  ${tenant.nombre_comercial} (Alias: /${alias})
🔑 Login de Acceso:   Email: ${adminEmail} | Contraseña: ${adminPlainPassword}
👥 Staff Creado:     3 Profesionales (${professionals.map(p => p.name).join(', ')})
🛠️ Servicios:       4 Tipos de citas creadas (${appointmentTypes.map(t => t.name).join(', ')})
👤 Pacientes:        ${patients.length} pacientes ficticios cifrados
📅 Total Citas:      ${appointmentsToCreate.length} citas sembradas (Histórico y Semana que viene)
---------------------------------------------

¡Perfecto para tomar capturas de pantalla de tu Dashboard de Estadísticas y Calendario!
`);
}

main()
    .catch((e) => {
        console.error('❌ Error durante la siembra:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
