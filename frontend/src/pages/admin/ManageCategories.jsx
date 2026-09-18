import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "", image: "", parentCategory: "" });
  const [error, setError] = useState("");

  const flattenCategories = (tree, prefix = "") =>
    tree.flatMap((cat) => [
      { ...cat, displayName: prefix + cat.name },
      ...flattenCategories(cat.children || [], prefix + cat.name + " > "),
    ]);

  const fetchCategories = async () => {
    try {
      const { data } = await axiosInstance.get("/categories");
      setCategories(flattenCategories(data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axiosInstance.post("/categories", {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        image: formData.image || undefined,
        parentCategory: formData.parentCategory || null,
      });
      setFormData({ name: "", slug: "", image: "", parentCategory: "" });
      setShowForm(false);
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create category");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/categories/${id}`);
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete category");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">
      <AdminSidebar />
      <div className="flex-1">
        <div className="flex justify-between items-center mb-10">
          <h1 className="font-display text-3xl text-ink">Categories</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-ink text-ivory px-5 py-2 text-sm hover:bg-crimson transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Category"}
          </button>
        </div>

        {error && <p className="text-sm text-crimson mb-4">{error}</p>}

        {showForm && (
          <form onSubmit={handleSubmit} className="border border-sand p-5 mb-8 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <input
              placeholder="Name (e.g. Kids Wear)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
            />
            <input
              placeholder="Slug (optional, e.g. kids-wear)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
            />
            <select
              value={formData.parentCategory}
              onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
            >
              <option value="">No parent (top-level)</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.displayName}</option>
              ))}
            </select>
            <input
              placeholder="Image URL (optional — leave blank for automatic stylish photo)"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="col-span-1 md:col-span-3 border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
            />
            <button type="submit" className="col-span-1 md:col-span-3 bg-ink text-ivory py-2 hover:bg-crimson transition-colors">
              Create Category
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat._id} className="flex justify-between items-center border border-sand px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-sand shrink-0 border border-sand">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-xs text-muted font-bold">
                        {cat.name?.[0]}
                      </span>
                    )}
                  </div>
                  <span className="text-ink font-medium">{cat.displayName}</span>
                </div>
                <button onClick={() => handleDelete(cat._id)} className="text-muted hover:text-crimson transition-colors">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;