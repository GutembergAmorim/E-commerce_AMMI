import axios from 'axios';

// ── Configuration ──────────────────────────────────────────────────────
const MELHOR_ENVIO_API = process.env.MELHOR_ENVIO_API_URL || 'https://sandbox.melhorenvio.com.br/api/v2';
const TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const CEP_ORIGEM = process.env.MELHOR_ENVIO_CEP_ORIGEM || '60861322';
const APP_NAME = process.env.MELHOR_ENVIO_APP_NAME || 'AMMI Fitwear';
const APP_EMAIL = process.env.MELHOR_ENVIO_APP_EMAIL || 'contato@ammifitwear.com.br';

// ── Cache simples em memória (CEP+peso → resultado, TTL 5min) ──────
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCacheKey(cep, products) {
  const totalWeight = products.reduce((sum, p) => sum + (p.weight || 0.3) * (p.quantity || 1), 0);
  return `${cep}_${totalWeight.toFixed(2)}`;
}

function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
  // Limpar entradas antigas (máximo 100 entradas)
  if (cache.size > 100) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

// ── Peso e dimensões padrão ────────────────────────────────────────────
const DEFAULT_PRODUCT_WEIGHT = 0.3; // 300g em kg
const DEFAULT_DIMENSIONS = { width: 20, height: 5, length: 30 }; // cm

// ── Fallback por região (quando API Melhor Envio cai) ──────────────────
const FALLBACK_TABLE = {
  CE: 15,
  // Nordeste
  MA: 25, PI: 25, RN: 25, PB: 25, PE: 25, AL: 25, SE: 25, BA: 25,
  // Sudeste
  MG: 32, SP: 35, RJ: 35, ES: 32,
  // Sul
  PR: 38, SC: 40, RS: 42,
  // Centro-Oeste
  GO: 35, MT: 38, MS: 38, DF: 35,
  // Norte
  PA: 42, AM: 48, AC: 50, AP: 45, RO: 45, RR: 48, TO: 38,
};

// Mapear faixa de CEP → UF (para fallback e detecção de região)
function getUFFromCEP(cep) {
  const prefix = parseInt(cep.substring(0, 2), 10);
  // São Paulo
  if (prefix >= 1 && prefix <= 19) return 'SP';
  // Rio de Janeiro
  if (prefix >= 20 && prefix <= 28) return 'RJ';
  // Espírito Santo
  if (prefix === 29) return 'ES';
  // Minas Gerais
  if (prefix >= 30 && prefix <= 39) return 'MG';
  // Bahia
  if (prefix >= 40 && prefix <= 48) return 'BA';
  // Sergipe
  if (prefix === 49) return 'SE';
  // Pernambuco
  if (prefix >= 50 && prefix <= 56) return 'PE';
  // Alagoas
  if (prefix === 57) return 'AL';
  // Paraíba
  if (prefix === 58) return 'PB';
  // Rio Grande do Norte
  if (prefix === 59) return 'RN';
  // Ceará
  if (prefix >= 60 && prefix <= 63) return 'CE';
  // Piauí
  if (prefix === 64) return 'PI';
  // Maranhão
  if (prefix === 65) return 'MA';
  // Pará
  if (prefix >= 66 && prefix <= 68) return 'PA';
  // Amazonas, Roraima, Acre
  if (prefix === 69) return 'AM'; // inclui RR e AC em sub-faixas
  // Distrito Federal e Goiás
  if (prefix >= 70 && prefix <= 72) return 'DF';
  if (prefix >= 73 && prefix <= 76) return 'GO';
  // Tocantins
  if (prefix === 77) return 'TO';
  // Mato Grosso
  if (prefix === 78) return 'MT';
  // Mato Grosso do Sul
  if (prefix === 79) return 'MS';
  // Paraná
  if (prefix >= 80 && prefix <= 87) return 'PR';
  // Santa Catarina
  if (prefix >= 88 && prefix <= 89) return 'SC';
  // Rio Grande do Sul
  if (prefix >= 90 && prefix <= 99) return 'RS';
  return 'SP'; // default
}

function getFallbackOptions(cep) {
  const uf = getUFFromCEP(cep);
  const price = FALLBACK_TABLE[uf] || 35;

  return {
    success: true,
    source: 'fallback',
    options: [
      {
        id: 1,
        name: 'PAC',
        company: 'Correios',
        price: price,
        deliveryDays: uf === 'CE' ? 3 : 12,
        deliveryRange: { min: uf === 'CE' ? 2 : 8, max: uf === 'CE' ? 4 : 15 },
      },
      {
        id: 2,
        name: 'SEDEX',
        company: 'Correios',
        price: price * 1.8,
        deliveryDays: uf === 'CE' ? 1 : 5,
        deliveryRange: { min: uf === 'CE' ? 1 : 3, max: uf === 'CE' ? 2 : 7 },
      },
    ],
  };
}

// ── Verificar se CEP é Norte ou Nordeste (elegível a frete grátis) ──────
function isNorteNordeste(cep) {
  const uf = getUFFromCEP(cep);
  const norteNordeste = [
    // Nordeste
    'AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE',
    // Norte
    'AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO',
  ];
  return norteNordeste.includes(uf);
}

// ── Calcular frete via Melhor Envio ────────────────────────────────────
export async function calculateShipping(destinationCep, products) {
  const cep = (destinationCep || '').replace(/\D/g, '');

  if (!cep || cep.length !== 8) {
    return { success: false, message: 'CEP inválido. Deve conter 8 dígitos.' };
  }

  // Flag de elegibilidade para frete grátis (Norte/Nordeste)
  const freeShippingEligible = isNorteNordeste(cep);

  // ── Frete fixo para Fortaleza (CEPs 60000-000 a 61699-999) ──
  const cepNum = parseInt(cep.substring(0, 5), 10);
  const isFortaleza = cepNum >= 60000 && cepNum <= 61699;

  if (isFortaleza) {
    console.log('📦 Frete: CEP de Fortaleza detectado — frete fixo R$ 15,00');
    const fortalezaResult = {
      success: true,
      source: 'fixed_fortaleza',
      freeShippingEligible,
      options: [
        {
          id: 'fortaleza',
          name: 'Entrega Local',
          company: 'AMMI Fitwear',
          price: 15,
          deliveryDays: 2,
          deliveryRange: { min: 1, max: 3 },
        },
      ],
    };
    return fortalezaResult;
  }

  // 1. Verificar cache
  const cacheKey = getCacheKey(cep, products);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log('📦 Frete: cache hit para CEP', cep);
    return cached;
  }

  // 2. Calcular peso total e dimensões
  const totalWeight = products.reduce(
    (sum, p) => sum + (p.weight || DEFAULT_PRODUCT_WEIGHT) * (p.quantity || 1),
    0
  );
  const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 1), 0);

  // Dimensões estimadas (empilhamento vertical)
  const width = DEFAULT_DIMENSIONS.width;
  const length = DEFAULT_DIMENSIONS.length;
  const height = Math.min(DEFAULT_DIMENSIONS.height * totalQuantity, 100); // Max 100cm

  // 3. Montar payload para Melhor Envio
  const payload = {
    from: { postal_code: CEP_ORIGEM },
    to: { postal_code: cep },
    products: [
      {
        id: 'package',
        width,
        height,
        length,
        weight: Math.max(totalWeight, 0.3), // Mínimo 300g
        insurance_value: 0,
        quantity: 1,
      },
    ],
  };

  try {
    console.log('📦 Frete: calculando via Melhor Envio para CEP', cep);

    const response = await axios.post(
      `${MELHOR_ENVIO_API}/me/shipment/calculate`,
      payload,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`,
          'User-Agent': `${APP_NAME} (${APP_EMAIL})`,
        },
        timeout: 10000,
      }
    );

    const services = response.data;

    if (!Array.isArray(services) || services.length === 0) {
      console.log('⚠️ Melhor Envio retornou vazio, usando fallback');
      const fallback = { ...getFallbackOptions(cep), freeShippingEligible };
      setCache(cacheKey, fallback);
      return fallback;
    }

    // 4. Filtrar apenas serviços válidos (sem erro) — PAC e SEDEX
    const validServices = services.filter(
      (s) => !s.error && s.price && parseFloat(s.price) > 0
    );

    if (validServices.length === 0) {
      console.log('⚠️ Nenhum serviço válido, usando fallback');
      const fallback = { ...getFallbackOptions(cep), freeShippingEligible };
      setCache(cacheKey, fallback);
      return fallback;
    }

    // 5. Formatar resposta
    const options = validServices.map((service) => ({
      id: service.id,
      name: service.name,
      company: service.company?.name || 'Correios',
      companyPicture: service.company?.picture || null,
      price: parseFloat(service.price),
      deliveryDays: service.delivery_time,
      deliveryRange: {
        min: service.delivery_range?.min || service.delivery_time,
        max: service.delivery_range?.max || service.delivery_time,
      },
    }));

    // Ordenar por preço (mais barato primeiro)
    options.sort((a, b) => a.price - b.price);

    const result = { success: true, source: 'melhor_envio', freeShippingEligible, options };

    // 6. Salvar no cache
    setCache(cacheKey, result);

    return result;
  } catch (error) {
    console.error('❌ Erro Melhor Envio:', error.response?.data || error.message);

    // 7. Fallback por região
    const fallback = { ...getFallbackOptions(cep), freeShippingEligible };
    setCache(cacheKey, fallback);
    return fallback;
  }
}
