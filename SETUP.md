# 🚀 Guia de Configuração - AMII Fitwear (Monorepo)

Este guia ajudará você a configurar o projeto completo no seu ambiente local.

## 📋 Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **MongoDB** (Atlas ou Local)
- **Git**

## 🛠️ Instalação Rápida

1. **Instalar dependências (Raiz e Subpastas):**
```bash
npm install
npm run install:all
```

2. **Configuração de Ambiente:**
   - No diretório `/backend`, crie um `.env` baseado no `env.example`.
   - No diretório `/frontend`, crie um `.env` baseado no `.env.example`.

3. **Popular o Banco de Dados:**
```bash
cd backend
npm run seed
```

## 🏃‍♂️ Como Executar

Você pode rodar os dois projetos simultaneamente a partir da raiz:

```bash
npm run dev
```

Ou individualmente:
- **Backend:** `cd backend && npm run dev`
- **Frontend:** `cd frontend && npm run dev`

## 🧪 Testes

O projeto conta com testes automatizados em ambos os lados:

### Backend (Jest)
```bash
cd backend
npm test
```

### Frontend (Vitest)
```bash
cd frontend
npm run test
```

## 🔧 Estrutura das Pastas
```
/
├── frontend/             # React + Vite (Interface)
├── backend/              # Node.js + Express (API)
├── package.json          # Gerenciamento Monorepo
└── README.md             # Visão geral do projeto
```

---
**Dica:** Siga as instruções do `README.md` principal para configurações de deploy (Vercel/Render).
