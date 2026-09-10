import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(formData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-ivory px-6 py-16">
      <div className="w-full max-w-md border border-sand bg-white p-10">
        <h1 className="font-display text-3xl text-ink mb-1">Welcome back</h1>
        <p className="text-sm text-muted mb-8">
          Sign in to continue to your account.
        </p>

        {error && (
          <p className="border-l-2 border-crimson bg-sand/40 text-crimson text-sm px-3 py-2 mb-6">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="block text-sm text-muted mb-1.5">Email</span>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-sand py-2 text-ink placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
            />
          </label>

          <label className="block">
            <span className="block text-sm text-muted mb-1.5">Password</span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-sand py-2 text-ink placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-ivory py-3 mt-2 hover:bg-crimson transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-muted text-center mt-8">
          Don't have an account?{" "}
          <Link to="/register" className="text-crimson hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;