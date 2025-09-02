// /backend/scripts/generateTestToken.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/User.js"; // Ajuste o caminho conforme necessário

dotenv.config();

// Conectar ao MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado ao MongoDB");
  } catch (error) {
    console.error("❌ Erro ao conectar MongoDB:", error);
    process.exit(1);
  }
};

const generateTestToken = async () => {
  await connectDB();

  try {
    // Buscar ou criar usuário de teste
    let testUser = await User.findOne({ email: "test@example.com" });

    if (!testUser) {
      console.log("📝 Criando usuário de teste...");
      testUser = new User({
        name: "Silva Teste",
        email: "silva@example.com",
        password: "testpassword123", // Será hasheado pelo pre-save hook
        role: "user",
      });
      await testUser.save();
      console.log("✅ Usuário de teste criado");
    }

    // Gerar token com dados reais do usuário
    const payload = {
      id: testUser._id.toString(),
      email: testUser.email,
      name: testUser.name,
      role: testUser.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    console.log("\n🔐 TOKEN DE TESTE GERADO:");
    console.log("=".repeat(50));
    console.log(token);
    console.log("=".repeat(50));

    console.log("\n📋 INFORMAÇÕES DO TOKEN:");
    console.log("User ID:", payload.id);
    console.log("Email:", payload.email);
    console.log("Role:", payload.role);
    console.log("Expira em: 24 horas");

    console.log("\n💡 ADICIONE AO SEU .env:");
    console.log("TEST_TOKEN=", token);
  } catch (error) {
    console.error("❌ Erro ao gerar token:", error);
  } finally {
    await mongoose.connection.close();
  }
};

generateTestToken();
