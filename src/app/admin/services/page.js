
"use client";

import { useState, useEffect } from "react";

export default function AdminServicesPage() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ===============================
  // EDIT SERVICE
  // ===============================
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // ===============================
  // DARK MODE
  // ===============================
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setDarkMode(
        document.documentElement.classList.contains("dark")
      );
    };

    updateTheme();

    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // ===============================
  // FETCH CATEGORIES
  // ===============================
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();

      console.log("Categories:", data);

      if (res.ok) {
        setCategories(data);
      }
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  };

  // ===============================
  // FETCH SERVICES
  // ===============================
  const fetchServices = async () => {
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();

      if (res.ok) {
        setServices(data);
      } else {
        console.error("Service fetch error:", data);
      }
    } catch (err) {
      console.error("Service fetch error:", err);
    }
  };

  // ===============================
  // LOAD DATA
  // ===============================
  useEffect(() => {
    fetchCategories();
    fetchServices();
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

        fetchServices();
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

  // ===============================
  // START EDIT
  // ===============================
  const handleEdit = (service) => {
    setEditingId(service.id);
    setEditName(service.name || "");
    setEditDescription(service.description || "");
    setEditDuration(service.duration || "");
    setEditPrice(service.price ?? "");
    setEditCategoryId(service.categoryId || "");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ===============================
  // DELETE SERVICE
  // ===============================
  const handleDelete = async (service) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${service.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      const res = await fetch(
        `/api/admin/services/${service.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Service deleted successfully!");
        fetchServices();
      } else {
        setMessage(
          data.message || "Error deleting service"
        );
      }
    } catch (err) {
      console.error("Delete service error:", err);
      setMessage("Error deleting service");
    }
  };

  // ===============================
  // CANCEL EDIT
  // ===============================
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditDuration("");
    setEditPrice("");
    setEditCategoryId("");
  };

  // ===============================
  // UPDATE SERVICE
  // ===============================
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setEditLoading(true);

    try {
      const res = await fetch(
        `/api/admin/services/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editName,
            description: editDescription,
            duration: editDuration,
            price: editPrice,
            categoryId: editCategoryId,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Service updated successfully!");

        handleCancelEdit();
        fetchServices();
      } else {
        setMessage(
          data.message || "Error updating service"
        );
      }
    } catch (err) {
      console.error("Update service error:", err);
      setMessage("Error updating service");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">

      {/* ===============================
          MAIN CARD
      =============================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden">

        {/* ===============================
            HEADER
        =============================== */}
        <div className="px-5 sm:px-7 lg:px-8 pt-6 sm:pt-7 pb-5 border-b border-slate-100 dark:border-slate-800">

          <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 border border-blue-100 dark:border-blue-500/30 px-3 py-1 rounded-full">
            Services
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {editingId
              ? "Edit Salon Service"
              : "Add New Salon Service"}
          </h2>

          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl">
            {editingId
              ? "Update the service details and price."
              : "Fill in the details below to add a new service to your salon menu."}
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
                message.includes("successfully")
                  ? "border-emerald-200/60 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-rose-200/60 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  message.includes("successfully")
                    ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400"
                }`}
              >
                {message.includes("successfully") ? "✓" : "✕"}
              </span>

              <span>{message}</span>
            </div>
          )}

          {/* ===============================
              ADD FORM
          =============================== */}
          {!editingId && (
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* SERVICE NAME */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Service Name
                </label>

                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  placeholder="e.g. Premium Haircut"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Category
                </label>

                <select
                  required
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  <option
                    value=""
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    Select Category
                  </option>

                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                  placeholder="Service details..."
                />
              </div>

              {/* DURATION + PRICE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* DURATION */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Duration (Minutes)
                  </label>

                  <input
                    type="number"
                    required
                    min="1"
                    value={duration}
                    onChange={(e) =>
                      setDuration(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    placeholder="30"
                  />
                </div>

                {/* PRICE */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Price ($)
                  </label>

                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    placeholder="25.00"
                  />
                </div>

              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Adding Service..."
                    : "Add Service"}
                </button>
              </div>

            </form>
          )}

          {/* ===============================
              EDIT FORM
          =============================== */}
          {editingId && (
            <form
              onSubmit={handleUpdate}
              className="space-y-5"
            >

              {/* SERVICE NAME */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Service Name
                </label>

                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Category
                </label>

                <select
                  required
                  value={editCategoryId}
                  onChange={(e) =>
                    setEditCategoryId(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                >
                  <option
                    value=""
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    Select Category
                  </option>

                  {categories.map((cat) => (
                    <option
                      key={cat.id}
                      value={cat.id}
                      className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) =>
                    setEditDescription(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                  placeholder="Service details..."
                />
              </div>

              {/* DURATION + PRICE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* DURATION */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Duration (Minutes)
                  </label>

                  <input
                    type="number"
                    required
                    min="1"
                    value={editDuration}
                    onChange={(e) =>
                      setEditDuration(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                {/* PRICE */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Price ($)
                  </label>

                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) =>
                      setEditPrice(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

              </div>

              {/* EDIT BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">

                <button
                  type="submit"
                  disabled={editLoading}
                  className="w-full rounded-xl bg-blue-600 py-3 sm:py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 active:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editLoading
                    ? "Updating Service..."
                    : "Update Service"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={editLoading}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 sm:py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>

              </div>

            </form>
          )}

        </div>
      </div>

      {/* ===============================
          EXISTING SERVICES
      =============================== */}
      <div className="mt-5 sm:mt-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden">

        {/* HEADER */}
        <div className="px-5 sm:px-6 lg:px-7 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/40 flex items-center justify-between gap-3">

          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              Existing Services
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage your salon services and prices.
            </p>
          </div>

          <span className="shrink-0 text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
            {services.length} total
          </span>

        </div>

        {/* SERVICE LIST */}
        {services.length === 0 ? (
          <div className="py-14 text-center px-4">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
              ✂️
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              No services found
            </p>

            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
              Add a service above to get started.
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-5 lg:p-6 space-y-3">

            {services.map((service) => (
              <div
                key={service.id}
                className="border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/60 rounded-2xl p-4 sm:p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  {/* SERVICE INFO */}
                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                        {service.name}
                      </h3>

                      {service.category?.name && (
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 border border-blue-100 dark:border-blue-500/30 px-2 py-1 rounded-md">
                          {service.category.name}
                        </span>
                      )}

                    </div>

                    {service.description && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {service.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">

                      <span className="text-slate-500 dark:text-slate-400">
                        Duration:
                        <span className="font-semibold text-slate-700 dark:text-slate-200 ml-1">
                          {service.duration} min
                        </span>
                      </span>

                      <span className="text-slate-500 dark:text-slate-400">
                        Price:
                        <span className="font-bold text-slate-900 dark:text-white ml-1">
                          Rs. {Number(service.price || 0).toLocaleString()}
                        </span>
                      </span>

                    </div>

                  </div>

                  {/* EDIT + DELETE BUTTONS */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0">

                    <button
                      type="button"
                      onClick={() => handleEdit(service)}
                      className="w-full lg:w-auto rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 px-4 py-2.5 text-xs sm:text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/20 active:bg-blue-200 dark:active:bg-blue-500/30 transition"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(service)}
                      className="w-full lg:w-auto rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 px-4 py-2.5 text-xs sm:text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/20 active:bg-rose-200 dark:active:bg-rose-500/30 transition"
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

