import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get('type') || 'docker'; // 'docker' or 'pm2'
    const serviceName = searchParams.get('name') || 'evolution-api';
    const lines = searchParams.get('lines') || '100';

    try {
        let command = '';
        if (serviceType === 'docker') {
            command = `docker logs --tail ${lines} ${serviceName}`;
        } else if (serviceType === 'pm2') {
            command = `pm2 logs ${serviceName} --lines ${lines} --nostream`;
        } else {
            return NextResponse.json({ error: 'Invalid service type' }, { status: 400 });
        }

        const { stdout, stderr } = await execPromise(command);
        
        // Return both stdout and stderr as logs might be written to stderr
        return NextResponse.json({ 
            logs: stdout + '\n' + stderr,
            command 
        });
    } catch (error: any) {
        return NextResponse.json({ 
            error: 'Failed to fetch logs', 
            details: error.message || String(error)
        }, { status: 500 });
    }
}
