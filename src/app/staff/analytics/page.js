"use client";

import { useEffect, useState } from "react";

export default function StaffAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FETCH ANALYTICS
  // =====================================================

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);

      const res = await fetch("/api/staff/analytics");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch analytics");
      }

      setAnalytics(data);
    } catch (error) {
      console.error("STAFF ANALYTICS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                My Analytics
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400 mt-1">
                View your personal performance statistics and metrics.
              </p>
            </div>

            <button
              onClick={fetchAnalytics}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔄</span>
              Refresh
            </button>
          </div>
        </div>

        {/* ==========================================
            LOADING
        ========================================== */}

        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 p-16 sm:p-20 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500 rounded-full mx-auto mb-3" />

            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
              Loading analytics...
            </p>
          </div>
        ) : analytics ? (
          <div className="space-y-5 sm:space-y-6">

            {/* ==========================================
                STATS CARDS
            ========================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

              {/* TOTAL APPOINTMENTS */}

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Total Appointments
                  </p>

                  <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    📅
                  </span>
                </div>

                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 mt-4">
                  {analytics.totalAppointments}
                </p>
              </div>

              {/* COMPLETED */}

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-emerald-500 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Completed
                  </p>

                  <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    ✓
                  </span>
                </div>

                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-4">
                  {analytics.completedAppointments}
                </p>
              </div>

              {/* PENDING */}

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-blue-500 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Pending
                  </p>

                  <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    ⏳
                  </span>
                </div>

                <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-4">
                  {analytics.pendingAppointments}
                </p>
              </div>

              {/* CANCELLED */}

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 border-l-4 border-l-rose-500 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Cancelled
                  </p>

                  <span className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    ✕
                  </span>
                </div>

                <p className="text-3xl sm:text-4xl font-extrabold text-rose-600 dark:text-rose-400 mt-4">
                  {analytics.cancelledAppointments}
                </p>
              </div>
            </div>

            {/* ==========================================
                REVIEWS & STATUS BREAKDOWN
            ========================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">

              {/* REVIEWS */}

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    Reviews & Ratings
                  </h2>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Your customer feedback and overall rating.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                  {/* TOTAL REVIEWS */}

                  <div className="bg-blue-50/40 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Total Reviews
                    </p>

                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
                      {analytics.totalReviews}
                    </p>
                  </div>

                  {/* AVERAGE RATING */}

                  <div className="bg-blue-50/40 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-100 dark:border-blue-900">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Average Rating
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                        {analytics.averageRating}
                      </p>

                      <span className="text-lg sm:text-xl">
                        ⭐
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STATUS BREAKDOWN */}

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    Status Breakdown
                  </h2>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Appointment status overview.
                  </p>
                </div>

                <div className="space-y-2">

                  {/* CONFIRMED */}

                  <div className="flex items-center justify-between gap-3 text-sm py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Confirmed
                    </span>

                    <span className="font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 px-2.5 py-1 rounded-full text-[10px] sm:text-xs">
                      {analytics.confirmedAppointments}
                    </span>
                  </div>

                  {/* PENDING */}

                  <div className="flex items-center justify-between gap-3 text-sm py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Pending
                    </span>

                    <span className="font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 px-2.5 py-1 rounded-full text-[10px] sm:text-xs">
                      {analytics.pendingAppointments}
                    </span>
                  </div>

                  {/* COMPLETED */}

                  <div className="flex items-center justify-between gap-3 text-sm py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Completed
                    </span>

                    <span className="font-bold text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 px-2.5 py-1 rounded-full text-[10px] sm:text-xs">
                      {analytics.completedAppointments}
                    </span>
                  </div>

                  {/* CANCELLED */}

                  <div className="flex items-center justify-between gap-3 text-sm py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Cancelled
                    </span>

                    <span className="font-bold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800 px-2.5 py-1 rounded-full text-[10px] sm:text-xs">
                      {analytics.cancelledAppointments}
                    </span>
                  </div>

                  {/* REJECTED */}

                  <div className="flex items-center justify-between gap-3 text-sm py-2.5">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Rejected
                    </span>

                    <span className="font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full text-[10px] sm:text-xs">
                      {analytics.rejectedAppointments}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ==========================================
                WEEKLY STATISTICS
            ========================================== */}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 overflow-hidden">

              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Last 7 Days
                </h2>

                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Daily appointment performance.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">

                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">
                        Date
                      </th>

                      <th className="py-3.5 px-4 sm:px-6 text-center">
                        Total
                      </th>

                      <th className="py-3.5 px-4 sm:px-6 text-center">
                        Completed
                      </th>

                      <th className="py-3.5 px-4 sm:px-6 text-center">
                        Pending
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                    {analytics.weeklyData.map((day, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50/30 dark:hover:bg-slate-800 transition"
                      >
                        <td className="py-3.5 sm:py-4 px-4 sm:px-6 font-semibold text-slate-800 dark:text-slate-200">
                          {day.date}
                        </td>

                        <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-center font-bold text-slate-900 dark:text-slate-100">
                          {day.count}
                        </td>

                        <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                          {day.completed}
                        </td>

                        <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-center font-semibold text-blue-600 dark:text-blue-400">
                          {day.pending}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ==========================================
                MONTHLY STATISTICS
            ========================================== */}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 overflow-hidden">

              <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Last 30 Days (Weekly)
                </h2>

                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Weekly appointment performance.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">

                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4 sm:px-6">
                        Week
                      </th>

                      <th className="py-3.5 px-4 sm:px-6 text-center">
                        Total
                      </th>

                      <th className="py-3.5 px-4 sm:px-6 text-center">
                        Completed
                      </th>

                      <th className="py-3.5 px-4 sm:px-6 text-center">
                        Pending
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
                    {analytics.monthlyData.map((week, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50/30 dark:hover:bg-slate-800 transition"
                      >
                        <td className="py-3.5 sm:py-4 px-4 sm:px-6 font-semibold text-slate-800 dark:text-slate-200">
                          {week.week}
                        </td>

                        <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-center font-bold text-slate-900 dark:text-slate-100">
                          {week.count}
                        </td>

                        <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                          {week.completed}
                        </td>

                        <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-center font-semibold text-blue-600 dark:text-blue-400">
                          {week.pending}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================
              NO DATA
          ========================================== */

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 p-10 sm:p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
              📊
            </div>

            <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
              No analytics data available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}