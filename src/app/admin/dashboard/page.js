"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    totalCustomers: 0,
    totalStaff: 0,
    totalServices: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaveRequests: 0,
    approvedLeaves: 0,
  });

  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // DARK MODE
  // FOLLOW ADMIN LAYOUT THEME
  // =====================================================

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setDarkMode(
        document.documentElement.classList.contains("dark")
      );
    };

    // Initial theme
    updateTheme();

    // Watch Admin Layout theme changes
    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // =====================================================
  // FETCH DASHBOARD STATS
  // =====================================================

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/dashboard/stats");
        const data = await response.json();
        setStats(data);
        setTodaysAppointments(data.todaysAppointments || []);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      label: "Overall",
      icon: "📅",
      iconBg: darkMode ? "bg-indigo-500/15" : "bg-indigo-100",
      iconText: darkMode ? "text-indigo-400" : "text-indigo-600",
      valueText: darkMode ? "text-slate-100" : "text-slate-900",
      badge: darkMode
        ? "bg-indigo-500/15 text-indigo-400"
        : "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Pending",
      value: stats.pendingAppointments,
      label: "Awaiting Action",
      icon: "⏳",
      iconBg: darkMode ? "bg-amber-500/15" : "bg-amber-100",
      iconText: darkMode ? "text-amber-400" : "text-amber-600",
      valueText: darkMode ? "text-slate-100" : "text-slate-900",
      badge: darkMode
        ? "bg-amber-500/15 text-amber-400"
        : "bg-amber-50 text-amber-600",
    },
    {
      title: "Confirmed",
      value: stats.confirmedAppointments,
      label: "Ready",
      icon: "✓",
      iconBg: darkMode ? "bg-emerald-500/15" : "bg-emerald-100",
      iconText: darkMode ? "text-emerald-400" : "text-emerald-600",
      valueText: darkMode ? "text-slate-100" : "text-slate-900",
      badge: darkMode
        ? "bg-emerald-500/15 text-emerald-400"
        : "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Completed",
      value: stats.completedAppointments,
      label: "Finished",
      icon: "✓",
      iconBg: darkMode ? "bg-violet-500/15" : "bg-violet-100",
      iconText: darkMode ? "text-violet-400" : "text-violet-600",
      valueText: darkMode ? "text-slate-100" : "text-slate-900",
      badge: darkMode
        ? "bg-violet-500/15 text-violet-400"
        : "bg-violet-50 text-violet-600",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      label: "Registered",
      icon: "👥",
      iconBg: darkMode ? "bg-blue-500/15" : "bg-blue-100",
      iconText: darkMode ? "text-blue-400" : "text-blue-600",
      valueText: darkMode ? "text-slate-100" : "text-slate-900",
      badge: darkMode
        ? "bg-blue-500/15 text-blue-400"
        : "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Staff",
      value: stats.totalStaff,
      label: "Team",
      icon: "👤",
      iconBg: darkMode ? "bg-sky-500/15" : "bg-sky-100",
      iconText: darkMode ? "text-sky-400" : "text-sky-600",
      valueText: darkMode ? "text-slate-100" : "text-slate-900",
      badge: darkMode
        ? "bg-sky-500/15 text-sky-400"
        : "bg-sky-50 text-sky-600",
    },
    {
      title: "Total Services",
      value: stats.totalServices,
      label: "Catalog",
      icon: "✂️",
      iconBg: darkMode ? "bg-cyan-500/15" : "bg-cyan-100",
      iconText: darkMode ? "text-cyan-400" : "text-cyan-600",
      valueText: darkMode ? "text-slate-100" : "text-slate-900",
      badge: darkMode
        ? "bg-cyan-500/15 text-cyan-400"
        : "bg-cyan-50 text-cyan-600",
    },
    {
      title: "Present Today",
      value: stats.presentToday,
      label: "Active",
      icon: "🟢",
      iconBg: darkMode ? "bg-emerald-500/15" : "bg-emerald-100",
      iconText: darkMode ? "text-emerald-400" : "text-emerald-600",
      valueText: darkMode ? "text-slate-100" : "text-slate-900",
      badge: darkMode
        ? "bg-emerald-500/15 text-emerald-400"
        : "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Absent Today",
      value: stats.absentToday,
      label: "Off Duty",
      icon: "🔴",
      iconBg: darkMode ? "bg-rose-500/15" : "bg-rose-100",
      iconText: darkMode ? "text-rose-400" : "text-rose-600",
      valueText: darkMode ? "text-slate-100" : "text-slate-900",
      badge: darkMode
        ? "bg-rose-500/15 text-rose-400"
        : "bg-rose-50 text-rose-600",
    },
    {
      title: "Pending Leave Requests",
      value: stats.pendingLeaveRequests,
      label: "Review",
      icon: "📋",
      iconBg: darkMode ? "bg-orange-500/15" : "bg-orange-100",
      iconText: darkMode ? "text-orange-400" : "text-orange-600",
      valueText: darkMode ? "text-slate-100" : "text-slate-900",
      badge: darkMode
        ? "bg-orange-500/15 text-orange-400"
        : "bg-orange-50 text-orange-600",
    },
    {
      title: "Approved Leaves",
      value: stats.approvedLeaves,
      label: "Granted",
      icon: "✓",
      iconBg: darkMode ? "bg-teal-500/15" : "bg-teal-100",
      iconText: darkMode ? "text-teal-400" : "text-teal-600",
      valueText: darkMode ? "text-slate-100" : "text-slate-900",
      badge: darkMode
        ? "bg-teal-500/15 text-teal-400"
        : "bg-teal-50 text-teal-600",
    },
  ];

  return (
    <div
      className={`min-h-screen p-3 sm:p-5 lg:p-7 transition-colors duration-200 ${
        darkMode ? "bg-slate-950" : "bg-slate-50"
      }`}
    >
      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <div className="mb-6 sm:mb-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                  darkMode
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                Admin Dashboard
              </span>
            </div>

            <h1
              className={`text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight ${
                darkMode ? "text-slate-100" : "text-slate-900"
              }`}
            >
              Dashboard Overview
            </h1>

            <p
              className={`mt-1.5 text-xs sm:text-sm max-w-2xl ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Here is a quick summary of your salon activities and metrics today.
            </p>
          </div>

          <div
            className={`hidden sm:flex items-center gap-2 rounded-xl border px-4 py-2.5 shadow-sm ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span
              className={`text-xs font-semibold ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Salon Overview
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          STATS GRID
      ===================================================== */}

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`group relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 ${
              darkMode
                ? "border-slate-800 bg-slate-900 shadow-[0_4px_18px_rgba(0,0,0,0.20)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.30)]"
                : "border-slate-100 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
            }`}
          >
            {/* TOP */}

            <div className="flex items-start justify-between gap-3">
              <div
                className={`
                  flex
                  h-10 w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  text-base
                  ${card.iconBg}
                  ${card.iconText}
                `}
              >
                {card.icon}
              </div>

              <span
                className={`
                  rounded-full
                  px-2.5
                  py-1
                  text-[9px] sm:text-[10px]
                  font-bold
                  ${card.badge}
                `}
              >
                {card.label}
              </span>
            </div>

            {/* CONTENT */}

            <div className="mt-5">
              <p
                className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {card.title}
              </p>

              <div className="mt-1 flex items-end justify-between">
                <h2
                  className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    darkMode ? "text-slate-100" : "text-slate-900"
                  }`}
                >
                  {loading ? "..." : card.value}
                </h2>

                <span
                  className={`hidden sm:block text-[10px] font-medium ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Today
                </span>
              </div>
            </div>

            {/* BOTTOM DECORATIVE LINE */}

            <div
              className={`mt-4 h-1 overflow-hidden rounded-full ${
                darkMode ? "bg-slate-800" : "bg-slate-100"
              }`}
            >
              <div
                className={`
                  h-full
                  w-1/2
                  rounded-full
                  ${card.iconBg.replace("100", "500")}
                  transition-all
                  duration-500
                  group-hover:w-3/4
                `}
              />
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          TODAY'S APPOINTMENTS
      ===================================================== */}

      <div
        className={`mt-6 sm:mt-7 rounded-2xl border shadow-[0_4px_18px_rgba(15,23,42,0.04)] overflow-hidden ${
          darkMode
            ? "border-slate-800 bg-slate-900 shadow-[0_4px_18px_rgba(0,0,0,0.20)]"
            : "border-slate-100 bg-white"
        }`}
      >
        {/* HEADER */}

        <div
          className={`flex flex-col gap-3 border-b px-4 py-4 sm:px-6 sm:py-5 sm:flex-row sm:items-center sm:justify-between ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-100 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                darkMode
                  ? "bg-indigo-500/15 text-indigo-400"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              📅
            </div>

            <div>
              <h2
                className={`text-base sm:text-lg font-bold ${
                  darkMode ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Today's Appointments
              </h2>

              <p
                className={`mt-0.5 text-[11px] sm:text-xs ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Real-time salon schedule
              </p>
            </div>
          </div>

          <div
            className={`self-start sm:self-auto rounded-full border px-3 py-1.5 ${
              darkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-slate-50 border-slate-100"
            }`}
          >
            <span
              className={`text-[10px] sm:text-xs font-semibold ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {todaysAppointments.length} Appointment
              {todaysAppointments.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* CONTENT */}

        {todaysAppointments.length === 0 ? (
          <div className="px-4 py-14 sm:px-6">
            <div className="mx-auto flex max-w-sm flex-col items-center text-center">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
                  darkMode
                    ? "bg-indigo-500/15"
                    : "bg-indigo-50"
                }`}
              >
                📅
              </div>

              <h3
                className={`mt-4 text-sm font-bold ${
                  darkMode ? "text-slate-200" : "text-slate-800"
                }`}
              >
                No appointments for today
              </h3>

              <p
                className={`mt-1 text-xs ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                There are currently no appointments scheduled for today.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            <div className="block lg:hidden p-3 sm:p-4 space-y-3">
              {todaysAppointments.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition ${
                    darkMode
                      ? "border-slate-800 bg-slate-800/50 hover:border-indigo-500/30 hover:bg-indigo-500/10"
                      : "border-slate-100 bg-slate-50/60 hover:border-indigo-100 hover:bg-indigo-50/30"
                  }`}
                >
                  {/* TIME + CUSTOMER */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          darkMode
                            ? "bg-indigo-500/15 text-indigo-400"
                            : "bg-indigo-100 text-indigo-600"
                        }`}
                      >
                        🕐
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold ${
                            darkMode ? "text-slate-100" : "text-slate-900"
                          }`}
                        >
                          {item.time}
                        </p>

                        <p
                          className={`mt-0.5 truncate text-xs font-medium ${
                            darkMode ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {item.customer?.name}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${
                        darkMode
                          ? "bg-indigo-500/15 text-indigo-400"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      Today
                    </span>
                  </div>

                  {/* DETAILS */}

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div
                      className={`rounded-lg border px-3 py-2.5 ${
                        darkMode
                          ? "bg-slate-900 border-slate-800"
                          : "bg-white border-slate-100"
                      }`}
                    >
                      <p
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          darkMode ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        Service
                      </p>

                      <p
                        className={`mt-1 truncate text-xs font-semibold ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        {item.service?.name}
                      </p>
                    </div>

                    <div
                      className={`rounded-lg border px-3 py-2.5 ${
                        darkMode
                          ? "bg-slate-900 border-slate-800"
                          : "bg-white border-slate-100"
                      }`}
                    >
                      <p
                        className={`text-[9px] font-bold uppercase tracking-wider ${
                          darkMode ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        Staff
                      </p>

                      <p
                        className={`mt-1 truncate text-xs font-semibold ${
                          darkMode ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        {item.staff?.name || "Not Assigned"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={`border-b ${
                      darkMode
                        ? "border-slate-800 bg-slate-800/50"
                        : "border-slate-100 bg-slate-50/70"
                    }`}
                  >
                    <th
                      className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider ${
                        darkMode ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Time
                    </th>

                    <th
                      className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider ${
                        darkMode ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Customer
                    </th>

                    <th
                      className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider ${
                        darkMode ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Service
                    </th>

                    <th
                      className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider ${
                        darkMode ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Staff
                    </th>
                  </tr>
                </thead>

                <tbody
                  className={
                    darkMode
                      ? "divide-y divide-slate-800"
                      : "divide-y divide-slate-50"
                  }
                >
                  {todaysAppointments.map((item) => (
                    <tr
                      key={item.id}
                      className={`group transition ${
                        darkMode
                          ? "hover:bg-indigo-500/10"
                          : "hover:bg-indigo-50/30"
                      }`}
                    >
                      {/* TIME */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs ${
                              darkMode
                                ? "bg-indigo-500/15 text-indigo-400"
                                : "bg-indigo-50 text-indigo-600"
                            }`}
                          >
                            🕐
                          </div>

                          <span
                            className={`text-xs font-bold ${
                              darkMode ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            {item.time}
                          </span>
                        </div>
                      </td>

                      {/* CUSTOMER */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${
                              darkMode
                                ? "bg-blue-500/15 text-blue-400"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {item.customer?.name
                              ? item.customer.name
                                  .charAt(0)
                                  .toUpperCase()
                              : "C"}
                          </div>

                          <span
                            className={`text-xs font-semibold ${
                              darkMode ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            {item.customer?.name}
                          </span>
                        </div>
                      </td>

                      {/* SERVICE */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-medium ${
                            darkMode
                              ? "bg-slate-800 text-slate-300"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {item.service?.name}
                        </span>
                      </td>

                      {/* STAFF */}

                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-medium ${
                            darkMode ? "text-slate-400" : "text-slate-600"
                          }`}
                        >
                          {item.staff?.name || "Not Assigned"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}