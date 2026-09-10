import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ProductForm from "../../components/admin/ProductForm";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await axiosInstance.get("/products?limit=50");
      setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/products/${id}`);
      await fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">
      <AdminSidebar />
      <div className="flex-1">
        <div className="flex justify-between items-center mb-10">
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-ink text-ivory px-5 py-2 text-sm hover:bg-crimson transition-colors">
            {showForm ? "Cancel" : "+ Add Product"}
          </button>
        </div>

        {showForm && <ProductForm onSuccess={() => { setShowForm(false); fetchProducts(); }} />}

        {loading ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : (
          <div className="space-y-2">
            {products.map((product) => (
              <div key={product._id} className="flex items-center justify-between border border-sand px-4 py-3 text-sm">
                <div className="flex items-center gap-4">
                  <img src={product.images?.[0]?.url} alt="" className="w-10 h-12 object-cover bg-sand" />
                  <div>
                    <p className="text-ink">{product.name}</p>
                    <p className="text-muted">₹{product.price} · Stock: {product.stock}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(product._id)} className="text-muted hover:text-crimson transition-colors">
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

export default ManageProducts;