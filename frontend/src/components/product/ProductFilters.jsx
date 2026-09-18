import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];
const COLOR_OPTIONS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Pink",
  "Grey",
  "Beige",
  "Navy",
];

const flattenCategories = (tree, prefix = "") =>
  tree.flatMap((cat) => [
    { ...cat, displayName: prefix + cat.name },
    ...flattenCategories(cat.children || [], prefix + cat.name + " > "),
  ]);

const ProductFilters = ({ filters, setFilters }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/categories")
      .then(({ data }) => setCategories(flattenCategories(data)))
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-lg text-ink mb-3">Category</h3>
        <select
          value={filters.category}
          onChange={(e) => handleChange("category", e.target.value)}
          className="w-full border border-sand px-2 py-2 text-sm focus:outline-none focus:border-crimson"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.displayName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-display text-lg text-ink mb-3">Price</h3>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleChange("minPrice", e.target.value)}
            className="w-full border border-sand px-2 py-1.5 focus:outline-none focus:border-crimson"
          />
          <span className="text-muted">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleChange("maxPrice", e.target.value)}
            className="w-full border border-sand px-2 py-1.5 focus:outline-none focus:border-crimson"
          />
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-ink mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() =>
                handleChange(
                  "size",
                  (filters.size || "").toUpperCase() === size.toUpperCase() ? "" : size
                )
              }
              className={`px-3 py-1.5 text-xs border ${
                (filters.size || "").toUpperCase() === size.toUpperCase()
                  ? "border-ink bg-ink text-ivory"
                  : "border-sand text-ink hover:border-ink"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-ink mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() =>
                handleChange(
                  "color",
                  (filters.color || "").toLowerCase() === color.toLowerCase() ? "" : color
                )
              }
              className={`px-3 py-1.5 text-xs border ${
                (filters.color || "").toLowerCase() === color.toLowerCase()
                  ? "border-ink bg-ink text-ivory"
                  : "border-sand text-ink hover:border-ink"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg text-ink mb-3">Brand</h3>
        <input
          type="text"
          placeholder="e.g. Zara"
          value={filters.brand}
          onChange={(e) => handleChange("brand", e.target.value)}
          className="w-full border border-sand px-2 py-1.5 text-sm focus:outline-none focus:border-crimson"
        />
      </div>

      <div>
        <h3 className="font-display text-lg text-ink mb-3">Sort By</h3>
        <select
          value={filters.sort}
          onChange={(e) => handleChange("sort", e.target.value)}
          className="w-full border border-sand px-2 py-2 text-sm focus:outline-none focus:border-crimson"
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <button
        onClick={() =>
          setFilters((prev) => ({
            minPrice: "",
            maxPrice: "",
            sort: "",
            category: "",
            size: "",
            color: "",
            brand: "",
            keyword: prev.keyword,
          }))
        }
        className="text-sm text-muted hover:text-crimson transition-colors"
      >
        Clear filters
      </button>
    </div>
  );
};

export default ProductFilters;
