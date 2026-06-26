// DATABASE_URL NO se define aquí: Next.js carga el .env del proyecto
// (PostgreSQL). Definirla en PM2 machacaría la del .env — fue el origen
// de que las instancias apuntaran a SQLite locales distintas.
module.exports = {
    apps: [
        {
            name: 'booklysharp-1',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            env: {
                PORT: 3000
            }
        },
        {
            name: 'booklysharp-2',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            env: {
                PORT: 3001
            }
        },
        {
            name: 'bookly-reminders',
            script: 'scripts/reminder-worker.js',
            env: {
                REMINDER_API_URL: 'http://localhost:3000/api/reminders/process'
            }
        }
    ]
};
