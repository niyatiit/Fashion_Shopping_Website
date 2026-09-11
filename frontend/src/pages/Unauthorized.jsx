import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <h1 className="font-display text-3xl text-ink mb-3">403 — Access Denied</h1>
      <p className="text-sm text-muted mb-8">You don't have permission to view this page.</p>
      <Link to="/" className="inline-block bg-ink text-ivory px-6 py-2.5 text-sm hover:bg-crimson transition-colors">
        Go to Home
      </Link>
    </div>
  );
};

export default Unauthorized;