import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";

const emptyForm = { fullName: "", phone: "", address: "", city: "", state: "", pincode: "", isDefault: false };

const AddressesTab = () => {
  const { user, fetchProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const addresses = user.addresses || [];

  const openAdd = () => { setFormData(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (addr) => {
    setFormData({
      fullName: addr.fullName, phone: addr.phone, address: addr.address,
      city: addr.city, state: addr.state, pincode: addr.pincode, isDefault: addr.isDefault,
    });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setSaving(true);
      if (editingId) {
        await axiosInstance.put(`/users/address/${editingId}`, formData);
      } else {
        await axiosInstance.post("/users/address", formData);
      }
      await fetchProfile();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/users/address/${id}`);
      await fetchProfile();
    } catch (err) {
      setError("Could not delete address");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosInstance.put(`/users/address/${id}/default`);
      await fetchProfile();
    } catch (err) {
      setError("Could not set default address");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display text-2xl text-ink">Addresses</h2>
        {!showForm && (
          <button onClick={openAdd} className="bg-ink text-ivory px-5 py-2 text-sm hover:bg-crimson transition-colors">
            + Add Address
          </button>
        )}
      </div>

      {error && <p className="bg-red-50 text-crimson text-sm p-3 mb-5">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-sand p-5 mb-8 grid grid-cols-2 gap-3 text-sm">
          <input placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />
          <input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />
          <input placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required className="col-span-2 border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />
          <input placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />
          <input placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} required className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />
          <input placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} required className="border border-sand px-3 py-2 focus:outline-none focus:border-crimson" />
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} />
            Set as default
          </label>
          <div className="col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="bg-ink text-ivory px-5 py-2 hover:bg-crimson transition-colors disabled:opacity-50">
              {saving ? "Saving..." : editingId ? "Update Address" : "Save Address"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted hover:text-ink transition-colors">
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
            <div key={addr._id} className="border border-sand p-4 text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-ink font-medium">
                    {addr.fullName} {addr.isDefault && <span className="text-crimson font-normal">(Default)</span>}
                  </p>
                  <p className="text-muted mt-1">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                  <p className="text-muted">Phone: {addr.phone}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => openEdit(addr)} className="text-muted hover:text-ink transition-colors">Edit</button>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr._id)} className="text-muted hover:text-crimson transition-colors">Set Default</button>
                  )}
                  <button onClick={() => handleDelete(addr._id)} className="text-muted hover:text-crimson transition-colors">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesTab;