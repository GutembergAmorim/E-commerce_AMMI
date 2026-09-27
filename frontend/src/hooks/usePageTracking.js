import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/analytics';

/**
 * usePageTracking
 *
 * Observa cada mudança de rota e dispara um page_view automático
 * para GA4 e Meta Pixel. Coloque este hook uma única vez dentro do
 * componente App (que está dentro do RouterProvider).
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Aguarda o título da página ser atualizado pelo react-helmet-async
    // antes de enviar o evento (1 tick de microtask é suficiente)
    const timer = setTimeout(() => {
      trackPageView(location.pathname + location.search, document.title);
    }, 0);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);
}
