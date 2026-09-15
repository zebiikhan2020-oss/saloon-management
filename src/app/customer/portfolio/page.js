"use client";

import { useEffect, useState } from "react";

export default function CustomerPortfolioPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Selected portfolio
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Review form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // =========================
  // FETCH PORTFOLIOS
  // =========================

  useEffect(() => {
    fetchPortfolios();
  }, []);

  async function fetchPortfolios() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/portfolio");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch portfolios");
      }

      setPortfolios(data.portfolios || []);
    } catch (error) {
      console.error("FETCH CUSTOMER PORTFOLIO ERROR:", error);
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // OPEN PORTFOLIO
  // =========================

  async function openPortfolio(portfolio) {
    setSelectedPortfolio(portfolio);

    setRating(0);
    setComment("");
    setReviewError("");

    await fetchReviews(portfolio.id);
  }

  // =========================
  // CLOSE PORTFOLIO
  // =========================

  function closePortfolio() {
    setSelectedPortfolio(null);
    setReviews([]);
    setRating(0);
    setComment("");
    setReviewError("");
  }

  // =========================
  // FETCH REVIEWS
  // =========================

  async function fetchReviews(portfolioId) {
    try {
      setReviewsLoading(true);
      setReviewError("");

      const res = await fetch(
        `/api/reviews?portfolioId=${encodeURIComponent(portfolioId)}`
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch reviews");
      }

      setReviews(data.reviews || []);
    } catch (error) {
      console.error("FETCH REVIEWS ERROR:", error);
      setReviewError(error.message || "Failed to load reviews");
    } finally {
      setReviewsLoading(false);
    }
  }

  // =========================
  // SUBMIT REVIEW
  // =========================

  async function handleSubmitReview(e) {
    e.preventDefault();

    if (!selectedPortfolio) {
      return;
    }

    if (!rating) {
      setReviewError("Please select a rating.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError("");

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          portfolioId: selectedPortfolio.id,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit review");
      }

      setReviews((prev) => [data.review, ...prev]);

      setRating(0);
      setComment("");

      fetchPortfolios();
    } catch (error) {
      console.error("SUBMIT REVIEW ERROR:", error);

      if (
        error.message === "You have already reviewed this portfolio" ||
        error.message.includes("already reviewed")
      ) {
        setReviewError("You have already reviewed this portfolio.");
      } else {
        setReviewError(error.message || "Failed to submit review");
      }
    } finally {
      setSubmittingReview(false);
    }
  }

  // =========================
  // AVERAGE RATING
  // =========================

  function calculateAverageRating() {
    if (!reviews.length) return "0.0";

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return (total / reviews.length).toFixed(1);
  }

  // =========================
  // STARS
  // =========================

  function renderStars(value, interactive = false) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={
              interactive ? () => setRating(star) : undefined
            }
            aria-label={
              interactive ? `Rate ${star} stars` : undefined
            }
            className={`
              text-xl
              sm:text-2xl
              transition
              ${
                star <= value
                  ? "text-yellow-400"
                  : "text-slate-200 dark:text-slate-700"
              }
              ${
                interactive
                  ? "cursor-pointer hover:text-yellow-400"
                  : "cursor-default"
              }
            `}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600" />

            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Loading portfolios...
            </p>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Please wait a moment
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-2xl">
              ⚠️
            </div>

            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Unable to load portfolios
            </h2>

            <p className="mt-2 break-words text-sm text-rose-600 dark:text-rose-400">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ================================================= */}
      {/* MAIN PAGE */}
      {/* ================================================= */}

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
        <div className="mx-auto w-full max-w-7xl">

          {/* =========================
              HEADER
          ========================= */}

          <div className="mb-6 sm:mb-8">
            <span className="inline-flex items-center rounded-full border border-blue-100 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400 sm:text-xs">
              ✨ Style Showcase
            </span>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Staff Portfolio
            </h1>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
              Explore our staff members and their creative work
            </p>
          </div>

          {/* =========================
              EMPTY
          ========================= */}

          {portfolios.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-12 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-3xl">
                🎨
              </div>

              <p className="font-bold text-slate-800 dark:text-slate-100">
                No portfolios available yet.
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
                Check back later for new styles and updates.
              </p>
            </div>
          ) : (
            /* =========================
               PORTFOLIO GRID
            ========================= */

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6">
              {portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="
                    group
                    flex
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    dark:border-slate-800
                    bg-white
                    dark:bg-slate-900
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-slate-300
                    dark:hover:border-slate-700
                    hover:shadow-lg
                  "
                >

                  {/* =========================
                      IMAGE
                  ========================= */}

                  <div className="relative flex h-52 w-full items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 sm:h-56">
                    {portfolio.imageUrl ? (
                      <img
                        src={portfolio.imageUrl}
                        alt={portfolio.title || "Portfolio"}
                        className="
                          h-full
                          w-full
                          object-contain
                          p-3
                          transition-transform
                          duration-500
                          group-hover:scale-[1.02]
                        "
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <div className="text-center">
                          <div className="mb-2 text-3xl">
                            🖼️
                          </div>

                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                            No Image Available
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* =========================
                      CONTENT
                  ========================= */}

                  <div className="flex flex-1 flex-col p-5 sm:p-6">

                    {/* STAFF */}

                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400 sm:text-xs">
                      {portfolio.staff?.name || "Staff Member"}
                    </span>

                    {/* TITLE */}

                    <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                      {portfolio.title}
                    </h3>

                    {/* DESCRIPTION */}

                    {portfolio.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {portfolio.description}
                      </p>
                    )}

                    {/* PRICE + RATING */}

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">

                      {/* PRICE */}

                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                          Price
                        </span>

                        <span className="mt-1 block text-base font-extrabold text-slate-900 dark:text-slate-100">
                          Rs. {portfolio.price}
                        </span>
                      </div>

                      {/* RATING */}

                      <div className="flex justify-end">
                        <div className="inline-flex h-fit items-center gap-1.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5">
                          <span className="text-xs text-amber-500">
                            ⭐
                          </span>

                          <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                            {portfolio.averageRating || "0.0"}
                          </span>

                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            ({portfolio.reviewCount || 0})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* VIEW BUTTON */}

                    <button
                      onClick={() => openPortfolio(portfolio)}
                      className="
                        mt-6
                        w-full
                        rounded-xl
                        bg-slate-900
                        dark:bg-slate-100
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-white
                        dark:text-slate-900
                        shadow-sm
                        transition
                        hover:bg-blue-600
                        dark:hover:bg-blue-500
                        dark:hover:text-white
                        active:scale-[0.98]
                        cursor-pointer
                      "
                    >
                      View Portfolio & Reviews
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* PORTFOLIO DETAIL MODAL */}
      {/* ================================================= */}

      {selectedPortfolio && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-900/60
            p-2
            backdrop-blur-sm
            sm:p-4
          "
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closePortfolio();
            }
          }}
        >
          <div
            className="
              flex
              max-h-[96vh]
              w-full
              max-w-4xl
              flex-col
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              dark:border-slate-800
              bg-white
              dark:bg-slate-900
              shadow-2xl
              sm:max-h-[92vh]
            "
          >

            {/* =========================
                MODAL HEADER
            ========================= */}

            <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-lg">
                  {selectedPortfolio.staff?.name ||
                    "Staff Member"}
                </h2>

                <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
                  {selectedPortfolio.title}
                </p>
              </div>

              <button
                onClick={closePortfolio}
                aria-label="Close portfolio"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-100
                  dark:bg-slate-800
                  text-lg
                  text-slate-700
                  dark:text-slate-200
                  transition
                  hover:bg-slate-200
                  dark:hover:bg-slate-700
                  active:scale-95
                  cursor-pointer
                "
              >
                ×
              </button>
            </div>

            {/* =========================
                MODAL SCROLL AREA
            ========================= */}

            <div className="overflow-y-auto">
              <div className="space-y-6 p-4 sm:p-6 lg:p-8">

                {/* =========================
                    IMAGE
                ========================= */}

                <div className="flex h-60 w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 sm:h-80 lg:h-96">
                  {selectedPortfolio.imageUrl ? (
                    <img
                      src={selectedPortfolio.imageUrl}
                      alt={
                        selectedPortfolio.title ||
                        "Portfolio"
                      }
                      className="h-full w-full object-contain p-3 sm:p-4"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 sm:text-sm">
                      No Image Available
                    </span>
                  )}
                </div>

                {/* =========================
                    PORTFOLIO INFO
                ========================= */}

                <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-2xl">
                      {selectedPortfolio.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                      Crafted by{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {selectedPortfolio.staff?.name ||
                          "Staff Member"}
                      </span>
                    </p>
                  </div>

                  <div className="w-fit rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                      Price
                    </span>

                    <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 sm:text-xl">
                      Rs. {selectedPortfolio.price}
                    </span>
                  </div>
                </div>

                {/* =========================
                    DESCRIPTION
                ========================= */}

                {selectedPortfolio.description && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-700 dark:text-slate-300">
                      About This Work
                    </h4>

                    <p className="mt-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {selectedPortfolio.description}
                    </p>
                  </div>
                )}

                {/* ================================================= */}
                {/* REVIEWS */}
                {/* ================================================= */}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-6">

                  {/* REVIEW HEADER */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                        Customer Reviews
                      </h3>

                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        See what customers think about this work.
                      </p>
                    </div>

                    {/* RATING SUMMARY */}

                    <div className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3">
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        {calculateAverageRating()}
                      </span>

                      <div>
                        <div className="text-sm text-amber-400">
                          {"★".repeat(
                            Math.round(
                              Number(
                                calculateAverageRating()
                              )
                            )
                          )}
                        </div>

                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:text-[11px]">
                          {reviews.length} review
                          {reviews.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* =========================
                      WRITE REVIEW
                  ========================= */}

                  <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 p-4 sm:p-6">
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Write a Review
                    </h4>

                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Share your experience with this staff member.
                    </p>

                    <form
                      onSubmit={handleSubmitReview}
                      className="mt-5 space-y-5"
                    >
                      {/* RATING */}

                      <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300 sm:text-xs">
                          Your Rating
                        </label>

                        {renderStars(rating, true)}

                        {rating > 0 && (
                          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                            You selected {rating} out of 5 stars.
                          </p>
                        )}
                      </div>

                      {/* COMMENT */}

                      <div>
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300 sm:text-xs">
                          Your Review
                        </label>

                        <textarea
                          value={comment}
                          onChange={(e) =>
                            setComment(e.target.value)
                          }
                          rows={4}
                          placeholder="Write your experience..."
                          className="
                            w-full
                            resize-none
                            rounded-xl
                            border
                            border-slate-200
                            dark:border-slate-700
                            bg-white
                            dark:bg-slate-900
                            px-4
                            py-3
                            text-sm
                            text-slate-800
                            dark:text-slate-100
                            outline-none
                            transition
                            placeholder:text-slate-400
                            dark:placeholder:text-slate-500
                            focus:border-blue-500
                            focus:ring-2
                            focus:ring-blue-100
                            dark:focus:ring-blue-950/50
                          "
                        />
                      </div>

                      {/* ERROR */}

                      {reviewError && (
                        <div className="flex items-start gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs font-semibold text-rose-700 dark:text-rose-300">
                          <span>⚠️</span>

                          <p className="break-words">
                            {reviewError}
                          </p>
                        </div>
                      )}

                      {/* SUBMIT */}

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="
                          w-full
                          rounded-xl
                          bg-slate-900
                          dark:bg-slate-100
                          px-6
                          py-3
                          text-sm
                          font-bold
                          text-white
                          dark:text-slate-900
                          shadow-sm
                          transition
                          hover:bg-blue-600
                          dark:hover:bg-blue-500
                          dark:hover:text-white
                          active:scale-[0.98]
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                          sm:w-auto
                          cursor-pointer
                        "
                      >
                        {submittingReview
                          ? "Submitting..."
                          : "Submit Review"}
                      </button>
                    </form>
                  </div>

                  {/* =========================
                      REVIEWS LIST
                  ========================= */}

                  <div className="mt-6">
                    {reviewsLoading ? (
                      <div className="py-8 text-center">
                        <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600" />

                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Loading reviews...
                        </p>
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-7 text-center sm:p-8">
                        <div className="mb-2 text-3xl">
                          ⭐
                        </div>

                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                          No reviews yet
                        </p>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                          Be the first customer to review this work.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-5"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                                  {review.customer?.name ||
                                    "Anonymous"}
                                </p>

                                <div className="mt-1 flex items-center gap-2">
                                  <div className="text-xs text-amber-400">
                                    {"★".repeat(
                                      Number(review.rating)
                                    )}
                                  </div>

                                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                    {review.rating}/5
                                  </span>
                                </div>
                              </div>

                              {review.createdAt && (
                                <span className="shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500 sm:text-[11px]">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {review.comment && (
                              <p className="mt-3 break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                                "{review.comment}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}