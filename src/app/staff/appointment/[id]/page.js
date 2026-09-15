
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StaffAppointmentDetailsPage() {
  const params = useParams();

  const appointmentId = params?.id;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  // =====================================================
  // FETCH APPOINTMENT DETAILS
  // =====================================================

  useEffect(() => {
    if (!appointmentId) return;

    fetchAppointment();
  }, [appointmentId]);

  async function fetchAppointment() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/staff/appointment/${appointmentId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to load appointment details."
        );

        return;
      }

      setAppointment(data);
    } catch (error) {
      console.error(
        "FETCH STAFF APPOINTMENT DETAILS ERROR:",
        error
      );

      setError(
        "Something went wrong while loading appointment."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // CONFIRM / REJECT APPOINTMENT
  // =====================================================

  async function updateAppointmentStatus(status) {
    try {
      setActionLoading(true);
      setActionMessage("");
      setActionError("");

      const response = await fetch(
        `/api/admin/staff/appointment/${appointmentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setActionError(
          data.message ||
            "Failed to update appointment status."
        );

        return;
      }

      setAppointment((prev) => ({
        ...prev,
        status: data.appointment?.status || status,
      }));

      setActionMessage(
        status === "CONFIRMED"
          ? "Appointment confirmed successfully."
          : "Appointment rejected successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE STAFF APPOINTMENT STATUS ERROR:",
        error
      );

      setActionError(
        "Something went wrong while updating appointment."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";

      case "CONFIRMED":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

      case "IN_PROGRESS":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";

      case "COMPLETED":
        return "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";

      case "REJECTED":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";

      case "CANCELLED":
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";

      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
        <div className="mx-auto max-w-5xl">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 p-8 sm:p-12 text-center">
            <div className="w-10 h-10 border-4 border-indigo-100 dark:border-indigo-950 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />

            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Loading appointment details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
        <div className="mx-auto max-w-5xl">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-sm dark:shadow-black/20 p-8 sm:p-12 text-center">

            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl mx-auto mb-4">
              ⚠️
            </div>

            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Appointment Not Found
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {error}
            </p>

            <Link
              href="/staff/appointment"
              className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold transition"
            >
              ← Back to Appointments
            </Link>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO DATA
  // =====================================================

  if (!appointment) {
    return null;
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
      <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">

        {/* =================================================
            TOP HEADER
        ================================================= */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 p-4 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">

              <Link
                href="/staff/appointment"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition mb-3"
              >
                ← Back to Appointments
              </Link>

              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Appointment Details
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                View complete details of your assigned appointment.
              </p>

            </div>

            {/* STATUS */}

            <div
              className={`inline-flex items-center px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-extrabold w-fit ${getStatusStyle(
                appointment.status
              )}`}
            >
              {appointment.status}
            </div>

          </div>

        </div>

        {/* =================================================
            APPOINTMENT INFORMATION
        ================================================= */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 overflow-hidden">

          <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
                📅
              </div>

              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Appointment Information
                </h2>

                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Scheduled booking details
                </p>
              </div>

            </div>

          </div>

          <div className="p-4 sm:p-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* DATE */}

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Date
                </p>

                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {formatDate(appointment.date)}
                </p>
              </div>

              {/* TIME */}

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Time
                </p>

                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {appointment.time || "-"}
                </p>
              </div>

              {/* SERVICE */}

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Service
                </p>

                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-1 break-words">
                  {appointment.service?.name || "-"}
                </p>
              </div>

              {/* CATEGORY */}

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Category
                </p>

                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-1 break-words">
                  {appointment.service?.category?.name || "-"}
                </p>
              </div>

              {/* DURATION */}

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Duration
                </p>

                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                  {appointment.service?.duration
                    ? `${appointment.service.duration} minutes`
                    : "-"}
                </p>
              </div>

              {/* APPOINTMENT ID */}

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Appointment ID
                </p>

                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 break-all">
                  {appointment.id || "-"}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            CUSTOMER INFORMATION
        ================================================= */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 overflow-hidden">

          <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
                👤
              </div>

              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Customer Information
                </h2>

                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Customer assigned to this appointment
                </p>
              </div>

            </div>

          </div>

          <div className="p-4 sm:p-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* CUSTOMER NAME */}

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4">

                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Name
                </p>

                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-1 break-words">
                  {appointment.customer?.name || "-"}
                </p>

              </div>

              {/* CUSTOMER EMAIL */}

              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4">

                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Email
                </p>

                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-1 break-all">
                  {appointment.customer?.email || "-"}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            STATUS INFORMATION
        ================================================= */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 overflow-hidden">

          <div className="p-4 sm:p-6">

            <div className="flex flex-col gap-5">

              {/* STATUS ROW */}

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shrink-0">
                  ℹ️
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Current Status
                  </p>

                  <p className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                    {appointment.status || "-"}
                  </p>

                </div>

                <div className="sm:ml-auto">

                  <span
                    className={`inline-flex px-3.5 py-2 rounded-xl border text-xs font-bold ${getStatusStyle(
                      appointment.status
                    )}`}
                  >
                    {appointment.status || "UNKNOWN"}
                  </span>

                </div>

              </div>

              {/* =================================================
                  CONFIRM / REJECT BUTTONS
              ================================================= */}

              {appointment.status === "PENDING" && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">

                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                    This appointment is waiting for your response.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">

                    {/* CONFIRM */}

                    <button
                      type="button"
                      onClick={() =>
                        updateAppointmentStatus("CONFIRMED")
                      }
                      disabled={actionLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 dark:disabled:bg-emerald-900/60 text-white text-sm font-extrabold transition shadow-sm"
                    >
                      {actionLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          ✓ Confirm Appointment
                        </>
                      )}
                    </button>

                    {/* REJECT */}

                    <button
                      type="button"
                      onClick={() =>
                        updateAppointmentStatus("REJECTED")
                      }
                      disabled={actionLoading}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 dark:disabled:bg-rose-900/60 text-white text-sm font-extrabold transition shadow-sm"
                    >
                      {actionLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          ✕ Reject Appointment
                        </>
                      )}
                    </button>

                  </div>

                </div>
              )}

              {/* =================================================
                  SUCCESS MESSAGE
              ================================================= */}

              {actionMessage && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  ✓ {actionMessage}
                </div>
              )}

              {/* =================================================
                  ERROR MESSAGE
              ================================================= */}

              {actionError && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-300">
                  ⚠️ {actionError}
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

