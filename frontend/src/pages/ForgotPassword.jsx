import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    try {
      setLoading(true);
      const data = await forgotPassword(email.trim());
      setMessage(data?.message || "A password reset link has been generated.");
      if (data?.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <h1 className="font-display text-3xl text-ink text-center mb-2">Forgot Password</h1>
      <p className="text-sm text-muted text-center mb-8">
        Enter your account email and we'll send you a link to reset your password.
      </p>

      {error && <p className="bg-red-50 text-crimson text-sm p-3 mb-5 border border-red-100">{error}</p>}
      {message && <p className="bg-green-50 text-green-700 text-sm p-3 mb-5 border border-green-100">{message}</p>}

      {resetUrl && (
        <div className="bg-sand/30 border border-sand p-5 mb-6 rounded-sm text-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔑</span>
            <span className="font-medium text-ink">Reset Link Ready</span>
          </div>
          <p className="text-muted text-xs leading-relaxed">
            Click the button below to reset your password immediately:
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <a
              href={resetUrl}
              className="inline-block text-center bg-crimson text-ivory px-5 py-2.5 hover:bg-ink transition-colors text-sm font-medium"
            >
              Reset Password Now →
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(resetUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="border border-sand px-4 py-2.5 hover:bg-sand text-ink transition-colors text-sm"
            >
              {copied ? "✓ Copied Link" : "Copy Link"}
            </button>
          </div>
        </div>
      )}

      {!message && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-sand px-3 py-2.5 text-sm focus:outline-none focus:border-crimson"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-ivory py-3 hover:bg-crimson transition-colors disabled:opacity-50"
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>
      )}

      <p className="text-sm text-center text-muted mt-6">
        Remembered your password?{" "}
        <Link to="/login" className="text-ink hover:text-crimson transition-colors">
          Back to Login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;