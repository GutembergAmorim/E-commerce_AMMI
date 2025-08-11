const Product = require('../models/Product');
const User = require('../models/User');
const connectDB = require('../config/database');

const products = [
  {
    name: "Top e Calça Fitness",
    description: "Tecido de poliamida com elastano, proporcionando conforto, elasticidade e proteção UV.",
    price: 89.9,
    oldPrice: 99.9,
    images: [
      "https://via.placeholder.com/600x800/FF6B9D/FFFFFF?text=Produto+1",
      "https://via.placeholder.com/600x800/FF6B9D/FFFFFF?text=Produto+1+Thumb+2",
      "https://via.placeholder.com/600x800/FF6B9D/FFFFFF?text=Produto+1+Thumb+3",
      "https://via.placeholder.com/600x800/FF6B9D/FFFFFF?text=Produto+1+Thumb+4"
    ],
    colors: [
      { name: "Vinho", value: "Vinho", colorCode: "#8B0000" },
      { name: "Rosa escuro", value: "Rosa escuro", colorCode: "#8B008B" }
    ],
    sizes: ["P", "M", "G"],
    category: "Top",
    isNew: true,
    isHighlighted: true,
    stock: 10,
    status: "",
    statusColor: "bg-custom-pink",
    statusTextColor: "text-white"
  },
  {
    name: "Top e Short Premium",
    description: "Modelagem de alta sustentação proporcionando conforto. Comprimento médio e entrada para bojo.",
    price: 104.8,
    oldPrice: 118.9,
    images: [
      "https://via.placeholder.com/600x800/FFA500/FFFFFF?text=Produto+2",
      "https://via.placeholder.com/600x800/FFA500/FFFFFF?text=Produto+2+Thumb+2",
      "https://via.placeholder.com/600x800/FFA500/FFFFFF?text=Produto+2+Thumb+3",
      "https://via.placeholder.com/600x800/FFA500/FFFFFF?text=Produto+2+Thumb+4"
    ],
    colors: [
      { name: "Laranja", value: "Orange", colorCode: "#FFA500" },
      { name: "Rosa escuro", value: "Rosa escuro", colorCode: "#8B008B" }
    ],
    sizes: ["P", "M", "G"],
    category: "Short",
    isNew: false,
    isHighlighted: true,
    stock: 10,
    status: "",
    statusColor: "bg-custom-pink",
    statusTextColor: "text-white"
  },
  {
    name: "Top Isis e Short Grazy",
    description: "Cós alto com alta compressão e ideal para exercícios de forte impacto.",
    price: 100.8,
    oldPrice: 114.9,
    images: [
      "https://via.placeholder.com/600x800/8B0000/FFFFFF?text=Produto+3",
      "https://via.placeholder.com/600x800/8B0000/FFFFFF?text=Produto+3+Thumb+2",
      "https://via.placeholder.com/600x800/8B0000/FFFFFF?text=Produto+3+Thumb+3",
      "https://via.placeholder.com/600x800/8B0000/FFFFFF?text=Produto+3+Thumb+4"
    ],
    colors: [
      { name: "Vinho", value: "Vinho", colorCode: "#8B0000" },
      { name: "Rosa escuro", value: "Rosa escuro", colorCode: "#8B008B" }
    ],
    sizes: ["P", "M", "G"],
    category: "Short",
    isNew: false,
    isHighlighted: false,
    stock: 5,
    status: "Em Estoque",
    statusColor: "bg-success",
    statusTextColor: "text-white"
  }
];

const seedData = async () => {
  try {
    // Conectar ao banco
    await connectDB();

    // Limpar produtos existentes
    await Product.deleteMany();
    console.log('🗑️ Produtos existentes removidos');

    // Inserir novos produtos
    await Product.insertMany(products);
    console.log('✅ Produtos inseridos com sucesso');

    // Criar usuário admin padrão
    const adminExists = await User.findOne({ email: 'admin@amii.com' });
    if (!adminExists) {
      await User.create({
        name: 'Administrador',
        email: 'admin@amii.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('👤 Usuário admin criado: admin@amii.com / admin123');
    }

    console.log('🎉 Dados populados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
    process.exit(1);
  }
};

seedData();
