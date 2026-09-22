import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import PasswordInput from "../components/common/PasswordInput";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) return "Please provide your full name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) return "Please provide a valid email address";
    const digitsOnly = formData.phone.replace(/[^\d]/g, "");
    if (digitsOnly.length < 7 || digitsOnly.length > 15) return "Please provide a valid phone number";
    if (formData.password.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) return "Password must contain at least one letter and one number";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setLoading(true);
      await register(formData);
      setMessage("Account created! We've sent a verification link to your email.");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-display text-3xl text-ink text-center mb-8">Create Account</h1>

      {error && <p className="bg-red-50 text-crimson text-sm p-3 mb-5">{error}</p>}
      {message && <p className="bg-green-50 text-green-700 text-sm p-3 mb-5">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full border border-sand px-3 py-2.5 text-sm focus:outline-none focus:border-crimson" />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full border border-sand px-3 py-2.5 text-sm focus:outline-none focus:border-crimson" />
        <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required className="w-full border border-sand px-3 py-2.5 text-sm focus:outline-none focus:border-crimson" />
        <PasswordInput name="password" placeholder="Password (min 8 chars, 1 letter & 1 number)" value={formData.password} onChange={handleChange} required autoComplete="new-password" />
        <PasswordInput name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password" />

        <button type="submit" disabled={loading} className="w-full bg-ink text-ivory py-3 hover:bg-crimson transition-colors disabled:opacity-50">
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-sm text-center text-muted mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-ink hover:text-crimson transition-colors">Login</Link>
      </p>
    </div>
  );
};

export default Register;