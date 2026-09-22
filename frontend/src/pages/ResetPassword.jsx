import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import PasswordInput from "../components/common/PasswordInput";

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      setError("Password must contain at least one letter and one number");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const data = await resetPassword(token, formData.password, formData.confirmPassword);
      setMessage(data?.message || "Password has been reset successfully. You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset link is invalid or has expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-display text-3xl text-ink text-center mb-8">Reset Password</h1>

      {error && <p className="bg-red-50 text-crimson text-sm p-3 mb-5">{error}</p>}
      {message && <p className="bg-green-50 text-green-700 text-sm p-3 mb-5">{message}</p>}

      {!message && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput name="password" placeholder="New Password (min 8 chars, 1 letter & 1 number)" value={formData.password} onChange={handleChange} required autoComplete="new-password" />
          <PasswordInput name="confirmPassword" placeholder="Confirm New Password" value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
          <button type="submit" disabled={loading} className="w-full bg-ink text-ivory py-3 hover:bg-crimson transition-colors disabled:opacity-50">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      <p className="text-sm text-center text-muted mt-6">
        <Link to="/login" className="text-ink hover:text-crimson transition-colors">Back to Login</Link>
      </p>
    </div>
  );
};

export default ResetPassword;