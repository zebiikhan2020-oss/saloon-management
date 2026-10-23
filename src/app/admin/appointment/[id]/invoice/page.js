"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminInvoicePage() {
  const params = useParams();
  const router = useRouter();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params?.id) {
      fetchAppointment();
    }
  }, [params?.id]);

  async function fetchAppointment() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/appointment");

      if (!response.ok) {
        throw new Error("Failed to load appointment");
      }

      const data = await response.json();

      const appointments = Array.isArray(data)
        ? data
        : data?.appointments || data?.data || [];

      const found = appointments.find(
        (item) => item.id === params.id
      );

      if (!found) {
        throw new Error("Appointment not found");
      }

      setAppointment(found);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Loading invoice...
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Invoice Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {error || "Unable to load this appointment."}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-5 rounded-xl bg-slate-900 dark:bg-white px-5 py-2.5 text-sm font-bold text-white dark:text-slate-900"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const servicePrice =
    appointment.priceAtBooking ??
    appointment.service?.price ??
    0;

  return (
    <>
      {/* =====================================================
          SCREEN ACTIONS
      ===================================================== */}

      <div className="print:hidden sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="rounded-xl bg-slate-900 dark:bg-white px-5 py-2.5 text-sm font-bold text-white dark:text-slate-900 shadow-sm hover:opacity-90"
          >
            🖨 Print Invoice
          </button>
        </div>
      </div>

      {/* =====================================================
          INVOICE
      ===================================================== */}

      <main className="min-h-screen bg-slate-100 dark:bg-slate-950 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div
            id="invoice"
            className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm print:rounded-none print:border-0 print:shadow-none"
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-7 sm:px-10">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    ✨ Salon Management
                  </h1>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Appointment Invoice
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Invoice
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    #{appointment.id}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(appointment.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                CUSTOMER + APPOINTMENT INFO
            ================================================= */}

            <div className="grid grid-cols-1 gap-6 border-b border-slate-200 dark:border-slate-800 px-6 py-7 sm:grid-cols-2 sm:px-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Customer
                </p>

                <p className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                  {appointment.customer?.name || "-"}
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {appointment.customer?.email || "-"}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Appointment
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                  Date: {formatDate(appointment.date)}
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Time: {appointment.time || "-"}
                </p>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Staff: {appointment.staff?.name || "Not assigned"}
                </p>
              </div>
            </div>

            {/* =================================================
                SERVICE
            ================================================= */}

            <div className="px-6 py-7 sm:px-10">
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-800/70 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <div className="col-span-7">
                    Service
                  </div>

                  <div className="col-span-2 text-center">
                    Duration
                  </div>

                  <div className="col-span-3 text-right">
                    Amount
                  </div>
                </div>

                <div className="grid grid-cols-12 px-4 py-5 text-sm">
                  <div className="col-span-7">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {appointment.service?.name || "-"}
                    </p>

                    {appointment.service?.description && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {appointment.service.description}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center justify-center text-slate-600 dark:text-slate-300">
                    {appointment.service?.duration || 0} min
                  </div>

                  <div className="col-span-3 flex items-center justify-end font-bold text-slate-900 dark:text-white">
                    Rs. {servicePrice.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* =================================================
                  TOTAL
              ================================================= */}

              <div className="mt-5 flex justify-end">
                <div className="w-full max-w-sm">
                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
                    <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                      Total
                    </span>

                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      Rs. {servicePrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                PAYMENT
            ================================================= */}

            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-6 py-6 sm:px-10">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Payment Method
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {appointment.paymentMethod === "EASYPAISA"
                      ? "Easypaisa"
                      : "Pay at Salon"}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Payment Status
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {appointment.paymentStatus || "PENDING"}
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-6 text-center sm:px-10">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Thank you for choosing Salon Management.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                This is a computer-generated invoice.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          PRINT STYLES
      ===================================================== */}

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            background: white !important;
          }

          #invoice {
            width: 100% !important;
          }
        }
      `}</style>
    </>
  );
}