import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import ProductGrid from "../components/product/ProductGrid";

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await axiosInstance.get("/products?limit=8");
        setFeatured(data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="font-display text-5xl md:text-6xl leading-tight text-ink mb-6">
            Wear what<br />moves you.
          </h1>
          <p className="text-muted max-w-md mb-8">
            Curated fashion for everyday moments — new arrivals dropping weekly, styled for how you actually live.
          </p>
          <Link
            to="/products"
            className="inline-block bg-ink text-ivory px-8 py-3 hover:bg-crimson transition-colors"
          >
            Shop the collection
          </Link>
        </div>
        <div className="aspect-[4/5] bg-sand" />
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-2xl text-ink">New Arrivals</h2>
          <Link to="/products" className="text-sm text-muted hover:text-crimson transition-colors">
            View all
          </Link>
        </div>
        <ProductGrid products={featured} loading={loading} />
      </section>
    </div>
  );
};

export default Home;