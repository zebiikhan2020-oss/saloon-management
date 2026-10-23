"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
  // FETCH STAFF
  // ===============================
  async function fetchStaff() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/staff");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch staff list");
      }

      setStaff(data || []);
    } catch (err) {
      console.error("FETCH STAFF ERROR:", err);
      setError(err.message || "Failed to load staff list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStaff();
  }, []);

  // ===============================
  // APPROVE STAFF
  // ===============================
  async function approveStaff(id) {
    try {
      setActionLoading(id);
      setMessage("");
      setError("");

      const res = await fetch("/api/admin/staff", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Approval failed");
      }

      setStaff((currentStaff) =>
        currentStaff.map((item) =>
          item.id === id ? { ...item, isApproved: true } : item
        )
      );

      setMessage("Staff approved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("APPROVE STAFF ERROR:", err);
      setError(err.message || "Approval failed");
      setTimeout(() => setError(""), 3000);
    } finally {
      setActionLoading(null);
    }
  }

  // ===============================
  // FILTER STAFF
  // ===============================
  const filteredStaff = useMemo(() => {
    return staff.filter((user) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "APPROVED" && user.isApproved) ||
        (statusFilter === "PENDING" && !user.isApproved);

      return matchesStatus;
    });
  }, [staff, statusFilter]);

  // ===============================
  // COUNTS
  // ===============================
  const totalStaffCount = staff.length;
  const approvedCount = staff.filter((user) => user.isApproved).length;
  const pendingCount = staff.filter((user) => !user.isApproved).length;

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6 ${
        darkMode ? "text-slate-100" : ""
      }`}
    >
      {/* ===============================
          HEADER
      =============================== */}
      <div
        className={`border-b pb-5 ${
          darkMode ? "border-slate-800" : "border-slate-100"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <span
              className={`inline-flex items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                darkMode
                  ? "text-blue-400 bg-blue-500/15 border-blue-500/20"
                  : "text-blue-600 bg-blue-50 border-blue-100"
              }`}
            >
              Staff Portal
            </span>

            <h1
              className={`text-xl sm:text-2xl font-bold mt-2 ${
                darkMode ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Staff Management & Approvals
            </h1>

            <p
              className={`text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Review new staff registrations, check email verifications,
              and approve accounts.
            </p>
          </div>
        </div>
      </div>

      {/* ===============================
          SUCCESS MESSAGE
      =============================== */}
      {message && (
        <div
          className={`flex items-start sm:items-center gap-3 rounded-2xl border px-4 py-3 text-xs sm:text-sm shadow-xs ${
            darkMode
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-emerald-200/60 bg-emerald-50 text-emerald-700"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold ${
              darkMode
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-emerald-100 text-emerald-600"
            }`}
          >
            ✓
          </span>

          <span>{message}</span>
        </div>
      )}

      {/* ===============================
          ERROR MESSAGE
      =============================== */}
      {error && (
        <div
          className={`flex items-start sm:items-center gap-3 rounded-2xl border px-4 py-3 text-xs sm:text-sm shadow-xs ${
            darkMode
              ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
              : "border-rose-200/60 bg-rose-50 text-rose-700"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold ${
              darkMode
                ? "bg-rose-500/15 text-rose-400"
                : "bg-rose-100 text-rose-600"
            }`}
          >
            ✕
          </span>

          <span>{error}</span>
        </div>
      )}

      {/* ===============================
          STAT CARDS
      =============================== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

        {/* TOTAL */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 ${
            darkMode
              ? "bg-blue-500/10 border-blue-500/20"
              : "bg-blue-50/60 border-blue-100/80"
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div
              className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl text-lg ${
                darkMode
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              👥
            </div>

            <p
              className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                darkMode ? "text-blue-400" : "text-blue-700"
              }`}
            >
              Total Staff
            </p>
          </div>

          <h2
            className={`text-xl sm:text-2xl font-bold ${
              darkMode ? "text-slate-100" : "text-slate-900"
            }`}
          >
            {totalStaffCount}
          </h2>
        </div>

        {/* APPROVED */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 ${
            darkMode
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-emerald-50/60 border-emerald-100/80"
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div
              className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl text-lg ${
                darkMode
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              ✓
            </div>

            <p
              className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                darkMode ? "text-emerald-400" : "text-emerald-700"
              }`}
            >
              Approved
            </p>
          </div>

          <h2
            className={`text-xl sm:text-2xl font-bold ${
              darkMode ? "text-slate-100" : "text-slate-900"
            }`}
          >
            {approvedCount}
          </h2>
        </div>

        {/* PENDING */}
        <div
          className={`col-span-2 lg:col-span-1 rounded-2xl border p-4 sm:p-5 ${
            darkMode
              ? "bg-amber-500/10 border-amber-500/20"
              : "bg-amber-50/60 border-amber-100/80"
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div
              className={`h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl text-lg ${
                darkMode
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              ⏳
            </div>

            <p
              className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                darkMode ? "text-amber-400" : "text-amber-700"
              }`}
            >
              Pending Approval
            </p>
          </div>

          <h2
            className={`text-xl sm:text-2xl font-bold ${
              darkMode ? "text-slate-100" : "text-slate-900"
            }`}
          >
            {pendingCount}
          </h2>
        </div>
      </div>

      {/* ===============================
          FILTER BAR
      =============================== */}
      <div
        className={`rounded-2xl shadow-xs border p-4 sm:p-5 ${
          darkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-100"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="min-w-0">
            <h2
              className={`text-sm font-bold ${
                darkMode ? "text-slate-200" : "text-slate-800"
              }`}
            >
              Filter Staff Records
            </h2>

            <p
              className={`text-xs mt-0.5 leading-relaxed ${
                darkMode ? "text-slate-500" : "text-slate-500"
              }`}
            >
              Quickly sort staff members by their approval status
            </p>
          </div>

          <div className="w-full sm:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                darkMode
                  ? "bg-slate-800 border border-slate-700 text-slate-100"
                  : "bg-slate-50/50 border border-slate-200/80 text-slate-900 focus:bg-white"
              }`}
            >
              <option value="ALL">All Staff</option>
              <option value="APPROVED">Approved Only</option>
              <option value="PENDING">Pending Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===============================
          STAFF LIST
      =============================== */}
      <div
        className={`rounded-2xl shadow-xs border overflow-hidden ${
          darkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-100"
        }`}
      >
        {/* LIST HEADER */}
        <div
          className={`px-4 sm:px-5 py-4 border-b flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 ${
            darkMode
              ? "border-slate-800 bg-slate-800/40"
              : "border-slate-100 bg-slate-50/30"
          }`}
        >
          <h2
            className={`text-sm font-bold ${
              darkMode ? "text-slate-200" : "text-slate-800"
            }`}
          >
            Staff Records
          </h2>

          <span
            className={`w-fit text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-md ${
              darkMode
                ? "text-slate-400 bg-slate-800"
                : "text-slate-500 bg-slate-100"
            }`}
          >
            Showing {filteredStaff.length} results
          </span>
        </div>

        {/* ===============================
            LOADING
        =============================== */}
        {loading ? (
          <div className="py-16 text-center px-4">
            <div
              className={`animate-spin h-7 w-7 border-2 border-t-blue-500 rounded-full mx-auto mb-3 ${
                darkMode
                  ? "border-slate-700"
                  : "border-slate-200"
              }`}
            />

            <p
              className={`text-sm font-medium ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Loading staff data...
            </p>
          </div>
        ) : filteredStaff.length === 0 ? (
          /* ===============================
             EMPTY
          =============================== */
          <div className="py-16 text-center px-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl ${
                darkMode
                  ? "bg-slate-800 text-slate-500"
                  : "bg-slate-50 text-slate-400"
              }`}
            >
              ✂️
            </div>

            <h3
              className={`font-semibold text-sm ${
                darkMode ? "text-slate-200" : "text-slate-800"
              }`}
            >
              No staff members found
            </h3>

            <p
              className={`mt-1 text-xs ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Try changing your status filter selection.
            </p>
          </div>
        ) : (
          <>
            {/* ===============================
                DESKTOP TABLE
            =============================== */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">

                <thead>
                  <tr
                    className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      darkMode
                        ? "bg-slate-800/50 border-slate-800 text-slate-500"
                        : "bg-slate-50/70 border-slate-100 text-slate-400"
                    }`}
                  >
                    <th className="px-5 py-4">
                      Staff Details
                    </th>

                    <th className="px-5 py-4 text-center">
                      Email Verified
                    </th>

                    <th className="px-5 py-4 text-center">
                      Approval Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody
                  className={`divide-y text-xs ${
                    darkMode
                      ? "divide-slate-800"
                      : "divide-slate-50"
                  }`}
                >
                  {filteredStaff.map((user) => (
                    <tr
                      key={user.id}
                      className={`transition ${
                        darkMode
                          ? "hover:bg-slate-800/40"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      {/* STAFF */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                              darkMode
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                : "bg-blue-100 text-blue-600 border-blue-200/60"
                            }`}
                          >
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`font-semibold text-sm ${
                                darkMode
                                  ? "text-slate-100"
                                  : "text-slate-900"
                              }`}
                            >
                              {user.name}
                            </p>

                            <p
                              className={`mt-0.5 ${
                                darkMode
                                  ? "text-slate-500"
                                  : "text-slate-500"
                              }`}
                            >
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {user.isEmailVerified ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              darkMode
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                            }`}
                          >
                            ✓ Verified
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              darkMode
                                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                : "bg-amber-50 text-amber-600 border-amber-100"
                            }`}
                          >
                            ⏳ Pending
                          </span>
                        )}
                      </td>

                      {/* APPROVAL */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {user.isApproved ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              darkMode
                                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                : "bg-blue-50 text-blue-600 border-blue-100"
                            }`}
                          >
                            ✓ Approved
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              darkMode
                                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                : "bg-rose-50 text-rose-600 border-rose-100"
                            }`}
                          >
                            Awaiting Approval
                          </span>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {user.isApproved ? (
                          <span
                            className={`inline-flex font-bold text-xs px-3 py-1.5 rounded-xl border ${
                              darkMode
                                ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30"
                                : "text-emerald-600 bg-emerald-50 border-emerald-100"
                            }`}
                          >
                            ✓ Approved
                          </span>
                        ) : (
                          <button
                            onClick={() => approveStaff(user.id)}
                            disabled={actionLoading === user.id}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionLoading === user.id
                              ? "Approving..."
                              : "Approve Staff"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===============================
                MOBILE CARDS
            =============================== */}
            <div
              className={`md:hidden divide-y ${
                darkMode
                  ? "divide-slate-800"
                  : "divide-slate-100"
              }`}
            >
              {filteredStaff.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 sm:p-5 transition ${
                    darkMode
                      ? "hover:bg-slate-800/40"
                      : "hover:bg-slate-50/50"
                  }`}
                >

                  {/* TOP */}
                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold border ${
                          darkMode
                            ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                            : "bg-blue-100 text-blue-600 border-blue-200/60"
                        }`}
                      >
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`font-semibold text-sm truncate ${
                            darkMode
                              ? "text-slate-100"
                              : "text-slate-900"
                          }`}
                        >
                          {user.name}
                        </p>

                        <p
                          className={`text-xs truncate mt-0.5 ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-500"
                          }`}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {user.isApproved ? (
                      <span
                        className={`shrink-0 rounded-md px-2 py-1 text-[9px] sm:text-[10px] font-bold uppercase border ${
                          darkMode
                            ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                            : "bg-blue-50 border-blue-100 text-blue-600"
                        }`}
                      >
                        Approved
                      </span>
                    ) : (
                      <span
                        className={`shrink-0 rounded-md px-2 py-1 text-[9px] sm:text-[10px] font-bold uppercase border ${
                          darkMode
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                            : "bg-rose-50 border-rose-100 text-rose-600"
                        }`}
                      >
                        Pending
                      </span>
                    )}
                  </div>

                  {/* STATUS BOXES */}
                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <div
                      className={`rounded-xl border p-3 ${
                        darkMode
                          ? "bg-slate-800/60 border-slate-700"
                          : "bg-slate-50/80 border-slate-100"
                      }`}
                    >
                      <p
                        className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${
                          darkMode
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        Email Status
                      </p>

                      <p
                        className={`mt-1 text-xs font-semibold ${
                          user.isEmailVerified
                            ? darkMode
                              ? "text-emerald-400"
                              : "text-emerald-600"
                            : darkMode
                            ? "text-amber-400"
                            : "text-amber-500"
                        }`}
                      >
                        {user.isEmailVerified
                          ? "✓ Verified"
                          : "Not Verified"}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border p-3 ${
                        darkMode
                          ? "bg-slate-800/60 border-slate-700"
                          : "bg-slate-50/80 border-slate-100"
                      }`}
                    >
                      <p
                        className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider ${
                          darkMode
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        Approval
                      </p>

                      <p
                        className={`mt-1 text-xs font-semibold ${
                          user.isApproved
                            ? darkMode
                              ? "text-blue-400"
                              : "text-blue-600"
                            : darkMode
                            ? "text-rose-400"
                            : "text-rose-600"
                        }`}
                      >
                        {user.isApproved
                          ? "Active Staff"
                          : "Needs Review"}
                      </p>
                    </div>

                  </div>

                  {/* ACTION */}
                  <div className="mt-4">
                    {user.isApproved ? (
                      <div
                        className={`w-full text-center py-2.5 rounded-xl border text-xs font-bold ${
                          darkMode
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : "bg-emerald-50 border-emerald-100 text-emerald-600"
                        }`}
                      >
                        ✓ Already Approved
                      </div>
                    ) : (
                      <button
                        onClick={() => approveStaff(user.id)}
                        disabled={actionLoading === user.id}
                        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionLoading === user.id
                          ? "Approving..."
                          : "Approve Staff Member"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}