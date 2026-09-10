import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import useCart from "../hooks/useCart";
import useWishlist from "../hooks/useWishlist";
import ReviewList from "../components/product/ReviewList";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = product && isInWishlist(product._id);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axiosInstance.get(`/products/${id}`);
        setProduct(data);
        setSelectedSize(data.sizes?.[0] || "");
        setSelectedColor(data.colors?.[0] || "");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(product._id, 1, selectedSize, selectedColor);
      setMessage("Added to bag");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not add to bag");
    } finally {
      setAdding(false);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  if (loading)
    return <p className="text-center text-muted py-20">Loading...</p>;
  if (!product)
    return <p className="text-center text-muted py-20">Product not found.</p>;

  const hasDiscount = product.discountPrice > 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-[3/4] bg-sand mb-3 overflow-hidden">
            <img
              src={product.images?.[selectedImage]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-3">
            {product.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-16 h-20 bg-sand overflow-hidden border ${
                  selectedImage === i ? "border-ink" : "border-transparent"
                }`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-muted mb-2">{product.category?.name}</p>
          <h1 className="font-display text-3xl text-ink mb-4">{product.name}</h1>

          <div className="flex items-center gap-3 mb-6">
            {hasDiscount ? (
              <>
                <span className="text-2xl text-crimson font-medium">
                  ₹{product.discountPrice}
                </span>
                <span className="text-muted line-through">₹{product.price}</span>
              </>
            ) : (
              <span className="text-2xl text-ink font-medium">
                ₹{product.price}
              </span>
            )}
          </div>

          <p className="text-muted mb-8 leading-relaxed">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-ink mb-2">Size</p>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm border ${
                      selectedSize === size
                        ? "border-ink bg-ink text-ivory"
                        : "border-sand text-ink hover:border-ink"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-ink mb-2">Color</p>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-sm border ${
                      selectedColor === color
                        ? "border-ink bg-ink text-ivory"
                        : "border-sand text-ink hover:border-ink"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className="w-full bg-ink text-ivory py-3 hover:bg-crimson transition-colors disabled:opacity-50"
          >
            {product.stock === 0
              ? "Out of Stock"
              : adding
                ? "Adding..."
                : "Add to Bag"}
          </button>
          <button
            onClick={() =>
              inWishlist
                ? removeFromWishlist(product._id)
                : addToWishlist(product._id)
            }
            className="w-full border border-ink text-ink py-3 mt-3 hover:border-crimson hover:text-crimson transition-colors"
          >
            {inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
          </button>
          {message && <p className="text-sm text-crimson mt-3">{message}</p>}
        </div>
      </div>

      <ReviewList productId={product._id} />
    </div>
  );
};

export default ProductDetails;