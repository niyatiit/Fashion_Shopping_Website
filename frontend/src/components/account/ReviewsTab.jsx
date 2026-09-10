import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const Star = ({ filled }) => (
  <svg viewBox="0 0 20 20" fill={filled ? "#8C1D18" : "none"} stroke="#8C1D18" strokeWidth="1" className="w-3.5 h-3.5">
    <path d="M10 1l2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.2l6.1-.6L10 1z" />
  </svg>
);

const ReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axiosInstance.get("/reviews/user/mine");
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleDelete = async (reviewId) => {
    try {
      await axiosInstance.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl text-ink mb-8">My Reviews</h2>
      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted">You haven't written any reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border border-sand p-4 text-sm">
              <div className="flex justify-between items-start mb-2">
                <Link to={`/products/${review.product?._id}`} className="text-ink hover:text-crimson transition-colors">
                  {review.product?.name}
                </Link>
                <button onClick={() => handleDelete(review._id)} className="text-muted hover:text-crimson transition-colors">
                  Delete
                </button>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} filled={star <= review.rating} />)}
              </div>
              <p className="text-muted">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;