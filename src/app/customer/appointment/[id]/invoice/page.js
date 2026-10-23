
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CustomerInvoicePage() {
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
      console.error("CUSTOMER INVOICE ERROR:", err);

      setError(
        err.message || "Failed to load invoice."
      );
    } finally {
      setLoading(false);
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
            Loading invoice
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Please wait while we prepare your invoice.
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
            Invoice Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {error || "This invoice could not be found."}
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
  // BOOKING PRICE SNAPSHOT
  // =====================================================

  const servicePrice =
    appointment.priceAtBooking ??
    appointment.service?.price ??
    0;

  // =====================================================
  // INVOICE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-5 sm:py-8 px-3 sm:px-5 transition-colors duration-300">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}

        <div className="mb-5 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 px-3 py-1 text-[10px] sm:text-xs font-bold text-blue-600 dark:text-blue-400">
                🧾 Customer Invoice
              </div>

              <h1 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                Invoice
              </h1>

              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Your appointment invoice and payment details.
              </p>
            </div>

            <span className="self-start sm:self-center inline-flex items-center px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              <span className="mr-1.5 w-1.5 h-1.5 rounded-full bg-current" />
              {appointment.status}
            </span>

          </div>
        </div>

        {/* INVOICE CARD */}

        <div
          id="customer-invoice"
          className="w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-black/20"
        >

          {/* INVOICE HEADER */}

          <div className="px-5 py-5 sm:px-7 sm:py-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  ✨ Salon Management
                </h2>

                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Appointment Invoice
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Invoice ID
                </p>

                <p className="mt-1 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 break-all">
                  {appointment.id}
                </p>
              </div>

            </div>
          </div>

          {/* APPOINTMENT INFORMATION */}

          <div className="p-5 sm:p-7">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* SERVICE */}

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Service
                </p>

                <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {appointment.service?.name || "Salon Service"}
                </p>
              </div>

              {/* STAFF */}

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Staff Member
                </p>

                <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {appointment.staff?.name ||
                    "Any Available Staff"}
                </p>
              </div>

              {/* DATE */}

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Appointment Date
                </p>

                <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {new Date(
                    appointment.date
                  ).toLocaleDateString()}
                </p>
              </div>

              {/* TIME */}

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Appointment Time
                </p>

                <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {appointment.time}
                </p>
              </div>

            </div>

            {/* SERVICE BILL */}

            <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">

              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Billing Details
                </p>
              </div>

              <div className="p-4">

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {appointment.service?.name ||
                        "Salon Service"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Salon service
                    </p>
                  </div>

                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    Rs. {servicePrice}
                  </p>
                </div>

              </div>

              <div className="px-4 py-4 bg-slate-50/70 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between gap-4">

                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Total
                  </p>

                  <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                    Rs. {servicePrice}
                  </p>

                </div>
              </div>

            </div>

            {/* PAYMENT */}

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Payment Method
                </p>

                <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {appointment.paymentMethod ||
                    "PAY_AT_SALON"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-4 py-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Payment Status
                </p>

                <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                  {appointment.paymentStatus ||
                    "PENDING"}
                </p>
              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-5 py-4 sm:px-7">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Thank you for choosing Salon Management.
            </p>
          </div>

        </div>

        {/* ACTIONS */}

        <div className="mt-4 flex flex-col sm:flex-row gap-3">

          <button
            type="button"
            onClick={() =>
              router.push(
                `/customer/appointment/${appointment.id}`
              )
            }
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-black/20 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            ← Appointment Details
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.99]"
          >
            🖨️ Print Invoice
          </button>

        </div>

      </div>

      {/* PRINT STYLES */}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          #customer-invoice,
          #customer-invoice * {
            visibility: visible;
          }

          #customer-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

