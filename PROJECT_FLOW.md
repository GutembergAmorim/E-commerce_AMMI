# Documentação do Fluxo do Projeto - AMII Fitwear

Este documento descreve os principais fluxos e processos técnicos do projeto AMII Fitwear, cobrindo desde a autenticação até o processamento de pagamentos e gestão de pedidos.

## 1. Visão Geral
O **AMII Fitwear** é um e-commerce de roupas fitness desenvolvido com a stack MERN (MongoDB, Express, React, Node.js). O sistema gerencia usuários, produtos, estoque e processa pagamentos reais através da integração com a API do **PagSeguro**.

---

## 2. Autenticação e Segurança

O sistema utiliza **JWT (JSON Web Tokens)** para autenticação stateless.

### 2.1. Cadastro de Usuário (`/api/auth/register`)
*   **Entrada**: Nome, E-mail, Senha.
*   **Processo**:
    1.  Verifica se o e-mail já está cadastrado no banco de dados.
    2.  Cria o usuário com a senha criptografada (hash).
    3.  Gera um token JWT assinado.
*   **Saída**: Dados do usuário (sem senha) e Token JWT.

### 2.2. Login (`/api/auth/login`)
*   **Entrada**: E-mail, Senha.
*   **Processo**:
    1.  Busca o usuário pelo e-mail.
    2.  Compara a senha fornecida com o hash salvo no banco (usando `bcryptjs`).
    3.  Verifica se o usuário está ativo.
    4.  Gera um token JWT com tempo de expiração configurado.
*   **Saída**: Dados do usuário e Token JWT.

### 2.3. Proteção de Rotas
*   O middleware de autenticação intercepta requisições para rotas protegidas.
*   Ele valida o token enviado no cabeçalho `Authorization: Bearer <token>`.
*   Se válido, anexa o objeto `user` à requisição (`req.user`), permitindo que os controladores saibam quem está fazendo a ação.

---

## 3. Fluxo de Compras e Pagamentos

O processamento de pagamentos é o núcleo transacional do sistema, integrado diretamente com o **PagSeguro**.

### 3.1. Criação do Pedido
Ao contrário de alguns sistemas onde o pedido é criado antes do pagamento, aqui o pedido é criado **durante a intenção de pagamento** para garantir a consistência dos dados enviados ao gateway.

#### Validações Prévias (Backend)
Antes de processar qualquer pagamento:
1.  **Validação de Usuário**: Confirma se o usuário está autenticado.
2.  **Validação de Estoque**: Percorre cada item do carrinho e verifica se há estoque disponível no banco de dados (`Product.stock`).
3.  **Cálculo de Valores**: O backend recalcula o total com base nos preços reais dos produtos no banco, ignorando valores enviados pelo frontend para evitar fraudes.

### 3.2. Pagamento via PIX (`/api/payment/pix`)
1.  **Criação do Pedido**: Um registro `Order` é criado no banco com status `Pendente`.
2.  **Integração PagSeguro**:
    *   O backend envia uma requisição para a API do PagSeguro (`/orders`) com os dados do cliente e do pedido.
    *   Utiliza uma `idempotency-key` para evitar cobranças duplicadas em caso de falha de rede.
3.  **Resposta**:
    *   O PagSeguro retorna os dados do PIX (Copia e Cola e QR Code).
    *   O ID da cobrança do PagSeguro (`charge_id`) é salvo no pedido local.
4.  **Retorno ao Cliente**: O frontend recebe o QR Code para exibição.

### 3.3. Pagamento via Cartão de Crédito (`/api/payment/card`)
1.  **Dados Sensíveis**: O frontend envia os dados do cartão (Número, Validade, CVV, Titular) de forma segura.
2.  **Criação do Pedido**: Registro `Order` criado com status `Processando`.
3.  **Integração PagSeguro**:
    *   O backend envia uma requisição para `/charges` com os dados do cartão e parcelamento escolhido.
    *   A transação é processada em tempo real (Captura automática).
4.  **Atualização de Status**:
    *   Se aprovado (`PAID` ou `AUTHORIZED`), o pedido é marcado como pago (`isPaid: true`) e o estoque é **decrementado** imediatamente.
    *   Se recusado, o erro é retornado ao usuário com a mensagem da operadora.

---

## 4. Gestão de Pedidos e Webhooks

Para garantir que o status do pedido esteja sempre atualizado (ex: usuário paga o PIX 10 minutos depois), o sistema utiliza Webhooks.

### 4.1. Webhook (`/api/payment/webhook`)
O PagSeguro notifica o sistema sempre que há mudança no status de uma transação.

1.  **Recebimento**: O endpoint recebe o payload do PagSeguro.
2.  **Verificação**: O sistema consulta a API do PagSeguro novamente usando o `charge_id` recebido para garantir a autenticidade da informação (evitando spoofing).
3.  **Atualização**:
    *   Busca o pedido local associado.
    *   Atualiza o status (ex: `Pendente` -> `Pago`).
    *   Se o status mudar para `Pago`, a data de pagamento é registrada e o estoque é baixado (caso ainda não tenha sido).

### 4.2. Consulta de Status (`/api/payment/status/:orderId`)
O frontend pode consultar periodicamente este endpoint para saber se o pagamento foi confirmado, útil para atualizar a tela de "Aguardando Pagamento" em tempo real.

---

## 5. Estados do Pedido

O ciclo de vida de um pedido segue os seguintes estados principais:

1.  **Pendente**: Pedido criado, aguardando pagamento (comum em PIX).
2.  **Processando**: Pagamento em análise (comum em Cartão).
3.  **Pago / Aprovado**: Pagamento confirmado. Estoque debitado.
4.  **Enviado**: Pedido despachado (atualização manual via Admin).
5.  **Entregue**: Pedido entregue ao cliente.
6.  **Cancelado / Rejeitado**: Pagamento recusado ou pedido cancelado.

---

## 6. Tecnologias e Bibliotecas Chave

*   **Backend**: Node.js, Express.
*   **Banco de Dados**: MongoDB (Mongoose).
*   **Pagamentos**: Axios (para requisições HTTP à API do PagSeguro).
*   **Validação**: Express-Validator (entradas), validação manual de regras de negócio.
*   **Segurança**: Helmet (headers HTTP), CORS, BCrypt (senhas), JWT.
