import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-ivory px-6 py-16">
      <div className="w-full max-w-md border border-sand bg-white p-10">
        <h1 className="font-display text-3xl text-ink mb-1">Create account</h1>
        <p className="text-sm text-muted mb-8">
          Join FashionHub to start shopping.
        </p>

        {error && (
          <p className="border-l-2 border-crimson bg-sand/40 text-crimson text-sm px-3 py-2 mb-6">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="block text-sm text-muted mb-1.5">Full name</span>
            <input
              type="text"
              name="name"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-transparent border-b border-sand py-2 text-ink placeholder:text-muted/60 focus:outline-none focus:border-ink transition-colors"
            />
          </label>

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
            <span className="block text-sm text-muted mb-1.5">Phone number</span>
            <input
              type="tel"
              name="phone"
              placeholder="+1 555 000 0000"
              value={formData.phone}
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

          <label className="block">
            <span className="block text-sm text-muted mb-1.5">Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-muted text-center mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-crimson hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;