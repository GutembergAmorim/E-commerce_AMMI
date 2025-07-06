import Produto1 from "../assets/produto1.jpg";
import Produto1_thumb2 from "../assets/produto1_thumb2.jpg";
import Produto1_thumb3 from "../assets/produto1_thumb3.jpg";
import Produto1_thumb4 from "../assets/produto1_thumb4.jpg";
import Produto2 from "../assets/produto2.jpg";
import Produto2_thumb2 from "../assets/produto2_thumb2.jpg";
import Produto2_thumb3 from "../assets/produto2_thumb3.jpg";
import Produto2_thumb4 from "../assets/produto2_thumb4.jpg";
import Produto3 from "../assets/produto3.jpg";
import Produto3_thumb2 from "../assets/produto3_thumb2.jpg";
import Produto3_thumb3 from "../assets/produto3_thumb3.jpg";
import Produto3_thumb4 from "../assets/produto3_thumb4.jpg";

const produtos = [
  {
    id: 1,
    name: "Top e Calça Fitness",
    description:
      "Tecido de poliamida com elastano, proporcionando conforto, elasticidade e proteção UV.",
    price: 89.9,
    oldPrice: 99.9,
    images: [Produto1, Produto1_thumb2, Produto1_thumb3, Produto1_thumb4],
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
    id: 2,
    name: "Top e Short Premium",
    description:
      "Modelagem de alta sustentação proporcionando conforto. Comprimento médio e entrada para bojo.",
    price: 104.8,
    oldPrice: 118.9,
    images: [Produto2, Produto2_thumb2, Produto2_thumb3, Produto2_thumb4],
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
    id: 3,
    name: "Top Isis e Short Grazy",
    description:
      "Cós alto com alta compressão e ideal para exercícios de forte impacto.",
    price: 100.8,
    oldPrice: 114.9,
    images: [Produto3, Produto3_thumb2, Produto3_thumb3, Produto3_thumb4],
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
export default produtos;
