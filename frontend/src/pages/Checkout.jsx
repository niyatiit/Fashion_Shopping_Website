import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";

const Checkout = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
      const def = user.addresses.find((a) => a.isDefault);
      setSelectedAddress(def?._id || user.addresses[0]?._id || "");
    }
  }, [user]);

  const shipping = cart.totalPrice > 999 ? 0 : 79;
  const total = cart.totalPrice + shipping;

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const buildOrderItems = () =>
    cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0]?.url,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

  const placeOrder = async (paymentInfo = {}) => {
    const address = addresses.find((a) => a._id === selectedAddress);
    const { data } = await axiosInstance.post("/orders", {
      orderItems: buildOrderItems(),
      shippingAddress: address,
      paymentMethod,
      paymentInfo,
      itemsPrice: cart.totalPrice,
      shippingPrice: shipping,
      totalPrice: total,
    });
    await clearCart();
    navigate(`/orders/${data._id}`);
  };

  const handlePlaceOrder = async () => {
    setError("");
    if (!selectedAddress) {
      setError("Please select a shipping address");
      return;
    }

    try {
      setPlacing(true);

      if (paymentMethod === "COD") {
        await placeOrder();
        return;
      }

      // Razorpay flow
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load payment gateway. Check your connection.");
        setPlacing(false);
        return;
      }

      const { data: razorOrder } = await axiosInstance.post("/payment/create-order", {
        amount: total,
      });

      const options = {
        key: razorOrder.key,
        amount: razorOrder.amount,
        currency: razorOrder.currency,
        order_id: razorOrder.orderId,
        name: "FashionHub",
        description: "Order Payment",
        handler: async (response) => {
          try {
            await axiosInstance.post("/payment/verify", response);
            await placeOrder({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch (err) {
            setError("Payment verification failed");
            setPlacing(false);
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: "#8C1D18" },
        modal: { ondismiss: () => setPlacing(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-10">Checkout</h1>

      {error && <p className="bg-red-50 text-crimson text-sm p-3 mb-6">{error}</p>}

      <div className="mb-10">
        <h2 className="font-display text-lg text-ink mb-4">Shipping Address</h2>
        {addresses.length === 0 ? (
          <p className="text-muted text-sm">No saved addresses. Add one from your profile.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <label
                key={addr._id}
                className={`block border p-4 cursor-pointer text-sm ${
                  selectedAddress === addr._id ? "border-ink" : "border-sand"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={addr._id}
                  checked={selectedAddress === addr._id}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="mr-3"
                />
                {addr.houseNo}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="font-display text-lg text-ink mb-4">Payment Method</h2>
        <div className="flex gap-3">
          {["COD", "Razorpay"].map((method) => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`px-5 py-2 text-sm border ${
                paymentMethod === method ? "border-ink bg-ink text-ivory" : "border-sand text-ink"
              }`}
            >
              {method === "COD" ? "Cash on Delivery" : "Pay Online"}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-sand pt-6 flex justify-between items-center mb-8">
        <span className="text-ink font-medium">Total</span>
        <span className="text-ink font-medium text-xl">₹{total}</span>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={placing}
        className="w-full bg-ink text-ivory py-3 hover:bg-crimson transition-colors disabled:opacity-50"
      >
        {placing ? "Processing..." : "Place Order"}
      </button>
    </div>
  );
};

export default Checkout;