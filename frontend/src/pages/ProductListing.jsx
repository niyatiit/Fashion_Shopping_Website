import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import ProductGrid from "../components/product/ProductGrid";
import ProductFilters from "../components/product/ProductFilters";

const ProductListing = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sort: "",
    category: searchParams.get("category") || "",
    size: "",
    fabric: "",
    brand: "",
    keyword: searchParams.get("keyword") || "",
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      keyword: searchParams.get("keyword") || "",
      category: searchParams.get("category") || prev.category,
    }));
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams();
        if (filters.keyword) params.append("keyword", filters.keyword);
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        if (filters.sort) params.append("sort", filters.sort);
        if (filters.category) params.append("category", filters.category);
        if (filters.size) params.append("size", filters.size);
        if (filters.fabric) params.append("fabric", filters.fabric);
        if (filters.brand) params.append("brand", filters.brand);
        if (searchParams.get("onSale")) params.append("onSale", searchParams.get("onSale"));
        params.append("page", page);

        const { data } = await axiosInstance.get(`/products?${params.toString()}`);
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, page, searchParams]);

  const handleSetFilters = (updater) => {
    setFilters(updater);
    setPage(1);
  };

  const heading = filters.keyword
    ? `Results for "${filters.keyword}"`
    : searchParams.get("onSale")
      ? "On Sale"
      : "Shop All";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-10">{heading}</h1>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        <ProductFilters filters={filters} setFilters={handleSetFilters} />
        <div>
          {error ? (
            <p className="text-center text-crimson py-20">{error}</p>
          ) : (
            <>
              <ProductGrid products={products} loading={loading} />
              {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border border-sand px-4 py-2 text-sm text-ink hover:border-ink transition-colors disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted px-3">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border border-sand px-4 py-2 text-sm text-ink hover:border-ink transition-colors disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;