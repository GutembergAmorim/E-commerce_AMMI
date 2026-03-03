import Subscriber from "../models/Subscriber.js";

// @desc    Inscrever e-mail na newsletter
// @route   POST /api/newsletter
// @access  Public
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "E-mail é obrigatório.",
      });
    }

    // Verificar se já está inscrito
    const existing = await Subscriber.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.isActive) {
        return res.status(409).json({
          success: false,
          message: "Este e-mail já está inscrito na nossa newsletter!",
        });
      }
      // Reativar inscrição
      existing.isActive = true;
      await existing.save();
      return res.status(200).json({
        success: true,
        message: "Bem-vindo(a) de volta! Inscrição reativada.",
      });
    }

    await Subscriber.create({ email });

    res.status(201).json({
      success: true,
      message: "Inscrito com sucesso! Você receberá nossas novidades.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Este e-mail já está inscrito.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Erro ao processar inscrição. Tente novamente.",
    });
  }
};

// @desc    Cancelar inscrição
// @route   DELETE /api/newsletter/:email
// @access  Public
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.params;
    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "E-mail não encontrado.",
      });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: "Inscrição cancelada com sucesso.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao cancelar inscrição.",
    });
  }
};
