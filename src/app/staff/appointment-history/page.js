
"use client";

import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 8;

export default function StaffAppointmentHistoryPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState(1);

  // =====================================================
  // PAGINATION CALCULATIONS
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(appointments.length / ITEMS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentAppointments = appointments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // =====================================================
  // FETCH HISTORY
  // =====================================================

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/staff/appointment-history", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data?.message || "Failed to load appointment history."
        );

        setAppointments([]);
        setCurrentPage(1);
        return;
      }

      if (Array.isArray(data)) {
        setAppointments(data);

        const totalPagesAfterFetch = Math.max(
          1,
          Math.ceil(data.length / ITEMS_PER_PAGE)
        );

        setCurrentPage((page) =>
          Math.min(page, totalPagesAfterFetch)
        );
      } else {
        setAppointments([]);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error(
        "FETCH APPOINTMENT HISTORY ERROR:",
        error
      );

      setMessage(
        "Something went wrong while loading appointment history."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD HISTORY
  // =====================================================

  useEffect(() => {
    fetchHistory();
  }, []);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Appointment History
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                View your completed and rejected appointments.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 w-fit">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                Total:
              </span>

              <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                {appointments.length}
              </span>
            </div>

          </div>
        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <div className="p-3.5 sm:p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm rounded-xl">
            {message}
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-10 sm:p-12 text-center shadow-sm dark:shadow-black/20">
            <div className="w-8 h-8 border-4 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Loading appointment history...
            </p>
          </div>
        ) : appointments.length === 0 ? (

          /* =================================================
             EMPTY
          ================================================= */

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-10 sm:p-12 text-center shadow-sm dark:shadow-black/20">

            <div className="text-4xl mb-3">
              📋
            </div>

            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              No Appointment History
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              You don't have any completed or rejected
              appointments yet.
            </p>

          </div>

        ) : (

          /* =================================================
             HISTORY LIST
          ================================================= */

          <div className="space-y-4">

            {currentAppointments.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/30 transition duration-200"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  {/* =================================================
                      APPOINTMENT INFO
                  ================================================= */}

                  <div className="flex-1 min-w-0">

                    {/* SERVICE + STATUS */}

                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-4">

                      <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg break-words">
                        {item.service?.name || "Service"}
                      </h3>

                      {/* COMPLETED */}

                      {item.status === "COMPLETED" && (
                        <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          COMPLETED
                        </span>
                      )}

                      {/* REJECTED */}

                      {item.status === "REJECTED" && (
                        <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          REJECTED
                        </span>
                      )}

                    </div>

                    {/* =================================================
                        DETAILS
                    ================================================= */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                      {/* CUSTOMER */}

                      <div className="min-w-0">
                        <span className="block text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                          Customer
                        </span>

                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm break-words">
                          {item.customer?.name || "-"}
                        </span>
                      </div>

                      {/* EMAIL */}

                      <div className="min-w-0">
                        <span className="block text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                          Email
                        </span>

                        <span className="font-medium text-slate-700 dark:text-slate-300 text-xs sm:text-sm break-all">
                          {item.customer?.email || "-"}
                        </span>
                      </div>

                      {/* DATE */}

                      <div>
                        <span className="block text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                          Date
                        </span>

                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                          {item.date
                            ? new Date(
                                item.date
                              ).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>

                      {/* TIME */}

                      <div>
                        <span className="block text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                          Time
                        </span>

                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                          {item.time || "-"}
                        </span>
                      </div>

                    </div>

                    {/* =================================================
                        DURATION
                    ================================================= */}

                    {item.service?.duration && (
                      <div className="mt-4 inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-lg">

                        <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                          Duration:
                        </span>

                        <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200">
                          {item.service.duration} minutes
                        </span>

                      </div>
                    )}

                  </div>

                  {/* =================================================
                      HISTORY STATUS
                  ================================================= */}

                  <div className="shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">

                    {item.status === "COMPLETED" && (
                      <div className="text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 rounded-xl">
                        ✓ Completed
                      </div>
                    )}

                    {item.status === "REJECTED" && (
                      <div className="text-center text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-2.5 rounded-xl">
                        ✕ Rejected
                      </div>
                    )}

                  </div>

                </div>
              </div>
            ))}

            {/* =================================================
                NUMBERED PAGINATION
            ================================================= */}

            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center justify-center gap-3">

                <div className="flex items-center gap-2">

                  {/* PREVIOUS */}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(page - 1, 1)
                      )
                    }
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 transition"
                  >
                    ←
                  </button>

                  {/* PAGE NUMBERS */}

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-bold transition ${
                        currentPage === page
                          ? "bg-blue-600 dark:bg-blue-500 text-white shadow-sm"
                          : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* NEXT */}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 transition"
                  >
                    →
                  </button>

                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {startIndex + 1}–
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    appointments.length
                  )}{" "}
                  of {appointments.length} appointments
                </p>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

