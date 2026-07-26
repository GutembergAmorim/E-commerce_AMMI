const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log para desenvolvimento (stack completo) ou produção (apenas mensagem)
  if (process.env.NODE_ENV === "development") {
    console.error(err);
  } else {
    console.error(`${err.name || "Error"}: ${err.message}`);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error = { message: "Recurso não encontrado", statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = { message: "Valor duplicado", statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = { message: "Token inválido", statusCode: 401 };
  }
  if (err.name === "TokenExpiredError") {
    error = { message: "Token expirado", statusCode: 401 };
  }

  // Evitar enviar resposta duplicada
  if (res.headersSent) {
    return next(err);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Erro interno do servidor",
  });
};

export default errorHandler;
