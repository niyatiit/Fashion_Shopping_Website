import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useCart from "../../hooks/useCart";
import Avatar from "../account/Avatar";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-ivory border-b border-sand">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        <Link to="/" className="font-display text-3xl tracking-tight text-ink">
          FashionHub
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted">
          <Link to="/products" className="hover:text-ink transition-colors">
            Shop
          </Link>
          <Link to="/wishlist" className="hover:text-ink transition-colors">
            Wishlist
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <Link
            to="/cart"
            className="flex items-center gap-1.5 text-sm text-ink hover:text-crimson transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 10a4 4 0 01-8 0"
              />
            </svg>
            Bag
            {cartCount > 0 && (
              <span className="text-crimson font-medium">({cartCount})</span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-4 text-sm">
              <Link
                to="/profile"
                className="flex items-center gap-2 text-ink hover:text-crimson transition-colors"
              >
                <Avatar user={user} size="sm" />
                <span className="hidden sm:inline">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <Link
                to="/orders"
                className="text-ink hover:text-crimson transition-colors"
              >
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
            </div>
          ) : (
            <div className="flex items-center gap-4 text-sm">
              <Link
                to="/login"
                className="text-ink hover:text-crimson transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-ink text-ivory px-4 py-1.5 hover:bg-crimson transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
