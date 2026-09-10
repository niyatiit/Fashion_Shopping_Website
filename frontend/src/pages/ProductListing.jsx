import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import ProductGrid from "../components/product/ProductGrid";
import ProductFilters from "../components/product/ProductFilters";

const ProductListing = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    sort: "",
    keyword: searchParams.get("keyword") || "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.keyword) params.append("keyword", filters.keyword);
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        if (filters.sort) params.append("sort", filters.sort);

        const { data } = await axiosInstance.get(`/products?${params.toString()}`);
        setProducts(data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-10">
        {filters.keyword ? `Results for "${filters.keyword}"` : "Shop All"}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        <ProductFilters filters={filters} setFilters={setFilters} />
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
};

export default ProductListing;