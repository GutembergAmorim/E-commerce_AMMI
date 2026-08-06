# AMMI Fitwear - E-commerce Full Stack

O **AMMI Fitwear** é uma plataforma de e-commerce completa para moda fitness, desenvolvida com a stack MERN (MongoDB, Express, React, Node.js). O projeto inclui um sistema de gestão de produtos, integração real com gateways de pagamento, autenticação segura e testes automatizados.

## 📸 Demonstração

| Página Inicial |
| :---: | :---: |
| <img width="1816" height="997" alt="image" src="https://github.com/user-attachments/assets/c0a568c0-4c25-4e67-996b-70062dea0dea" />

| Página de Produtos |
| :---: | :---: |
| <img width="1779" height="986" alt="image" src="https://github.com/user-attachments/assets/05b9c626-cfb3-47a1-9821-8c376754bc4a" />

| Detalhes de Produtos |
| :---: | :---: |
| <img width="1719" height="993" alt="image" src="https://github.com/user-attachments/assets/24b4a662-1d0e-49a2-8efb-14c92fff624d" />

| Carrinho |
| :---: | :---: |
| <img width="1726" height="994" alt="image" src="https://github.com/user-attachments/assets/09b3376e-4db9-49a7-a906-e18302964b81" />



## Funcionalidades Principais

- 🛒 **Fluxo de Compra Completo**: Carrinho, favoritos e finalização de pedido.
- 💳 **Pagamentos Reais**: Integração com InfinitePay (PIX e Cartão).
- 🔐 **Autenticação**: Sistema de login seguro com JWT e Google OAuth.
- 📦 **Gestão de Estoque**: Painel administrativo para controle de produtos e pedidos.
- 🖼️ **Cloud Storage**: Upload de imagens integrado ao Cloudinary.
- 🧪 **Testes Robustos**: Suíte de testes automatizados com Jest (Backend) e Vitest/RTL (Frontend).

## Estrutura do Projeto

Este repositório está organizado como um Monorepo:

- `/frontend`: Aplicação React construída com Vite.
- `/backend`: API RESTful em Node.js e Express.
- `/docs`: Documentação técnica adicional.

## Guia de Início Rápido

### Pré-requisitos
- Node.js (v18+)
- MongoDB Atlas (ou local)

### Instalação
1. Clone o repositório:
```bash
git clone https://github.com/GutembergAmorim/E-commerce_AMMI.git
```

2. Instale as dependências na raiz:
```bash
npm install
npm run install:all
```

3. Configure as variáveis de ambiente baseadas nos arquivos `.env.example` dentro de cada pasta.

### Execução
Para rodar o Frontend e o Backend simultaneamente:
```bash
npm run dev
```

## Licença
Este projeto está sob a licença [MIT](LICENSE).

---
Desenvolvido por **Gutemberg Amorim**.
