"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminCalendarPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // =====================================================
  // FETCH APPOINTMENTS
  // =====================================================

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/admin/appointment?search=&status=ALL"
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to fetch appointments"
        );
      }

      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error(
        "CALENDAR APPOINTMENTS ERROR:",
        error
      );

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // MONTH INFORMATION
  // =====================================================

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  // =====================================================
  // GET DAYS IN MONTH
  // =====================================================

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      days.push(
        new Date(year, month, day)
      );
    }

    return days;
  }, [year, month]);

  // =====================================================
  // PREVIOUS MONTH
  // =====================================================

  function previousMonth() {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  }

  // =====================================================
  // NEXT MONTH
  // =====================================================

  function nextMonth() {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  }

  // =====================================================
  // TODAY
  // =====================================================

  function goToToday() {
    setCurrentDate(new Date());
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  function formatDate(date) {
    const y = date.getFullYear();

    const m = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const d = String(
      date.getDate()
    ).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }

  // =====================================================
  // GET APPOINTMENTS FOR DATE
  // =====================================================

  function getAppointmentsForDate(date) {
    if (!date) return [];

    const targetDate = formatDate(date);

    return appointments.filter((appointment) => {
      if (!appointment.date) return false;

      const appointmentDate = new Date(
        appointment.date
      );

      return (
        formatDate(appointmentDate) ===
        targetDate
      );
    });
  }

  // =====================================================
  // CHECK TODAY
  // =====================================================

  function isToday(date) {
    if (!date) return false;

    const today = new Date();

    return (
      date.getFullYear() ===
        today.getFullYear() &&
      date.getMonth() ===
        today.getMonth() &&
      date.getDate() ===
        today.getDate()
    );
  }

  // =====================================================
  // STATUS STYLE
  // =====================================================

  function getStatusStyle(status) {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/60";

      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/60";

      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100/60";

      case "COMPLETED":
        return "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/60";

      case "CANCELLED":
        return "bg-slate-100 text-slate-700 border-slate-200/60 hover:bg-slate-200/60";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200/60 hover:bg-slate-200/60";
    }
  }

  // =====================================================
  // STATUS DOT
  // =====================================================

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
        return "bg-slate-500";

      default:
        return "bg-slate-500";
    }
  }

  // =====================================================
  // MONTH APPOINTMENT COUNT
  // =====================================================

  const monthAppointments = appointments.filter(
    (appointment) => {
      if (!appointment.date) return false;

      const date = new Date(
        appointment.date
      );

      return (
        date.getFullYear() === year &&
        date.getMonth() === month
      );
    }
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">

        <div>
          <span className="inline-flex text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Schedule View
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Appointment Calendar
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            View and manage salon appointments by date.
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          className="w-full sm:w-auto rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>🔄</span>
          Refresh
        </button>

      </div>


      {/* =================================================
          CALENDAR CARD
      ================================================= */}

      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">

        {/* =================================================
            CALENDAR HEADER
        ================================================= */}

        <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-100">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            {/* MONTH */}

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {monthName} {year}
              </h2>

              <p className="text-sm text-slate-500 mt-0.5">
                {monthAppointments.length} appointment
                {monthAppointments.length !== 1
                  ? "s"
                  : ""}{" "}
                this month
              </p>
            </div>


            {/* CONTROLS */}

            <div className="flex items-center gap-2 w-full sm:w-auto">

              <button
                onClick={goToToday}
                className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Today
              </button>

              <button
                onClick={previousMonth}
                aria-label="Previous month"
                className="w-10 h-10 shrink-0 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-700 flex items-center justify-center text-lg cursor-pointer"
              >
                ←
              </button>

              <button
                onClick={nextMonth}
                aria-label="Next month"
                className="w-10 h-10 shrink-0 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-700 flex items-center justify-center text-lg cursor-pointer"
              >
                →
              </button>

            </div>

          </div>

        </div>


        {/* =================================================
            LEGEND
        ================================================= */}

        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/50">

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Pending
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Confirmed
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Completed
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Rejected
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              Cancelled
            </div>

          </div>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="bg-white p-12 sm:p-16 text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>

            <p className="text-slate-500 text-sm font-medium">
              Loading appointments...
            </p>
          </div>

        ) : (

          /* =================================================
             CALENDAR GRID
          ================================================= */

          <div className="overflow-x-auto">

            <div className="min-w-[720px] sm:min-w-[900px]">

              {/* WEEK DAYS */}

              <div className="grid grid-cols-7 bg-slate-50/70 border-b border-slate-100">

                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day) => (

                  <div
                    key={day}
                    className="px-1 sm:px-3 py-3 text-center text-[9px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 border-r border-slate-100 last:border-r-0 truncate"
                  >
                    <span className="hidden sm:inline">
                      {day}
                    </span>

                    <span className="sm:hidden">
                      {day.slice(0, 3)}
                    </span>
                  </div>

                ))}

              </div>


              {/* CALENDAR DAYS */}

              <div className="grid grid-cols-7">

                {calendarDays.map(
                  (date, index) => {

                    if (!date) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="min-h-[130px] sm:min-h-[150px] bg-slate-50/35 border-r border-b border-slate-100"
                        />
                      );
                    }

                    const dayAppointments =
                      getAppointmentsForDate(
                        date
                      );

                    return (

                      <div
                        key={formatDate(date)}
                        className={`min-h-[130px] sm:min-h-[150px] border-r border-b border-slate-100 p-1.5 sm:p-2 ${
                          isToday(date)
                            ? "bg-blue-50/30"
                            : "bg-white"
                        }`}
                      >

                        {/* DATE NUMBER */}

                        <div className="flex items-center justify-between mb-2 px-0.5 sm:px-1">

                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-[10px] sm:text-xs font-bold ${
                              isToday(date)
                                ? "bg-blue-600 text-white"
                                : "text-slate-700"
                            }`}
                          >
                            {date.getDate()}
                          </span>

                          {dayAppointments.length > 0 && (
                            <span className="text-[9px] sm:text-[11px] text-slate-600 font-bold bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full">
                              {dayAppointments.length}
                            </span>
                          )}

                        </div>


                        {/* APPOINTMENTS */}

                        <div className="space-y-1.5">

                          {dayAppointments.map(
                            (appointment) => (

                              <button
                                key={
                                  appointment.id
                                }
                                onClick={() =>
                                  setSelectedAppointment(
                                    appointment
                                  )
                                }
                                className={`w-full text-left border rounded-lg sm:rounded-xl px-1.5 sm:px-2 py-1.5 sm:py-2 transition cursor-pointer shadow-2xs ${getStatusStyle(
                                  appointment.status
                                )}`}
                              >

                                <div className="flex items-center gap-1">

                                  <span
                                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${getStatusDot(
                                      appointment.status
                                    )}`}
                                  />

                                  <span className="font-bold text-[9px] sm:text-[11px] truncate">
                                    {appointment.time ||
                                      "Time"}
                                  </span>

                                </div>

                                <p className="text-[10px] sm:text-xs font-semibold truncate mt-1 text-slate-900">
                                  {appointment
                                    .customer
                                    ?.name ||
                                    "Customer"}
                                </p>

                                <p className="text-[8px] sm:text-[10px] truncate mt-0.5 opacity-80">
                                  {appointment
                                    .service
                                    ?.name ||
                                    "Service"}
                                </p>

                              </button>

                            )
                          )}

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

          </div>

        )}

      </div>


      {/* =================================================
          APPOINTMENT DETAILS MODAL
      ================================================= */}

      {selectedAppointment && (

        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() =>
            setSelectedAppointment(null)
          }
        >

          <div
            className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="bg-white border-b border-slate-100 px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3">

              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Appointment Details
                </h2>

                <p className="text-slate-500 text-xs mt-0.5">
                  Complete appointment information
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedAppointment(null)
                }
                className="w-8 h-8 shrink-0 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>

            </div>


            {/* MODAL BODY */}

            <div className="p-5 sm:p-6 space-y-4">

              {/* STATUS */}

              <div>
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-600">
                  Status
                </p>

                <div className="mt-1.5">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(
                      selectedAppointment.status
                    )}`}
                  >
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>


              {/* CUSTOMER */}

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                  Customer
                </p>

                <p className="font-bold text-slate-900 text-sm break-words">
                  {selectedAppointment
                    .customer?.name ||
                    "Unknown"}
                </p>

                <p className="text-xs text-slate-500 mt-0.5 break-all">
                  {selectedAppointment
                    .customer?.email ||
                    "-"}
                </p>
              </div>


              {/* SERVICE */}

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                  Service
                </p>

                <p className="font-bold text-slate-900 text-sm break-words">
                  {selectedAppointment
                    .service?.name ||
                    "-"}
                </p>

                <p className="text-xs text-slate-500 mt-0.5 break-words">
                  Category:{" "}
                  {selectedAppointment
                    .service
                    ?.category?.name ||
                    "-"}
                </p>
              </div>


              {/* STAFF */}

              <div className="border-t border-slate-100 pt-4">
                <p className="text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                  Staff
                </p>

                <p className="font-bold text-slate-900 text-sm break-words">
                  {selectedAppointment
                    .staff?.name ||
                    "Not Assigned"}
                </p>

                {selectedAppointment
                  .staff?.email && (
                  <p className="text-xs text-slate-500 mt-0.5 break-all">
                    {
                      selectedAppointment
                        .staff.email
                    }
                  </p>
                )}
              </div>


              {/* DATE + TIME */}

              <div className="border-t border-slate-100 pt-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-4">

                <div>
                  <p className="text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                    Date
                  </p>

                  <p className="font-semibold text-slate-900 text-sm">
                    {selectedAppointment.date
                      ? new Date(
                          selectedAppointment.date
                        ).toLocaleDateString(
                          undefined,
                          {
                            weekday:
                              "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "-"}
                  </p>
                </div>


                <div>
                  <p className="text-[11px] uppercase font-bold tracking-wider text-slate-600 mb-1">
                    Time
                  </p>

                  <p className="font-semibold text-slate-900 text-sm">
                    {selectedAppointment.time ||
                      "-"}
                  </p>
                </div>

              </div>


              {/* CLOSE BUTTON */}

              <div className="pt-2">
                <button
                  onClick={() =>
                    setSelectedAppointment(null)
                  }
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-xs cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}