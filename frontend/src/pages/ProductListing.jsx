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
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sort: "",
    keyword: searchParams.get("keyword") || "",
  });

  // Keep filters in sync with the URL (e.g. searching again from the navbar
  // while already on this page, or landing here via a "?onSale=true" link).
  useEffect(() => {
    setFilters((prev) => ({ ...prev, keyword: searchParams.get("keyword") || "" }));
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
        if (searchParams.get("category")) params.append("category", searchParams.get("category"));
        if (searchParams.get("onSale")) params.append("onSale", searchParams.get("onSale"));

        const { data } = await axiosInstance.get(`/products?${params.toString()}`);
        setProducts(data.products);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, searchParams]);

  const heading = filters.keyword
    ? `Results for "${filters.keyword}"`
    : searchParams.get("onSale")
      ? "On Sale"
      : "Shop All";

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-10">{heading}</h1>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        <ProductFilters filters={filters} setFilters={setFilters} />
        {error ? (
          <p className="text-center text-crimson py-20">{error}</p>
        ) : (
          <ProductGrid products={products} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default ProductListing;