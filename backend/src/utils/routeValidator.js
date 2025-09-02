// /backend/utils/routeValidator.js
export const validateRoutes = (app) => {
  console.log('🔄 Validando rotas do backend...');
  
  const routes = [
    { method: 'POST', path: '/api/payment/create-preference' },
    { method: 'POST', path: '/api/payment/webhook' },
    { method: 'GET', path: '/api/payment/status/:orderId' },
    { method: 'GET', path: '/api/products' },
    { method: 'GET', path: '/api/users' }
  ];

  routes.forEach(route => {
    const found = app._router.stack
      .filter(layer => layer.route)
      .some(layer => {
        const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase());
        return methods.includes(route.method) && layer.route.path === route.path;
      });

    console.log(
      found ? '✅' : '❌',
      `${route.method} ${route.path}`,
      found ? '' : '(NÃO ENCONTRADA)'
    );
  });
};

// Validador de variáveis de ambiente
export const validateEnv = () => {
  console.log('🔍 Validando variáveis de ambiente...');
  
  const requiredEnvVars = [
    'MERCADOPAGO_ACCESS_TOKEN',
    'CLIENT_URL',
    'BACKEND_URL',
    'MONGODB_URI'
  ];

  requiredEnvVars.forEach(envVar => {
    const exists = process.env[envVar] !== undefined;
    console.log(
      exists ? '✅' : '❌',
      `${envVar}:`,
      exists ? 'Definida' : 'NÃO DEFINIDA'
    );
  });
};