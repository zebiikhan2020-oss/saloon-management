"use client";

import { useEffect, useState } from "react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();

      if (res.ok) {
        setCategories(data);
      } else {
        setMessage(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("FETCH CATEGORIES ERROR:", error);
      setMessage("Failed to fetch categories");
    }
  };

  // =====================================================
  // LOAD CATEGORIES
  // =====================================================

  useEffect(() => {
    fetchCategories();
  }, []);

  // =====================================================
  // ADD CATEGORY
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const categoryName = name.trim();

    if (!categoryName) {
      setMessage("Category name is required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Category added successfully ✅");
        setName("");
        fetchCategories();
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("ADD CATEGORY ERROR:", error);
      setMessage("Something went wrong while adding category");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE CATEGORY
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setDeletingId(id);

      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Category deleted successfully ✅");
        fetchCategories();
      } else {
        setMessage(data.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("DELETE CATEGORY ERROR:", error);
      setMessage("Something went wrong while deleting category");
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-slate-100 pb-5">
        <div className="min-w-0">
          <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
            Categories
          </span>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Manage Categories
          </h1>

          <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
            Add and manage your salon service categories.
          </p>
        </div>
      </div>

      {/* =====================================================
          MESSAGE
      ===================================================== */}

      {message && (
        <div
          className={`flex items-start sm:items-center gap-3 rounded-2xl border px-4 py-3 text-xs sm:text-sm shadow-xs ${
            message.includes("success") || message.includes("✅")
              ? "border-emerald-200/60 bg-emerald-50 text-emerald-700"
              : "border-rose-200/60 bg-rose-50 text-rose-700"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
              message.includes("success") || message.includes("✅")
                ? "bg-emerald-100 text-emerald-600"
                : "bg-rose-100 text-rose-600"
            }`}
          >
            {message.includes("success") || message.includes("✅")
              ? "✓"
              : "✕"}
          </span>

          <span>{message}</span>
        </div>
      )}

      {/* =====================================================
          ADD CATEGORY
      ===================================================== */}

      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">

        {/* CARD HEADER */}

        <div className="px-5 sm:px-6 lg:px-7 py-5 border-b border-slate-100 bg-slate-50/30">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Add New Category
          </h2>

          <p className="text-xs text-slate-500 mt-0.5">
            Create a category for organizing your salon services.
          </p>
        </div>

        {/* FORM */}

        <div className="p-5 sm:p-6 lg:p-7">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              placeholder="Category name e.g Hair, Makeup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 min-w-0 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>
      </div>

      {/* =====================================================
          CATEGORY LIST
      ===================================================== */}

      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">

        {/* LIST HEADER */}

        <div className="px-5 sm:px-6 lg:px-7 py-4 border-b border-slate-100 bg-slate-50/30 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              All Categories
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Manage your existing salon categories.
            </p>
          </div>

          <span className="w-fit text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            {categories.length} total
          </span>
        </div>

        {/* EMPTY STATE */}

        {categories.length === 0 ? (
          <div className="py-14 sm:py-16 text-center px-4">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
              📂
            </div>

            <p className="text-slate-500 text-sm font-medium">
              No categories found
            </p>

            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Add a new category above to get started.
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="border border-slate-100 bg-slate-50/40 rounded-2xl p-4 flex items-center justify-between gap-3 hover:bg-slate-50 hover:border-slate-200 transition"
                >
                  {/* CATEGORY NAME */}

                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {cat.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <span className="font-semibold text-slate-800 text-sm truncate">
                      {cat.name}
                    </span>
                  </div>

                  {/* DELETE */}

                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="shrink-0 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 px-3 py-2 text-[11px] sm:text-xs font-semibold hover:bg-rose-100 active:bg-rose-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {deletingId === cat.id
                      ? "Deleting..."
                      : "🗑️ Delete"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}