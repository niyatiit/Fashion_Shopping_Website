import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center text-muted py-20">Loading...</p>;

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;