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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">

      {/* ===============================
          HEADER
      =============================== */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Staff Portal
            </span>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              Staff Management & Approvals
            </h1>

            <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl">
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
        <div className="flex items-start sm:items-center gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50 px-4 py-3 text-xs sm:text-sm text-emerald-700 shadow-xs">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold">
            ✓
          </span>

          <span>{message}</span>
        </div>
      )}

      {/* ===============================
          ERROR MESSAGE
      =============================== */}
      {error && (
        <div className="flex items-start sm:items-center gap-3 rounded-2xl border border-rose-200/60 bg-rose-50 px-4 py-3 text-xs sm:text-sm text-rose-700 shadow-xs">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold">
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
        <div className="bg-blue-50/60 rounded-2xl border border-blue-100/80 p-4 sm:p-5">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl text-lg">
              👥
            </div>

            <p className="text-[10px] sm:text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Total Staff
            </p>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {totalStaffCount}
          </h2>
        </div>

        {/* APPROVED */}
        <div className="bg-emerald-50/60 rounded-2xl border border-emerald-100/80 p-4 sm:p-5">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-xl text-lg">
              ✓
            </div>

            <p className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Approved
            </p>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {approvedCount}
          </h2>
        </div>

        {/* PENDING */}
        <div className="col-span-2 lg:col-span-1 bg-amber-50/60 rounded-2xl border border-amber-100/80 p-4 sm:p-5">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center bg-amber-100 text-amber-600 rounded-xl text-lg">
              ⏳
            </div>

            <p className="text-[10px] sm:text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Pending Approval
            </p>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {pendingCount}
          </h2>
        </div>
      </div>

      {/* ===============================
          FILTER BAR
      =============================== */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-800">
              Filter Staff Records
            </h2>

            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Quickly sort staff members by their approval status
            </p>
          </div>

          <div className="w-full sm:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
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
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">

        {/* LIST HEADER */}
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 bg-slate-50/30 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800">
            Staff Records
          </h2>

          <span className="w-fit text-[10px] sm:text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            Showing {filteredStaff.length} results
          </span>
        </div>

        {/* ===============================
            LOADING
        =============================== */}
        {loading ? (
          <div className="py-16 text-center px-4">
            <div className="animate-spin h-7 w-7 border-2 border-slate-200 border-t-blue-500 rounded-full mx-auto mb-3" />

            <p className="text-slate-400 text-sm font-medium">
              Loading staff data...
            </p>
          </div>
        ) : filteredStaff.length === 0 ? (
          /* ===============================
             EMPTY
          =============================== */
          <div className="py-16 text-center px-4">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
              ✂️
            </div>

            <h3 className="text-slate-800 font-semibold text-sm">
              No staff members found
            </h3>

            <p className="mt-1 text-xs text-slate-400">
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
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
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

                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredStaff.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/60 transition"
                    >
                      {/* STAFF */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200/60">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm">
                              {user.name}
                            </p>

                            <p className="text-slate-500 mt-0.5">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {user.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                            ⏳ Pending
                          </span>
                        )}
                      </td>

                      {/* APPROVAL */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        {user.isApproved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                            ✓ Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                            Awaiting Approval
                          </span>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {user.isApproved ? (
                          <span className="inline-flex text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
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
            <div className="md:hidden divide-y divide-slate-100">
              {filteredStaff.map((user) => (
                <div
                  key={user.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/50 transition"
                >

                  {/* TOP */}
                  <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold border border-blue-200/60">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">
                          {user.name}
                        </p>

                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {user.isApproved ? (
                      <span className="shrink-0 rounded-md bg-blue-50 border border-blue-100 px-2 py-1 text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase">
                        Approved
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-md bg-rose-50 border border-rose-100 px-2 py-1 text-[9px] sm:text-[10px] font-bold text-rose-600 uppercase">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* STATUS BOXES */}
                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-3">
                      <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Email Status
                      </p>

                      <p
                        className={`mt-1 text-xs font-semibold ${
                          user.isEmailVerified
                            ? "text-emerald-600"
                            : "text-amber-500"
                        }`}
                      >
                        {user.isEmailVerified
                          ? "✓ Verified"
                          : "Not Verified"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-3">
                      <p className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Approval
                      </p>

                      <p
                        className={`mt-1 text-xs font-semibold ${
                          user.isApproved
                            ? "text-blue-600"
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
                      <div className="w-full text-center py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-600">
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