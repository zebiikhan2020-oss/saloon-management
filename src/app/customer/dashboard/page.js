
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CustomerDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH APPOINTMENTS
  // =========================

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(
        "/api/customer/appointment"
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (error) {
      console.log(
        "DASHBOARD APPOINTMENT ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // COUNTS
  // =========================

  const totalAppointments =
    appointments.length;

  const pendingAppointments =
    appointments.filter(
      (item) => item.status === "PENDING"
    ).length;

  const confirmedAppointments =
    appointments.filter(
      (item) => item.status === "CONFIRMED"
    ).length;

  const completedAppointments =
    appointments.filter(
      (item) => item.status === "COMPLETED"
    ).length;

  const cancelledAppointments =
    appointments.filter(
      (item) =>
        item.status === "CANCELLED" ||
        item.status === "REJECTED"
    ).length;

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusStyle = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900";

      case "CONFIRMED":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900";

      case "COMPLETED":
        return "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-100 dark:border-sky-900";

      case "REJECTED":
      case "CANCELLED":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900";

      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500";

      case "CONFIRMED":
        return "bg-emerald-500";

      case "COMPLETED":
        return "bg-sky-500";

      case "REJECTED":
      case "CANCELLED":
        return "bg-rose-500";

      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-8">

      {/* =================================================
          TOP HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full">
            Overview
          </span>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            Customer Dashboard
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Manage your salon appointments and view
            notifications easily.
          </p>
        </div>

      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Total
          </span>

          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-3">
            {loading
              ? "..."
              : totalAppointments}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Pending
          </span>

          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-3">
            {loading
              ? "..."
              : pendingAppointments}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Confirmed
          </span>

          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-3">
            {loading
              ? "..."
              : confirmedAppointments}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            Completed
          </span>

          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-3">
            {loading
              ? "..."
              : completedAppointments}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            Cancelled
          </span>

          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-3">
            {loading
              ? "..."
              : cancelledAppointments}
          </p>
        </div>

      </div>

      {/* =================================================
          ACTION BUTTONS
      ================================================= */}

      <div className="flex flex-wrap items-center gap-3">

        <Link
          href="/customer/book"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
        >
          + Book Appointment
        </Link>

        <Link
          href="/customer/appointment"
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition"
        >
          My Appointments
        </Link>

        <Link
          href="/customer/portfolio"
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition"
        >
          👨‍💼 Staff Portfolio
        </Link>

      </div>

      {/* =================================================
          RECENT APPOINTMENTS
      ================================================= */}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">

        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">

          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Appointments
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your latest booked salon services.
            </p>
          </div>

          <Link
            href="/customer/appointment"
            className="text-xs font-semibold text-blue-600 dark:text-white-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            View All →
          </Link>

        </div>

        <div className="p-6">

          {loading ? (
            <div className="py-12 text-center">

              <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />

              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                Loading appointments...
              </p>

            </div>

          ) : appointments.length === 0 ? (

            <div className="text-center py-12">

              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-white-950/40 text-blue-600 dark:text-white-400 flex items-center justify-center text-xl mx-auto mb-3">
                📅
              </div>

              <p className="text-slate-900 dark:text-white text-sm font-bold">
                No appointments found
              </p>

              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-4">
                You don't have any salon bookings yet.
              </p>

              <Link
                href="/customer/book"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
              >
                Book Your First Appointment
              </Link>

            </div>

          ) : (

            <div className="space-y-3">

              {appointments
                .slice(0, 5)
                .map((appointment) => (

                  <div
                    key={appointment.id}
                    className="border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-800/40 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition"
                  >

                    <div className="space-y-1">

                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {appointment.service?.name ||
                          "Salon Service"}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">

                        <span>
                          📅{" "}
                          {new Date(
                            appointment.date
                          ).toLocaleDateString()}
                        </span>

                        <span>
                          ⏰ {appointment.time}
                        </span>

                        <span>
                          👨‍💼{" "}
                          {appointment.staff?.name ||
                            "Any Available Staff"}
                        </span>

                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          💰 $
                          {appointment.service
                            ?.price || 0}
                        </span>

                      </div>

                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border w-fit ${getStatusStyle(
                        appointment.status
                      )}`}
                    >

                      <span
                        className={`w-2 h-2 rounded-full ${getStatusDot(
                          appointment.status
                        )}`}
                      />

                      {appointment.status}

                    </span>

                  </div>

                ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

