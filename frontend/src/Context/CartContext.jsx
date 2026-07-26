import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../services/api";

const CartContext = createContext();

// Função para carregar o estado inicial do localStorage de forma segura
const getInitialCart = () => {
  try {
    const savedCartItems = localStorage.getItem("cartItems");
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  } catch (error) {
    console.error(
      "Falha ao carregar itens do carrinho do localStorage.",
      error
    );
    // Limpa o localStorage se os dados estiverem corrompidos
    localStorage.removeItem("cartItems");
    return [];
  }
};

export const CartProvider = ({ children }) => {
  // Utiliza a inicialização preguiçosa para ler o localStorage apenas uma vez
  const [cartItems, setCartItems] = useState(getInitialCart);

  // Estado para animação do carrinho
  const [animateCart, setAnimateCart] = useState(false);

  // Configuração de atacado (carregada da API)
  const [wholesaleConfig, setWholesaleConfig] = useState(null);

  // Buscar configuração de atacado ao montar
  useEffect(() => {
    const fetchWholesaleConfig = async () => {
      try {
        const res = await api.get("/wholesale/config");
        if (res.data.success) {
          setWholesaleConfig(res.data.data);
        }
      } catch (err) {
        // Fallback silencioso — atacado simplesmente não aparece
        console.error("Erro ao carregar config atacado:", err.message);
      }
    };
    fetchWholesaleConfig();
  }, []);

  useEffect(() => {
    // Salva os itens do carrinho no localStorage sempre que cartItems mudar
    try {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (error) {
      console.error(
        "Falha ao salvar itens do carrinho no localStorage.",
        error
      );
    }
  }, [cartItems]);

  const handleQuantityChange = (id, color, size, amount) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id === id && item.color === color && item.size === size) {
          const newQuantity = item.quantity + amount;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id, color, size) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(item.id === id && item.color === color && item.size === size)
      )
    );
  };

  const addItemToCart = (newItem) => {
    setCartItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.color === newItem.color &&
          item.size === newItem.size
      );

      if (existingItemIndex > -1) {
        // Se o item já existe (mesmo ID, cor e tamanho), atualiza a quantidade
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        };
        return updatedItems;
      } else {
        // Adiciona o novo item
        return [...currentItems, newItem];
      }
    });

    // Dispara a animação
    setAnimateCart(true);
    setTimeout(() => {
      setAnimateCart(false);
    }, 500); // Duração da animação
  };

  // funcao para limpar o carrinho
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cartItems");
  };

  // Calcula o subtotal
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Calcula o desconto total
  const discount = cartItems.reduce((acc, item) => {
    if (item.originalPrice) {
      return acc + (item.originalPrice - item.price) * item.quantity;
    }
    return acc;
  }, 0);

  // Quantidade total de peças (para atacado)
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Elegibilidade atacado
  const isWholesaleEligible =
    wholesaleConfig?.isActive && totalQuantity >= (wholesaleConfig?.minQuantity || 6);

  // Quantas peças faltam para atingir atacado
  const piecesUntilWholesale = wholesaleConfig?.isActive
    ? Math.max(0, (wholesaleConfig?.minQuantity || 6) - totalQuantity)
    : 0;

  // Frete dinâmico (calculado no checkout via Melhor Envio)
  const [shippingPrice, setShippingPrice] = useState(null);
  const [shippingOption, setShippingOption] = useState(null);
  const [freeShippingEligible, setFreeShippingEligible] = useState(false);

  // Frete grátis acima de R$ 299 exclusivamente para Fortaleza, Maracanaú e Caucaia (quando o frete foi calculado/confirmado)
  const isFreeShipping = subtotal > 299 && freeShippingEligible;
  const effectiveShipping = isFreeShipping ? 0 : (shippingPrice ?? 0);

  // Calcula o total (subtotal + frete)
  // NÃO subtrai 'discount' aqui — o subtotal já usa item.price (preço promocional)
  // O 'discount' é apenas para exibição (quanto o cliente economizou)
  const total = subtotal + effectiveShipping;

  // Alias para compatibilidade (componentes que usam `frete`)
  const frete = effectiveShipping;

  const setShippingData = (price, option) => {
    setShippingPrice(price);
    setShippingOption(option);
  };

  const resetShipping = () => {
    setShippingPrice(null);
    setShippingOption(null);
    setFreeShippingEligible(false);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        handleQuantityChange,
        handleRemoveItem,
        addItemToCart,
        clearCart,
        subtotal,
        discount,
        total,
        frete,
        isFreeShipping,
        shippingPrice,
        shippingOption,
        setShippingData,
        setFreeShippingEligible,
        resetShipping,
        animateCart,
        // Atacado
        totalQuantity,
        wholesaleConfig,
        isWholesaleEligible,
        piecesUntilWholesale,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
