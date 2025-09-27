# AMII E-commerce

## PagSeguro (PagBank) - Integração simples

- Variáveis de ambiente no `backend/.env`:
  - `PAGSEGURO_BASE_URL` (ex.: `https://sandbox.api.pagseguro.com`)
  - `PAGSEGURO_TOKEN` (token de API)
  - `CLIENT_URL` (URL do frontend)
  - `BACKEND_URL` (URL público do backend para webhooks)

- Fluxo PIX:
  - POST `POST /api/payment/create-pix` com `cartItems` e `shippingAddress`
  - Resposta inclui `qrCodeText` e `qrCodeLink`
  - Webhook: `POST /api/payment/webhook` (configure a URL no PagSeguro)

- Removido Mercado Pago/Stripe do projeto.