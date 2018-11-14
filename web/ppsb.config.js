module.exports = {
    apps: [{
        name: 'ppsb',
        script: './app.js',
        exec_mode: 'cluster',
        instances: 0,
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }]
};
