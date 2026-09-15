"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminAppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const appointmentId = params?.id;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =====================================================
  // LOAD APPOINTMENT
  // =====================================================

  useEffect(() => {
    if (!appointmentId) return;

    loadAppointment();
  }, [appointmentId]);

  async function loadAppointment() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/appointment");

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

      const found = appointments.find(
        (item) =>
          String(item.id) === String(appointmentId)
      );

      if (!found) {
        setError("Appointment not found.");
        return;
      }

      setAppointment(found);
    } catch (err) {
      console.error(
        "ADMIN APPOINTMENT ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to load appointment."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // ACCEPT / REJECT
  // =====================================================

  async function updateStatus(status) {
    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/admin/appointment",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentId,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update appointment"
        );
      }

      setMessage(
        data.message ||
          "Appointment updated successfully."
      );

      await loadAppointment();
    } catch (err) {
      console.error(
        "UPDATE APPOINTMENT ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to update appointment."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // =====================================================
  // STATUS COLOR
  // =====================================================

  function statusColor(status) {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";

      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "COMPLETED":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "CANCELLED":
        return "bg-slate-100 text-slate-600 border-slate-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-7 text-center">
          <div className="mx-auto mb-4 w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>

          <h2 className="text-sm font-bold text-slate-900">
            Loading appointment
          </h2>

          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Please wait while we load the appointment
            details.
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-2xl">
            ⚠️
          </div>

          <h1 className="mt-4 text-xl sm:text-2xl font-bold text-slate-900">
            Appointment Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "Appointment could not be found."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/appointment")
            }
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
          >
            ← Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">
        <div className="mx-auto max-w-4xl">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="mb-5 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[10px] sm:text-xs font-bold text-blue-600">
                  ✨ Admin Portal
                </div>

                <h1 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
                  Appointment Details
                </h1>

                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  View and manage appointment information.
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

          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {message && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">
                  ✓
                </span>

                <p className="text-xs sm:text-sm font-medium text-emerald-700 break-words">
                  {message}
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
              <div className="flex items-start gap-2">
                <span className="text-rose-600">
                  ⚠️
                </span>

                <p className="text-xs sm:text-sm font-medium text-rose-700 break-words">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              APPOINTMENT CARD
          ================================================= */}

          <div className="w-full overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">

            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">

                <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg sm:text-xl">
                  📅
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Service
                  </p>

                  <h2 className="mt-0.5 text-base sm:text-lg font-bold text-slate-900 break-words">
                    {appointment.service?.name ||
                      "Salon Service"}
                  </h2>

                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 break-all">
                    Appointment #{appointment.id}
                  </p>
                </div>

              </div>
            </div>

            {/* =================================================
                DETAILS
            ================================================= */}

            <div className="p-4 sm:p-5 lg:p-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                {/* CUSTOMER */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:py-4">
                  <div className="flex items-center gap-2">
                    <span>👤</span>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Customer
                    </p>
                  </div>

                  <p className="mt-1.5 text-sm font-bold text-slate-800 break-words">
                    {appointment.customer?.name ||
                      "Customer"}
                  </p>
                </div>

                {/* EMAIL */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:py-4">
                  <div className="flex items-center gap-2">
                    <span>📧</span>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Email
                    </p>
                  </div>

                  <p className="mt-1.5 text-sm font-bold text-slate-800 break-all">
                    {appointment.customer?.email ||
                      "N/A"}
                  </p>
                </div>

                {/* SERVICE */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:py-4">
                  <div className="flex items-center gap-2">
                    <span>💇</span>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Service
                    </p>
                  </div>

                  <p className="mt-1.5 text-sm font-bold text-slate-800 break-words">
                    {appointment.service?.name ||
                      "Salon Service"}
                  </p>
                </div>

                {/* STAFF */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:py-4">
                  <div className="flex items-center gap-2">
                    <span>👨‍💼</span>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Staff
                    </p>
                  </div>

                  <p className="mt-1.5 text-sm font-bold text-slate-800 break-words">
                    {appointment.staff?.name ||
                      "Not Assigned"}
                  </p>
                </div>

                {/* DATE */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:py-4">
                  <div className="flex items-center gap-2">
                    <span>📅</span>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Date
                    </p>
                  </div>

                  <p className="mt-1.5 text-sm font-bold text-slate-800">
                    {new Date(
                      appointment.date
                    ).toLocaleDateString()}
                  </p>
                </div>

                {/* TIME */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:py-4">
                  <div className="flex items-center gap-2">
                    <span>⏰</span>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Time
                    </p>
                  </div>

                  <p className="mt-1.5 text-sm font-bold text-slate-800">
                    {appointment.time}
                  </p>
                </div>

                {/* PRICE */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:py-4">
                  <div className="flex items-center gap-2">
                    <span>💰</span>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Price
                    </p>
                  </div>

                  <p className="mt-1.5 text-sm font-bold text-slate-800">
                    Rs.{" "}
                    {appointment.service?.price || 0}
                  </p>
                </div>

                {/* PAYMENT */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5 sm:py-4">
                  <div className="flex items-center gap-2">
                    <span>💳</span>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Payment
                    </p>
                  </div>

                  <p className="mt-1.5 text-sm font-bold text-slate-800 break-words">
                    {appointment.paymentMethod ||
                      "PAY_AT_SALON"}
                  </p>
                </div>

              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            {appointment.status === "PENDING" && (
              <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-5 sm:py-5">

                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Appointment Action
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Confirm or reject this appointment.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:justify-end">

                  {/* CONFIRM */}

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      updateStatus("CONFIRMED")
                    }
                    className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "✓ Confirm Appointment"
                    )}
                  </button>

                  {/* REJECT */}

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      updateStatus("REJECTED")
                    }
                    className="w-full rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "✕ Reject Appointment"
                    )}
                  </button>

                </div>
              </div>
            )}

          </div>

          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <div className="mt-4">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/appointment")
              }
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]"
            >
              ← Back to Appointments
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}