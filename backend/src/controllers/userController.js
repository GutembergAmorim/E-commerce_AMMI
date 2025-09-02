import User from "../models/User.js";

// Listar usuários (admin)
const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao listar usuários",
        error: error.message,
      });
  }
};

// Obter usuário por ID (admin)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });
    res.json({ success: true, data: user });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao buscar usuário",
        error: error.message,
      });
  }
};

// Alterar papel do usuário (admin)
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body; // 'user' | 'admin'
    if (!["user", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Papel inválido" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser)
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });

    // Evitar que um admin remova seu próprio papel de admin
    if (String(targetUser._id) === String(req.user._id) && role !== "admin") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Você não pode remover seu próprio papel de admin",
        });
    }

    // Garantir que sempre exista pelo menos um admin
    if (targetUser.role === "admin" && role === "user") {
      const adminCount = await User.countDocuments({
        role: "admin",
        _id: { $ne: targetUser._id },
      });
      if (adminCount === 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Pelo menos um administrador deve permanecer",
          });
      }
    }

    targetUser.role = role;
    await targetUser.save();
    const sanitized = await User.findById(targetUser._id).select("-password");
    res.json({ success: true, data: sanitized });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao atualizar papel do usuário",
        error: error.message,
      });
  }
};

// Ativar/Desativar usuário (admin)
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body; // boolean
    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "Parâmetro isActive inválido" });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser)
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });

    // Não permitir desativar a si mesmo
    if (String(targetUser._id) === String(req.user._id) && isActive === false) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Você não pode desativar seu próprio usuário",
        });
    }

    targetUser.isActive = isActive;
    await targetUser.save();
    const sanitized = await User.findById(targetUser._id).select("-password");
    res.json({ success: true, data: sanitized });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao atualizar status do usuário",
        error: error.message,
      });
  }
};

// Excluir usuário (admin)
const deleteUser = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser)
      return res
        .status(404)
        .json({ success: false, message: "Usuário não encontrado" });

    // Impedir excluir a si mesmo
    if (String(targetUser._id) === String(req.user._id)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Você não pode excluir seu próprio usuário",
        });
    }

    // Impedir excluir o último admin
    if (targetUser.role === "admin") {
      const otherAdmins = await User.countDocuments({
        role: "admin",
        _id: { $ne: targetUser._id },
      });
      if (otherAdmins === 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Pelo menos um administrador deve permanecer",
          });
      }
    }

    await targetUser.deleteOne();
    res.json({ success: true, message: "Usuário excluído com sucesso" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao excluir usuário",
        error: error.message,
      });
  }
};

export { listUsers, getUserById, updateUserRole, updateUserStatus, deleteUser };
