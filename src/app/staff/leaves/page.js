"use client";

import { useEffect, useState } from "react";

export default function StaffLeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [filterStatus, setFilterStatus] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // TODAY'S DATE
  // ==========================================

  const today = new Date().toISOString().split("T")[0];

  // ==========================================
  // FETCH LEAVES
  // ==========================================

  useEffect(() => {
    fetchLeaves();
  }, []);

  async function fetchLeaves() {
    try {
      setLoading(true);

      const url = filterStatus
        ? `/api/staff/leave?status=${filterStatus}`
        : "/api/staff/leave";

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setLeaves(Array.isArray(data) ? data : []);
      } else {
        setError(data.message || "Failed to fetch leave requests");
      }
    } catch (err) {
      console.error("FETCH LEAVES ERROR:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  // ==========================================
  // HANDLE FORM CHANGE
  // ==========================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");

    if (
      name === "startDate" &&
      formData.endDate &&
      formData.endDate < value
    ) {
      setFormData((prev) => ({
        ...prev,
        startDate: value,
        endDate: "",
      }));
    }
  }

  // ==========================================
  // SUBMIT LEAVE
  // ==========================================

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.startDate || !formData.endDate) {
      setError("Please select start and end date.");
      return;
    }

    if (formData.startDate < today) {
      setError("You cannot select a past date.");
      return;
    }

    if (formData.endDate < today) {
      setError("End date cannot be a past date.");
      return;
    }

    if (formData.endDate < formData.startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    if (!formData.reason.trim()) {
      setError("Please enter a reason for leave.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/staff/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to submit leave request");
        return;
      }

      setMessage(
        data.message || "Leave request submitted successfully"
      );

      setFormData({
        startDate: "",
        endDate: "",
        reason: "",
      });

      fetchLeaves();
    } catch (err) {
      console.error("SUBMIT LEAVE ERROR:", err);
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // CANCEL LEAVE
  // ==========================================

  async function handleCancel(leaveId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this leave request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const res = await fetch("/api/staff/leave", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaveId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to cancel leave request");
        return;
      }

      setMessage(
        data.message || "Leave request cancelled successfully"
      );

      fetchLeaves();
    } catch (err) {
      console.error("CANCEL LEAVE ERROR:", err);
      setError("Something went wrong");
    }
  }

  // ==========================================
  // STATUS STYLE
  // ==========================================

  function getStatusClass(status) {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

      case "REJECTED":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";

      case "PENDING":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";

      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  }

  function getStatusDot(status) {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-500";

      case "REJECTED":
        return "bg-rose-500";

      case "PENDING":
        return "bg-blue-500";

      default:
        return "bg-slate-400";
    }
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Leave Management
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400 mt-1">
            Apply for future leave and manage your leave requests easily.
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
            APPLY LEAVE FORM
        ========================================== */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 lg:p-7">
          <div className="mb-5">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Apply for Leave
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select the dates and provide a reason for your leave.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* DATES */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

              {/* START DATE */}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  min={today}
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  required
                />

                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                  Past dates are not allowed.
                </p>
              </div>

              {/* END DATE */}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  End Date
                </label>

                <input
                  type="date"
                  name="endDate"
                  min={formData.startDate || today}
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  required
                />

                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                  End date cannot be before start date.
                </p>
              </div>

            </div>

            {/* REASON */}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Reason
              </label>

              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={4}
                placeholder="Enter reason for leave..."
                className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition resize-y"
                required
              />
            </div>

            {/* SUBMIT BUTTON */}

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition text-sm shadow-sm cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit Leave Request"}
            </button>

          </form>
        </div>

        {/* ==========================================
            LEAVE LIST
        ========================================== */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 overflow-hidden">

          {/* HEADER + FILTER */}

          <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                  My Leave Requests
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  View the status of your submitted leave requests.
                </p>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

            </div>
          </div>

          {/* ==========================================
              LOADING
          ========================================== */}

          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-200 dark:border-blue-950 border-t-blue-600 rounded-full mx-auto mb-3" />

              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                Loading leave requests...
              </p>
            </div>

          ) : leaves.length === 0 ? (

            /* EMPTY */

            <div className="text-center py-16 px-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                🏖️
              </div>

              <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                No leave requests found.
              </p>
            </div>

          ) : (

            <>
              {/* ==========================================
                  DESKTOP TABLE
              ========================================== */}

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-5 lg:px-6">
                        Start Date
                      </th>

                      <th className="py-3.5 px-5 lg:px-6">
                        End Date
                      </th>

                      <th className="py-3.5 px-5 lg:px-6">
                        Reason
                      </th>

                      <th className="py-3.5 px-5 lg:px-6">
                        Status
                      </th>

                      <th className="py-3.5 px-5 lg:px-6 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                    {leaves.map((leave) => (
                      <tr
                        key={leave.id}
                        className="hover:bg-blue-50/30 dark:hover:bg-slate-800/60 transition"
                      >
                        <td className="py-4 px-5 lg:px-6 font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(leave.startDate)}
                        </td>

                        <td className="py-4 px-5 lg:px-6 font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(leave.endDate)}
                        </td>

                        <td className="py-4 px-5 lg:px-6 text-slate-600 dark:text-slate-300 max-w-xs">
                          <p className="truncate">
                            {leave.reason}
                          </p>
                        </td>

                        <td className="py-4 px-5 lg:px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusClass(
                              leave.status
                            )}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${getStatusDot(
                                leave.status
                              )}`}
                            />

                            {leave.status}
                          </span>
                        </td>

                        <td className="py-4 px-5 lg:px-6 text-right">
                          {leave.status === "PENDING" ? (
                            <button
                              onClick={() => handleCancel(leave.id)}
                              className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-bold text-xs bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-100 dark:border-rose-800 px-3 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 font-bold">
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ==========================================
                  MOBILE CARDS
              ========================================== */}

              <div className="md:hidden p-3 sm:p-4 space-y-3">
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 p-4"
                  >
                    {/* CARD TOP */}

                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                          Leave Request
                        </p>

                        <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
                          {formatDate(leave.startDate)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${getStatusClass(
                          leave.status
                        )}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${getStatusDot(
                            leave.status
                          )}`}
                        />

                        {leave.status}
                      </span>
                    </div>

                    {/* DATES */}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                          Start Date
                        </p>

                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                          {formatDate(leave.startDate)}
                        </p>
                      </div>

                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                          End Date
                        </p>

                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                          {formatDate(leave.endDate)}
                        </p>
                      </div>
                    </div>

                    {/* REASON */}

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-3 mb-4">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1">
                        Reason
                      </p>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 break-words leading-5">
                        {leave.reason}
                      </p>
                    </div>

                    {/* ACTION */}

                    {leave.status === "PENDING" && (
                      <button
                        onClick={() => handleCancel(leave.id)}
                        className="w-full text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-bold text-xs bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-800 px-3 py-2.5 rounded-xl transition cursor-pointer"
                      >
                        Cancel Leave Request
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}