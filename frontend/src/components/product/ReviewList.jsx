import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import useAuth from "../../hooks/useAuth";

const Star = ({ filled }) => (
  <svg
    viewBox="0 0 20 20"
    fill={filled ? "#8C1D18" : "none"}
    stroke="#8C1D18"
    strokeWidth="1"
    className="w-4 h-4"
  >
    <path d="M10 1l2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.2l6.1-.6L10 1z" />
  </svg>
);

const ReviewList = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      const { data } = await axiosInstance.get(`/reviews/${productId}`);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setSubmitting(true);
      await axiosInstance.post(`/reviews/${productId}`, { rating, comment });
      setComment("");
      setRating(5);
      setShowForm(false);
      await fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const userAlreadyReviewed = user && reviews.some((r) => r.user?._id === user._id);

  return (
    <div className="mt-16 border-t border-sand pt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl text-ink">Reviews ({reviews.length})</h2>
        {user && !userAlreadyReviewed && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-muted hover:text-crimson transition-colors"
          >
            Write a review
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-sand p-5 mb-8">
          {error && <p className="text-sm text-crimson mb-3">{error}</p>}

          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
              >
                <Star filled={star <= rating} />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            required
            rows={3}
            className="w-full border border-sand px-3 py-2 text-sm focus:outline-none focus:border-crimson mb-4"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-ink text-ivory px-5 py-2 text-sm hover:bg-crimson transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted">No reviews yet. Be the first to review this product.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-sand pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} filled={star <= review.rating} />
                  ))}
                </div>
                <span className="text-sm text-ink">{review.user?.name}</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewList;