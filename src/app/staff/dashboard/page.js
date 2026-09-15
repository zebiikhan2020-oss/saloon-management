"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function StaffDashboard() {
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState({
    staff: {},
    todaysAppointments: 0,
    pendingAppointments: 0,
    completedToday: 0,
    todaysSchedule: [],
  });

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/staff/dashboard", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("Dashboard API Error:", data);
        return;
      }

      setDashboard({
        staff: data.staff || {},
        todaysAppointments:
          data.todaysAppointments || 0,
        pendingAppointments:
          data.pendingAppointments || 0,
        completedToday:
          data.completedToday || 0,
        todaysSchedule:
          data.todaysSchedule || [],
      });
    } catch (error) {
      console.log("DASHBOARD ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 py-5 sm:py-8 px-3 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="mx-auto w-full max-w-7xl">

        {/* =====================================================
            WELCOME BANNER
        ===================================================== */}

        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 px-3 py-1.5 rounded-full inline-block mb-3">
          ✨ Staff Portal
        </span>

        {/* WELCOME TEXT */}

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome,{" "}
            {loading
              ? "..."
              : dashboard.staff?.name || "Staff"}
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage today's appointments and your daily work efficiently.
          </p>
        </div>

        {/* =====================================================
            DASHBOARD CARDS
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 mb-7 sm:mb-10">

          {/* TODAY'S APPOINTMENTS */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-indigo-500 hover:shadow-md dark:hover:shadow-black/30 transition">

            <div className="flex items-center justify-between gap-3">

              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Today's Appointments
                </span>

                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                  {loading
                    ? "..."
                    : dashboard.todaysAppointments}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shrink-0">
                📅
              </div>

            </div>

          </div>

          {/* PENDING */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-amber-500 hover:shadow-md dark:hover:shadow-black/30 transition">

            <div className="flex items-center justify-between gap-3">

              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Pending
                </span>

                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                  {loading
                    ? "..."
                    : dashboard.pendingAppointments}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shrink-0">
                ⏳
              </div>

            </div>

          </div>

          {/* COMPLETED */}

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-emerald-500 hover:shadow-md dark:hover:shadow-black/30 transition sm:col-span-2 xl:col-span-1">

            <div className="flex items-center justify-between gap-3">

              <div>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Completed Today
                </span>

                <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                  {loading
                    ? "..."
                    : dashboard.completedToday}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0">
                ✓
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            QUICK ACTIONS
        ===================================================== */}

        <div className="mb-7 sm:mb-10">

          <div className="mb-4">

            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Quick Actions
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quickly access your most used staff tools.
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">

            {/* ATTENDANCE */}

            <Link
              href="/staff/attendance"
              className="bg-white dark:bg-slate-900 hover:bg-indigo-50/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 rounded-2xl p-5 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/30 transition-all block group"
            >

              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-105 transition">
                📍
              </div>

              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Attendance
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Mark today's attendance status.
              </p>

            </Link>

            {/* LEAVE */}

            <Link
              href="/staff/leaves"
              className="bg-white dark:bg-slate-900 hover:bg-indigo-50/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 rounded-2xl p-5 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/30 transition-all block group"
            >

              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-105 transition">
                🏖️
              </div>

              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Leave
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Apply and track leave requests.
              </p>

            </Link>

            {/* AVAILABILITY */}

            <Link
              href="/staff/availability"
              className="bg-white dark:bg-slate-900 hover:bg-indigo-50/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 rounded-2xl p-5 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/30 transition-all block group"
            >

              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-105 transition">
                ⏰
              </div>

              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                Availability
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Update your working hours.
              </p>

            </Link>

            {/* PORTFOLIO */}

            <Link
              href="/staff/portfolio"
              className="bg-white dark:bg-slate-900 hover:bg-indigo-50/40 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 rounded-2xl p-5 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/30 transition-all block group"
            >

              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg mb-3 group-hover:scale-105 transition">
                ✨
              </div>

              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                My Portfolio
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Add and manage styling work.
              </p>

            </Link>

          </div>

        </div>

        {/* =====================================================
            TODAY'S SCHEDULE
        ===================================================== */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6">

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5 sm:mb-6">

            <div>

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Today's Schedule
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                List of bookings assigned to you today
              </p>

            </div>

            <span className="text-[11px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1.5 rounded-full w-fit">
              {dashboard.todaysSchedule?.length || 0}{" "}
              Appointment(s)
            </span>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="text-center py-12">

              <div className="w-8 h-8 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>

              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Loading schedule...
              </p>

            </div>

          ) : dashboard.todaysSchedule.length === 0 ? (

            /* EMPTY */

            <div className="text-center py-12 px-4 text-slate-400 dark:text-slate-500">

              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl mx-auto mb-3">
                📅
              </div>

              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                No appointments scheduled for today.
              </p>

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Check back later for new bookings.
              </p>

            </div>

          ) : (

            /* TABLE */

            <div className="overflow-x-auto -mx-1 px-1">

              <table className="min-w-[750px] w-full text-left border-collapse">

                <thead>

                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">

                    <th className="px-4 py-3 rounded-l-xl">
                      Time
                    </th>

                    <th className="px-4 py-3">
                      Customer
                    </th>

                    <th className="px-4 py-3">
                      Email
                    </th>

                    <th className="px-4 py-3">
                      Service
                    </th>

                    <th className="px-4 py-3">
                      Duration
                    </th>

                    <th className="px-4 py-3 rounded-r-xl">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-600 dark:text-slate-300">

                  {dashboard.todaysSchedule.map(
                    (item) => (

                      <tr
                        key={item.id}
                        className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/60 transition"
                      >

                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {item.time}
                        </td>

                        <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                          {item.customer?.name ||
                            "N/A"}
                        </td>

                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                          {item.customer?.email ||
                            "N/A"}
                        </td>

                        <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                          {item.service?.name ||
                            "Salon Service"}
                        </td>

                        <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {item.service?.duration ||
                            0}{" "}
                          min
                        </td>

                        <td className="px-4 py-3.5">

                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${
                              item.status ===
                              "PENDING"
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50"
                                : item.status ===
                                  "CONFIRMED"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50"
                                : item.status ===
                                  "COMPLETED"
                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
                                : item.status ===
                                  "REJECTED"
                                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {item.status}
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </div>
  );
}