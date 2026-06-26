/**
 * Reminder Worker for Booklysharp
 * This script pings the automated reminder engine periodically.
 * Run with PM2: pm2 start scripts/reminder-worker.js --name "bookly-reminders"
 */

// Cargar .env si se ejecuta fuera de PM2 (dotenv está en node_modules)
try { require('dotenv').config(); } catch (e) { /* opcional */ }

const INTERVAL = 10 * 60 * 1000; // 10 minutes (matching your cron preference)
const API_URL = process.env.REMINDER_API_URL || 'http://localhost:3000/api/reminders/process';
const CRON_SECRET = process.env.CRON_SECRET;

if (!CRON_SECRET) {
    console.error('FATAL: CRON_SECRET no está definido. El motor de recordatorios lo exige. Añádelo al .env');
    process.exit(1);
}

console.log(`[${new Date().toISOString()}] Reminder worker started. Mode: AUTO - API: ${API_URL}`);

async function processReminders() {
    console.log(`[${new Date().toISOString()}] Checking for pending reminders...`);
    try {
        const response = await fetch(API_URL, {
            headers: { 'x-cron-secret': CRON_SECRET }
        });
        const data = await response.json();

        if (data.success) {
            console.log(`[${new Date().toISOString()}] Summary:`);
            console.log(` - Processed: ${data.processed}`);
            console.log(` - Sent (WhatsApp): ${data.sent_whatsapp}`);
            console.log(` - Sent (Email): ${data.sent_email}`);
            console.log(` - Failed: ${data.failed}`);
            console.log(` - Skipped (for future): ${data.skipped}`);
        } else {
            console.error(`[${new Date().toISOString()}] Engine error:`, data.error);
        }
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Connection error: ${error.message} (Verify port 3000 is open)`);
    }
}

// Immediate first run
processReminders();

// Set interval for continuous run
setInterval(processReminders, INTERVAL);
