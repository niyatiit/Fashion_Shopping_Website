import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/coupons", label: "Coupons" },
];

const AdminSidebar = () => {
  return (
    <div className="w-48 shrink-0 border-r border-sand pr-6">
      <p className="font-display text-lg text-ink mb-6">Admin</p>
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block text-sm py-2 ${
                isActive ? "text-crimson" : "text-muted hover:text-ink"
              } transition-colors`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
