import { Link } from "react-router-dom";

const socials = [
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4.5 h-4.5">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4.5 h-4.5">
        <path d="M14 9h3V6h-3a4 4 0 00-4 4v2H7v3h3v6h3v-6h3l1-3h-4v-2a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4.5 h-4.5">
        <path d="M22 5.9c-.7.3-1.5.6-2.3.7a4 4 0 001.8-2.2 8 8 0 01-2.5 1 4 4 0 00-6.9 3.6A11.4 11.4 0 014 4.6a4 4 0 001.2 5.3c-.6 0-1.2-.2-1.7-.5v.1a4 4 0 003.2 3.9c-.6.1-1.2.2-1.8.1a4 4 0 003.7 2.8A8 8 0 012 17.5a11.3 11.3 0 006.1 1.8c7.3 0 11.3-6 11.3-11.3v-.5c.8-.6 1.4-1.3 2-2.1z" />
      </svg>
    ),
  },
  {
    name: "Pinterest",
    href: "https://pinterest.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4.5 h-4.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 18c.8-2.7 1.3-4.6 1.9-7a2.6 2.6 0 015 .8c0 2-1.2 3.7-2.9 3.7-.8 0-1.4-.6-1.4-1.4 0-.8.9-2.9.9-4A1.3 1.3 0 0011.6 9c-1.2 0-2.1 1.3-2.1 3 0 .5.1.9.3 1.2" />
      </svg>
    ),
  },
];

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Shop All", to: "/products" },
  { label: "Wishlist", to: "/wishlist" },
  { label: "My Orders", to: "/orders" },
];

const categoryLinks = [
  { label: "New Arrivals", to: "/products?sort=" },
  { label: "Best Sellers", to: "/products" },
  { label: "On Sale", to: "/products?onSale=true" },
  { label: "All Categories", to: "/products" },
];

const Footer = () => {
  return (
    <footer className="bg-ink text-ivory mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-display text-2xl tracking-tight">
            FashionHub
          </Link>
          <p className="text-sm text-ivory/60 mt-4 leading-relaxed max-w-xs">
            Curated fashion for everyday moments — new arrivals dropping weekly, styled for how you actually live.
          </p>
          <div className="flex items-center gap-3 mt-6">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="w-9 h-9 border border-ivory/20 flex items-center justify-center hover:border-crimson hover:text-crimson transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-sm tracking-wide text-ivory/50 mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-ivory/80 hover:text-crimson transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-sm tracking-wide text-ivory/50 mb-4">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            {categoryLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-ivory/80 hover:text-crimson transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm tracking-wide text-ivory/50 mb-4">Contact</h4>
          <ul className="space-y-2.5 text-sm text-ivory/80">
            <li>support@fashionhub.com</li>
            <li>+91 98765 43210</li>
            <li>Ahmedabad, Gujarat, India</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ivory/50">
          <p>© {new Date().getFullYear()} FashionHub. All rights reserved.</p>
          <p>Designed for people who dress on purpose.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;