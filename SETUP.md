# 🚀 Guia de Configuração - AMII E-commerce

Este guia te ajudará a configurar e executar o projeto AMII completo com frontend React e backend Node.js + MongoDB.

## 📋 Pré-requisitos

- **Node.js** (versão 16 ou superior)
- **MongoDB** (local ou MongoDB Atlas)
- **npm** ou **yarn**
- **Git**

## 🛠️ Configuração do Backend

### 1. Instalar dependências do backend
```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente
```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar o arquivo .env com suas configurações
```

**Conteúdo do arquivo .env:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/amii_db
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 3. Configurar MongoDB

**Opção A - MongoDB Local:**
1. Instalar MongoDB Community Server
2. Iniciar o serviço MongoDB
3. Criar banco de dados: `amii_db`

**Opção B - MongoDB Atlas:**
1. Criar conta no MongoDB Atlas
2. Criar cluster gratuito
3. Obter string de conexão
4. Substituir `MONGODB_URI` no .env

### 4. Popular banco de dados
```bash
npm run seed
```

Isso criará:
- 3 produtos de exemplo
- Usuário admin: `admin@amii.com` / `admin123`

### 5. Executar backend
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

O backend estará disponível em: `http://localhost:5000`

## 🎨 Configuração do Frontend

### 1. Instalar dependências do frontend
```bash
# Voltar para a pasta raiz
cd ..

# Instalar dependências
npm install
```

### 2. Configurar variáveis de ambiente (opcional)
```bash
# Criar arquivo .env na raiz do projeto
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

### 3. Executar frontend
```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

## 🔧 Estrutura do Projeto

```
AMII_v2/
├── backend/                 # Backend Node.js + Express
│   ├── src/
│   │   ├── config/         # Configurações
│   │   ├── controllers/    # Controladores da API
│   │   ├── middleware/     # Middlewares
│   │   ├── models/         # Modelos MongoDB
│   │   ├── routes/         # Rotas da API
│   │   └── utils/          # Utilitários
│   ├── server.js           # Servidor principal
│   └── package.json
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   ├── Context/           # Context API
│   ├── hooks/             # Hooks personalizados
│   ├── pages/             # Páginas
│   ├── services/          # Serviços de API
│   └── ...
└── package.json
```

## 🔌 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Perfil do usuário

### Produtos
- `GET /api/products` - Listar produtos
- `GET /api/products/:id` - Buscar produto por ID
- `POST /api/products` - Criar produto (admin)
- `PUT /api/products/:id` - Atualizar produto (admin)
- `DELETE /api/products/:id` - Deletar produto (admin)

## 👤 Usuários Padrão

Após executar o seed:
- **Admin:** admin@amii.com / admin123
- **Cliente:** Registre-se através da interface

## 🚀 Executando o Projeto Completo

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

### Acessar aplicação
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔍 Testando a API

### Teste básico
```bash
curl http://localhost:5000
```

### Teste de produtos
```bash
curl http://localhost:5000/api/products
```

### Teste de login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@amii.com","password":"admin123"}'
```

## 🛡️ Segurança

- Senhas criptografadas com bcrypt
- JWT para autenticação
- Rate limiting
- CORS configurado
- Validação de dados
- Headers de segurança com Helmet

## 🐛 Solução de Problemas

### Erro de conexão com MongoDB
- Verificar se o MongoDB está rodando
- Verificar string de conexão no .env
- Verificar se o banco existe

### Erro de CORS
- Verificar se o CORS_ORIGIN está correto
- Verificar se o frontend está na porta 5173

### Erro de autenticação
- Verificar se o JWT_SECRET está definido
- Verificar se o token está sendo enviado corretamente

### Erro de PowerShell (Windows)
```bash
# Usar cmd em vez do PowerShell
cmd /c "npm run dev"
```

## 📝 Próximos Passos

1. **Implementar upload de imagens**
2. **Adicionar sistema de pedidos**
3. **Implementar pagamentos**
4. **Adicionar sistema de avaliações**
5. **Implementar busca avançada**
6. **Adicionar dashboard admin**

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Se encontrar problemas, verifique:
1. Logs do console
2. Network tab do navegador
3. Logs do servidor
4. Status do MongoDB

---

**🎉 Parabéns! Seu projeto AMII está configurado e funcionando!**
