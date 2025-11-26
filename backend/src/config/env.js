import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega o .env da raiz do backend (dois níveis acima de src/config)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

console.log("Environment variables loaded from:", path.resolve(__dirname, "../../.env"));
