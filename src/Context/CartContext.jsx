import React, { createContext, useState, useContext, useEffect } from "react";

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
      // A lógica de filtro original estava incorreta.
      // Ela mantinha apenas os itens que não correspondiam a NENHUM dos critérios.
      // A lógica correta é manter os itens que NÃO são o item a ser removido (ou seja, que não correspondem a TODOS os critérios).
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
    localStorage.removeItem("cartItems");  };

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

  // Calcula o total (subtotal - desconto)
  const total = subtotal - discount;

  

  return (
    <CartContext.Provider
      value={{
        cartItems,
        handleQuantityChange,
        handleRemoveItem,
        addItemToCart,
        clearCart, // Adiciona a função de limpar o carrinho
        subtotal,
        discount,
        total, 
        animateCart, // Expõe o estado da animação
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
