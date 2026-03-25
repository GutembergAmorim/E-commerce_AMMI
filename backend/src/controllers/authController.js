import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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

// @desc    Solicitar recuperação de senha
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Nenhuma conta encontrada com este e-mail",
      });
    }

    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({
        success: false,
        message: "Esta conta usa login com Google. Não é possível redefinir a senha.",
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset link
    // For now, return the token in the response for development
    const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/reset-password/${resetToken}`;

    console.log(`[AUTH] Reset password link for ${email}: ${resetUrl}`);

    res.json({
      success: true,
      message: "Instruções de recuperação enviadas. Verifique seu e-mail.",
      // Remove in production:
      resetUrl,
    });
  } catch (error) {
    console.error("Erro no forgot password:", error);
    res.status(500).json({ success: false, message: "Erro ao processar solicitação" });
  }
};

// @desc    Redefinir senha com token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token inválido ou expirado. Solicite uma nova recuperação.",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Senha deve ter pelo menos 6 caracteres",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Senha redefinida com sucesso! Você já pode fazer login.",
    });
  } catch (error) {
    console.error("Erro no reset password:", error);
    res.status(500).json({ success: false, message: "Erro ao redefinir senha" });
  }
};

export { register, login, getMe, googleLogin, forgotPassword, resetPassword };
