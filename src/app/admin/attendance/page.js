
"use client";

import { useEffect, useState } from "react";

export default function AdminAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    staffId: "",
    date: "",
    status: "",
  });

  // =====================================================
  // DARK MODE
  // =====================================================

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

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchAttendance();
  }, [filters]);

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/admin/staff");
      const data = await response.json();

      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("FETCH STAFF ERROR:", error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filters.staffId) {
        params.append("staffId", filters.staffId);
      }

      if (filters.date) {
        params.append("date", filters.date);
      }

      if (filters.status) {
        params.append("status", filters.status);
      }

      const response = await fetch(
        `/api/admin/attendance?${params}`
      );

      const data = await response.json();

      setAttendance(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("FETCH ATTENDANCE ERROR:", error);
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      staffId: "",
      date: "",
      status: "",
    });
  };

  // =====================================================
  // PAGINATION CALCULATION
  // =====================================================

  const totalPages = Math.ceil(
    attendance.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const currentAttendance =
    attendance.slice(startIndex, endIndex);

  const getStatusColor = (status) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300";

      case "ABSENT":
        return "bg-rose-50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/30 text-rose-700 dark:text-rose-300";

      case "LEAVE":
        return "bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/30 text-amber-700 dark:text-amber-300";

      default:
        return "bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300";
    }
  };

  const presentCount = attendance.filter(
    (item) => item.status === "PRESENT"
  ).length;

  const absentCount = attendance.filter(
    (item) => item.status === "ABSENT"
  ).length;

  const leaveCount = attendance.filter(
    (item) => item.status === "LEAVE"
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 border border-blue-100 dark:border-blue-500/30 px-3 py-1 rounded-full">
            Staff Management
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            Staff Attendance
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Monitor daily attendance, status, and records.
          </p>
        </div>

        <button
          onClick={fetchAttendance}
          className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* PRESENT */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Present
            </p>

            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {presentCount}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
            ✓
          </div>
        </div>

        {/* ABSENT */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Absent
            </p>

            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {absentCount}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
            ✕
          </div>
        </div>

        {/* LEAVE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Leave
            </p>

            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {leaveCount}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
            ⚡
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 p-4 sm:p-6 lg:p-8 space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            Filter Records
          </h2>

          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Filter attendance records by staff, date, or status.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

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

          {/* DATE */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Date
            </label>

            <input
              type="date"
              className="w-full border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={filters.date}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  date: e.target.value,
                })
              }
            />
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
                value="PRESENT"
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                Present
              </option>

              <option
                value="ABSENT"
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                Absent
              </option>

              <option
                value="LEAVE"
                className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              >
                Leave
              </option>
            </select>
          </div>
        </div>

        {/* CLEAR FILTERS */}
        {(filters.staffId ||
          filters.date ||
          filters.status) && (
          <div className="pt-1 flex justify-start sm:justify-end">
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ATTENDANCE RECORDS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden">

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">

            <thead className="bg-slate-50/70 dark:bg-slate-800/60">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Staff Name
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Email
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Date
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Status
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Note
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin"></div>

                      Loading attendance...
                    </div>
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                      📋
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      No attendance records found
                    </p>
                  </td>
                </tr>
              ) : (
                currentAttendance.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {record.staff?.name || "Unknown Staff"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {record.staff?.email || "-"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {new Date(
                        record.date
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold inline-block ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {record.note || "-"}
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
                Loading attendance...
              </p>
            </div>
          ) : attendance.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                📋
              </div>

              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                No attendance records found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentAttendance.map((record) => (
                <div
                  key={record.id}
                  className="p-4 sm:p-5"
                >
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                        {(record.staff?.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {record.staff?.name ||
                            "Unknown Staff"}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {record.staff?.email || "-"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-semibold ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </div>

                  {/* DETAILS */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div className="bg-slate-50/70 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                        Date
                      </p>

                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-0.5">
                        {new Date(
                          record.date
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="bg-slate-50/70 dark:bg-slate-800/60 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                        Note
                      </p>

                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mt-0.5 break-words">
                        {record.note || "-"}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {!loading &&
        attendance.length > 0 &&
        totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">

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
                disabled={
                  currentPage === totalPages
                }
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
  );
}



