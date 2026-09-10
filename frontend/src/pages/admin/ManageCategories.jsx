import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "", parentCategory: "" });
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
        slug: formData.slug,
        parentCategory: formData.parentCategory || null,
      });
      setFormData({ name: "", slug: "", parentCategory: "" });
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
          <form onSubmit={handleSubmit} className="border border-sand p-5 mb-8 grid grid-cols-3 gap-3 text-sm">
            <input
              placeholder="Name (e.g. Men)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
            />
            <input
              placeholder="Slug (e.g. men)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
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
            <button type="submit" className="col-span-3 bg-ink text-ivory py-2 hover:bg-crimson transition-colors">
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
                <span className="text-ink">{cat.displayName}</span>
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