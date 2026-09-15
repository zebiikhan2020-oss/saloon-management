"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffCalendarPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [view, setView] = useState("month"); // day, week, month

  // =====================================================
  // FETCH APPOINTMENTS
  // =====================================================

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      setLoading(true);
      const res = await fetch("/api/staff/appointments");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch appointments");
      }

      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("STAFF CALENDAR APPOINTMENTS ERROR:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // DATE CALCULATIONS
  // =====================================================

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [year, month]);

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();

    startOfWeek.setDate(startOfWeek.getDate() - day);

    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }

    return days;
  }, [currentDate]);

  function formatDate(date) {
    if (!date) return "";

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }

  function getAppointmentsForDate(date) {
    if (!date) return [];

    const targetDate = formatDate(date);

    return appointments.filter((appointment) => {
      if (!appointment.date) return false;

      const appointmentDate = new Date(appointment.date);

      return formatDate(appointmentDate) === targetDate;
    });
  }

  const dayAppointments = useMemo(() => {
    return getAppointmentsForDate(currentDate);
  }, [appointments, currentDate]);

  const monthAppointments = appointments.filter((appointment) => {
    if (!appointment.date) return false;

    const date = new Date(appointment.date);

    return date.getFullYear() === year && date.getMonth() === month;
  });

  const weekAppointments = weekDays.reduce((count, day) => {
    return count + getAppointmentsForDate(day).length;
  }, 0);

  function isToday(date) {
    if (!date) return false;

    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  // Navigation handlers
  function goToToday() {
    setCurrentDate(new Date());
  }

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function previousWeek() {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  }

  function nextWeek() {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  }

  function previousDay() {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  }

  function nextDay() {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  }

  // =====================================================
  // STATUS STYLES
  // =====================================================

  function getStatusStyle(status) {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60";

      case "PENDING":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/60";

      case "REJECTED":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950/60";

      case "COMPLETED":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/60";

      case "CANCELLED":
      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700";
    }
  }

  function getStatusDot(status) {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-500";

      case "PENDING":
        return "bg-amber-500";

      case "REJECTED":
        return "bg-rose-500";

      case "COMPLETED":
        return "bg-blue-500";

      case "CANCELLED":
      default:
        return "bg-slate-400";
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                My Calendar
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-slate-500 dark:text-slate-400 mt-1">
                View and manage your personal appointment schedule.
              </p>
            </div>

            <button
              onClick={fetchAppointments}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition shadow-sm text-sm font-bold cursor-pointer"
            >
              <span>🔄</span>
              Refresh
            </button>
          </div>
        </div>

        {/* =====================================================
            VIEW SELECTOR & CONTROLS
        ===================================================== */}

        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

            {/* VIEW BUTTONS */}
            <div className="flex w-full sm:w-fit bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setView("day")}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  view === "day"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                Day
              </button>

              <button
                onClick={() => setView("week")}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  view === "week"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                Week
              </button>

              <button
                onClick={() => setView("month")}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  view === "month"
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                Month
              </button>
            </div>

            {/* NAVIGATION */}
            <div className="flex items-center justify-between gap-2">

              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                {view === "month" &&
                  `${monthName} ${year}`}

                {view === "week" &&
                  `Week of ${weekDays[0]?.toLocaleDateString(
                    "default",
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )}`}

                {view === "day" &&
                  currentDate.toLocaleDateString("default", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
              </span>

              <div className="flex items-center gap-2 shrink-0">

                <button
                  onClick={goToToday}
                  className="px-3 sm:px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-slate-600 transition"
                >
                  Today
                </button>

                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                  <button
                    onClick={
                      view === "month"
                        ? previousMonth
                        : view === "week"
                        ? previousWeek
                        : previousDay
                    }
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 font-bold"
                  >
                    ←
                  </button>

                  <button
                    onClick={
                      view === "month"
                        ? nextMonth
                        : view === "week"
                        ? nextWeek
                        : nextDay
                    }
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition text-slate-600 dark:text-slate-300 font-bold"
                  >
                    →
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            CALENDAR CONTAINER
        ===================================================== */}

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-200/80 dark:border-slate-800 overflow-hidden">

          {/* CALENDAR TITLE BAR */}

          <div className="hidden sm:flex items-center justify-between px-5 lg:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/60">
            <h2 className="text-lg lg:text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {view === "month" &&
                `${monthName} ${year}`}

              {view === "week" &&
                `Week of ${weekDays[0]?.toLocaleDateString(
                  "default",
                  {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }
                )}`}

              {view === "day" &&
                currentDate.toLocaleDateString("default", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
            </h2>

            <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              {view === "month" &&
                `${monthAppointments.length} appointments this month`}

              {view === "week" &&
                `${weekAppointments} appointments this week`}

              {view === "day" &&
                `${dayAppointments.length} appointments today`}
            </span>
          </div>

          {/* =====================================================
              LEGEND
          ===================================================== */}

          <div className="px-4 sm:px-5 lg:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400">

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Pending
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Confirmed
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Completed
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Rejected
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                Cancelled
              </div>

            </div>
          </div>

          {/* =====================================================
              LOADING
          ===================================================== */}

          {loading ? (
            <div className="py-20 sm:py-24 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />

              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                Loading appointments...
              </p>
            </div>
          ) : view === "month" ? (

            /* =====================================================
                MONTH VIEW
            ===================================================== */

            <div className="overflow-x-auto">
              <div className="min-w-[720px] sm:min-w-[768px]">

                <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-center text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {[
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                  ].map((day) => (
                    <div
                      key={day}
                      className="py-3 border-r border-slate-200 dark:border-slate-700 last:border-r-0"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="min-h-[110px] sm:min-h-[120px] bg-slate-50/40 dark:bg-slate-800/40 border-r border-b border-slate-200 dark:border-slate-700"
                        />
                      );
                    }

                    const dayApps = getAppointmentsForDate(date);

                    return (
                      <div
                        key={formatDate(date)}
                        className={`min-h-[120px] sm:min-h-[130px] border-r border-b border-slate-200 dark:border-slate-700 p-1.5 sm:p-2 flex flex-col ${
                          isToday(date)
                            ? "bg-blue-50/40 dark:bg-blue-950/20"
                            : "bg-white dark:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-bold ${
                              isToday(date)
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {date.getDate()}
                          </span>

                          {dayApps.length > 0 && (
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                              {dayApps.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 overflow-y-auto max-h-[95px] sm:max-h-[100px] pr-0.5">
                          {dayApps.map((appointment) => (
                            <button
                              key={appointment.id}
                              onClick={() =>
                                setSelectedAppointment(appointment)
                              }
                              className={`w-full text-left border rounded-lg p-1.5 transition text-[10px] sm:text-xs shadow-sm ${getStatusStyle(
                                appointment.status
                              )}`}
                            >
                              <div className="flex items-center gap-1 font-bold">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getStatusDot(
                                    appointment.status
                                  )}`}
                                />

                                <span className="truncate">
                                  {appointment.time || "Time"}
                                </span>
                              </div>

                              <p className="font-semibold truncate mt-0.5 text-[10px] sm:text-[11px]">
                                {appointment.customer?.name ||
                                  "Customer"}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

          ) : view === "week" ? (

            /* =====================================================
                WEEK VIEW
            ===================================================== */

            <div className="overflow-x-auto">
              <div className="min-w-[720px] sm:min-w-[768px]">

                <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  {weekDays.map((date) => (
                    <div
                      key={formatDate(date)}
                      className="py-3 px-2 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0"
                    >
                      <div className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                        {date.toLocaleDateString("default", {
                          weekday: "short",
                        })}
                      </div>

                      <div
                        className={`mt-1 inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          isToday(date)
                            ? "bg-blue-600 text-white"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {weekDays.map((date) => {
                    const dayApps = getAppointmentsForDate(date);

                    return (
                      <div
                        key={formatDate(date)}
                        className={`min-h-[260px] sm:min-h-[280px] border-r border-b border-slate-200 dark:border-slate-700 p-1.5 sm:p-2 ${
                          isToday(date)
                            ? "bg-blue-50/40 dark:bg-blue-950/20"
                            : "bg-white dark:bg-slate-900"
                        }`}
                      >
                        <div className="space-y-1.5">
                          {dayApps.map((appointment) => (
                            <button
                              key={appointment.id}
                              onClick={() =>
                                setSelectedAppointment(appointment)
                              }
                              className={`w-full text-left border rounded-lg p-2 transition text-[10px] sm:text-xs shadow-sm ${getStatusStyle(
                                appointment.status
                              )}`}
                            >
                              <div className="flex items-center gap-1.5 font-bold">
                                <span
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDot(
                                    appointment.status
                                  )}`}
                                />

                                <span className="truncate">
                                  {appointment.time || "Time"}
                                </span>
                              </div>

                              <p className="font-semibold truncate mt-1">
                                {appointment.customer?.name ||
                                  "Customer"}
                              </p>

                              <p className="text-[9px] sm:text-[10px] truncate opacity-75 mt-0.5">
                                {appointment.service?.name ||
                                  "Service"}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

          ) : (

            /* =====================================================
                DAY VIEW
            ===================================================== */

            <div className="p-4 sm:p-6">
              {dayAppointments.length === 0 ? (
                <div className="text-center py-14 sm:py-16">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                    📅
                  </div>

                  <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                    No appointments scheduled for this day.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-w-2xl mx-auto">
                  {dayAppointments.map((appointment) => (
                    <button
                      key={appointment.id}
                      onClick={() =>
                        setSelectedAppointment(appointment)
                      }
                      className={`w-full text-left border rounded-xl p-3.5 sm:p-4 transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm ${getStatusStyle(
                        appointment.status
                      )}`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={`w-3 h-3 mt-1 rounded-full flex-shrink-0 ${getStatusDot(
                            appointment.status
                          )}`}
                        />

                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {appointment.time || "Time"}{" "}
                            {appointment.endTime &&
                              `- ${appointment.endTime}`}
                          </p>

                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                            {appointment.customer?.name ||
                              "Customer"}
                          </p>

                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                            {appointment.service?.name ||
                              "Service"}
                          </p>
                        </div>
                      </div>

                      <span className="self-start sm:self-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border bg-white/60 dark:bg-slate-900/60">
                        {appointment.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* =====================================================
            APPOINTMENT DETAILS MODAL
        ===================================================== */}

        {selectedAppointment && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            onClick={() => setSelectedAppointment(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}

              <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold">
                    Appointment Details
                  </h3>

                  <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5">
                    Full information record
                  </p>
                </div>

                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-slate-400 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition shrink-0"
                >
                  ×
                </button>
              </div>

              {/* MODAL BODY */}

              <div className="p-4 sm:p-6 space-y-4 text-sm">

                {/* STATUS */}

                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                    Status
                  </span>

                  <div className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border ${getStatusStyle(
                        selectedAppointment.status
                      )}`}
                    >
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>

                {/* CUSTOMER */}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                    Customer
                  </span>

                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 break-words">
                    {selectedAppointment.customer?.name ||
                      "Unknown"}
                  </p>

                  <p className="text-slate-500 dark:text-slate-400 text-xs break-all">
                    {selectedAppointment.customer?.email ||
                      "No email provided"}
                  </p>
                </div>

                {/* SERVICE */}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                    Service
                  </span>

                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5 break-words">
                    {selectedAppointment.service?.name ||
                      "Unknown Service"}
                  </p>

                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    Category:{" "}
                    {selectedAppointment.service?.category?.name ||
                      "-"}
                  </p>
                </div>

                {/* DATE + TIME */}

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                      Date
                    </span>

                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 text-xs sm:text-sm">
                      {selectedAppointment.date
                        ? new Date(
                            selectedAppointment.date
                          ).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                      Time
                    </span>

                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 text-xs sm:text-sm">
                      {selectedAppointment.time || "-"}
                      {selectedAppointment.endTime &&
                        ` - ${selectedAppointment.endTime}`}
                    </p>
                  </div>
                </div>

                {/* CLOSE */}

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold transition text-sm shadow-sm"
                  >
                    Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}