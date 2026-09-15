"use client";

import { useState, useEffect } from "react";

export default function AdminServicesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ===============================
  // FETCH CATEGORIES
  // ===============================
  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        console.log("Categories:", data);
        setCategories(data);
      })
      .catch((err) =>
        console.error("Category fetch error:", err)
      );
  }, []);

  // ===============================
  // SUBMIT SERVICE
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          duration,
          price,
          categoryId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Service added successfully!");

        setName("");
        setDescription("");
        setDuration("");
        setPrice("");
        setCategoryId("");
      } else {
        setMessage(data.message || "Error adding service");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("Error adding service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">

      {/* ===============================
          MAIN CARD
      =============================== */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">

        {/* ===============================
            HEADER
        =============================== */}
        <div className="px-5 sm:px-7 lg:px-8 pt-6 sm:pt-7 pb-5 border-b border-slate-100">

          <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
            Services
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Add New Salon Service
          </h2>

          <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl">
            Fill in the details below to add a new service to your salon menu.
          </p>
        </div>

        {/* ===============================
            FORM AREA
        =============================== */}
        <div className="p-5 sm:p-7 lg:p-8">

          {/* ===============================
              MESSAGE
          =============================== */}
          {message && (
            <div
              className={`mb-6 flex items-start sm:items-center gap-3 rounded-2xl border px-4 py-3 text-xs sm:text-sm shadow-xs ${
                message.includes("success")
                  ? "border-emerald-200/60 bg-emerald-50 text-emerald-700"
                  : "border-rose-200/60 bg-rose-50 text-rose-700"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  message.includes("success")
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-rose-100 text-rose-600"
                }`}
              >
                {message.includes("success") ? "✓" : "✕"}
              </span>

              <span>{message}</span>
            </div>
          )}

          {/* ===============================
              FORM
          =============================== */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* SERVICE NAME */}
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Service Name
              </label>

              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                placeholder="e.g. Premium Haircut"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Category
              </label>

              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              >
                <option value="">Select Category</option>

                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Description
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                placeholder="Service details..."
              />
            </div>

            {/* ===============================
                DURATION + PRICE
            =============================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* DURATION */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Duration (Minutes)
                </label>

                <input
                  type="number"
                  required
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="30"
                />
              </div>

              {/* PRICE */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Price ($)
                </label>

                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="25.00"
                />
              </div>

            </div>

            {/* ===============================
                SUBMIT BUTTON
            =============================== */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding Service..." : "Add Service"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}