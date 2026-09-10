import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";
import Avatar from "./Avatar";

const ProfileTab = () => {
  const { user, fetchProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email, phone: user.phone });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError("All fields are required");
      return;
    }

    try {
      setSaving(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      if (imageFile) data.append("profileImage", imageFile);

      await axiosInstance.put("/users/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchProfile();
      setSuccess("Profile updated successfully");
      setEditing(false);
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-8">My Profile</h2>

      {success && <p className="bg-green-50 text-green-700 text-sm p-3 mb-5">{success}</p>}
      {error && <p className="bg-red-50 text-crimson text-sm p-3 mb-5">{error}</p>}

      {!editing ? (
        <div className="border border-sand p-6">
          <div className="flex items-center gap-5 mb-6">
            <Avatar user={user} size="lg" />
            <div>
              <p className="text-ink font-medium">{user.name}</p>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <p className="text-sm text-muted">
            <span className="text-ink">Phone:</span> {user.phone}
          </p>
          <button
            onClick={() => setEditing(true)}
            className="mt-6 border border-ink text-ink px-5 py-2 text-sm hover:bg-ink hover:text-ivory transition-colors"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="border border-sand p-6 space-y-4">
          <div className="flex items-center gap-5 mb-2">
            <Avatar
              user={imageFile ? { ...user, profileImage: { url: URL.createObjectURL(imageFile) } } : user}
              size="lg"
            />
            <div>
              <label className="text-sm text-muted block mb-2">Update Photo</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="text-sm" />
            </div>
          </div>

          <div>
            <label className="text-sm text-ink block mb-1">Name</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson"
            />
          </div>
          <div>
            <label className="text-sm text-ink block mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson"
            />
          </div>
          <div>
            <label className="text-sm text-ink block mb-1">Phone</label>
            <input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-ink text-ivory px-5 py-2 text-sm hover:bg-crimson transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setImageFile(null); }}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileTab;