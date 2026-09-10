const ProductFilters = ({ filters, setFilters }) => {
  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
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
        onClick={() => setFilters({ minPrice: "", maxPrice: "", sort: "", keyword: filters.keyword })}
        className="text-sm text-muted hover:text-crimson transition-colors"
      >
        Clear filters
      </button>
    </div>
  );
};

export default ProductFilters;