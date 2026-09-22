import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { formatPrice } from "../../utils/formatPrice";

const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: "",
  maxDiscount: "",
  expiryDate: "",
  usageLimit: "",
};

const ManageCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const fetchCoupons = async () => {
    try {
      const { data } = await axiosInstance.get("/coupons");
      setCoupons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSeedSamples = async () => {
    try {
      setSeeding(true);
      setError("");
      await axiosInstance.post("/coupons/seed-samples");
      await fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Could not seed sample coupons");
    } finally {
      setSeeding(false);
    }
  };

  const applyPreset = (preset) => {
    const nextMonth = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    if (preset === "welcome") {
      setFormData({
        code: "WELCOME10",
        discountType: "percentage",
        discountValue: "10",
        minOrderValue: "499",
        maxDiscount: "200",
        expiryDate: nextMonth,
        usageLimit: "500",
      });
    } else if (preset === "flat") {
      setFormData({
        code: "FLAT150",
        discountType: "flat",
        discountValue: "150",
        minOrderValue: "999",
        maxDiscount: "",
        expiryDate: nextMonth,
        usageLimit: "250",
      });
    } else if (preset === "festive") {
      setFormData({
        code: "FESTIVE50",
        discountType: "percentage",
        discountValue: "50",
        minOrderValue: "1999",
        maxDiscount: "1000",
        expiryDate: nextMonth,
        usageLimit: "100",
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setSaving(true);
      await axiosInstance.post("/coupons", {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      });
      setFormData(emptyForm);
      setShowForm(false);
      await fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await axiosInstance.patch(`/coupons/${id}/toggle`);
      await fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update coupon");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/coupons/${id}`);
      await fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete coupon");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-ink">Coupons & Discounts</h1>
            <p className="text-xs text-muted mt-1">
              Create and manage promotional discount promo codes for shoppers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedSamples}
              disabled={seeding}
              className="border border-sand bg-white text-ink px-4 py-2 text-xs hover:border-ink transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>⚡</span>
              <span>{seeding ? "Seeding..." : "Quick Seed Sample Coupons"}</span>
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-ink text-ivory px-5 py-2 text-xs hover:bg-crimson transition-colors shadow-xs"
            >
              {showForm ? "Cancel" : "+ Add Coupon"}
            </button>
          </div>
        </div>

        {/* Educational "How Coupons Work" Guide */}
        {showGuide && (
          <div className="border border-sand bg-sand/20 p-5 mb-8 rounded-xs relative">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <h3 className="font-display text-base text-ink font-semibold">
                  How the Coupon Concept Works
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-xs text-muted hover:text-ink"
              >
                ✕ Dismiss
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-xs text-muted leading-relaxed">
              <div className="bg-white p-3.5 border border-sand rounded-xs">
                <p className="font-semibold text-ink mb-1">1. Percentage vs Flat</p>
                <p>
                  <strong>Percentage:</strong> E.g. <span className="font-mono text-crimson">10%</span> off deductions based on cart value. You can set a <em>Max Discount</em> (e.g. max ₹200) to cap large orders.<br/>
                  <strong>Flat:</strong> E.g. <span className="font-mono text-crimson">₹150</span> directly deducted from the total.
                </p>
              </div>

              <div className="bg-white p-3.5 border border-sand rounded-xs">
                <p className="font-semibold text-ink mb-1">2. Minimum Order Value</p>
                <p>
                  Requires customers to have a cart total above a threshold before applying (e.g. Min order ₹999). If their cart is ₹700, they are prompted to add ₹299 more!
                </p>
              </div>

              <div className="bg-white p-3.5 border border-sand rounded-xs">
                <p className="font-semibold text-ink mb-1">3. Customer Checkout Flow</p>
                <p>
                  During checkout in the summary box, customer types your code (e.g. <span className="font-mono font-bold text-ink">WELCOME10</span>) and clicks Apply. The system validates and instantly subtracts the savings!
                </p>
              </div>
            </div>

            {/* Quick Fill Preset Buttons */}
            <div className="mt-4 pt-3 border-t border-sand flex flex-wrap items-center gap-2 text-xs">
              <span className="text-ink font-medium">Quick Template Presets:</span>
              <button
                onClick={() => applyPreset("welcome")}
                className="bg-white border border-sand hover:border-ink px-2.5 py-1 rounded text-ink font-medium transition-colors"
              >
                10% Welcome Discount (Min ₹499)
              </button>
              <button
                onClick={() => applyPreset("flat")}
                className="bg-white border border-sand hover:border-ink px-2.5 py-1 rounded text-ink font-medium transition-colors"
              >
                Flat ₹150 Off (Min ₹999)
              </button>
              <button
                onClick={() => applyPreset("festive")}
                className="bg-white border border-sand hover:border-ink px-2.5 py-1 rounded text-ink font-medium transition-colors"
              >
                50% Festive Mega Deal (Min ₹1,999)
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-crimson mb-4">{error}</p>}

        {showForm && (
          <form onSubmit={handleSubmit} className="border border-sand p-5 mb-8 grid grid-cols-3 gap-3 text-sm">
            <input
              placeholder="Code (e.g. FASHION10)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson uppercase"
            />
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
            >
              <option value="percentage">Percentage off</option>
              <option value="flat">Flat amount off</option>
            </select>
            <input
              type="number"
              min="0"
              placeholder={formData.discountType === "percentage" ? "Discount % (e.g. 10)" : "Discount ₹ (e.g. 200)"}
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              required
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
            />
            <input
              type="number"
              min="0"
              placeholder="Min order value (optional)"
              value={formData.minOrderValue}
              onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
            />
            {formData.discountType === "percentage" && (
              <input
                type="number"
                min="0"
                placeholder="Max discount cap ₹ (optional)"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
              />
            )}
            <input
              type="number"
              min="0"
              placeholder="Usage limit (optional)"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
            />
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              required
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
            />
            <button
              type="submit"
              disabled={saving}
              className="col-span-3 bg-ink text-ivory py-2 hover:bg-crimson transition-colors disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Coupon"}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : coupons.length === 0 ? (
          <p className="text-sm text-muted">No coupons yet.</p>
        ) : (
          <div className="space-y-2">
            {coupons.map((c) => (
              <div key={c._id} className="flex justify-between items-center border border-sand px-4 py-3 text-sm">
                <div>
                  <span className="text-ink font-medium">{c.code}</span>
                  <span className="text-muted ml-3">
                    {c.discountType === "percentage" ? `${c.discountValue}% off` : `${formatPrice(c.discountValue)} off`}
                    {c.minOrderValue > 0 && ` · min ${formatPrice(c.minOrderValue)}`}
                    {" · expires "}
                    {new Date(c.expiryDate).toLocaleDateString("en-IN")}
                  </span>
                  {!c.isActive && <span className="text-crimson ml-3">Inactive</span>}
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={() => handleToggle(c._id)} className="text-muted hover:text-ink transition-colors">
                    {c.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="text-muted hover:text-crimson transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCoupons;