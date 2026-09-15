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

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-50 border border-emerald-200/60 text-emerald-700";

      case "ABSENT":
        return "bg-rose-50 border border-rose-200/60 text-rose-700";

      case "LEAVE":
        return "bg-amber-50 border border-amber-200/60 text-amber-700";

      default:
        return "bg-slate-100 border border-slate-200/60 text-slate-700";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Staff Management
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Staff Attendance
          </h1>

          <p className="text-slate-500 text-sm mt-1">
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
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              Present
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-1">
              {presentCount}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
            ✓
          </div>
        </div>

        {/* ABSENT */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              Absent
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-1">
              {absentCount}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-bold">
            ✕
          </div>
        </div>

        {/* LEAVE */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Leave
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-1">
              {leaveCount}
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 font-bold">
            ⚡
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-4 sm:p-6 lg:p-8 space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Filter Records
          </h2>

          <p className="text-slate-500 text-sm mt-1">
            Filter attendance records by staff, date, or status.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* STAFF */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Staff
            </label>

            <select
              className="w-full border border-slate-200/80 bg-slate-50/50 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={filters.staffId}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  staffId: e.target.value,
                })
              }
            >
              <option value="">All Staff</option>

              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Date
            </label>

            <input
              type="date"
              className="w-full border border-slate-200/80 bg-slate-50/50 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Status
            </label>

            <select
              className="w-full border border-slate-200/80 bg-slate-50/50 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value,
                })
              }
            >
              <option value="">All Status</option>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LEAVE">Leave</option>
            </select>
          </div>
        </div>

        {/* CLEAR FILTERS */}
        {(filters.staffId || filters.date || filters.status) && (
          <div className="pt-1 flex justify-start sm:justify-end">
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ATTENDANCE RECORDS */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">

            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Staff Name
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Email
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Date
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Status
                </th>

                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Note
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-12 text-slate-500 text-sm font-medium"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

                      Loading attendance...
                    </div>
                  </td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                      📋
                    </div>

                    <p className="text-slate-500 text-sm font-medium">
                      No attendance records found
                    </p>
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/50 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      {record.staff?.name || "Unknown Staff"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {record.staff?.email || "-"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(record.date).toLocaleDateString()}
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

                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
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
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

              <p className="text-slate-500 text-sm font-medium">
                Loading attendance...
              </p>
            </div>
          ) : attendance.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
                📋
              </div>

              <p className="text-slate-500 text-sm font-medium">
                No attendance records found
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="p-4 sm:p-5"
                >
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {(record.staff?.name || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {record.staff?.name || "Unknown Staff"}
                        </p>

                        <p className="text-xs text-slate-500 truncate mt-0.5">
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

                    <div className="bg-slate-50/70 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Date
                      </p>

                      <p className="text-sm font-medium text-slate-700 mt-0.5">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="bg-slate-50/70 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                        Note
                      </p>

                      <p className="text-sm font-medium text-slate-700 mt-0.5 break-words">
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
    </div>
  );
}