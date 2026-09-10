import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const VerifyEmail = () => {
  const { verifyEmail } = useAuth();
  const { token } = useParams();

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode / re-renders firing the verification request twice,
    // which would otherwise show a false "invalid or expired" error on the second call.
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
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow-md rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-6">Email Verification</h2>

      {status === "verifying" && <p className="text-gray-500">Verifying your email...</p>}

      {status === "success" && (
        <p className="bg-green-100 text-green-700 text-sm p-2 rounded mb-4">{message}</p>
      )}

      {status === "error" && (
        <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4">{message}</p>
      )}

      {status !== "verifying" && (
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          Continue to FashionHub
        </Link>
      )}
    </div>
  );
};

export default VerifyEmail;