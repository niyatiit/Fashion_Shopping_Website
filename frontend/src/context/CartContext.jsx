import { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], totalPrice: 0 });
      return;
    }
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/cart");
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1, size, color) => {
    const { data } = await axiosInstance.post("/cart", {
      productId,
      quantity,
      size,
      color,
    });
    setCart(data);
    return data;
  };

  const updateCartItem = async (itemId, quantity) => {
    const { data } = await axiosInstance.put(`/cart/${itemId}`, { quantity });
    setCart(data);
    return data;
  };

  const removeCartItem = async (itemId) => {
    const { data } = await axiosInstance.delete(`/cart/${itemId}`);
    setCart(data);
    return data;
  };

  const clearCart = async () => {
    await axiosInstance.delete("/cart");
    setCart({ items: [], totalPrice: 0 });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        cartCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};