import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import ProductGrid from "../components/product/ProductGrid";
import SectionHeader from "../components/home/SectionHeader";
import CategoryCard from "../components/home/CategoryCard";
import heroImage from "../assets/hero.jpg";

// Generic section state: { items, loading, error }
const initialSection = { items: [], loading: true, error: "" };

const Home = () => {
  const [categories, setCategories] = useState({ items: [], loading: true, error: "" });
  const [featured, setFeatured] = useState(initialSection);
  const [newArrivals, setNewArrivals] = useState(initialSection);
  const [bestSellers, setBestSellers] = useState(initialSection);
  const [saleProducts, setSaleProducts] = useState(initialSection);

  useEffect(() => {
    // Categories
    axiosInstance
      .get("/categories")
      .then(({ data }) => setCategories({ items: data.slice(0, 6), loading: false, error: "" }))
      .catch(() => setCategories({ items: [], loading: false, error: "Could not load categories." }));

    // Featured products
    axiosInstance
      .get("/products?isFeatured=true&limit=8")
      .then(({ data }) => setFeatured({ items: data.products, loading: false, error: "" }))
      .catch(() => setFeatured({ items: [], loading: false, error: "Could not load featured products." }));

    // New arrivals (default sort is newest-first on the backend)
    axiosInstance
      .get("/products?limit=8")
      .then(({ data }) => setNewArrivals({ items: data.products, loading: false, error: "" }))
      .catch(() => setNewArrivals({ items: [], loading: false, error: "Could not load new arrivals." }));

    // Best sellers — ranked from real order data on the backend
    axiosInstance
      .get("/products/best-sellers?limit=8")
      .then(({ data }) => setBestSellers({ items: data, loading: false, error: "" }))
      .catch(() => setBestSellers({ items: [], loading: false, error: "Could not load best sellers." }));

    // On-sale products
    axiosInstance
      .get("/products?onSale=true&limit=8")
      .then(({ data }) => setSaleProducts({ items: data.products, loading: false, error: "" }))
      .catch(() => setSaleProducts({ items: [], loading: false, error: "Could not load sale items." }));
  }, []);

  const renderSection = (section) =>
    section.error ? (
      <p className="text-center text-crimson py-16 text-sm">{section.error}</p>
    ) : (
      <ProductGrid products={section.items} loading={section.loading} />
    );

  return (
    <div>
      {/* Promo strip */}
      <div className="bg-ink text-ivory text-center text-xs sm:text-sm py-2.5 px-4">
        Free shipping on orders over ₹1,999 · Use code{" "}
        <span className="text-crimson font-medium">FASHION10</span> for 10% off your first order
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block text-xs tracking-wide text-crimson border border-crimson px-3 py-1 mb-6">
            New Season Sale — Up to 40% Off
          </span>
          <h1 className="font-display text-5xl md:text-6xl leading-tight text-ink mb-6">
            Wear what
            <br />
            moves you.
          </h1>
          <p className="text-muted max-w-md mb-8">
            Curated fashion for everyday moments — new arrivals dropping weekly, styled for how you
            actually live.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/products"
              className="inline-block bg-ink text-ivory px-8 py-3 hover:bg-crimson transition-colors"
            >
              Shop Now
            </Link>
            <Link
              to="/products?onSale=true"
              className="inline-block border border-ink text-ink px-8 py-3 hover:border-crimson hover:text-crimson transition-colors"
            >
              View Sale
            </Link>
          </div>
        </div>
        <div className="aspect-[4/5] bg-sand overflow-hidden rounded-sm shadow-sm border border-sand">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=85"
            alt="Latest fashion collection"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
      </section>

      {/* Categories */}
      {(categories.loading || categories.items.length > 0) && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <SectionHeader title="Shop by Category" subtitle="Find your next favorite, sorted by category." />
          {categories.loading ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-sand rounded-full mb-3" />
                  <div className="h-3 bg-sand w-2/3 mx-auto" />
                </div>
              ))}
            </div>
          ) : categories.error ? (
            <p className="text-center text-crimson py-10 text-sm">{categories.error}</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
              {categories.items.map((cat) => (
                <CategoryCard key={cat._id} category={cat} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <SectionHeader
          title="Featured Products"
          subtitle="Hand-picked pieces we think you'll love."
          viewAllTo="/products?isFeatured=true"
        />
        {featured.error ? (
          <p className="text-center text-crimson py-16 text-sm">{featured.error}</p>
        ) : featured.loading || featured.items.length > 0 ? (
          renderSection(featured)
        ) : (
          <p className="text-center text-muted py-16 text-sm">
            No featured products yet — check back soon.
          </p>
        )}
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <SectionHeader title="New Arrivals" subtitle="Fresh off the rack." viewAllTo="/products" />
        {renderSection(newArrivals)}
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <SectionHeader title="Best Sellers" subtitle="What everyone's adding to their bag." viewAllTo="/products" />
        {renderSection(bestSellers)}
      </section>

      {/* Editorial Feature Showcase Banner */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="relative overflow-hidden bg-white border border-sand grid md:grid-cols-2 items-center">
          <div className="p-8 md:p-14 z-10">
            <span className="text-xs uppercase tracking-widest text-crimson font-medium mb-3 block">
              Spring / Summer 2026 Collection
            </span>
            <h2 className="font-display text-3xl md:text-4xl text-ink mb-4 leading-tight">
              Elegance in Every Detail.
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-6 max-w-md">
              Discover timeless staples and expressive silhouettes tailored to redefine everyday luxury. Hand-picked fabrics, conscious craftsmanship, and versatile aesthetics.
            </p>
            <Link
              to="/products"
              className="inline-block bg-ink text-ivory px-6 py-3 text-sm hover:bg-crimson transition-colors"
            >
              Explore Collection
            </Link>
          </div>
          <div className="aspect-[16/10] md:aspect-auto md:h-full overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&auto=format&fit=crop&q=85"
              alt="Fashion editorial showcase"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </section>

      {/* Sale section */}
      <section className="bg-sand/40 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-block text-xs tracking-wide text-ivory bg-crimson px-3 py-1 mb-4">
                Limited Time
              </span>
              <h2 className="font-display text-2xl md:text-3xl text-ink">On Sale Now</h2>
              <p className="text-sm text-muted mt-1">Deep discounts on select styles, while stock lasts.</p>
            </div>
            <Link
              to="/products?onSale=true"
              className="inline-block bg-ink text-ivory px-6 py-2.5 text-sm hover:bg-crimson transition-colors w-fit"
            >
              Shop the Sale
            </Link>
          </div>

          {saleProducts.error ? (
            <p className="text-center text-crimson py-16 text-sm">{saleProducts.error}</p>
          ) : saleProducts.loading || saleProducts.items.length > 0 ? (
            renderSection(saleProducts)
          ) : (
            <p className="text-center text-muted py-16 text-sm">
              No sale items right now — check back soon for new markdowns.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;