module.exports = {
    apps: [
        {
            name: 'booklysharp-1',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            env: {
                PORT: 3001,
                DATABASE_URL: 'file:./agenda1.db'
            }
        },
        {
            name: 'booklysharp-2',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            env: {
                PORT: 3002,
                DATABASE_URL: 'file:./agenda2.db'
            }
        }
    ]
};
