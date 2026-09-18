import { useState } from "react";
import useAuth from "../hooks/useAuth";
import axiosInstance from "../api/axiosInstance";

const Profile = () => {
  const { user, fetchProfile, changePassword, resendVerification } = useAuth();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [resending, setResending] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");

  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
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
      setAddressForm({
        fullName: user?.name || "",
        phone: user?.phone || "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        isDefault: false,
      });
      setAddingAddress(false);
      await fetchProfile();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add address");
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const { data } = await axiosInstance.put(`/users/address/${addressId}/default`);
      setAddresses(data);
      await fetchProfile();
    } catch (err) {
      setMessage("Could not set default address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const { data } = await axiosInstance.delete(`/users/address/${addressId}`);
      setAddresses(data);
      await fetchProfile();
    } catch (err) {
      setMessage("Could not delete address");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }
    if (!/[A-Za-z]/.test(passwordForm.newPassword) || !/\d/.test(passwordForm.newPassword)) {
      setPasswordError("New password must contain at least one letter and one number");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    try {
      setPasswordSaving(true);
      const data = await changePassword(passwordForm);
      setPasswordMessage(data?.message || "Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setTimeout(() => {
        setChangingPassword(false);
        setPasswordMessage("");
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Could not change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setResending(true);
      const data = await resendVerification();
      setVerifyMessage(data?.message || "Verification email sent");
    } catch (err) {
      setVerifyMessage(err.response?.data?.message || "Could not send verification email");
    } finally {
      setResending(false);
      setTimeout(() => setVerifyMessage(""), 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl text-ink mb-10">My Profile</h1>

      {message && <p className="text-sm text-crimson mb-6">{message}</p>}

      {/* Email verification status */}
      {!user.isVerified && (
        <div className="border border-sand bg-sand/30 p-4 mb-8 flex items-center justify-between text-sm">
          <span className="text-muted">Your email address is not verified yet.</span>
          <div className="flex items-center gap-3">
            {verifyMessage && <span className="text-crimson">{verifyMessage}</span>}
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="text-ink underline hover:text-crimson transition-colors disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend verification email"}
            </button>
          </div>
        </div>
      )}

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

      {/* Change password */}
      <div className="border border-sand p-6 mb-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display text-lg text-ink">Password</h2>
          {!changingPassword && (
            <button
              onClick={() => setChangingPassword(true)}
              className="text-sm text-muted hover:text-crimson transition-colors"
            >
              Change Password
            </button>
          )}
        </div>

        {changingPassword && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordError && (
              <p className="bg-red-100 text-red-600 text-xs p-2 rounded">{passwordError}</p>
            )}
            {passwordMessage && (
              <p className="bg-green-100 text-green-700 text-xs p-2 rounded">{passwordMessage}</p>
            )}
            <input
              type="password"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              required
              className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson"
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwordForm.confirmNewPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })
              }
              required
              className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={passwordSaving}
                className="bg-ink text-ivory px-5 py-2 text-sm hover:bg-crimson transition-colors disabled:opacity-50"
              >
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setChangingPassword(false);
                  setPasswordError("");
                  setPasswordMessage("");
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
                }}
                className="text-sm text-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
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
            <input
              placeholder="Full Name"
              value={addressForm.fullName}
              onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
              required
            />
            <input
              placeholder="Phone Number"
              value={addressForm.phone}
              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
              required
            />
            <input
              placeholder="Street Address / House No / Area"
              value={addressForm.address}
              onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
              className="col-span-2 border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
              required
            />
            <input
              placeholder="City"
              value={addressForm.city}
              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
              required
            />
            <input
              placeholder="State"
              value={addressForm.state}
              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
              required
            />
            <input
              placeholder="Pincode"
              value={addressForm.pincode}
              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
              className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson"
              required
            />
            <label className="flex items-center gap-2 text-muted">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
              />
              Set as default address
            </label>
            <div className="col-span-2 flex gap-3 mt-2">
              <button type="submit" className="bg-ink text-ivory px-5 py-2 hover:bg-crimson transition-colors">
                Save Address
              </button>
              <button
                type="button"
                onClick={() => setAddingAddress(false)}
                className="text-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
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
                  <p className="text-ink font-medium">
                    {addr.fullName || user.name}{" "}
                    {addr.isDefault && (
                      <span className="text-crimson text-xs border border-crimson/30 bg-crimson/5 px-2 py-0.5 rounded ml-2">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="text-muted mt-1">
                    {addr.address || `${addr.houseNo || ""}, ${addr.street || ""}`.replace(/^, |, $/g, "")},{" "}
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-muted text-xs mt-0.5">Phone: {addr.phone || user.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefaultAddress(addr._id)}
                      className="text-xs text-muted hover:text-ink underline transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-xs text-muted hover:text-crimson transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;