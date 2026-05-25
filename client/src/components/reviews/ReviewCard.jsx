import React from "react";
import Stars from "./Stars";
import { Link } from "react-router-dom";

export default function ReviewCard({ review }) {
  const reviewer = review?.reviewer || {};
  const createdAt = review?.createdAt ? new Date(review.createdAt) : null;
 
  

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 border border-gray-100 shrink-0 flex items-center justify-center">
           
             {reviewer?.profileImage?.url ? (
              <img src={reviewer?.profileImage?.url} alt={reviewer?.username} className="w-full h-full object-cover object-top" />
            ) : (
              <span className="text-2xl font-black text-gray-400 uppercase">{reviewer?.username.charAt(0) || "?"}</span>
            )}
          </div>
          <div className="min-w-0">
            <Link to={`/users/${reviewer._id}`}>
            <p className="text-sm font-black text-gray-900 truncate">
              {reviewer?.username || "Anonymous"}
            </p>
            </Link>
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

