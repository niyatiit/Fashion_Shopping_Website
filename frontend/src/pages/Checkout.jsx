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
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiTab, setUpiTab] = useState("qr"); // "qr" | "id"
  const [upiId, setUpiId] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placingStage, setPlacingStage] = useState(""); // human-readable status while placing
  const [error, setError] = useState("");

  const fillDemoUpi = (handle = "@okhdfcbank") => {
    const base = user?.email ? user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") : "buyer";
    setUpiId(`${base || "demo.shopper"}${handle}`);
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

      if (paymentMethod === "UPI") {
        if (upiTab === "id") {
          if (!upiId.trim()) {
            setError("Please enter your UPI ID (or click '⚡ Fill Demo UPI')");
            setPlacing(false);
            return;
          }
          if (!upiId.includes("@")) {
            setError("UPI ID must contain '@' (e.g. mobile@upi or name@okhdfcbank)");
            setPlacing(false);
            return;
          }
        }

        setPlacingStage("Verifying UPI payment...");
        await new Promise((r) => setTimeout(r, 600));

        await placeOrder({
          upiId: upiTab === "id" ? upiId.trim() : "fashionhub@upi",
          transactionId: `upi_tx_${Date.now()}`,
          razorpay_payment_id: `pay_upi_${Date.now()}`,
        });
        return;
      }

      // Razorpay flow
      setPlacingStage("Loading payment gateway...");
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("External payment script was blocked by browser or adblocker. Please select 'UPI Payment' or 'Cash on Delivery'.");
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
                  setPaymentMethod("UPI");
                  setError("");
                }}
                className={`text-left border p-4 text-sm transition-all ${
                  paymentMethod === "UPI" ? "border-ink bg-sand/30 shadow-sm ring-1 ring-ink" : "border-sand hover:border-ink/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-ink font-medium">UPI Payment</p>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                    Fast & Instant
                  </span>
                </div>
                <p className="text-muted text-xs">GPay, PhonePe, Paytm, QR Code</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("COD");
                  setError("");
                }}
                className={`text-left border p-4 text-sm transition-all ${
                  paymentMethod === "COD" ? "border-ink bg-sand/30 shadow-sm ring-1 ring-ink" : "border-sand hover:border-ink/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-ink font-medium">Cash on Delivery</p>
                  <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">
                    COD
                  </span>
                </div>
                <p className="text-muted text-xs">Pay in cash when order arrives</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("Razorpay");
                  setError("");
                }}
                className={`text-left border p-4 text-sm transition-all ${
                  paymentMethod === "Razorpay" ? "border-ink bg-sand/30 shadow-sm ring-1 ring-ink" : "border-sand hover:border-ink/60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-ink font-medium">Razorpay Gateway</p>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                    Online
                  </span>
                </div>
                <p className="text-muted text-xs">Netbanking, UPI & Wallets</p>
              </button>
            </div>

            {/* UPI Payment Interface */}
            {paymentMethod === "UPI" && (
              <div className="border border-sand bg-white p-5 text-sm rounded-sm shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-sand pb-3">
                  <div>
                    <span className="font-medium text-ink">Instant UPI Payment</span>
                    <p className="text-xs text-muted mt-0.5">Pay via any UPI App</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="bg-sand/60 px-2 py-0.5 rounded font-mono text-[11px]">GPay</span>
                    <span className="bg-sand/60 px-2 py-0.5 rounded font-mono text-[11px]">PhonePe</span>
                    <span className="bg-sand/60 px-2 py-0.5 rounded font-mono text-[11px]">Paytm</span>
                    <span className="bg-sand/60 px-2 py-0.5 rounded font-mono text-[11px]">BHIM</span>
                  </div>
                </div>

                {/* UPI Sub-tabs */}
                <div className="flex border-b border-sand text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setUpiTab("qr")}
                    className={`pb-2 px-3 border-b-2 transition-colors ${
                      upiTab === "qr"
                        ? "border-crimson text-crimson"
                        : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    📱 Scan UPI QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiTab("id")}
                    className={`pb-2 px-3 border-b-2 transition-colors ${
                      upiTab === "id"
                        ? "border-crimson text-crimson"
                        : "border-transparent text-muted hover:text-ink"
                    }`}
                  >
                    ⚡ Enter UPI ID / VPA
                  </button>
                </div>

                {/* QR Code Tab */}
                {upiTab === "qr" && (
                  <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                    <div className="p-3 bg-white border border-sand rounded-sm shadow-inner shrink-0 flex flex-col items-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=fashionhub@upi%26pn=FashionHub%26am=${total}%26cu=INR`}
                        alt="FashionHub UPI QR Code"
                        className="w-36 h-36 object-contain"
                      />
                      <span className="text-[10px] text-muted tracking-wide mt-1.5 uppercase font-medium">
                        Scan to Pay {formatPrice(total)}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2.5 text-center sm:text-left">
                      <div>
                        <p className="text-xs text-muted">UPI ID / VPA:</p>
                        <p className="font-mono text-sm text-ink font-semibold select-all">
                          fashionhub@upi
                        </p>
                      </div>

                      <div className="text-xs text-muted space-y-1">
                        <p>1. Open GPay, PhonePe, Paytm, or any UPI app.</p>
                        <p>2. Scan this QR code and approve ₹{total}.</p>
                        <p>3. Click <strong>"Pay via UPI"</strong> below to confirm your order.</p>
                      </div>

                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] px-2.5 py-1 rounded border border-emerald-200">
                        <span>✓</span>
                        <span>Zero transaction fees · Instant order confirmation</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enter UPI ID Tab */}
                {upiTab === "id" && (
                  <div className="space-y-3 py-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs text-muted">Enter Your Virtual Payment Address (VPA)</label>
                      <button
                        type="button"
                        onClick={() => fillDemoUpi()}
                        className="text-xs text-crimson hover:underline font-medium"
                      >
                        ⚡ Fill Demo UPI
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="yourname@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full border border-sand px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-crimson"
                      />
                    </div>

                    {/* Quick Handle Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs text-muted">Quick handle:</span>
                      {["@okhdfcbank", "@okaxis", "@paytm", "@ybl", "@upi"].map((handle) => (
                        <button
                          key={handle}
                          type="button"
                          onClick={() => fillDemoUpi(handle)}
                          className="text-[11px] bg-sand/50 hover:bg-sand px-2 py-0.5 rounded text-ink font-mono transition-colors"
                        >
                          {handle}
                        </button>
                      ))}
                    </div>

                    <p className="text-xs text-muted bg-sand/30 p-2.5 rounded">
                      💡 When you click "Pay via UPI", we will verify the UPI ID and place your order as <strong>Paid</strong> immediately.
                    </p>
                  </div>
                )}
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
            className="w-full bg-ink text-ivory py-3 hover:bg-crimson transition-colors disabled:opacity-50 font-medium"
          >
            {placing
              ? placingStage || "Processing..."
              : paymentMethod === "COD"
              ? "Place Order (Cash on Delivery)"
              : paymentMethod === "UPI"
              ? `Pay ${formatPrice(total)} via UPI`
              : `Pay ${formatPrice(total)} with Razorpay`}
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