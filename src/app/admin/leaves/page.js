"use client";

import { useEffect, useState } from "react";

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [staff, setStaff] = useState([]);

  const [filters, setFilters] = useState({
    staffId: "",
    status: "",
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ==============================
  // WATCH ADMIN LAYOUT THEME
  // ==============================
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

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchLeaves();
  }, [filters]);

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/admin/staff");
      const data = await response.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("STAFF ERROR:", error);
    }
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (filters.staffId) {
        params.append("staffId", filters.staffId);
      }

      if (filters.status) {
        params.append("status", filters.status);
      }

      const response = await fetch(`/api/admin/leaves?${params}`);
      const data = await response.json();

      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("LEAVES ERROR:", error);
      setError("Failed to fetch leave requests.");
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const updateLeave = async (id, status) => {
    try {
      setActionLoading(id);
      setMessage("");
      setError("");

      const response = await fetch(`/api/admin/leaves/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          adminNote:
            status === "APPROVED"
              ? "Approved by admin"
              : "Rejected by admin",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update leave request"
        );
      }

      setMessage(
        `Leave ${status.toLowerCase()} successfully ✅`
      );

      fetchLeaves();
    } catch (error) {
      console.log(error);
      setError(error.message || "Something went wrong.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 dark:bg-amber-500/15 border border-amber-200/60 dark:border-amber-500/30 text-amber-700 dark:text-amber-300";

      case "APPROVED":
        return "bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200/60 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300";

      case "REJECTED":
        return "bg-rose-50 dark:bg-rose-500/15 border border-rose-200/60 dark:border-rose-500/30 text-rose-700 dark:text-rose-300";

      default:
        return "bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300";
    }
  };

  const pendingCount = leaves.filter(
    (l) => l.status === "PENDING"
  ).length;

  const approvedCount = leaves.filter(
    (l) => l.status === "APPROVED"
  ).length;

  const rejectedCount = leaves.filter(
    (l) => l.status === "REJECTED"
  ).length;

  // =====================================================
  // PAGINATION CALCULATIONS
  // =====================================================

  const totalPages = Math.ceil(
    leaves.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const currentLeaves = leaves.slice(
    startIndex,
    endIndex
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 bg-slate-50 dark:bg-slate-950 min-h-full">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 px-3 py-1 rounded-full">
            Staff Management
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            Staff Leave Requests
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Review, approve, or reject employee leave applications.
          </p>
        </div>

        <button
          onClick={fetchLeaves}
          className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* MESSAGES */}
      {message && (
        <div className="flex items-start sm:items-center gap-3 rounded-xl border border-emerald-200/60 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300 shadow-xs">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20">
            ✓
          </span>

          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-start sm:items-center gap-3 rounded-xl border border-rose-200/60 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300 shadow-xs">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-500/20">
            ✕
          </span>

          <span>{error}</span>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* PENDING */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending
            </p>

            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {pendingCount}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-100 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
            ⏳
          </div>
        </div>

        {/* APPROVED */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Approved
            </p>

            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {approvedCount}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-100 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
            ✓
          </div>
        </div>

        {/* REJECTED */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Rejected
            </p>

            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {rejectedCount}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/15 border border-rose-100 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
            ✕
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 p-4 sm:p-6 lg:p-8 space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            Filter Requests
          </h2>

          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Filter leave requests by staff or status.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* STAFF */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Staff
            </label>

            <select
              className="w-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={filters.staffId}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  staffId: e.target.value,
                })
              }
            >
              <option
                value=""
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                All Staff
              </option>

              {staff.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Status
            </label>

            <select
              className="w-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value,
                })
              }
            >
              <option
                value=""
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                All Status
              </option>

              <option
                value="PENDING"
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                Pending
              </option>

              <option
                value="APPROVED"
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                Approved
              </option>

              <option
                value="REJECTED"
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                Rejected
              </option>
            </select>
          </div>
        </div>

        {/* CLEAR FILTERS */}
        {(filters.staffId || filters.status) && (
          <div className="pt-1 flex justify-start sm:justify-end">
            <button
              onClick={() =>
                setFilters({
                  staffId: "",
                  status: "",
                })
              }
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* LEAVE REQUESTS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden">

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">

            <thead className="bg-slate-50/70 dark:bg-slate-800/60">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Staff
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Start Date
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  End Date
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Reason
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Status
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                      Loading leave requests...
                    </div>
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                      📅
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      No leaves found
                    </p>
                  </td>
                </tr>
              ) : (
                currentLeaves.map((leave) => (
                  <tr
                    key={leave.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {leave.staff?.name || "Unknown"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {new Date(
                        leave.startDate
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {new Date(
                        leave.endDate
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {leave.reason || "-"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold inline-block ${getStatusColor(
                          leave.status
                        )}`}
                      >
                        {leave.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {leave.status === "PENDING" ? (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={
                              actionLoading === leave.id
                            }
                            onClick={() =>
                              updateLeave(
                                leave.id,
                                "APPROVED"
                              )
                            }
                            className="bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/25 transition disabled:opacity-50 cursor-pointer"
                          >
                            {actionLoading === leave.id
                              ? "..."
                              : "Approve"}
                          </button>

                          <button
                            disabled={
                              actionLoading === leave.id
                            }
                            onClick={() =>
                              updateLeave(
                                leave.id,
                                "REJECTED"
                              )
                            }
                            className="bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/25 transition disabled:opacity-50 cursor-pointer"
                          >
                            {actionLoading === leave.id
                              ? "..."
                              : "Reject"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 text-xs italic">
                          No actions available
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden">

          {loading ? (
            <div className="py-12 flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin"></div>

              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Loading leave requests...
              </p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                📅
              </div>

              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                No leaves found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-4 sm:p-5"
                >
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-500/15 border border-blue-100 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                        {(leave.staff?.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {leave.staff?.name || "Unknown"}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Leave Request
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-semibold ${getStatusColor(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  {/* DATES */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-slate-50/70 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                        Start Date
                      </p>

                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                        {new Date(
                          leave.startDate
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="bg-slate-50/70 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                        End Date
                      </p>

                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                        {new Date(
                          leave.endDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* REASON */}
                  <div className="mt-3 bg-slate-50/70 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                      Reason
                    </p>

                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-0.5 break-words">
                      {leave.reason || "-"}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  {leave.status === "PENDING" ? (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        disabled={
                          actionLoading === leave.id
                        }
                        onClick={() =>
                          updateLeave(
                            leave.id,
                            "APPROVED"
                          )
                        }
                        className="w-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/25 transition disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === leave.id
                          ? "..."
                          : "Approve"}
                      </button>

                      <button
                        disabled={
                          actionLoading === leave.id
                        }
                        onClick={() =>
                          updateLeave(
                            leave.id,
                            "REJECTED"
                          )
                        }
                        className="w-full bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/25 transition disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === leave.id
                          ? "..."
                          : "Reject"}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <span className="text-slate-400 dark:text-slate-500 text-xs italic">
                        No actions available
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800">

            <p
              className={`text-xs font-medium ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Page{" "}
              <span
                className={`font-bold ${
                  darkMode
                    ? "text-slate-100"
                    : "text-slate-900"
                }`}
              >
                {currentPage}
              </span>{" "}
              of{" "}
              <span
                className={`font-bold ${
                  darkMode
                    ? "text-slate-100"
                    : "text-slate-900"
                }`}
              >
                {totalPages}
              </span>
            </p>

            <div className="flex items-center gap-1.5">

              {/* PREVIOUS */}
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                className={`px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                  currentPage === 1
                    ? darkMode
                      ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                      : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                    : darkMode
                    ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
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
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    className={`min-w-9 h-9 px-2 rounded-xl text-xs font-bold transition ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-sm"
                        : darkMode
                        ? "bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* NEXT */}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      totalPages
                    )
                  )
                }
                className={`px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                  currentPage === totalPages
                    ? darkMode
                      ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                      : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                    : darkMode
                    ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                Next →
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}