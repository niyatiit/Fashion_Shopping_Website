import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const hasDiscount = product.discountPrice > 0;

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="aspect-[3/4] bg-sand overflow-hidden mb-3">
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <h3 className="text-sm text-ink mb-1">{product.name}</h3>
      <div className="flex items-center gap-2 text-sm">
        {hasDiscount ? (
          <>
            <span className="text-crimson font-medium">₹{product.discountPrice}</span>
            <span className="text-muted line-through">₹{product.price}</span>
          </>
        ) : (
          <span className="text-ink font-medium">₹{product.price}</span>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;