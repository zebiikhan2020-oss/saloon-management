"use client";

import { useEffect, useState } from "react";

export default function AdminAppointmentReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/appointment-reviews");
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to fetch reviews");
        return;
      }

      setReviews(data.reviews || []);
    } catch (err) {
      console.error("FETCH REVIEWS ERROR:", err);
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  function formatRating(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-10">
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">
          All Appointment Reviews
        </h1>
        <p className="text-gray-500 mt-1">
          View all customer reviews for completed appointments
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {!error && reviews.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">⭐</div>
          <p className="font-medium">No reviews yet</p>
          <p className="text-sm mt-1">
            Appointment reviews will appear here once customers submit them.
          </p>
        </div>
      )}

      {/* REVIEWS LIST */}
      {!error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border rounded-xl p-5 shadow-sm bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                
                {/* REVIEW DETAILS */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">
                      {review.customer?.name || "Customer"}
                    </h3>
                    <span className="text-yellow-500 text-xl">
                      {formatRating(review.rating)}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-3">
                    <strong>Service:</strong> {review.appointment?.service?.name || "Service"}
                  </p>

                  <p className="text-gray-600 mb-3">
                    <strong>Staff:</strong> {review.appointment?.staff?.name || "Not assigned"}
                  </p>

                  <p className="text-gray-600 mb-3">
                    <strong>Date:</strong>{" "}
                    {review.appointment?.date
                      ? new Date(review.appointment.date).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <p className="text-gray-600 mb-3">
                    <strong>Time:</strong> {review.appointment?.time || "N/A"}
                  </p>

                  {review.comment && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 italic">
                        "{review.comment}"
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-3">
                    Reviewed on{" "}
                    {review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
