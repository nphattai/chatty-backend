module.exports = {
  apps: [
    {
      name: 'funny-social-app',
      script: './build/src/app.js',
      instances: 'max',
      exec_mode: 'cluster'
    }
  ]
};
