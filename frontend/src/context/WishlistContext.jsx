import { createContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist({ products: [] });
      return;
    }
    try {
      const { data } = await axiosInstance.get("/wishlist");
      setWishlist(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const addToWishlist = async (productId) => {
    const { data } = await axiosInstance.post(`/wishlist/${productId}`);
    setWishlist(data);
  };

  const removeFromWishlist = async (productId) => {
    const { data } = await axiosInstance.delete(`/wishlist/${productId}`);
    setWishlist(data);
  };

  const isInWishlist = (productId) =>
    wishlist.products.some((p) => p._id === productId);

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};