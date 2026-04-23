import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    console.log('Starting multi-tenant migration...')

    let defaultTenant = await prisma.tenant.findUnique({ where: { alias: 'default' } })
    if (!defaultTenant) {
        defaultTenant = await prisma.tenant.create({
            data: {
                alias: 'default',
                nombre_comercial: 'Default Agenda',
            }
        })
        console.log('Created default tenant (alias: default)')
    } else {
        console.log('Default tenant already exists')
    }

    const tenantId = defaultTenant.id

    const usersRes = await prisma.user.updateMany({ where: { tenantId: null }, data: { tenantId } })
    console.log(`Updated ${usersRes.count} users`)

    const patientsRes = await prisma.patient.updateMany({ where: { tenantId: null }, data: { tenantId } })
    console.log(`Updated ${patientsRes.count} patients`)

    const apptsRes = await prisma.appointment.updateMany({ where: { tenantId: null }, data: { tenantId } })
    console.log(`Updated ${apptsRes.count} appointments`)

    const apptTypesRes = await prisma.appointmentType.updateMany({ where: { tenantId: null }, data: { tenantId } })
    console.log(`Updated ${apptTypesRes.count} appointmentTypes`)

    const settingsRes = await prisma.setting.updateMany({ where: { tenantId: null }, data: { tenantId } })
    console.log(`Updated ${settingsRes.count} settings`)

    const dayConfigsRes = await prisma.dayConfig.updateMany({ where: { tenantId: null }, data: { tenantId } })
    console.log(`Updated ${dayConfigsRes.count} dayConfigs`)

    const profsRes = await prisma.professional.updateMany({ where: { tenantId: null }, data: { tenantId } })
    console.log(`Updated ${profsRes.count} professionals`)

    const superadminEmail = 'superadmin'
    let superadmin = await prisma.user.findFirst({ where: { email: superadminEmail, tenantId: null } })
    if (!superadmin) {
        superadmin = await prisma.user.create({
            data: {
                email: superadminEmail,
                name: 'SuperAdmin',
                password: '1234admin',
                role: 'SUPERADMIN',
                tenantId: null
            }
        })
        console.log('Created superadmin user')
    } else {
        await prisma.user.updateMany({
            where: { email: superadminEmail },
            data: { role: 'SUPERADMIN', tenantId: null, password: '1234admin' }
        })
        console.log('Superadmin user updated')
    }

    console.log('Done.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
