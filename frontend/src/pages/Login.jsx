import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : "/";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-display text-3xl text-ink text-center mb-8">Login</h1>

      {error && <p className="bg-red-50 text-crimson text-sm p-3 mb-5">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full border border-sand px-3 py-2.5 text-sm focus:outline-none focus:border-crimson" />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full border border-sand px-3 py-2.5 text-sm focus:outline-none focus:border-crimson" />

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-muted hover:text-crimson transition-colors">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-ink text-ivory py-3 hover:bg-crimson transition-colors disabled:opacity-50">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-center text-muted mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-ink hover:text-crimson transition-colors">Register</Link>
      </p>
    </div>
  );
};

export default Login;