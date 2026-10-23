
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const appointmentId = params?.id;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH APPOINTMENT
  // =====================================================

  useEffect(() => {
    if (!appointmentId) return;

    fetchAppointment();
  }, [appointmentId]);

  async function fetchAppointment() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/customer/appointment");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load appointment"
        );
      }

      const appointments = Array.isArray(data)
        ? data
        : Array.isArray(data.appointments)
        ? data.appointments
        : [];

      const foundAppointment = appointments.find(
        (item) => String(item.id) === String(appointmentId)
      );

      if (!foundAppointment) {
        setError("Appointment not found.");
        return;
      }

      setAppointment(foundAppointment);
    } catch (err) {
      console.error("APPOINTMENT DETAILS ERROR:", err);

      setError(
        err.message || "Failed to load appointment."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // STATUS COLOR
  // =====================================================

  function statusColor(status) {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";

      case "CONFIRMED":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";

      case "REJECTED":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800";

      case "IN_PROGRESS":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";

      case "COMPLETED":
        return "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";

      case "CANCELLED":
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";

      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 transition-colors duration-300">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-black/20 p-6 text-center">
          <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-600 dark:border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>

          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Loading appointment
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Please wait while we load your appointment details.
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-black/20 p-6 sm:p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-2xl">
            ⚠️
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">
            Appointment Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {error || "This appointment could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/customer/appointment")
            }
            className="mt-6 w-full rounded-xl bg-slate-900 dark:bg-slate-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:hover:bg-slate-600"
          >
            ← My Appointments
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // APPOINTMENT DETAILS
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-5 sm:py-7 px-3 sm:px-5 transition-colors duration-300">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}

        <div className="mb-5 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 px-3 py-1 text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400">
                ✨ Customer Portal
              </div>

              <h1 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Appointment Details
              </h1>

              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                View your appointment information and latest status.
              </p>
            </div>

            <span
              className={`self-start sm:self-center inline-flex items-center px-3 py-1.5 rounded-full border text-[10px] sm:text-xs font-bold uppercase tracking-wide ${statusColor(
                appointment.status
              )}`}
            >
              <span className="mr-1.5 w-1.5 h-1.5 rounded-full bg-current" />
              {appointment.status}
            </span>

          </div>
        </div>

        {/* MAIN CARD */}

        <div className="w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-black/20">

          {/* CARD HEADER */}

          <div className="px-4 py-4 sm:px-5 sm:py-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-lg sm:text-xl">
                📅
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Service
                </p>

                <h2 className="mt-0.5 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 break-words">
                  {appointment.service?.name || "Salon Service"}
                </h2>

                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5 break-all">
                  Appointment #{appointment.id}
                </p>
              </div>

            </div>
          </div>

          {/* DETAILS */}

          <div className="p-4 sm:p-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* SERVICE */}

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span>💇</span>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Service
                  </p>
                </div>

                <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                  {appointment.service?.name || "Salon Service"}
                </p>
              </div>

              {/* STAFF */}

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span>👨‍💼</span>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Staff Member
                  </p>
                </div>

                <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                  {appointment.staff?.name ||
                    "Any Available Staff"}
                </p>
              </div>

              {/* DATE */}

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span>📅</span>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Date
                  </p>
                </div>

                <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {new Date(
                    appointment.date
                  ).toLocaleDateString()}
                </p>
              </div>

              {/* TIME */}

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span>⏰</span>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Time
                  </p>
                </div>

                <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {appointment.time}
                </p>
              </div>

              {/* PRICE */}

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span>💰</span>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Price
                  </p>
                </div>

                <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                 Rs. {appointment.priceAtBooking ?? appointment.service?.price ?? 0}
                </p>
              </div>

              {/* PAYMENT */}

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <span>💳</span>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Payment
                  </p>
                </div>

                <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200 break-words">
                  {appointment.paymentMethod ||
                    "PAY_AT_SALON"}
                </p>
              </div>

            </div>
          </div>

          {/* STATUS MESSAGE */}

          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-4 py-4 sm:px-5">

            {appointment.status === "PENDING" && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3">
                <div className="flex items-start gap-2">
                  <span>⏳</span>

                  <p className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300">
                    Your appointment is waiting for staff approval.
                  </p>
                </div>
              </div>
            )}

            {appointment.status === "CONFIRMED" && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3">
                <div className="flex items-start gap-2">
                  <span>✅</span>

                  <p className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Your appointment has been accepted by the staff.
                  </p>
                </div>
              </div>
            )}

            {appointment.status === "REJECTED" && (
              <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-3">
                <div className="flex items-start gap-2">
                  <span>❌</span>

                  <p className="text-xs sm:text-sm font-medium text-rose-700 dark:text-rose-300">
                    Your appointment has been rejected.
                  </p>
                </div>
              </div>
            )}

            {appointment.status === "IN_PROGRESS" && (
              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 px-4 py-3">
                <div className="flex items-start gap-2">
                  <span>🔵</span>

                  <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">
                    Your appointment is currently in progress.
                  </p>
                </div>
              </div>
            )}

            {appointment.status === "COMPLETED" && (
              <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 px-4 py-3">
                <div className="flex items-start gap-2">
                  <span>🎉</span>

                  <p className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">
                    Your appointment has been completed.
                  </p>
                </div>
              </div>
            )}

            {appointment.status === "CANCELLED" && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-3">
                <div className="flex items-start gap-2">
                  <span>ℹ️</span>

                  <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                    Appointment cancelled.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* VIEW INVOICE */}

{appointment.status === "COMPLETED" && (
  <div className="mb-3">
    <button
      type="button"
      onClick={() =>
        router.push(
          `/customer/appointment/${appointment.id}/invoice`
        )
      }
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.99]"
    >
      🧾 View Invoice
    </button>
  </div>
)}

        {/* BACK BUTTON */}

        <div className="mt-4">
          <button
            type="button"
            onClick={() =>
              router.push("/customer/appointment")
            }
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-black/20 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.99]"
          >
            ← Back to My Appointment
          </button>
        </div>

      </div>
    </div>
  );
}

