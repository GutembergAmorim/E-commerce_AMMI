import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import connectDB from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const products = [
  {
    name: "Top Maya e Short Nina",
    description:
      "Tecido de poliamida com elastano, proporcionando conforto, elasticidade e proteção UV.",
    price: 89.9,
    oldPrice: 99.9,
    // Exemplo com URLs do Cloudinary. Substitua 'seu-cloud-name' e os public_ids
    images: [
      "https://res.cloudinary.com/dxaacelde/image/upload/w_600,h_800,c_fill,q_auto,f_auto/Top_Maya_short_Nina_Verde_dudrrh.jpg",
      "https://res.cloudinary.com/dxaacelde/image/upload/w_600,h_800,c_fill,q_auto,f_auto/Top_Maya_short_Nina_Marrom_nywizo.jpg",
      "https://res.cloudinary.com/dxaacelde/image/upload/w_600,h_800,c_fill,q_auto,f_auto/Top_Maya_-_Frente_Marrom_qh2rgw.jpg",
    ],
    colors: [
      { name: "Vinho", value: "Vinho", colorCode: "#8B0000" },
      { name: "Rosa escuro", value: "Rosa escuro", colorCode: "#8B008B" },
    ],
    sizes: ["P", "M", "G"],
    category: "Top",
    isNew: true,
    isHighlighted: true,
    stock: 10,
    status: "",
    statusColor: "bg-custom-pink",
    statusTextColor: "text-white",
  },
  {
    name: "Top e Short Premium",
    description:
      "Modelagem de alta sustentação proporcionando conforto. Comprimento médio e entrada para bojo.",
    price: 104.8,
    oldPrice: 118.9,
    images: [
      "https://res.cloudinary.com/dxaacelde/image/upload/w_600,h_800,c_fill,q_auto,f_auto/Home_2-Photoroom_cjzuna.png",
      "https://res.cloudinary.com/dxaacelde/image/upload/w_600,h_800,c_fill,q_auto,f_auto/Top_Anne_Cal%C3%A7a_Ana_-_Costas_Marrom_ij2jhj.jpg",
      "https://res.cloudinary.com/dxaacelde/image/upload/w_600,h_800,c_fill,q_auto,f_auto/Top_Anne_-_Frente_Marrom_rpz5cb.jpg",
      "https://res.cloudinary.com/dxaacelde/image/upload/w_600,h_800,c_fill,q_auto,f_auto/Top_Anne_short_Nina_-_Frente_Verde_glmw1v.jpg",
    ],
    colors: [
      { name: "Laranja", value: "Orange", colorCode: "#FFA500" },
      { name: "Rosa escuro", value: "Rosa escuro", colorCode: "#8B008B" },
    ],
    sizes: ["P", "M", "G"],
    category: "Short",
    isNew: false,
    isHighlighted: true,
    stock: 10,
    status: "",
    statusColor: "bg-custom-pink",
    statusTextColor: "text-white",
  },
  {
    name: "Top Isis e Short Grazy",
    description:
      "Cós alto com alta compressão e ideal para exercícios de forte impacto.",
    price: 100.8,
    oldPrice: 114.9,
    images: [
      "https://res.cloudinary.com/dxaacelde/image/upload/w_600,h_800,c_fill,q_auto,f_auto/Top_Maya_-_Frente_Marrom_qh2rgw.jpg",
      "https://via.placeholder.com/600x800/8B0000/FFFFFF?text=Produto+3+Thumb+2",
      "https://via.placeholder.com/600x800/8B0000/FFFFFF?text=Produto+3+Thumb+3",
      "https://via.placeholder.com/600x800/8B0000/FFFFFF?text=Produto+3+Thumb+4",
    ],
    colors: [
      { name: "Vinho", value: "Vinho", colorCode: "#8B0000" },
      { name: "Rosa escuro", value: "Rosa escuro", colorCode: "#8B008B" },
    ],
    sizes: ["P", "M", "G"],
    category: "Short",
    isNew: false,
    isHighlighted: false,
    stock: 5,
    status: "Em Estoque",
    statusColor: "bg-success",
    statusTextColor: "text-white",
  },
];

const seedData = async () => {
  try {
    // Conectar ao banco
    await connectDB();

    // Limpar produtos existentes
    // await Product.deleteMany();
    // console.log("🗑️ Produtos existentes removidos");

    // Inserir novos produtos
    // await Product.insertMany(products);
    // console.log("✅ Produtos inseridos com sucesso");

    // Limpar todos os pedidos
    await Order.deleteMany();
    console.log("🗑️ Pedidos existentes removidos");

    // Criar usuário admin padrão
    // const adminExists = await User.findOne({ email: 'admin@amii.com' });
    // if (!adminExists) {
    //   await User.create({
    //     name: 'Administrador',
    //     email: 'admin@amii.com',
    //     password: 'admin123',
    //     role: 'admin'
    //   });
    //   console.log('👤 Usuário admin criado: admin@amii.com / admin123');
    // }
  } catch (error) {
    console.error("❌ Erro ao remover pedidos:", error);
    process.exit(1);
  }
};

seedData();
