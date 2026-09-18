import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import { formatPrice } from "../utils/formatPrice";

const emptyAddressForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};

const Checkout = () => {
  const { user, fetchProfile } = useAuth();
  const { cart, clearCart, appliedCoupon, couponLoading, couponError, applyCoupon, removeCoupon } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [selectedAddress, setSelectedAddress] = useState(
    () => addresses.find((a) => a.isDefault)?._id || addresses[0]?._id || ""
  );

  // Synchronize saved addresses whenever user profile finishes loading or updating
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0) {
      setAddresses(user.addresses);
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddress((prev) => {
        if (prev && user.addresses.some((a) => a._id === prev)) return prev;
        return defaultAddr?._id || "";
      });
      setAddressMode(null);
    } else if (user && (!user.addresses || user.addresses.length === 0)) {
      setAddresses([]);
      setSelectedAddress("");
      setAddressMode("add");
      setAddressForm({
        ...emptyAddressForm,
        fullName: user.name || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const [addressMode, setAddressMode] = useState(null); // null | "add" | editing addressId
  const [addressForm, setAddressForm] = useState({
    ...emptyAddressForm,
    fullName: user?.name || "",
    phone: user?.phone || "",
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressError, setAddressError] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardHolder: user?.name || "",
    expiry: "",
    cvv: "",
  });
  const [placing, setPlacing] = useState(false);
  const [placingStage, setPlacingStage] = useState(""); // human-readable status while placing
  const [error, setError] = useState("");

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardForm((prev) => ({ ...prev, cardNumber: val }));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardForm((prev) => ({ ...prev, expiry: val }));
  };

  const handleCvvChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardForm((prev) => ({ ...prev, cvv: val }));
  };

  const fillDemoCard = () => {
    setCardForm({
      cardNumber: "4111 1111 1111 1111",
      cardHolder: user?.name || "Demo Shopper",
      expiry: "12/28",
      cvv: "123",
    });
    setError("");
  };

  const hasStockIssue = cart.items.some(
    (item) => (item.product?.stock ?? 0) === 0 || item.quantity > (item.product?.stock ?? 0)
  );

  const shipping = cart.totalPrice > 999 ? 0 : 79;
  const discount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(cart.totalPrice - discount, 0) + shipping;

  // ---------- Address management ----------
  const openAddForm = () => {
    setAddressForm(emptyAddressForm);
    setAddressError("");
    setAddressMode("add");
  };

  const openEditForm = (addr) => {
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country || "India",
      isDefault: addr.isDefault,
    });
    setAddressError("");
    setAddressMode(addr._id);
  };

  const closeAddressForm = () => {
    setAddressMode(null);
    setAddressForm(emptyAddressForm);
    setAddressError("");
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressError("");
    try {
      setAddressSaving(true);
      let data;
      if (addressMode === "add") {
        ({ data } = await axiosInstance.post("/users/address", addressForm));
      } else {
        ({ data } = await axiosInstance.put(`/users/address/${addressMode}`, addressForm));
      }
      setAddresses(data);
      // Newly added address is appended last; keep the selection sensible either way
      const target =
        addressMode === "add" ? data[data.length - 1] : data.find((a) => a._id === addressMode);
      if (target) setSelectedAddress(target._id);
      fetchProfile(); // refresh the global user object in the background
      closeAddressForm();
    } catch (err) {
      setAddressError(err.response?.data?.message || "Could not save this address");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const { data } = await axiosInstance.delete(`/users/address/${addressId}`);
      setAddresses(data);
      if (selectedAddress === addressId) {
        setSelectedAddress(data.find((a) => a.isDefault)?._id || data[0]?._id || "");
      }
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete address");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const { data } = await axiosInstance.put(`/users/address/${addressId}/default`);
      setAddresses(data);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update default address");
    }
  };

  // ---------- Coupon ----------
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput("");
    } catch {
      // couponError is surfaced from context
    }
  };

  // ---------- Order placement ----------
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
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
    setPlacingStage("Placing your order...");
    const { data } = await axiosInstance.post("/orders", {
      orderItems: buildOrderItems(),
      shippingAddress: address,
      paymentMethod,
      paymentInfo,
      itemsPrice: cart.totalPrice,
      shippingPrice: shipping,
      couponCode: appliedCoupon?.code,
      discountAmount: discount,
      totalPrice: total,
    });
    await clearCart();
    navigate(`/order-success/${data._id}`);
  };

  const handlePlaceOrder = async () => {
    setError("");

    if (!cart.items || cart.items.length === 0) {
      setError("Your bag is empty");
      return;
    }
    if (hasStockIssue) {
      setError("Some items in your bag are out of stock or exceed available quantity. Please update your bag before continuing.");
      return;
    }
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

      if (paymentMethod === "Card") {
        const rawCard = cardForm.cardNumber.replace(/\s/g, "");
        if (!rawCard || rawCard.length < 12) {
          setError("Please enter a valid card number (or click '⚡ Fill Demo Card')");
          setPlacing(false);
          return;
        }
        if (!cardForm.expiry || cardForm.expiry.length < 4) {
          setError("Please enter an expiry date (MM/YY)");
          setPlacing(false);
          return;
        }
        if (!cardForm.cvv || cardForm.cvv.length < 3) {
          setError("Please enter card CVV");
          setPlacing(false);
          return;
        }

        setPlacingStage("Authorizing dummy card payment...");
        await new Promise((r) => setTimeout(r, 700));

        await placeOrder({
          cardLast4: rawCard.slice(-4),
          cardBrand: "Visa (Demo)",
          transactionId: `tx_card_dummy_${Date.now()}`,
        });
        return;
      }

      // Razorpay flow
      setPlacingStage("Loading payment gateway...");
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("External payment script was blocked by browser or adblocker. Please use the 'Credit / Debit Card' option for test checkout.");
        setPlacing(false);
        setPlacingStage("");
        return;
      }

      const { data: razorOrder } = await axiosInstance.post("/payment/create-order", {
        amount: total,
      });

      if (razorOrder.isFallback) {
        // Fallback simulated order when Razorpay credentials have issues
        await placeOrder({
          razorpay_payment_id: `pay_dummy_${Date.now()}`,
          razorpay_order_id: razorOrder.orderId,
          razorpay_signature: "mock_signature_test",
        });
        return;
      }

      setPlacingStage("Waiting for payment...");
      const options = {
        key: razorOrder.key,
        amount: razorOrder.amount,
        currency: razorOrder.currency,
        order_id: razorOrder.orderId,
        name: "FashionHub",
        description: "Order Payment",
        handler: async (response) => {
          try {
            setPlacingStage("Verifying payment...");
            await axiosInstance.post("/payment/verify", response);
            await placeOrder({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. If money was deducted, it will be refunded automatically."
            );
            setPlacing(false);
            setPlacingStage("");
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone },
        theme: { color: "#8C1D18" },
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled. Your bag is unchanged — you can try again anytime.");
            setPlacing(false);
            setPlacingStage("");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(`Payment failed: ${response.error?.description || "Please try again."}`);
        setPlacing(false);
        setPlacingStage("");
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setPlacing(false);
      setPlacingStage("");
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-2xl text-ink mb-3">Your bag is empty</h1>
        <p className="text-muted mb-6">Add something to your bag before checking out.</p>
        <Link to="/products" className="inline-block bg-ink text-ivory px-8 py-3 hover:bg-crimson transition-colors">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-10">Checkout</h1>

      {error && <p className="bg-red-50 text-crimson text-sm p-3 mb-8">{error}</p>}

      <div className="grid md:grid-cols-[1fr_360px] gap-12">
        <div>
          {/* Shipping Address */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-ink">Shipping Address</h2>
              {addressMode !== "add" && (
                <button onClick={openAddForm} className="text-sm text-muted hover:text-crimson transition-colors">
                  + Add New Address
                </button>
              )}
            </div>

            {addresses.length === 0 && addressMode === null && (
              <p className="text-muted text-sm">No saved addresses yet. Add one to continue.</p>
            )}

            <div className="space-y-3">
              {addresses.map((addr) =>
                addressMode === addr._id ? (
                  <AddressForm
                    key={addr._id}
                    formData={addressForm}
                    setFormData={setAddressForm}
                    onSubmit={handleSaveAddress}
                    onCancel={closeAddressForm}
                    saving={addressSaving}
                    error={addressError}
                    submitLabel="Save Changes"
                  />
                ) : (
                  <div
                    key={addr._id}
                    className={`border p-4 text-sm ${selectedAddress === addr._id ? "border-ink" : "border-sand"}`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr._id}
                        onChange={() => setSelectedAddress(addr._id)}
                        className="mt-1"
                      />
                      <span className="flex-1">
                        <span className="font-medium text-ink">{addr.fullName}</span>
                        {addr.isDefault && <span className="text-crimson text-xs ml-2">Default</span>}
                        <br />
                        <span className="text-muted">
                          {addr.address}, {addr.city}, {addr.state} - {addr.pincode}, {addr.country}
                        </span>
                        <br />
                        <span className="text-muted">{addr.phone}</span>
                      </span>
                    </label>
                    <div className="flex gap-4 mt-3 ml-7 text-xs">
                      <button onClick={() => openEditForm(addr)} className="text-muted hover:text-ink transition-colors">
                        Edit
                      </button>
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr._id)}
                          className="text-muted hover:text-ink transition-colors"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-muted hover:text-crimson transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}

              {addressMode === "add" && (
                <AddressForm
                  formData={addressForm}
                  setFormData={setAddressForm}
                  onSubmit={handleSaveAddress}
                  onCancel={closeAddressForm}
                  saving={addressSaving}
                  error={addressError}
                  submitLabel="Save Address"
                />
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-12">
            <h2 className="font-display text-lg text-ink mb-4">Payment Method</h2>
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("Razorpay");
                  setError("");
                }}
                className={`text-left border p-4 text-sm transition-all ${
                  paymentMethod === "Razorpay" ? "border-ink bg-sand/30 shadow-sm" : "border-sand hover:border-ink/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-ink font-medium">Razorpay Gateway</p>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                    All-in-One
                  </span>
                </div>
                <p className="text-muted text-xs">Credit/Debit Cards, UPI, Netbanking & Wallets</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("COD");
                  setError("");
                }}
                className={`text-left border p-4 text-sm transition-all ${
                  paymentMethod === "COD" ? "border-ink bg-sand/30 shadow-sm" : "border-sand hover:border-ink/60"
                }`}
              >
                <p className="text-ink font-medium mb-1">Cash on Delivery</p>
                <p className="text-muted text-xs">Pay in cash when your order arrives</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("Card");
                  setError("");
                }}
                className={`text-left border p-4 text-sm transition-all ${
                  paymentMethod === "Card" ? "border-ink bg-sand/30 shadow-sm" : "border-sand hover:border-ink/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-ink font-medium">Direct Demo Card</p>
                  <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-medium">
                    Instant Test
                  </span>
                </div>
                <p className="text-muted text-xs">1-Click test card (bypasses modal)</p>
              </button>
            </div>

            {/* Direct Card Form for Online Payment */}
            {paymentMethod === "Card" && (
              <div className="border border-sand bg-white p-5 text-sm space-y-4 rounded-sm shadow-sm">
                <div className="flex items-center justify-between border-b border-sand pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">Enter Card Details</span>
                    <span className="text-xs text-muted">(Dummy Test Card Supported)</span>
                  </div>
                  <button
                    type="button"
                    onClick={fillDemoCard}
                    className="text-xs bg-sand px-3 py-1.5 hover:bg-ink hover:text-ivory transition-colors font-medium rounded-sm"
                  >
                    ⚡ Fill Demo Card
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 1111 1111 1111"
                      value={cardForm.cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full border border-sand px-3 py-2 text-sm font-mono tracking-wider focus:outline-none focus:border-crimson"
                      maxLength={19}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-muted mb-1">Name on Card</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={cardForm.cardHolder}
                      onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                      className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted mb-1">Expiry Date (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardForm.expiry}
                        onChange={handleExpiryChange}
                        className="w-full border border-sand px-3 py-2 text-sm font-mono focus:outline-none focus:border-crimson"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        value={cardForm.cvv}
                        onChange={handleCvvChange}
                        className="w-full border border-sand px-3 py-2 text-sm font-mono focus:outline-none focus:border-crimson"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xs text-muted/80 bg-sand/30 p-2.5 rounded flex items-center gap-1.5">
                  <span>🛡️</span> Safe Dummy Checkout: Any test card data will be accepted for testing without external network blocking.
                </p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h2 className="font-display text-lg text-ink mb-4">
              Order Items ({cart.items.reduce((n, i) => n + i.quantity, 0)})
            </h2>
            <div>
              {cart.items.map((item) => (
                <div key={item._id} className="flex gap-4 py-4 border-b border-sand">
                  <div className="w-16 h-20 bg-sand shrink-0 overflow-hidden">
                    <img
                      src={item.product.images?.[0]?.url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="text-ink">{item.product.name}</p>
                    <p className="text-muted mt-1">
                      {item.size && `Size: ${item.size}`} {item.color && `· ${item.color}`} · Qty: {item.quantity}
                    </p>
                    {(item.product?.stock ?? 0) === 0 && (
                      <p className="text-crimson text-xs mt-1">Out of stock — remove from bag to continue</p>
                    )}
                    {item.product?.stock > 0 && item.quantity > item.product.stock && (
                      <p className="text-crimson text-xs mt-1">Only {item.product.stock} left in stock</p>
                    )}
                  </div>
                  <p className="text-ink font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="border border-sand p-6 h-fit">
          <h3 className="font-display text-lg text-ink mb-5">Order Summary</h3>

          <div className="mb-5">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-sand/40 px-3 py-2.5 text-sm">
                <span className="text-ink">
                  <span className="text-crimson">{appliedCoupon.code}</span> applied
                </span>
                <button onClick={removeCoupon} className="text-muted hover:text-crimson transition-colors">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 min-w-0 border border-sand px-3 py-2 text-sm uppercase placeholder:normal-case placeholder:text-muted/60 focus:outline-none focus:border-crimson"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponInput.trim()}
                  className="border border-ink px-4 text-sm text-ink hover:bg-ink hover:text-ivory transition-colors disabled:opacity-50 shrink-0"
                >
                  {couponLoading ? "..." : "Apply"}
                </button>
              </form>
            )}
            {couponError && <p className="text-xs text-crimson mt-2">{couponError}</p>}
          </div>

          <div className="space-y-3 text-sm mb-5">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatPrice(cart.totalPrice)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-crimson">
                <span>Discount</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
          </div>

          <div className="flex justify-between text-ink font-medium border-t border-sand pt-4 mb-6">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={placing || hasStockIssue}
            className="w-full bg-ink text-ivory py-3 hover:bg-crimson transition-colors disabled:opacity-50"
          >
            {placing ? placingStage || "Processing..." : "Place Order"}
          </button>

          {hasStockIssue && (
            <p className="text-xs text-crimson mt-3 text-center">
              Resolve the stock issues above before placing your order.
            </p>
          )}

          <Link to="/cart" className="block text-center text-sm text-muted hover:text-ink transition-colors mt-4">
            ← Back to Bag
          </Link>
        </div>
      </div>
    </div>
  );
};

const AddressForm = ({ formData, setFormData, onSubmit, onCancel, saving, error, submitLabel }) => (
  <form onSubmit={onSubmit} className="border border-ink p-4 grid grid-cols-2 gap-3 text-sm">
    {error && <p className="col-span-2 text-crimson text-xs">{error}</p>}
    <input
      placeholder="Full Name"
      value={formData.fullName}
      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
      required
      className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
    />
    <input
      placeholder="Phone"
      value={formData.phone}
      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      required
      className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
    />
    <input
      placeholder="Address"
      value={formData.address}
      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      required
      className="col-span-2 border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
    />
    <input
      placeholder="City"
      value={formData.city}
      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
      required
      className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
    />
    <input
      placeholder="State"
      value={formData.state}
      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
      required
      className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
    />
    <input
      placeholder="Pincode"
      value={formData.pincode}
      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
      required
      className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
    />
    <input
      placeholder="Country"
      value={formData.country}
      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
      className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
    />
    <label className="col-span-2 flex items-center gap-2 text-muted">
      <input
        type="checkbox"
        checked={formData.isDefault}
        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
      />
      Set as default address
    </label>
    <div className="col-span-2 flex gap-3">
      <button
        type="submit"
        disabled={saving}
        className="bg-ink text-ivory px-5 py-2 hover:bg-crimson transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
      <button type="button" onClick={onCancel} className="text-muted hover:text-ink transition-colors">
        Cancel
      </button>
    </div>
  </form>
);

export default Checkout;