import { useState } from "react";
import useAuth from "../hooks/useAuth";
import AccountSidebar from "../components/account/AccountSidebar";
import ProfileTab from "../components/account/ProfileTab";
import SecurityTab from "../components/account/SecurityTab";
import AddressesTab from "../components/account/AddressesTab";
import OrdersTab from "../components/account/OrdersTab";
import WishlistTab from "../components/account/WishlistTab";
import ReviewsTab from "../components/account/ReviewsTab";

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-10">My Account</h1>
      <div className="flex gap-12">
        <AccountSidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="space-y-10">
              <ProfileTab />
              <SecurityTab />
            </div>
          )}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "wishlist" && <WishlistTab />}
          {activeTab === "addresses" && <AddressesTab />}
          {activeTab === "reviews" && <ReviewsTab />}
        </div>
      </div>
    </div>
  );
};

export default Profile;