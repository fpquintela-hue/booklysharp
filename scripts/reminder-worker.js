/**
 * Reminder Worker for Booklysharp
 * This script pings the automated reminder engine periodically.
 * Run with PM2: pm2 start scripts/reminder-worker.js --name "bookly-reminders"
 */

const INTERVAL = 10 * 60 * 1000; // 10 minutes (matching your cron preference)
const API_URL = 'http://localhost:3000/api/reminders/process';

console.log(`[${new Date().toISOString()}] Reminder worker started. Mode: AUTO - API: ${API_URL}`);

async function processReminders() {
    console.log(`[${new Date().toISOString()}] Checking for pending reminders...`);
    try {
        const response = await fetch(API_URL);
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
