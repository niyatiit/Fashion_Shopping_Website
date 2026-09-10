import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow-md rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-3">403 - Access Denied</h2>
      <p className="text-sm text-gray-500 mb-6">
        You don't have permission to view this page.
      </p>
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default Unauthorized;