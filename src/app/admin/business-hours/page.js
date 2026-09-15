"use client";

import { useEffect, useState } from "react";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function BusinessHoursPage() {
  const [businessHours, setBusinessHours] = useState([]);
  const [specialHours, setSpecialHours] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [specialDate, setSpecialDate] = useState("");
  const [specialType, setSpecialType] = useState("FULL_DAY");
  const [specialReason, setSpecialReason] = useState("");
  const [addingSpecial, setAddingSpecial] = useState(false);
  const [deletingSpecialId, setDeletingSpecialId] = useState(null);

  // =====================================================
  // FETCH
  // =====================================================

  async function fetchBusinessHours() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/business-hours");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch business hours");
      }

      setBusinessHours(data.businessHours || []);
      setSpecialHours(data.specialBusinessHours || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBusinessHours();
  }, []);

  // =====================================================
  // GET DAY DATA
  // =====================================================

  function getDayData(day) {
    return (
      businessHours.find((item) => item.day === day) || {
        day,
        type: "NORMAL",
        openTime: "09:00",
        closeTime: "22:00",
      }
    );
  }

  // =====================================================
  // UPDATE DAY
  // =====================================================

  async function updateDay(day, changes) {
    try {
      setMessage("");
      setError("");

      const current = getDayData(day);

      const payload = {
        day,
        type: changes.type ?? current.type,
        openTime: changes.openTime ?? current.openTime,
        closeTime: changes.closeTime ?? current.closeTime,
      };

      const res = await fetch("/api/admin/business-hours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update");
      }

      setMessage(`${day} updated successfully ✅`);
      fetchBusinessHours();
    } catch (error) {
      setError(error.message);
    }
  }

  // =====================================================
  // SPECIAL DATE
  // =====================================================

  async function addSpecialHour(e) {
    e.preventDefault();

    if (!specialDate) {
      setError("Please select a date");
      return;
    }

    try {
      setMessage("");
      setError("");
      setAddingSpecial(true);

      const res = await fetch("/api/admin/business-hours", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: specialDate,
          type: specialType,
          reason: specialReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save special date");
      }

      setMessage("Special business hour added successfully ✅");

      setSpecialDate("");
      setSpecialReason("");
      setSpecialType("FULL_DAY");

      fetchBusinessHours();
    } catch (error) {
      setError(error.message);
    } finally {
      setAddingSpecial(false);
    }
  }

  // =====================================================
  // DELETE SPECIAL DATE
  // =====================================================

  async function deleteSpecialHour(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this special date?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingSpecialId(id);

      const res = await fetch(`/api/admin/business-hours?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete");
      }

      setMessage("Special date deleted successfully ✅");
      fetchBusinessHours();
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingSpecialId(null);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin"></div>

          <p className="text-slate-500 text-sm font-medium text-center">
            Loading business hours...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">

      {/* HEADER */}
      <div className="border-b border-slate-100 pb-5">
        <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Schedule
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
          Business Hours
        </h1>

        <p className="text-slate-500 text-sm mt-1">
          Manage salon opening, closing and special hours.
        </p>
      </div>

      {/* MESSAGES */}
      {message && (
        <div className="flex items-start sm:items-center gap-3 rounded-xl border border-emerald-200/60 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-xs">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-emerald-100">
            ✓
          </span>

          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start sm:items-center gap-3 rounded-xl border border-rose-200/60 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-xs">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-rose-100">
            ✕
          </span>

          <span>{error}</span>
        </div>
      )}

      {/* WEEKLY HOURS */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Weekly Business Hours
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Set your regular opening and closing hours for each day.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {days.map((day) => {
            const data = getDayData(day);

            return (
              <div
                key={day}
                className="border border-slate-100 bg-slate-50/40 rounded-xl p-4 sm:p-5 hover:bg-slate-50/80 transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">

                  {/* DAY */}
                  <div className="w-full lg:w-32 shrink-0">
                    <h3 className="font-semibold text-slate-800 text-sm">
                      {day}
                    </h3>
                  </div>

                  {/* CONTROLS */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 flex-1">

                    {/* TYPE */}
                    <select
                      value={data.type}
                      onChange={(e) =>
                        updateDay(day, { type: e.target.value })
                      }
                      className="border border-slate-200/80 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition w-full sm:w-44"
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="FULL_DAY">Full Day (24h)</option>
                      <option value="CLOSED">Closed</option>
                    </select>

                    {/* NORMAL TIMES */}
                    {data.type === "NORMAL" && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="time"
                          value={data.openTime || "09:00"}
                          onChange={(e) =>
                            updateDay(day, {
                              openTime: e.target.value,
                            })
                          }
                          className="min-w-0 flex-1 sm:flex-none border border-slate-200/80 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                        />

                        <span className="text-slate-400 text-sm px-1 shrink-0">
                          to
                        </span>

                        <input
                          type="time"
                          value={data.closeTime || "22:00"}
                          onChange={(e) =>
                            updateDay(day, {
                              closeTime: e.target.value,
                            })
                          }
                          className="min-w-0 flex-1 sm:flex-none border border-slate-200/80 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                        />
                      </div>
                    )}

                    {/* FULL DAY */}
                    {data.type === "FULL_DAY" && (
                      <span className="inline-flex w-fit text-emerald-600 font-semibold text-xs bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                        Open 24 Hours
                      </span>
                    )}

                    {/* CLOSED */}
                    {data.type === "CLOSED" && (
                      <span className="inline-flex w-fit text-rose-600 font-semibold text-xs bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg">
                        Salon Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SPECIAL HOURS */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-100 p-4 sm:p-6 lg:p-8">
        <div className="mb-5 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Special Business Hours
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Use this for Eid, holidays or other special dates.
          </p>
        </div>

        {/* ADD FORM */}
        <form
          onSubmit={addSpecialHour}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-slate-50/50 border border-slate-100 p-4 sm:p-5 rounded-2xl"
        >
          {/* DATE */}
          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Date
            </label>

            <input
              type="date"
              value={specialDate}
              min={(() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, "0");
                const day = String(today.getDate()).padStart(2, "0");

                return `${year}-${month}-${day}`;
              })()}
              onChange={(e) => setSpecialDate(e.target.value)}
              className="w-full border border-slate-200/80 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* TYPE */}
          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Type
            </label>

            <select
              value={specialType}
              onChange={(e) => setSpecialType(e.target.value)}
              className="w-full border border-slate-200/80 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            >
              <option value="FULL_DAY">Full Day (24h)</option>
              <option value="NORMAL">Normal</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* REASON */}
          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Reason
            </label>

            <input
              type="text"
              value={specialReason}
              onChange={(e) => setSpecialReason(e.target.value)}
              placeholder="Eid-ul-Fitr"
              className="w-full border border-slate-200/80 bg-white rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* ADD BUTTON */}
          <button
            type="submit"
            disabled={addingSpecial}
            className="w-full rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
          >
            {addingSpecial ? "Adding..." : "Add Special Date"}
          </button>
        </form>

        {/* SPECIAL LIST */}
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 mb-3">
            Configured Special Dates
          </h3>

          {specialHours.length === 0 ? (
            <div className="py-8 px-4 text-center border border-dashed border-slate-200 rounded-xl">
              <p className="text-slate-500 text-sm">
                No special business hours added.
              </p>
            </div>
          ) : (
            specialHours.map((item) => (
              <div
                key={item.id}
                className="border border-slate-100 bg-slate-50/40 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                {/* DATE + REASON */}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">
                    {new Date(item.date).toLocaleDateString()}
                  </p>

                  <p className="text-slate-500 text-xs mt-0.5 break-words">
                    {item.reason || "Special Day"}
                  </p>
                </div>

                {/* TYPE + DELETE */}
                <div className="flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-3">
                  <span
                    className={`font-semibold text-xs px-2.5 py-1.5 rounded-md border text-center whitespace-nowrap ${
                      item.type === "CLOSED"
                        ? "bg-rose-50 border-rose-100 text-rose-600"
                        : item.type === "FULL_DAY"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : "bg-blue-50 border-blue-100 text-blue-600"
                    }`}
                  >
                    {item.type === "FULL_DAY"
                      ? "Open 24 Hours"
                      : item.type === "CLOSED"
                      ? "Closed"
                      : `${item.openTime} - ${item.closeTime}`}
                  </span>

                  <button
                    onClick={() => deleteSpecialHour(item.id)}
                    disabled={deletingSpecialId === item.id}
                    className="rounded-xl bg-rose-50 border border-rose-100 text-rose-600 px-3 py-2 text-xs font-semibold hover:bg-rose-100 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {deletingSpecialId === item.id
                      ? "Deleting..."
                      : "🗑️ Delete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}