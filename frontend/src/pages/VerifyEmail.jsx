import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const VerifyEmail = () => {
  const { verifyEmail } = useAuth();
  const { token } = useParams();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      try {
        const data = await verifyEmail(token);
        setStatus("success");
        setMessage(data?.message || "Email verified successfully");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification link is invalid or has expired");
      }
    };

    if (token) {
      run();
    } else {
      setStatus("error");
      setMessage("Verification token is missing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <h1 className="font-display text-3xl text-ink mb-8">Email Verification</h1>

      {status === "verifying" && <p className="text-muted text-sm">Verifying your email...</p>}
      {status === "success" && <p className="bg-green-50 text-green-700 text-sm p-3 mb-4">{message}</p>}
      {status === "error" && <p className="bg-red-50 text-crimson text-sm p-3 mb-4">{message}</p>}

      {status !== "verifying" && (
        <Link to="/" className="text-sm text-ink hover:text-crimson transition-colors">
          Continue to FashionHub
        </Link>
      )}
    </div>
  );
};

export default VerifyEmail;