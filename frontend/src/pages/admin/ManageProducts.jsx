import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import AdminSidebar from "../../components/admin/AdminSidebar";
import ProductForm from "../../components/admin/ProductForm";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 5;

  const fetchProducts = async (pageToFetch = page) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/products?limit=${limit}&page=${pageToFetch}`);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.totalProducts || 0);
      setPage(data.currentPage || pageToFetch);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axiosInstance.delete(`/products/${id}`);
      // If last item on page deleted, go back one page if possible
      const newPage = products.length === 1 && page > 1 ? page - 1 : page;
      fetchProducts(newPage);
    } catch (err) {
      console.error(err);
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex gap-10">
      <AdminSidebar />
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl text-ink">Products</h1>
            <p className="text-xs text-muted mt-1">
              Showing {totalProducts > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, totalProducts)} of {totalProducts} products (5 per page)
            </p>
          </div>
          {!showForm && (
            <button
              onClick={openAdd}
              className="bg-ink text-ivory px-5 py-2.5 text-sm hover:bg-crimson transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>+ Add Product</span>
            </button>
          )}
        </div>

        {showForm && (
          <ProductForm
            initialProduct={editingProduct}
            onSuccess={() => {
              closeForm();
              fetchProducts(1);
            }}
            onCancel={closeForm}
          />
        )}

        {loading ? (
          <div className="py-16 text-center text-muted text-sm border border-sand">
            <div className="inline-block w-6 h-6 border-2 border-ink border-t-transparent rounded-full animate-spin mb-2"></div>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-muted text-sm border border-dashed border-sand">
            <p className="mb-3">No products found on this page.</p>
            {page > 1 && (
              <button
                onClick={() => setPage(1)}
                className="text-xs underline text-ink hover:text-crimson"
              >
                Go to page 1
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between border border-sand bg-white p-4 text-sm hover:border-ink/40 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.images?.[0]?.url || "https://placehold.co/100x120?text=Product"}
                      alt=""
                      className="w-12 h-14 object-cover bg-sand rounded-xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-ink">{product.name}</p>
                        {product.isFeatured && (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold">
                            Featured
                          </span>
                        )}
                        {product.fabric && (
                          <span className="bg-sand/60 text-ink text-[11px] px-2 py-0.5 rounded font-mono">
                            🧵 {product.fabric}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted mt-1">
                        <span className="font-medium text-ink">₹{product.price}</span>
                        {product.discountPrice > 0 && (
                          <span className="text-crimson font-medium">Sale: ₹{product.discountPrice}</span>
                        )}
                        <span>· Stock: <strong className={product.stock <= 5 ? "text-crimson" : "text-ink"}>{product.stock}</strong></span>
                        {product.category?.name && <span>· Cat: {product.category.name}</span>}
                        {product.sizes?.length > 0 && <span>· Sizes: {product.sizes.join(", ")}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => openEdit(product)}
                      className="border border-sand px-3 py-1.5 text-xs text-ink hover:border-ink hover:text-ink transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="border border-sand px-3 py-1.5 text-xs text-muted hover:border-crimson hover:text-crimson transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-sand pt-5 mt-4">
                <p className="text-xs text-muted">
                  Page {page} of {totalPages} ({totalProducts} total products)
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="border border-sand px-3 py-1 text-xs text-ink hover:border-ink disabled:opacity-40 disabled:hover:border-sand transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-7 h-7 text-xs flex items-center justify-center transition-colors ${
                          page === pageNum
                            ? "bg-ink text-ivory font-medium"
                            : "border border-sand text-ink hover:border-ink"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="border border-sand px-3 py-1 text-xs text-ink hover:border-ink disabled:opacity-40 disabled:hover:border-sand transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;