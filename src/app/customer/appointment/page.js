
"use client";

import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 8;

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [message, setMessage] = useState("");

  // ==========================================
  // PAGINATION
  // ==========================================

  const [currentPage, setCurrentPage] = useState(1);

  // ==========================================
  // APPOINTMENT FROM NOTIFICATION
  // ==========================================

  const [highlightedAppointmentId, setHighlightedAppointmentId] =
    useState(null);

  const [expandedAppointmentId, setExpandedAppointmentId] =
    useState(null);

  // ==========================================
  // PAGINATION CALCULATIONS
  // ==========================================

  const totalPages = Math.max(
    1,
    Math.ceil(appointments.length / ITEMS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentAppointments = appointments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // ==========================================
  // GET APPOINTMENT ID FROM URL
  // ==========================================

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appointmentId = params.get("appointmentId");

    if (appointmentId) {
      setHighlightedAppointmentId(appointmentId);
      setExpandedAppointmentId(appointmentId);
    }

    fetchAppointments();
  }, []);

  // ==========================================
  // FETCH APPOINTMENTS
  // ==========================================

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

      const totalPagesAfterFetch = Math.max(
        1,
        Math.ceil(
          appointmentsList.length / ITEMS_PER_PAGE
        )
      );

      setCurrentPage((page) =>
        Math.min(page, totalPagesAfterFetch)
      );

      const params = new URLSearchParams(window.location.search);
      const appointmentId = params.get("appointmentId");

      if (appointmentId) {
        setHighlightedAppointmentId(appointmentId);
        setExpandedAppointmentId(appointmentId);

        setTimeout(() => {
          const element = document.getElementById(
            `appointment-${appointmentId}`
          );

          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 400);
      }
    } catch (error) {
      console.log("FETCH APPOINTMENTS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // TOGGLE APPOINTMENT CARD
  // ==========================================

  const toggleAppointment = (id) => {
    if (expandedAppointmentId === id) {
      setExpandedAppointmentId(null);
    } else {
      setExpandedAppointmentId(id);
    }
  };

  // ==========================================
  // CANCEL APPOINTMENT
  // ==========================================

  const cancelAppointment = async (id) => {
    const confirmCancel = confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) return;

    try {
      setCancelLoading(id);
      setMessage("");

      const res = await fetch(
        `/api/customer/appointment/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Appointment cancelled successfully");
        await fetchAppointments();
      } else {
        setMessage(
          data.message || "Failed to cancel appointment"
        );
      }
    } catch (error) {
      console.log("CANCEL APPOINTMENT ERROR:", error);
      setMessage(
        "Something went wrong while cancelling appointment."
      );
    } finally {
      setCancelLoading(null);
    }
  };

  // ==========================================
  // STATUS COLOR
  // ==========================================

  const statusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800";

      case "CONFIRMED":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";

      case "REJECTED":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800";

      case "COMPLETED":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800";

      case "CANCELLED":
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700";

      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  // ==========================================
  // CLEAR NOTIFICATION HIGHLIGHT
  // ==========================================

  const clearHighlight = () => {
    setHighlightedAppointmentId(null);
    setExpandedAppointmentId(null);

    const url = new URL(window.location.href);
    url.searchParams.delete("appointmentId");
    window.history.replaceState({}, "", url.pathname);
  };

  // ==========================================
  // LOADING UI
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7ff] dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgba(79,70,229,0.08)] border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading appointments...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7ff] dark:bg-slate-950 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <div className="mb-6 sm:mb-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5">
                <span className="text-xs">✨</span>

                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Customer Portal
                </span>
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                My Appointments
              </h1>

              <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                View your upcoming bookings, history, and appointment status
                updates.
              </p>
            </div>

            {highlightedAppointmentId && (
              <button
                onClick={clearHighlight}
                className="self-start sm:self-auto inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 dark:border-indigo-900 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm transition hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:hover:border-indigo-800 cursor-pointer"
              >
                <span>✕</span>
                Close notification view
              </button>
            )}

          </div>
        </div>

        {/* ==========================================
            MESSAGE
        ========================================== */}

        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-sm shadow-sm">
              ✅
            </div>

            <div className="pt-1 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              {message}
            </div>
          </div>
        )}

        {/* ==========================================
            APPOINTMENTS
        ========================================== */}

        {appointments.length === 0 ? (

          <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-12 text-center shadow-[0_8px_30px_rgba(79,70,229,0.06)]">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-3xl">
              📅
            </div>

            <h3 className="mt-5 text-base sm:text-lg font-bold text-slate-800 dark:text-white">
              No appointments found
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              You haven't booked any salon services yet.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {currentAppointments.map((appointment) => {

              const isHighlighted =
                appointment.id === highlightedAppointmentId;

              const isExpanded =
                appointment.id === expandedAppointmentId;

              return (
                <div
                  key={appointment.id}
                  id={`appointment-${appointment.id}`}
                  className={`overflow-hidden rounded-2xl sm:rounded-3xl border bg-white dark:bg-slate-900 transition-all duration-300 ${
                    isHighlighted
                      ? "border-indigo-400 dark:border-indigo-500 shadow-[0_10px_40px_rgba(99,102,241,0.15)] ring-4 ring-indigo-500/10"
                      : "border-slate-100 dark:border-slate-800 shadow-[0_6px_25px_rgba(79,70,229,0.06)] hover:border-indigo-100 dark:hover:border-indigo-900 hover:shadow-[0_10px_35px_rgba(79,70,229,0.09)]"
                  }`}
                >

                  {/* ==========================================
                      CARD HEADER
                  ========================================== */}

                  <button
                    type="button"
                    onClick={() =>
                      toggleAppointment(appointment.id)
                    }
                    className="w-full cursor-pointer p-4 text-left sm:p-5 lg:p-6 focus:outline-none"
                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      {/* LEFT SIDE */}

                      <div className="flex min-w-0 items-start gap-3 sm:gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-lg sm:h-12 sm:w-12 sm:rounded-2xl">
                          ✂️
                        </div>

                        <div className="min-w-0">

                          <h2 className="truncate text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-white">
                            {appointment.service?.name ||
                              "Salon Service"}
                          </h2>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">

                            <span className="inline-flex items-center gap-1">
                              📅
                              {new Date(
                                appointment.date
                              ).toLocaleDateString()}
                            </span>

                            <span className="hidden xs:inline text-slate-300 dark:text-slate-600">
                              •
                            </span>

                            <span className="inline-flex items-center gap-1">
                              ⏰
                              {appointment.time}
                            </span>

                          </div>

                        </div>
                      </div>

                      {/* RIGHT SIDE */}

                      <div className="flex items-center justify-between gap-3 sm:justify-end">

                        <span
                          className={`rounded-full px-3 py-1.5 text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase whitespace-nowrap ${statusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-400 dark:text-slate-500 transition group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40">
                          {isExpanded ? "▲" : "▼"}
                        </span>

                      </div>

                    </div>

                  </button>

                  {/* ==========================================
                      NOTIFICATION BADGE
                  ========================================== */}

                  {isHighlighted && (
                    <div className="px-4 pb-4 sm:px-6">

                      <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white shadow-sm">
                        <span>🔔</span>
                        Notification Alert
                      </div>

                    </div>
                  )}

                  {/* ==========================================
                      EXPANDED DETAILS
                  ========================================== */}

                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-[#fafbff] dark:bg-slate-950/60 px-4 py-5 sm:px-6 sm:py-6">

                      <div className="mb-5 flex items-center gap-2">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-sm">
                          📋
                        </div>

                        <h3 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Appointment Details
                        </h3>

                      </div>

                      {/* DETAILS GRID */}

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                        {/* SERVICE */}

                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Service
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm">💇</span>

                            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                              {appointment.service?.name ||
                                "Salon Service"}
                            </span>
                          </div>
                        </div>

                        {/* STAFF */}

                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Staff Member
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm">👨‍💼</span>

                            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                              {appointment.staff?.name ||
                                "Any Available Staff"}
                            </span>
                          </div>
                        </div>

                        {/* DATE */}

                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Appointment Date
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm">📅</span>

                            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                              {new Date(
                                appointment.date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* TIME */}

                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Time Slot
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm">⏰</span>

                            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                              {appointment.time}
                            </span>
                          </div>
                        </div>

                        {/* PRICE */}

                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Price
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm">💰</span>

                            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                              Rs. {appointment.service?.price || 0}
                            </span>
                          </div>
                        </div>

                        {/* PAYMENT */}

                        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Payment Method
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm">💳</span>

                            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                              {appointment.paymentMethod ||
                                "PAY_AT_SALON"}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* ==========================================
                          ACTION BUTTONS
                      ========================================== */}

                      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 sm:flex-row sm:flex-wrap">

                        {(appointment.status === "PENDING" ||
                          appointment.status === "CONFIRMED") && (

                          <button
                            type="button"
                            onClick={() =>
                              cancelAppointment(
                                appointment.id
                              )
                            }
                            disabled={
                              cancelLoading ===
                              appointment.id
                            }
                            className="w-full rounded-xl bg-rose-500 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                          >
                            {cancelLoading ===
                            appointment.id
                              ? "Cancelling..."
                              : "Cancel Appointment"}
                          </button>
                        )}

                        {appointment.status === "COMPLETED" && (

                          <button
                            type="button"
                            onClick={() => {
                              window.location.href = `/customer/appointment-review?appointmentId=${appointment.id}`;
                            }}
                            className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
                          >
                            Leave a Review ✨
                          </button>
                        )}

                      </div>

                    </div>
                  )}

                </div>
              );
            })}

            {/* ==========================================
                NUMBERED PAGINATION
            ========================================== */}

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

