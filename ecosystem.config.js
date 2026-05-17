module.exports = {
  apps: [
    {
      name: 'weeding',
      script: 'npm',
      args: 'start',
      cwd: '/home/ubuntu/weeding',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
