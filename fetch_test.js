require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const settings = await prisma.setting.findMany({
        where: { tenantId: null, key: { in: ['GLOBAL_EVOLUTION_API_URL', 'GLOBAL_EVOLUTION_API_KEY'] } }
    });
    const config = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    const url = config.GLOBAL_EVOLUTION_API_URL || process.env.EVOLUTION_API_URL || 'http://192.168.1.6:8080';
    const key = config.GLOBAL_EVOLUTION_API_KEY || process.env.EVOLUTION_API_KEY;

    console.log('URL:', url, 'Key:', key ? '***' : 'missing');
    
    if (url && key) {
        try {
            const response = await fetch(`${url}/instance/fetchInstances`, {
                headers: { 'apikey': key }
            });
            const data = await response.json();
            console.log('Instances:', JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('Fetch error:', e);
        }
    }
}
run().catch(console.error).finally(() => prisma.$disconnect());
