import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const SecurityTab = () => {
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.put("/users/change-password", formData);
      setSuccess("Password updated successfully");
      setFormData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Could not update password");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-8">Change Password</h2>

      {success && <p className="bg-green-50 text-green-700 text-sm p-3 mb-5">{success}</p>}
      {error && <p className="bg-red-50 text-crimson text-sm p-3 mb-5">{error}</p>}

      <form onSubmit={handleSubmit} className="border border-sand p-6 space-y-4 max-w-md">
        <div>
          <label className="text-sm text-ink block mb-1">Current Password</label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            required
            className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson"
          />
        </div>
        <div>
          <label className="text-sm text-ink block mb-1">New Password</label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            required
            className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson"
          />
        </div>
        <div>
          <label className="text-sm text-ink block mb-1">Confirm New Password</label>
          <input
            type="password"
            value={formData.confirmNewPassword}
            onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
            required
            className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-ink text-ivory px-5 py-2 text-sm hover:bg-crimson transition-colors disabled:opacity-50"
        >
          {saving ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default SecurityTab;