"use client";

import { useEffect, useState } from "react";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch analytics");
      }

      setAnalytics(data);
    } catch (error) {
      console.error("ADMIN ANALYTICS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="inline-flex text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Performance Overview
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Business Analytics
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            View overall salon performance statistics and insights.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🔄</span>
          Refresh
        </button>
      </div>

      {/* LOADING STATE */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 sm:p-16 text-center shadow-xs">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>

          <p className="text-slate-500 text-sm font-medium">
            Loading analytics...
          </p>
        </div>
      ) : analytics ? (
        <div className="space-y-6 sm:space-y-8">

          {/* OVERVIEW STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

            {/* Total Appointments */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Total Appointments
                </p>

                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {analytics.totalAppointments}
                </p>
              </div>

              <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center text-blue-600 font-bold">
                📅
              </div>
            </div>

            {/* Total Customers */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Total Customers
                </p>

                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {analytics.totalCustomers}
                </p>
              </div>

              <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center text-blue-600 font-bold">
                👥
              </div>
            </div>

            {/* Total Staff */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Total Staff
                </p>

                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {analytics.totalStaff}
                </p>
              </div>

              <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center text-blue-600 font-bold">
                ✂️
              </div>
            </div>

            {/* Total Services */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Total Services
                </p>

                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {analytics.totalServices}
                </p>
              </div>

              <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 items-center justify-center text-blue-600 font-bold">
                💅
              </div>
            </div>

          </div>

          {/* APPOINTMENT STATUS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

            {/* Completed */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Completed
                </p>

                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {analytics.completedAppointments}
                </p>
              </div>

              <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center text-emerald-600 font-bold">
                ✓
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-600">
                  Pending
                </p>

                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {analytics.pendingAppointments}
                </p>
              </div>

              <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 items-center justify-center text-amber-600 font-bold">
                ⏳
              </div>
            </div>

            {/* Cancelled */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-rose-600">
                  Cancelled
                </p>

                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {analytics.cancelledAppointments}
                </p>
              </div>

              <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 items-center justify-center text-rose-600 font-bold">
                ✕
              </div>
            </div>

            {/* Rejected */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Rejected
                </p>

                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {analytics.rejectedAppointments}
                </p>
              </div>

              <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 items-center justify-center text-slate-600 font-bold">
                🚫
              </div>
            </div>

          </div>

          {/* REVIEWS + STATUS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">

            {/* Reviews Card */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 sm:p-6 lg:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Reviews & Ratings
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">

                <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Total Reviews
                  </p>

                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {analytics.totalReviews}
                  </p>
                </div>

                <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-100">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Average Rating
                  </p>

                  <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-3xl font-bold text-slate-900">
                      {analytics.averageRating}
                    </p>

                    <span className="text-xl">⭐</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 sm:p-6 lg:p-8 space-y-4">
              <h2 className="text-lg font-bold text-slate-900">
                Appointment Status Breakdown
              </h2>

              <div className="space-y-3 pt-1">

                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-600">
                    Confirmed
                  </span>

                  <span className="font-bold text-emerald-600">
                    {analytics.confirmedAppointments}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-600">
                    Pending
                  </span>

                  <span className="font-bold text-amber-600">
                    {analytics.pendingAppointments}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-600">
                    Completed
                  </span>

                  <span className="font-bold text-blue-600">
                    {analytics.completedAppointments}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                  <span className="font-medium text-slate-600">
                    Cancelled
                  </span>

                  <span className="font-bold text-rose-600">
                    {analytics.cancelledAppointments}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm py-2">
                  <span className="font-medium text-slate-600">
                    Rejected
                  </span>

                  <span className="font-bold text-slate-600">
                    {analytics.rejectedAppointments}
                  </span>
                </div>

              </div>
            </div>

          </div>

          {/* WEEKLY STATISTICS */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">

            <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Last 7 Days Performance
              </h2>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">

                <thead className="bg-slate-50/70">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Date
                    </th>

                    <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Total
                    </th>

                    <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Completed
                    </th>

                    <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Pending
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {analytics.weeklyData?.map((day, index) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {day.date}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-slate-900">
                        {day.count}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-emerald-600">
                        {day.completed}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-amber-600">
                        {day.pending}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden p-4 space-y-3">
              {analytics.weeklyData?.map((day, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-100 bg-slate-50/40 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-900">
                      {day.date}
                    </span>

                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                      {day.count} Total
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">

                    <div className="bg-white rounded-lg border border-slate-100 p-3">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                        Completed
                      </p>

                      <p className="text-lg font-bold text-emerald-600 mt-1">
                        {day.completed}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-100 p-3">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                        Pending
                      </p>

                      <p className="text-lg font-bold text-amber-600 mt-1">
                        {day.pending}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* MONTHLY STATISTICS */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">

            <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Last 30 Days (Weekly Breakdown)
              </h2>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">

                <thead className="bg-slate-50/70">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Week
                    </th>

                    <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Total
                    </th>

                    <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Completed
                    </th>

                    <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Pending
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {analytics.monthlyData?.map((week, index) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {week.week}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-slate-900">
                        {week.count}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-emerald-600">
                        {week.completed}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-amber-600">
                        {week.pending}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden p-4 space-y-3">
              {analytics.monthlyData?.map((week, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-100 bg-slate-50/40 p-4"
                >
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <span className="text-sm font-bold text-slate-900">
                      {week.week}
                    </span>

                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                      {week.count} Total
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">

                    <div className="bg-white rounded-lg border border-slate-100 p-3">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                        Completed
                      </p>

                      <p className="text-lg font-bold text-emerald-600 mt-1">
                        {week.completed}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-100 p-3">
                      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                        Pending
                      </p>

                      <p className="text-lg font-bold text-amber-600 mt-1">
                        {week.pending}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 sm:p-16 text-center shadow-xs">
          <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
            📊
          </div>

          <p className="text-slate-500 text-sm font-medium">
            No analytics data available.
          </p>
        </div>
      )}

    </div>
  );
}