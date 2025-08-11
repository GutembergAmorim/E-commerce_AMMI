const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rotas
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Pegar o token do header
      token = req.headers.authorization.split(' ')[1];

      // Verificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Pegar o usuário do token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Token inválido' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Token não fornecido' });
  }
};

// Middleware para verificar se é admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
  }
};

module.exports = { protect, admin };
