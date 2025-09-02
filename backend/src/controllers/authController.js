import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Gerar JWT Token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado no servidor");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Registrar usuário
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Este e-mail já está cadastrado",
      });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao registrar usuário",
      error: error.message,
    });
  }
};

// @desc    Login usuário
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[AUTH] Tentativa de login:", { email });

    // Verificar se usuário existe
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.warn("[AUTH] Usuário não encontrado:", { email });
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
      });
    }

    // Verificar usuário ativo e senha
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.warn("[AUTH] Senha inválida para:", { email });
      return res.status(401).json({
        success: false,
        message: "Credenciais inválidas",
      });
    }

    if (!user.isActive) {
      console.warn("[AUTH] Usuário desativado tentou login:", { email });
      return res
        .status(403)
        .json({ success: false, message: "Usuário desativado" });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao fazer login",
      error: error.message,
    });
  }
};

// @desc    Pegar usuário atual
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuário",
      error: error.message,
    });
  }
};

export { register, login, getMe };
