/**
 * analytics.js — Utilitário central de rastreamento
 *
 * Encapsula GA4 (gtag) e Meta Pixel (fbq) numa API única.
 * Adicione novos provedores aqui sem alterar os componentes de página.
 *
 * Variáveis de ambiente necessárias (frontend/.env):
 *   VITE_GA4_ID       → ex: G-XXXXXXXXXX
 *   VITE_META_PIXEL_ID → ex: 1234567890123
 */

// ── Helpers de acesso seguro ───────────────────────────────────────────────

/** Retorna o objeto gtag do window, ou uma função vazia se GA4 não carregou. */
const gtag = (...args) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
};

/** Retorna o objeto fbq do window, ou uma função vazia se o Pixel não carregou. */
const fbq = (...args) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args);
  }
};

// ── IDs das ferramentas (lidos das variáveis de ambiente) ──────────────────
export const GA4_ID = import.meta.env.VITE_GA4_ID || '';
export const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';

// ── Flag de debug (ativo apenas em desenvolvimento) ───────────────────────
const DEBUG = import.meta.env.DEV;

function log(event, data) {
  if (DEBUG) {
    console.log(`[Analytics] ${event}`, data || '');
  }
}

// ══════════════════════════════════════════════════════════════════════════
// EVENTOS PADRÃO
// ══════════════════════════════════════════════════════════════════════════

/**
 * Dispara um page_view manual.
 * Chamado pelo hook usePageTracking a cada troca de rota.
 *
 * @param {string} path   - ex: "/products/abc123"
 * @param {string} title  - document.title atual
 */
export function trackPageView(path, title) {
  log('page_view', { path, title });

  // GA4
  gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  });

  // Meta Pixel
  fbq('track', 'PageView');
}

/**
 * Visualização de produto (PDP).
 * Dispare quando o usuário carrega a página de um produto.
 *
 * @param {{ id, name, price, category, brand }} product
 */
export function trackViewItem(product) {
  if (!product) return;
  log('view_item', product);

  // GA4
  gtag('event', 'view_item', {
    currency: 'BRL',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || '',
        price: product.price,
        quantity: 1,
      },
    ],
  });

  // Meta Pixel
  fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_category: product.category || '',
    content_type: 'product',
    value: product.price,
    currency: 'BRL',
  });
}

/**
 * Adição ao carrinho.
 * Dispare quando o usuário clica em "Adicionar ao carrinho".
 *
 * @param {{ id, name, price, category, quantity, color, size }} item
 */
export function trackAddToCart(item) {
  if (!item) return;
  log('add_to_cart', item);

  // GA4
  gtag('event', 'add_to_cart', {
    currency: 'BRL',
    value: item.price * (item.quantity || 1),
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category || '',
        price: item.price,
        quantity: item.quantity || 1,
        item_variant: `${item.color || ''} / ${item.size || ''}`,
      },
    ],
  });

  // Meta Pixel
  fbq('track', 'AddToCart', {
    content_ids: [item.id],
    content_name: item.name,
    content_type: 'product',
    value: item.price * (item.quantity || 1),
    currency: 'BRL',
  });
}

/**
 * Início do checkout.
 * Dispare quando o usuário entra na página /checkout.
 *
 * @param {{ items: Array, total: number }} cart
 */
export function trackBeginCheckout(cart) {
  if (!cart) return;
  log('begin_checkout', cart);

  const gaItems = (cart.items || []).map((item) => ({
    item_id: item.id,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity || 1,
    item_variant: `${item.color || ''} / ${item.size || ''}`,
  }));

  // GA4
  gtag('event', 'begin_checkout', {
    currency: 'BRL',
    value: cart.total || 0,
    items: gaItems,
  });

  // Meta Pixel
  fbq('track', 'InitiateCheckout', {
    value: cart.total || 0,
    currency: 'BRL',
    num_items: (cart.items || []).reduce((s, i) => s + (i.quantity || 1), 0),
  });
}

/**
 * Compra finalizada (pedido criado com sucesso, link gerado).
 * Dispare logo após a criação do pedido no backend, antes do redirect.
 *
 * @param {{ orderId, total, items: Array, couponCode? }} order
 */
export function trackPurchase(order) {
  if (!order) return;
  log('purchase', order);

  const gaItems = (order.items || []).map((item) => ({
    item_id: item.id || item.product,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity || 1,
  }));

  // GA4
  gtag('event', 'purchase', {
    transaction_id: order.orderId,
    currency: 'BRL',
    value: order.total,
    coupon: order.couponCode || '',
    items: gaItems,
  });

  // Meta Pixel
  fbq('track', 'Purchase', {
    value: order.total,
    currency: 'BRL',
    content_ids: (order.items || []).map((i) => i.id || i.product),
    content_type: 'product',
    num_items: (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0),
  });
}

/**
 * Lead capturado (inscrição na newsletter).
 * Dispare quando o usuário se inscreve no formulário de e-mail.
 */
export function trackLead() {
  log('generate_lead');

  // GA4
  gtag('event', 'generate_lead');

  // Meta Pixel
  fbq('track', 'Lead');
}

/**
 * Evento personalizado genérico (para casos específicos não cobertos acima).
 *
 * @param {string} eventName
 * @param {object} params
 */
export function trackEvent(eventName, params = {}) {
  log(eventName, params);
  gtag('event', eventName, params);
}
