import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/amii_db",
      {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );

    console.log(`MongoDB conectado: ${conn.connection.host}`);

    mongoose.connection.on('error', err => {
      console.error('Erro na conexão MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB desconectado. Tentando reconectar...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconectado!');
    });

  } catch (error) {
    console.error("Erro ao conectar com MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
