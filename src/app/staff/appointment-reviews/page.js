
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffAppointmentReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==============================
  // PAGINATION
  // ==============================
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/staff/appointment-reviews", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to fetch reviews");
        return;
      }

      const reviewsList = data.reviews || [];

      setReviews(reviewsList);

      const totalPagesAfterFetch = Math.max(
        1,
        Math.ceil(reviewsList.length / ITEMS_PER_PAGE)
      );

      setCurrentPage((page) =>
        Math.min(page, totalPagesAfterFetch)
      );
    } catch (err) {
      console.error("FETCH REVIEWS ERROR:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  function formatRating(rating) {
    const num = Number(rating) || 0;
    return "★".repeat(num) + "☆".repeat(Math.max(0, 5 - num));
  }

  const totalPages = Math.max(
    1,
    Math.ceil(reviews.length / ITEMS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentReviews = reviews.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin" />

          <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
            Loading reviews...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">

        {/* HEADER */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Appointment Reviews
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Feedback from completed appointments
              </p>
            </div>

            <span className="px-3.5 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 rounded-xl text-xs font-bold w-fit">
              {reviews.length} Total
            </span>

          </div>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="p-3.5 sm:p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!error && reviews.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-10 sm:p-12 text-center shadow-sm dark:shadow-black/20">
            <div className="text-3xl mb-2">⭐</div>

            <p className="text-slate-400 dark:text-slate-500 text-sm">
              No reviews yet.
            </p>
          </div>
        )}

        {/* REVIEWS LIST */}
        {!error && reviews.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

            {currentReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/30 transition duration-200 space-y-4"
              >

                {/* TOP: CUSTOMER + STARS */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base break-words">
                      {review.customer?.name || "Customer"}
                    </h3>

                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1 break-words">
                      {review.appointment?.service?.name || "Service"}
                    </p>
                  </div>

                  <div className="text-amber-400 dark:text-amber-300 text-sm sm:text-base tracking-wider shrink-0">
                    {formatRating(review.rating)}
                  </div>

                </div>

                {/* COMMENT */}
                {review.comment && (
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm italic bg-slate-50 dark:bg-slate-800 p-3 sm:p-3.5 rounded-xl border border-slate-100 dark:border-slate-700 break-words leading-relaxed">
                    "{review.comment}"
                  </p>
                )}

                {/* FOOTER META */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">

                  <span className="break-words">
                    📅{" "}
                    {review.appointment?.date
                      ? new Date(
                          review.appointment.date
                        ).toLocaleDateString()
                      : "N/A"}{" "}
                    ({review.appointment?.time || "N/A"})
                  </span>

                  <span className="break-words">
                    Reviewed on{" "}
                    {review.createdAt
                      ? new Date(
                          review.createdAt
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>

                </div>

              </div>
            ))}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="col-span-1 lg:col-span-2 mt-6 flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(page - 1, 1)
                      )
                    }
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 transition"
                  >
                    ←
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-bold transition ${
                        currentPage === page
                          ? "bg-blue-600 dark:bg-blue-500 text-white shadow-sm"
                          : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 transition"
                  >
                    →
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {startIndex + 1}–
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    reviews.length
                  )}{" "}
                  of {reviews.length} reviews
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

