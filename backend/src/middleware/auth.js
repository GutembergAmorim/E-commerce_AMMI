import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware para proteger rotas
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Pegar o token do header
      token = req.headers.authorization.split(" ")[1];

      // Verificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Pegar o usuário do token
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Usuário não encontrado" });
      }
      if (!user.isActive) {
        return res.status(403).json({ message: "Usuário desativado" });
      }
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Token inválido" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Token não fornecido" });
  }
};

// Middleware para verificar se é admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Acesso negado. Apenas administradores." });
  }
};

export { protect, admin };
