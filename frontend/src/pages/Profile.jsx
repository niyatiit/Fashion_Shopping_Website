import { useState } from "react";
import useAuth from "../hooks/useAuth";
import axiosInstance from "../api/axiosInstance";

const Profile = () => {
  const { user, fetchProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [addressForm, setAddressForm] = useState({
    houseNo: "", street: "", city: "", state: "", pincode: "", isDefault: false,
  });
  const [addingAddress, setAddingAddress] = useState(false);
  const [addresses, setAddresses] = useState(user?.addresses || []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axiosInstance.put("/users/profile", formData);
      await fetchProfile();
      setMessage("Profile updated");
      setEditing(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post("/users/address", addressForm);
      setAddresses(data);
      setAddressForm({ houseNo: "", street: "", city: "", state: "", pincode: "", isDefault: false });
      setAddingAddress(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const { data } = await axiosInstance.delete(`/users/address/${addressId}`);
      setAddresses(data);
    } catch (err) {
      setMessage("Could not delete address");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-10">My Profile</h1>

      {message && <p className="text-sm text-crimson mb-6">{message}</p>}

      {/* Account info */}
      <div className="border border-sand p-6 mb-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display text-lg text-ink">Account Details</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-sm text-muted hover:text-crimson transition-colors">
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full Name"
              className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson"
            />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone"
              className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-ink text-ivory px-5 py-2 text-sm hover:bg-crimson transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-sm text-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-muted space-y-1">
            <p><span className="text-ink">Name:</span> {user.name}</p>
            <p><span className="text-ink">Email:</span> {user.email}</p>
            <p><span className="text-ink">Phone:</span> {user.phone}</p>
          </div>
        )}
      </div>

      {/* Addresses */}
      <div className="border border-sand p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display text-lg text-ink">Saved Addresses</h2>
          {!addingAddress && (
            <button onClick={() => setAddingAddress(true)} className="text-sm text-muted hover:text-crimson transition-colors">
              + Add Address
            </button>
          )}
        </div>

        {addingAddress && (
          <form onSubmit={handleAddAddress} className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <input placeholder="House No" value={addressForm.houseNo} onChange={(e) => setAddressForm({ ...addressForm, houseNo: e.target.value })} className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" required />
            <input placeholder="Street" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" required />
            <input placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" required />
            <input placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" required />
            <input placeholder="Pincode" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" required />
            <label className="flex items-center gap-2 text-muted">
              <input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
              Set as default
            </label>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="bg-ink text-ivory px-5 py-2 hover:bg-crimson transition-colors">Save Address</button>
              <button type="button" onClick={() => setAddingAddress(false)} className="text-muted hover:text-ink transition-colors">Cancel</button>
            </div>
          </form>
        )}

        {addresses.length === 0 ? (
          <p className="text-sm text-muted">No addresses saved yet.</p>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr._id} className="flex justify-between items-start border border-sand p-4 text-sm">
                <div>
                  <p className="text-ink">
                    {addr.houseNo}, {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                    {addr.isDefault && <span className="text-crimson ml-2">(Default)</span>}
                  </p>
                </div>
                <button onClick={() => handleDeleteAddress(addr._id)} className="text-muted hover:text-crimson transition-colors">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;