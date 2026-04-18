import React from "react";
import Stars from "./Stars";

export default function ReviewCard({ review }) {
  const reviewer = review?.reviewer || {};
  const createdAt = review?.createdAt ? new Date(review.createdAt) : null;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
            <img
              src={reviewer?.profileImage?.url || "https://via.placeholder.com/80"}
              alt={reviewer?.username || "Reviewer"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-gray-900 truncate">
              {reviewer?.username || "Anonymous"}
            </p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {createdAt ? createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <Stars value={review?.rating} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
            {typeof review?.rating === "number" ? `${review.rating.toFixed(1)}` : ""}
          </p>
        </div>
      </div>

      {review?.comment ? (
        <p className="text-gray-700 font-medium leading-relaxed mt-4 whitespace-pre-wrap">
          {review.comment}
        </p>
      ) : (
        <p className="text-gray-400 font-bold mt-4 text-sm">No comment provided.</p>
      )}
    </div>
  );
}

