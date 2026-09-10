import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const data = await forgotPassword(email.trim());
      setMessage(
        data?.message ||
          "If an account with that email exists, a password reset link has been sent"
      );
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-2 text-center">Forgot Password</h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Enter your account email and we'll send you a link to reset your password.
      </p>

      {error && (
        <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{error}</p>
      )}
      {message && (
        <p className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">{message}</p>
      )}

      {!message && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>
      )}

      <p className="text-sm text-center mt-4">
        Remembered your password?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;