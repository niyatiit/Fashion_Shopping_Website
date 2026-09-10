import ProductCard from "./ProductCard";

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return <p className="text-center text-muted py-20">Loading products...</p>;
  }

  if (!products || products.length === 0) {
    return <p className="text-center text-muted py-20">No products found.</p>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;