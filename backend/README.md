# 🚀 Backend AMII - E-commerce de Roupas Fitness

Backend completo para o projeto AMII, desenvolvido com Node.js, Express e MongoDB.

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

## 🛠️ Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp env.example .env
```

3. **Editar o arquivo .env com suas configurações:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/amii_db
JWT_SECRET=sua_chave_secreta_aqui
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
```

## 🚀 Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

### Popular banco de dados
```bash
npm run seed
```

## 📚 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (banco de dados)
│   ├── controllers/     # Controladores da API
│   ├── middleware/      # Middlewares (auth, error handling)
│   ├── models/          # Modelos do MongoDB
│   ├── routes/          # Rotas da API
│   └── utils/           # Utilitários (seed data)
├── server.js            # Servidor principal
├── package.json
└── README.md
```

## 🔌 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário (protegido)

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto por ID
- `POST /api/products` - Criar produto (admin)
- `PUT /api/products/:id` - Atualizar produto (admin)
- `DELETE /api/products/:id` - Deletar produto (admin)

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para acessar rotas protegidas, inclua o token no header:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

## 👤 Usuário Admin Padrão

Após executar o seed, um usuário admin será criado:
- **Email:** admin@amii.com
- **Senha:** admin123

## 🛡️ Segurança

- Senhas criptografadas com bcrypt
- Rate limiting para prevenir spam
- CORS configurado
- Helmet para headers de segurança
- Validação de dados com Mongoose

## 📝 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| PORT | Porta do servidor | 5000 |
| NODE_ENV | Ambiente (development/production) | development |
| MONGODB_URI | URI do MongoDB | mongodb://localhost:27017/amii_db |
| JWT_SECRET | Chave secreta do JWT | - |
| JWT_EXPIRE | Expiração do JWT | 30d |
| CORS_ORIGIN | Origem permitida para CORS | http://localhost:5173 |

## 🐛 Debug

Para debug, execute:
```bash
NODE_ENV=development npm run dev
```

Os logs aparecerão no console com informações detalhadas.
