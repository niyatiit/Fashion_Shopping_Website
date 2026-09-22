import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import useWishlist from "../../hooks/useWishlist";

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const wishlistCount = wishlist?.products?.length || 0;

  // Safe user properties to prevent 'Cannot read properties of undefined (reading split)'
  const userName =
    user?.name ||
    user?.user?.name ||
    (typeof user?.email === "string" ? user.email.split("@")[0] : "") ||
    "User";

  const firstName =
    typeof userName === "string" && userName.trim()
      ? userName.trim().split(/\s+/)[0]
      : "User";

  const userEmail = user?.email || user?.user?.email || "";
  const isAdmin = user?.role === "admin" || user?.user?.role === "admin";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
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
            <div className="hidden md:flex items-center text-sm">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full border border-sand bg-white hover:border-ink transition-all shadow-xs group cursor-pointer"
                  >
                    {/* Unique User Avatar Symbol with Initials */}
                    <div className="w-7 h-7 rounded-full bg-ink text-ivory text-xs font-semibold flex items-center justify-center tracking-wider shrink-0 group-hover:bg-crimson transition-colors">
                      {getInitials(userName)}
                    </div>

                    <div className="flex items-center gap-1.5 text-left">
                      <span className="text-xs font-medium text-ink max-w-[110px] truncate">
                        {firstName}
                      </span>
                      {isAdmin && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                          Admin
                        </span>
                      )}
                    </div>

                    {/* Animated Dropdown Arrow */}
                    <svg
                      className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Floating Dropdown Card */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-sand shadow-lg rounded-xs py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Header Info */}
                      <div className="px-4 py-3 border-b border-sand/70 bg-sand/15">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-ink text-ivory text-xs font-semibold flex items-center justify-center shrink-0">
                            {getInitials(userName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-ink truncate">{userName}</p>
                            {userEmail && <p className="text-[11px] text-muted truncate">{userEmail}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Menu Links */}
                      <div className="py-1 text-xs">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-ink hover:bg-sand/30 transition-colors"
                        >
                          <span>👤</span>
                          <span>My Profile & Addresses</span>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-ink hover:bg-sand/30 transition-colors"
                        >
                          <span>📦</span>
                          <span>Order History</span>
                        </Link>

                        <Link
                          to="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-ink hover:bg-sand/30 transition-colors"
                        >
                          <span>🤍</span>
                          <span>Saved Wishlist</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-crimson font-medium hover:bg-sand/30 transition-colors"
                          >
                            <span>👑</span>
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      {/* Divider & Logout */}
                      <div className="border-t border-sand/70 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-muted hover:text-crimson hover:bg-sand/20 transition-colors text-left cursor-pointer"
                        >
                          <span>🚪</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-ink hover:text-crimson transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="bg-ink text-ivory px-4 py-1.5 hover:bg-crimson transition-colors shadow-xs">
                    Sign Up
                  </Link>
                </div>
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
                <div className="flex items-center gap-3 p-3 bg-sand/30 border border-sand rounded-xs">
                  <div className="w-10 h-10 rounded-full bg-ink text-ivory text-xs font-semibold flex items-center justify-center shrink-0">
                    {getInitials(userName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink text-sm truncate">{userName}</p>
                      {isAdmin && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase">
                          Admin
                        </span>
                      )}
                    </div>
                    {userEmail && <p className="text-xs text-muted truncate">{userEmail}</p>}
                  </div>
                </div>

                <Link to="/profile" onClick={() => setMobileOpen(false)} className="block text-ink hover:text-crimson">
                  👤 My Profile & Addresses
                </Link>
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="block text-ink hover:text-crimson">
                  📦 My Orders
                </Link>
                {isAdmin && (
                  <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block text-crimson font-medium">
                    👑 Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full border border-ink px-4 py-2 text-ink hover:bg-ink hover:text-ivory transition-colors text-center cursor-pointer"
                >
                  Sign Out
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