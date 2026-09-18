import { createContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // { code, discountType, discountValue, discountAmount } | null
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], totalPrice: 0 });
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { data } = await axiosInstance.get("/cart");
      setCart(data);
    } catch (err) {
      console.error("Failed to fetch cart:", err.message);
      setError("Could not load your bag. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    setAppliedCoupon(null); // a new user session starts with no coupon applied
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code) => {
    try {
      setCouponLoading(true);
      setCouponError("");
      const { data } = await axiosInstance.post("/coupons/apply", {
        code,
        cartTotal: cart.totalPrice,
      });
      setAppliedCoupon(data);
      return data;
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || "Could not apply this coupon");
      throw err;
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  // If the cart total changes (item added/removed/qty changed) after a coupon
  // was applied, silently re-validate it — e.g. removing items may drop the
  // cart below the coupon's minimum order value.
  const revalidateCoupon = useCallback(
    async (code) => {
      try {
        const { data } = await axiosInstance.post("/coupons/apply", {
          code,
          cartTotal: cart.totalPrice,
        });
        setAppliedCoupon(data);
      } catch {
        setAppliedCoupon(null);
        setCouponError("Your coupon no longer applies to this bag and was removed.");
      }
    },
    [cart.totalPrice]
  );

  useEffect(() => {
    if (appliedCoupon && cart.items.length > 0) {
      revalidateCoupon(appliedCoupon.code);
    } else if (cart.items.length === 0) {
      setAppliedCoupon(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.totalPrice]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateCartItem,
        removeCartItem,
        cartCount: new Set(
          (cart?.items || []).map((item) =>
            (item.product?._id || item.product || item._id).toString()
          )
        ).size,
        couponLoading,
        couponError,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};