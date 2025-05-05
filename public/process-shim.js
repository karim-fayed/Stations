// توفير متغير process في المتصفح
window.process = window.process || {
  env: {
    NODE_ENV: 'development'
  }
};
