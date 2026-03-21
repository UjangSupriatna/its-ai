module.exports = {
  apps: [{
    name: 'its-ai',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/home/username/its-ai', // Ganti dengan path Anda
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
