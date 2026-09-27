import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component
 *
 * Injeta dinamicamente no <head>:
 *  - <title>
 *  - meta description
 *  - Open Graph (Facebook, WhatsApp, Instagram)
 *  - Twitter Card
 *  - Schema.org JSON-LD (opcional, via prop `schema`)
 *
 * Uso básico (Home):
 *   <SEO title="AMMI Fitwear | Moda Fitness" description="..." />
 *
 * Uso avançado (Produto):
 *   <SEO
 *     title={`${product.name} | AMMI Fitwear`}
 *     description={product.description}
 *     image={product.images[0]}
 *     url={`https://ammifitwear.com.br/products/${product._id}`}
 *     schema={productSchema}
 *   />
 */

const SITE_NAME = 'AMMI Fitwear';
const SITE_URL = 'https://ammifitwear.com.br';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`; // Coloque uma imagem padrão em /public
const DEFAULT_DESCRIPTION =
  'Moda fitness feminina de alta qualidade. Leggings, tops, shorts e macaquinhos com estilo e conforto para o seu treino.';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  schema = null,
  noIndex = false,
}) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Moda Fitness Feminina`;
  const pageUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const pageImage = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      {/* ── Básico ── */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={pageUrl} />

      {/* ── Open Graph (Facebook, WhatsApp, Instagram) ── */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="pt_BR" />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={pageImage} />

      {/* ── Schema.org JSON-LD (opcional) ── */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
