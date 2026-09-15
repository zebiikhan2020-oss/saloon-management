
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CustomerAppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // PAGINATION
  // =========================

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // =========================
  // FETCH APPOINTMENTS
  // =========================

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/customer/appointment");
      const data = await res.json();

      const appointmentsList = Array.isArray(data)
        ? data
        : Array.isArray(data.appointments)
        ? data.appointments
        : [];

      setAppointments(appointmentsList);
    } catch (error) {
      console.log("APPOINTMENT HISTORY ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PAGINATION CALCULATION
  // =========================

  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentAppointments = appointments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // =========================
  // STATUS COLOR
  // =========================

  const statusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60";

      case "CONFIRMED":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60";

      case "COMPLETED":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60";

      case "REJECTED":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60";

      case "CANCELLED":
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700";

      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-6xl">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full border border-blue-100 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400 sm:text-xs">
              ✨ Customer Portal
            </span>

            <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Appointment History
            </h1>

            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
              View all your past and current appointments
            </p>
          </div>

          {/* BOOK BUTTON */}

          <Link
            href="/customer/book"
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-slate-900
              dark:bg-slate-100
              px-4
              py-3
              text-sm
              font-bold
              text-white
              dark:text-slate-900
              shadow-sm
              transition
              duration-200
              hover:bg-blue-600
              dark:hover:bg-blue-500
              dark:hover:text-white
              active:scale-[0.98]
              sm:w-auto
              sm:px-5
            "
          >
            <span className="text-base leading-none">+</span>
            <span>Book New Appointment</span>
          </Link>
        </div>

        {/* =========================
            MAIN CARD
        ========================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">

          {/* =========================
              LOADING
          ========================= */}

          {loading ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-5 py-12 text-center">
              <div className="mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600" />

              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Loading appointment history...
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Please wait a moment
              </p>
            </div>
          ) : appointments.length === 0 ? (
            /* =========================
               NO APPOINTMENTS
            ========================= */

            <div className="flex min-h-[320px] flex-col items-center justify-center px-5 py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-3xl">
                📋
              </div>

              <p className="text-base font-bold text-slate-800 dark:text-slate-100">
                No appointments yet
              </p>

              <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                You don't have any appointments scheduled right now.
              </p>

              <Link
                href="/customer/book"
                className="
                  mt-6
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  shadow-sm
                  shadow-blue-200
                  dark:shadow-blue-950/30
                  transition
                  hover:bg-blue-700
                  active:scale-[0.98]
                "
              >
                Book Your First Appointment
              </Link>
            </div>
          ) : (
            <>
              {/* =========================
                  MOBILE + TABLET
              ========================= */}

              <div className="divide-y divide-slate-100 dark:divide-slate-800 lg:hidden">
                {currentAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="
                      p-4
                      transition
                      hover:bg-slate-50/70
                      dark:hover:bg-slate-800/50
                      sm:p-5
                    "
                  >
                    {/* TOP */}

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-base">
                          {appointment.service?.name || "Service"}
                        </h2>

                        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                          Staff:{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {appointment.staff?.name || "Not Assigned"}
                          </span>
                        </p>
                      </div>

                      <span
                        className={`
                          shrink-0
                          rounded-full
                          px-2.5
                          py-1
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-wide
                          sm:px-3
                          sm:text-xs
                          ${statusColor(appointment.status)}
                        `}
                      >
                        {appointment.status}
                      </span>
                    </div>

                    {/* DETAILS */}

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">

                      {/* DATE */}

                      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Date
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-100 sm:text-sm">
                          {formatDate(appointment.date)}
                        </p>
                      </div>

                      {/* TIME */}

                      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Time
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-100 sm:text-sm">
                          {appointment.time || "-"}
                          {appointment.endTime
                            ? ` - ${appointment.endTime}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* =========================
                  DESKTOP TABLE
              ========================= */}

              <div className="hidden lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60">
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Service Name
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Staff Name
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Date
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Time
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          End Time
                        </th>

                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentAppointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/50"
                        >
                          {/* SERVICE */}

                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {appointment.service?.name || "Service"}
                            </div>
                          </td>

                          {/* STAFF */}

                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {appointment.staff?.name || "Not Assigned"}
                          </td>

                          {/* DATE */}

                          <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                            {formatDate(appointment.date)}
                          </td>

                          {/* TIME */}

                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {appointment.time || "-"}
                          </td>

                          {/* END TIME */}

                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {appointment.endTime || "-"}
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-4">
                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-3
                                py-1
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-wide
                                ${statusColor(appointment.status)}
                              `}
                            >
                              {appointment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* =========================
                  PAGINATION
              ========================= */}

              {totalPages > 1 && (
                <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    {/* PAGE INFO */}

                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Showing{" "}
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {startIndex + 1}
                      </span>
                      {" - "}
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {Math.min(
                          startIndex + ITEMS_PER_PAGE,
                          appointments.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {appointments.length}
                      </span>{" "}
                      appointments
                    </p>

                    {/* PAGINATION BUTTONS */}

                    <div className="flex items-center justify-center gap-1.5">

                      {/* PREVIOUS */}

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((page) => Math.max(1, page - 1))
                        }
                        disabled={currentPage === 1}
                        className="
                          rounded-lg
                          border
                          border-slate-200
                          dark:border-slate-700
                          bg-white
                          dark:bg-slate-800
                          px-3
                          py-2
                          text-xs
                          font-bold
                          text-slate-600
                          dark:text-slate-300
                          transition
                          hover:bg-slate-50
                          dark:hover:bg-slate-700
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
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
                            onClick={() => setCurrentPage(page)}
                            className={`
                              h-8
                              min-w-8
                              rounded-lg
                              px-2
                              text-xs
                              font-bold
                              transition
                              ${
                                currentPage === page
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                              }
                            `}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      {/* NEXT */}

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(totalPages, page + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="
                          rounded-lg
                          border
                          border-slate-200
                          dark:border-slate-700
                          bg-white
                          dark:bg-slate-800
                          px-3
                          py-2
                          text-xs
                          font-bold
                          text-slate-600
                          dark:text-slate-300
                          transition
                          hover:bg-slate-50
                          dark:hover:bg-slate-700
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                        "
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* =========================
            FOOTER INFO
        ========================= */}

        {!loading && appointments.length > 0 && (
          <div className="mt-4 flex items-center justify-between px-1">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 sm:text-xs">
              Showing {currentAppointments.length} of{" "}
              {appointments.length} appointment
              {appointments.length !== 1 ? "s" : ""}
            </p>

            <Link
              href="/customer/book"
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 transition hover:text-blue-700 dark:hover:text-blue-300 sm:text-xs"
            >
              Book another →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

