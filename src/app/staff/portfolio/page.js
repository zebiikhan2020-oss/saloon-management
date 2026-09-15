"use client";

import { useEffect, useState } from "react";

export default function StaffPortfolioPage() {
  const [portfolio, setPortfolio] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // FETCH PORTFOLIO
  // ==========================================

  async function fetchPortfolio() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/staff/portfolio");
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch portfolio");
        return;
      }

      setPortfolio(data.portfolio || []);
    } catch (error) {
      console.error("FETCH PORTFOLIO ERROR:", error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // ==========================================
  // RESET FORM
  // ==========================================

  function resetForm() {
    setTitle("");
    setDescription("");
    setPrice("");
    setImage(null);
    setImagePreview("");
    setEditingId(null);
    setMessage("");
    setError("");
  }

  // ==========================================
  // IMAGE SELECT
  // ==========================================

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      setImage(null);
      setImagePreview("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, JPEG, PNG and WEBP images are allowed.");
      e.target.value = "";
      setImage(null);
      setImagePreview("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      e.target.value = "";
      setImage(null);
      setImagePreview("");
      return;
    }

    setError("");
    setImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  // ==========================================
  // ADD / UPDATE
  // ==========================================

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!title.trim()) {
      setError("Work title is required");
      return;
    }

    if (!price || Number(price) < 0) {
      setError("Please enter a valid price");
      return;
    }

    if (!editingId && !image) {
      setError("Please select a portfolio image.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("price", price);

      if (image) {
        formData.append("image", image);
      }

      if (editingId) {
        formData.append("id", editingId);

        const res = await fetch("/api/staff/portfolio", {
          method: "PUT",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to update work");
          return;
        }

        setMessage("Work updated successfully ✅");
        resetForm();
        await fetchPortfolio();
        return;
      }

      const res = await fetch("/api/staff/portfolio", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to add work");
        return;
      }

      setMessage("Work added successfully ✅");
      resetForm();
      await fetchPortfolio();
    } catch (error) {
      console.error("SAVE PORTFOLIO ERROR:", error);
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // EDIT
  // ==========================================

  function handleEdit(item) {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setPrice(
      item.price !== null && item.price !== undefined
        ? String(item.price)
        : ""
    );
    setImage(null);

    if (item.imageUrl) {
      setImagePreview(item.imageUrl);
    } else {
      setImagePreview("");
    }

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ==========================================
  // DELETE
  // ==========================================

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this work?"
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setError("");

      const res = await fetch("/api/staff/portfolio", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to delete work");
        return;
      }

      setMessage("Work deleted successfully ✅");

      if (editingId === id) {
        resetForm();
      }

      await fetchPortfolio();
    } catch (error) {
      console.error("DELETE PORTFOLIO ERROR:", error);
      setError("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            My Portfolio
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400 mt-1">
            Add and showcase your salon work easily.
          </p>
        </div>

        {/* ==========================================
            NOTIFICATIONS
        ========================================== */}

        {message && (
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 px-4 py-3 text-xs sm:text-sm font-semibold shadow-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 px-4 py-3 text-xs sm:text-sm font-semibold shadow-sm">
            {error}
          </div>
        )}

        {/* ==========================================
            ADD / EDIT FORM
        ========================================== */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 lg:p-7">
          <div className="mb-5">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {editingId ? "Edit Portfolio Work" : "Add New Work"}
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Add your salon work with title, price, image and description.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* TITLE + PRICE */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

              {/* TITLE */}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Work Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Wolf Cut"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  required
                />
              </div>

              {/* PRICE */}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  required
                />

                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                  Enter the price for this work/service.
                </p>
              </div>
            </div>

            {/* IMAGE */}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Portfolio Image
              </label>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 file:mr-3 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-[11px] sm:file:text-xs file:font-semibold file:bg-blue-100 dark:file:bg-blue-950/60 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-200 dark:hover:file:bg-blue-900/70 transition"
              />

              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                JPG, JPEG, PNG or WEBP. Maximum 5MB.
              </p>

              {/* IMAGE PREVIEW */}

              {imagePreview && (
                <div className="mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    {editingId ? "Image Preview" : "Selected Image"}
                  </p>

                  <div className="w-full sm:max-w-sm h-52 sm:h-64 bg-blue-50/30 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-2xl flex items-center justify-center overflow-hidden p-2">
                    <img
                      src={imagePreview}
                      alt="Portfolio preview"
                      className="max-h-full max-w-full object-contain rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your work..."
                rows={4}
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition resize-y"
              />
            </div>

            {/* BUTTONS */}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition text-sm shadow-sm cursor-pointer"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Work"
                  : "Add Work"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="w-full sm:w-auto bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ==========================================
            PORTFOLIO LIST
        ========================================== */}

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                My Work
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your portfolio work and services.
              </p>
            </div>

            {portfolio.length > 0 && (
              <span className="w-fit text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 px-3 py-1.5 rounded-full">
                {portfolio.length}{" "}
                {portfolio.length === 1 ? "Work" : "Works"}
              </span>
            )}
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 py-20 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full mx-auto mb-3" />

              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                Loading portfolio...
              </p>
            </div>
          ) : portfolio.length === 0 ? (
            /* EMPTY */

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 p-10 sm:p-12 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-xl">
                🖼️
              </div>

              <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                No portfolio work added yet.
              </p>
            </div>
          ) : (
            /* CARDS */

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 transition"
                >
                  {/* IMAGE */}

                  {item.imageUrl ? (
                    <div className="w-full h-56 sm:h-60 bg-blue-50/20 dark:bg-blue-950/20 flex items-center justify-center p-2 border-b border-slate-200 dark:border-slate-800">
                      <img
                        src={item.imageUrl}
                        alt={item.title || "Portfolio work"}
                        className="max-h-full max-w-full object-contain rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-56 sm:h-60 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-medium border-b border-slate-100 dark:border-slate-700">
                      No Image
                    </div>
                  )}

                  {/* CONTENT */}

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 break-words">
                        {item.title}
                      </h3>

                      {/* PRICE */}

                      <p className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                        Rs.{" "}
                        {Number(item.price || 0).toLocaleString()}
                      </p>

                      {/* DESCRIPTION */}

                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2 line-clamp-3 leading-5">
                        {item.description || "No description added."}
                      </p>
                    </div>

                    {/* BUTTONS */}

                    <div className="grid grid-cols-2 gap-2.5 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="w-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-100 dark:border-blue-800 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="w-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-100 dark:border-rose-800 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}