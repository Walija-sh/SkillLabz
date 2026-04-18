import React, { useEffect, useMemo, useState } from "react";
import reviewService from "../../services/review.service";
import ReviewCard from "./ReviewCard";

export default function ReviewsSection({ userId, initialReviews = [], initialTotal = 0 }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0) / limit)), [total, limit]);

  useEffect(() => {
    // Reset when userId changes
    setReviews(initialReviews);
    setTotal(initialTotal);
    setPage(1);
    setError("");
  }, [userId, initialReviews, initialTotal]);

  const fetchPage = async (nextPage) => {
    setIsLoading(true);
    setError("");
    try {
      const data = await reviewService.getReviewsForUser(userId, { page: nextPage, limit });
      if (nextPage === 1) setReviews(data.reviews || []);
      else setReviews((prev) => [...prev, ...(data.reviews || [])]);
      setTotal(data.total ?? 0);
      setPage(data.currentPage ?? nextPage);
    } catch (e) {
      setError(e?.message || "Failed to load reviews.");
    } finally {
      setIsLoading(false);
    }
  };

  const canLoadMore = page < totalPages;

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
      <div className="flex items-end justify-between gap-6 mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Reviews</h2>
          <p className="text-gray-500 font-medium mt-1">
            {total ? `${total} review${total === 1 ? "" : "s"}` : "No reviews yet"}
          </p>
        </div>

        {canLoadMore && (
          <button
            disabled={isLoading}
            onClick={() => fetchPage(page + 1)}
            className="px-5 py-2.5 rounded-2xl bg-gray-900 text-white text-xs font-black uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60"
          >
            {isLoading ? "Loading..." : "Load more"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 font-bold">
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No reviews posted yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r) => (
            <ReviewCard key={r._id} review={r} />
          ))}
        </div>
      )}

      {/* If initial data had no total, allow manual refresh */}
      {reviews.length > 0 && total === 0 && (
        <div className="mt-6">
          <button
            disabled={isLoading}
            onClick={() => fetchPage(1)}
            className="px-5 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-xs font-black uppercase tracking-widest hover:bg-gray-200 disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

