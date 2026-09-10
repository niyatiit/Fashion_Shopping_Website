import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4.5 h-4.5">
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21s-7.5-4.6-10-9.3C.4 8.2 2 4.5 5.6 4a5 5 0 016.4 2.3A5 5 0 0118.4 4c3.6.5 5.2 4.2 3.6 7.7C19.5 16.4 12 21 12 21z"
    />
  </svg>
);

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const MenuIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const wishlistCount = wishlist?.products?.length || 0;

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/products?keyword=${encodeURIComponent(query)}` : "/products");
    setMobileOpen(false);
    setMobileSearchOpen(false);
  };

  return (
    <nav className="bg-ivory border-b border-sand sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20 gap-6">
          <Link to="/" className="font-display text-3xl tracking-tight text-ink shrink-0">
            FashionHub
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted shrink-0">
            <Link to="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <Link to="/products" className="hover:text-ink transition-colors">
              Shop
            </Link>
            <Link to="/products" className="hover:text-ink transition-colors">
              Categories
            </Link>
          </div>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent border-b border-sand pl-6 pr-2 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
              />
            </div>
          </form>

          <div className="flex items-center gap-5 shrink-0">
            {/* Mobile search toggle */}
            <button
              className="md:hidden text-ink"
              aria-label="Toggle search"
              onClick={() => setMobileSearchOpen((v) => !v)}
            >
              <SearchIcon />
            </button>

            <Link to="/wishlist" className="hidden sm:flex items-center gap-1 text-ink hover:text-crimson transition-colors relative">
              <HeartIcon />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-crimson text-ivory text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="flex items-center gap-1 text-ink hover:text-crimson transition-colors relative">
              <BagIcon />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-crimson text-ivory text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Desktop auth area */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              {user ? (
                <>
                  <Link to="/profile" className="text-ink hover:text-crimson transition-colors">
                    {user.name.split(" ")[0]}
                  </Link>
                  <Link to="/orders" className="text-ink hover:text-crimson transition-colors">
                    Orders
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin/dashboard" className="text-crimson">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="border border-ink px-4 py-1.5 text-ink hover:bg-ink hover:text-ivory transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-ink hover:text-crimson transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="bg-ink text-ivory px-4 py-1.5 hover:bg-crimson transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-ink"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-4">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              autoFocus
              className="w-full bg-transparent border-b border-sand px-1 py-2 text-sm text-ink placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
            />
          </form>
        )}
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-sand bg-ivory px-6 py-6 space-y-5 text-sm">
          <Link to="/" onClick={() => setMobileOpen(false)} className="block text-ink">
            Home
          </Link>
          <Link to="/products" onClick={() => setMobileOpen(false)} className="block text-ink">
            Shop
          </Link>
          <Link to="/products" onClick={() => setMobileOpen(false)} className="block text-ink">
            Categories
          </Link>
          <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="block text-ink">
            Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </Link>

          <div className="border-t border-sand pt-5">
            {user ? (
              <div className="space-y-4">
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-ink">
                  {user.name}
                </Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block text-ink">
                  Orders
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block text-crimson">
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full border border-ink px-4 py-2 text-ink hover:bg-ink hover:text-ivory transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center border border-ink px-4 py-2 text-ink"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center bg-ink text-ivory px-4 py-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;