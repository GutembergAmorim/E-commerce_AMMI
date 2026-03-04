import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Senha é obrigatória e deve ter pelo menos 6 caracteres",
      });
    }

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
      authProvider: "local",
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
    if (user.authProvider === "google" && !user.password) {
      return res.status(401).json({
        success: false,
        message: "Esta conta usa login com Google. Clique em 'Login com Google' para acessar.",
      });
    }

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

// @desc    Login com Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Token do Google não fornecido",
      });
    }

    // Verificar o token JWT do Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Não foi possível obter o e-mail da conta Google",
      });
    }

    // Buscar usuário por googleId ou email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      // Usuário existe — atualizar googleId se necessário
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        await user.save();
      }
    } else {
      // Criar novo usuário (sem senha)
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
        authProvider: "google",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Usuário desativado",
      });
    }

    console.log("[AUTH] Login Google bem-sucedido:", { email, name });

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
    console.error("Erro no login Google:", error);

    if (error.message?.includes("Token used too late") || error.message?.includes("Invalid token")) {
      return res.status(401).json({
        success: false,
        message: "Token do Google expirado ou inválido. Tente novamente.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Erro ao fazer login com Google",
      error: error.message,
    });
  }
};

export { register, login, getMe, googleLogin };
