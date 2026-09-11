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
      <div className="flex-1">
        <div className="flex justify-between items-center mb-10">
          <h1 className="font-display text-3xl text-ink">Coupons</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-ink text-ivory px-5 py-2 text-sm hover:bg-crimson transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Coupon"}
          </button>
        </div>

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