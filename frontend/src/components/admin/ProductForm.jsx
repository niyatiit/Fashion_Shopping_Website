import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

const ProductForm = ({ onSuccess, onCancel, initialProduct = null }) => {
  const isEditMode = Boolean(initialProduct);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: initialProduct?.name || "",
    description: initialProduct?.description || "",
    price: initialProduct?.price || "",
    discountPrice: initialProduct?.discountPrice || "",
    category: initialProduct?.category?._id || initialProduct?.category || "",
    brand: initialProduct?.brand || "",
    sizes: initialProduct?.sizes?.join(", ") || "",
    colors: initialProduct?.colors?.join(", ") || "",
    stock: initialProduct?.stock ?? "",
    isFeatured: initialProduct?.isFeatured || false,
  });
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await axiosInstance.get("/categories");
      const flatten = (tree, prefix = "") =>
        tree.flatMap((c) => [{ ...c, displayName: prefix + c.name }, ...flatten(c.children || [], prefix + c.name + " > ")]);
      setCategories(flatten(data));
    };
    fetchCats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEditMode && images.length === 0) {
      setError("Please select at least one image");
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("discountPrice", formData.discountPrice || 0);
      data.append("category", formData.category);
      data.append("brand", formData.brand);
      data.append("stock", formData.stock);
      data.append("isFeatured", formData.isFeatured);
      formData.sizes.split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => data.append("sizes", s));
      formData.colors.split(",").map((c) => c.trim()).filter(Boolean).forEach((c) => data.append("colors", c));
      images.forEach((img) => data.append("images", img));

      if (isEditMode) {
        await axiosInstance.put(`/products/${initialProduct._id}`, data);
      } else {
        await axiosInstance.post("/products", data);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || `Could not ${isEditMode ? "update" : "create"} product`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-sand p-5 mb-8 space-y-3 text-sm">
      {error && <p className="text-crimson">{error}</p>}

      <input placeholder="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />
      <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={3} className="w-full border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />

      <div className="grid grid-cols-3 gap-3">
        <input type="number" placeholder="Price" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />
        <input type="number" placeholder="Discount Price (optional)" value={formData.discountPrice} onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })} className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />
        <input type="number" placeholder="Stock" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />
      </div>

      <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full border border-sand px-3 py-2 focus:outline-none focus:border-crimson">
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>{cat.displayName}</option>
        ))}
      </select>

      <input placeholder="Brand" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />
      <input placeholder="Sizes (comma separated, e.g. S,M,L)" value={formData.sizes} onChange={(e) => setFormData({ ...formData, sizes: e.target.value })} className="w-full border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />
      <input placeholder="Colors (comma separated, e.g. Red,Blue)" value={formData.colors} onChange={(e) => setFormData({ ...formData, colors: e.target.value })} className="w-full border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />

      <label className="flex items-center gap-2 text-muted">
        <input
          type="checkbox"
          checked={formData.isFeatured}
          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
        />
        Show in "Featured Products" on the homepage
      </label>

      {isEditMode && initialProduct.images?.length > 0 && (
        <div>
          <label className="block text-muted mb-2">Current Images</label>
          <div className="flex gap-2">
            {initialProduct.images.map((img, i) => (
              <img key={i} src={img.url} alt="" className="w-14 h-16 object-cover bg-sand" />
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-muted mb-2">
          {isEditMode ? "Replace Images (optional — leave empty to keep current)" : "Product Images"}
        </label>
        <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files))} className="text-sm" />
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="bg-ink text-ivory px-5 py-2 hover:bg-crimson transition-colors disabled:opacity-50">
          {submitting ? (isEditMode ? "Updating..." : "Uploading...") : isEditMode ? "Update Product" : "Create Product"}
        </button>
        {isEditMode && (
          <button type="button" onClick={onCancel} className="text-muted hover:text-ink transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;