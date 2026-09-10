import Avatar from "./Avatar";

const tabs = [
  { key: "profile", label: "Profile" },
  { key: "orders", label: "Orders" },
  { key: "wishlist", label: "Wishlist" },
  { key: "addresses", label: "Addresses" },
  { key: "reviews", label: "Reviews" },
];

const AccountSidebar = ({ user, activeTab, setActiveTab }) => {
  return (
    <div className="w-56 shrink-0">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-sand">
        <Avatar user={user} size="lg" />
        <div>
          <p className="text-ink font-medium">{user.name}</p>
          <p className="text-xs text-muted">{user.email}</p>
        </div>
      </div>
      <nav className="space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`block w-full text-left text-sm py-2 px-3 transition-colors ${
              activeTab === tab.key ? "bg-ink text-ivory" : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AccountSidebar;