
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AppointmentReviewPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [existingReview, setExistingReview] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // PAGINATION
  // =====================================================

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // =====================================================
  // LOAD
  // =====================================================

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appointmentId = params.get("appointmentId");

    if (appointmentId) {
      loadSpecificAppointment(appointmentId);
    } else {
      loadCompletedAppointments();
    }
  }, []);

  // =====================================================
  // LOAD COMPLETED APPOINTMENTS
  // =====================================================

  async function loadCompletedAppointments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/customer/appointment");
      const data = await response.json();

      if (!Array.isArray(data)) {
        setError("Failed to load appointments");
        return;
      }

      const completed = data.filter(
        (appointment) => appointment.status === "COMPLETED"
      );

      const appointmentsWithReviews = await Promise.all(
        completed.map(async (appointment) => {
          try {
            const reviewResponse = await fetch(
              `/api/appointment-reviews?appointmentId=${appointment.id}`
            );
            const reviewData = await reviewResponse.json();

            return {
              ...appointment,
              review:
                reviewData.success && reviewData.reviews.length > 0
                  ? reviewData.reviews[0]
                  : null,
            };
          } catch (error) {
            console.error("REVIEW CHECK ERROR:", error);
            return {
              ...appointment,
              review: null,
            };
          }
        })
      );

      setAppointments(appointmentsWithReviews);
      setCurrentPage(1);
    } catch (error) {
      console.error("LOAD COMPLETED APPOINTMENTS ERROR:", error);
      setError("Failed to load completed appointments");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // LOAD SPECIFIC APPOINTMENT
  // =====================================================

  async function loadSpecificAppointment(appointmentId) {
    try {
      setLoading(true);
      setError("");

      const appointmentResponse = await fetch("/api/customer/appointment");
      const appointmentData = await appointmentResponse.json();

      if (!Array.isArray(appointmentData)) {
        setError("Failed to load appointment");
        return;
      }

      const appointment = appointmentData.find(
        (apt) => apt.id === appointmentId
      );

      if (!appointment) {
        setError("Appointment not found");
        return;
      }

      if (appointment.status !== "COMPLETED") {
        setError("You can only review completed appointments");
        return;
      }

      const reviewResponse = await fetch(
        `/api/appointment-reviews?appointmentId=${appointmentId}`
      );
      const reviewData = await reviewResponse.json();

      let review = null;
      if (reviewData.success && reviewData.reviews.length > 0) {
        review = reviewData.reviews[0];
      }

      setSelectedAppointment(appointment);
      setExistingReview(review);

      if (review) {
        setRating(review.rating);
        setComment(review.comment || "");
      }
    } catch (error) {
      console.error("LOAD SPECIFIC APPOINTMENT ERROR:", error);
      setError("Failed to load appointment data");
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // OPEN REVIEW
  // =====================================================

  async function openReview(appointment) {
    setMessage("");
    setError("");

    setSelectedAppointment(appointment);
    setExistingReview(appointment.review || null);

    if (appointment.review) {
      setRating(appointment.review.rating);
      setComment(appointment.review.comment || "");
    } else {
      setRating(5);
      setComment("");
    }

    window.history.replaceState(
      {},
      "",
      `/customer/appointment-review?appointmentId=${appointment.id}`
    );
  }

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!selectedAppointment) {
      setError("Appointment not found");
      return;
    }

    if (existingReview) {
      setError("You have already reviewed this appointment.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/appointment-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId: selectedAppointment.id,
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setMessage("Review submitted successfully!");
      setExistingReview(data.review);

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? {
                ...appointment,
                review: data.review,
              }
            : appointment
        )
      );
    } catch (error) {
      console.error("SUBMIT REVIEW ERROR:", error);
      setError(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // BACK TO REVIEW LIST
  // =====================================================

  const backToReviews = () => {
    setSelectedAppointment(null);
    setExistingReview(null);
    setMessage("");
    setError("");

    window.history.replaceState({}, "", "/customer/appointment-review");
  };

  // =====================================================
  // PAGINATION CALCULATION
  // =====================================================

  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentAppointments = appointments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 p-12 text-center max-w-sm w-full">
          <div className="w-8 h-8 border-4 border-pink-600 dark:border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // SPECIFIC APPOINTMENT REVIEW
  // =====================================================

  if (selectedAppointment) {
    return (
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">

          {/* BACK BUTTON */}
          <button
            onClick={backToReviews}
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/60 px-3 py-1.5 rounded-full transition cursor-pointer"
          >
            ← Back to Reviews
          </button>

          {/* HEADER */}
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 border border-pink-100 dark:border-pink-900/60 px-3 py-1 rounded-full">
              ✨ Feedback
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-3">
              {existingReview ? "Review Submitted" : "Leave a Review"}
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Share your thoughts on your completed salon service
            </p>
          </div>

          {/* SUCCESS MESSAGE */}
          {message && (
            <div className="mb-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <span>✅</span>
              <p>{message}</p>
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-4 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* APPOINTMENT DETAILS CARD */}
          <div className="mb-6 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Appointment Details
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Service
                </span>

                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedAppointment.service?.name || "Salon Service"}
                </span>
              </div>

              <div className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Date
                </span>

                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {new Date(selectedAppointment.date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Time
                </span>

                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedAppointment.time}
                </span>
              </div>

              <div className="flex justify-between gap-4 py-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Staff
                </span>

                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedAppointment.staff?.name || "Any Available Staff"}
                </span>
              </div>
            </div>
          </div>

          {/* EXISTING REVIEW CARD */}
          {existingReview && (
            <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Review Already Submitted
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  You have already shared your feedback for this appointment.
                </p>
              </div>

              {/* RATING */}
              <div className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Your Rating
                </span>

                <div className="flex items-center gap-1 text-xl">
                  <span className="text-amber-400">
                    {"★".repeat(existingReview.rating)}
                  </span>

                  <span className="text-slate-200 dark:text-slate-700">
                    {"★".repeat(5 - existingReview.rating)}
                  </span>

                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                    {existingReview.rating}/5
                  </span>
                </div>
              </div>

              {/* COMMENT */}
              {existingReview.comment && (
                <div className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Your Comment
                  </span>

                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    "{existingReview.comment}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* NEW REVIEW FORM */}
          {!existingReview && (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-6"
            >
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Rate Your Experience
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tap on a star to provide your rating
                </p>
              </div>

              {/* RATING */}
              <div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-3xl transition cursor-pointer ${
                        star <= rating
                          ? "text-amber-400"
                          : "text-slate-200 dark:text-slate-700"
                      } hover:text-amber-400`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  Selected: {rating} / 5 stars
                </p>
              </div>

              {/* COMMENT */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Comment (Optional)
                </label>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 px-6 py-3 font-bold text-sm text-white hover:bg-pink-700 dark:hover:bg-pink-500 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

        </div>
      </div>
    );
  }

  // =====================================================
  // REVIEW LIST - SIDEBAR / DASHBOARD VIEW
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 px-3 py-1 rounded-full">
            ✨ Feedback Management
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-3">
            My Reviews
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your completed salon appointments and staff services
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-4 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* NO COMPLETED APPOINTMENTS */}
        {appointments.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-16 text-center shadow-sm border border-slate-200/80 dark:border-slate-800">
            <span className="text-4xl mb-3 block">📅</span>

            <p className="font-bold text-slate-800 dark:text-slate-100 text-base">
              No completed appointments yet.
            </p>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Once you complete an appointment, you'll be able to leave a
              review here.
            </p>
          </div>
        ) : (
          <>
            {/* REVIEW LIST */}

            <div className="grid gap-5">
              {currentAppointments.map((appointment) => {
                const hasReview = !!appointment.review;

                return (
                  <div
                    key={appointment.id}
                    className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 transition hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {appointment.service?.name || "Salon Service"}
                        </h2>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-lg">
                            📅{" "}
                            {new Date(
                              appointment.date
                            ).toLocaleDateString()}
                          </span>

                          <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-lg">
                            ⏰ {appointment.time}
                          </span>

                          <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-2.5 py-1 rounded-lg">
                            👨‍💼{" "}
                            {appointment.staff?.name ||
                              "Any Available Staff"}
                          </span>
                        </div>
                      </div>

                      {/* STATUS BADGE */}

                      {hasReview ? (
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          ✓ Review Submitted
                        </span>
                      ) : (
                        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                          ⏳ Review Pending
                        </span>
                      )}
                    </div>

                    {/* EXISTING REVIEW PREVIEW */}

                    {hasReview && (
                      <div className="mt-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-4">
                        <div className="flex items-center gap-1 text-sm text-amber-400">
                          {"★".repeat(appointment.review.rating)}

                          <span className="text-slate-200 dark:text-slate-700">
                            {"★".repeat(5 - appointment.review.rating)}
                          </span>

                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
                            {appointment.review.rating}/5
                          </span>
                        </div>

                        {appointment.review.comment && (
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            "{appointment.review.comment}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* ACTION BUTTON */}

                    {!hasReview && (
                      <button
                        type="button"
                        onClick={() => openReview(appointment)}
                        className="mt-5 rounded-xl bg-slate-900 dark:bg-slate-100 px-5 py-2.5 font-bold text-xs text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition shadow-sm cursor-pointer"
                      >
                        Leave a Review
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* =========================
                PAGINATION
            ========================= */}

            {totalPages > 1 && (
              <div className="mt-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  {/* PAGE INFO */}

                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Showing{" "}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {startIndex + 1}
                    </span>
                    {" - "}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {Math.min(
                        startIndex + ITEMS_PER_PAGE,
                        appointments.length
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {appointments.length}
                    </span>{" "}
                    reviews
                  </p>

                  {/* PAGINATION BUTTONS */}

                  <div className="flex items-center justify-center gap-1.5">

                    {/* PREVIOUS */}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={currentPage === 1}
                      className="
                        rounded-lg
                        border
                        border-slate-200
                        dark:border-slate-700
                        bg-white
                        dark:bg-slate-800
                        px-3
                        py-2
                        text-xs
                        font-bold
                        text-slate-600
                        dark:text-slate-300
                        transition
                        hover:bg-slate-50
                        dark:hover:bg-slate-700
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      ← Previous
                    </button>

                    {/* PAGE NUMBERS */}

                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`
                            h-8
                            min-w-8
                            rounded-lg
                            px-2
                            text-xs
                            font-bold
                            transition
                            ${
                              currentPage === page
                                ? "bg-blue-600 text-white shadow-sm"
                                : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }
                          `}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    {/* NEXT */}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                      className="
                        rounded-lg
                        border
                        border-slate-200
                        dark:border-slate-700
                        bg-white
                        dark:bg-slate-800
                        px-3
                        py-2
                        text-xs
                        font-bold
                        text-slate-600
                        dark:text-slate-300
                        transition
                        hover:bg-slate-50
                        dark:hover:bg-slate-700
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

