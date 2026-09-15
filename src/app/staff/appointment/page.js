
"use client";

import { useState, useEffect } from "react";

const ITEMS_PER_PAGE = 8;

export default function StaffAppointmentPage() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState(1);

  // =====================================================
  // FETCH APPOINTMENTS
  // =====================================================

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/admin/staff/appointment", {
        cache: "no-store",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setAppointments(data);

        const totalPagesAfterFetch = Math.max(
          1,
          Math.ceil(data.length / ITEMS_PER_PAGE)
        );

        setCurrentPage((page) =>
          Math.min(page, totalPagesAfterFetch)
        );
      }
    } catch (error) {
      console.log("FETCH APPOINTMENTS ERROR:", error);
    }
  };

  // =====================================================
  // TIME + APPOINTMENT REFRESH
  // =====================================================

  useEffect(() => {
    fetchAppointments();

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const appointmentInterval = setInterval(() => {
      fetchAppointments();
    }, 30000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(appointmentInterval);
    };
  }, []);

  // =====================================================
  // GET CURRENT PAKISTAN DATETIME
  // =====================================================

  const getPakistanDateTime = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(currentTime);

    const get = (type) =>
      Number(parts.find((part) => part.type === type)?.value);

    return {
      year: get("year"),
      month: get("month"),
      day: get("day"),
      hour: get("hour"),
      minute: get("minute"),
      second: get("second"),
    };
  };

  // =====================================================
  // PARSE APPOINTMENT TIME
  // =====================================================

  const parseAppointmentTime = (time) => {
    const timeString = String(time || "").trim();

    if (!timeString) {
      return null;
    }

    let hour;
    let minute;

    if (timeString.includes(" ")) {
      const parts = timeString.split(/\s+/);
      const timeValue = parts[0];
      const modifier = parts[1]?.toUpperCase();

      const timeParts = timeValue.split(":").map(Number);

      hour = timeParts[0];
      minute = timeParts[1];

      if (modifier === "PM" && hour !== 12) {
        hour += 12;
      }

      if (modifier === "AM" && hour === 12) {
        hour = 0;
      }
    } else {
      const timeParts = timeString.split(":").map(Number);

      hour = timeParts[0];
      minute = timeParts[1];
    }

    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    return {
      hour,
      minute,
    };
  };

  // =====================================================
  // CHECK APPOINTMENT TIME
  // =====================================================

  const isAppointmentTimeReached = (item) => {
    if (!item?.date || !item?.time) {
      return false;
    }

    try {
      const appointmentDate = new Date(item.date);

      if (Number.isNaN(appointmentDate.getTime())) {
        return false;
      }

      const dateParts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(appointmentDate);

      const getDatePart = (type) =>
        Number(dateParts.find((part) => part.type === type)?.value);

      const appointmentYear = getDatePart("year");
      const appointmentMonth = getDatePart("month");
      const appointmentDay = getDatePart("day");

      const appointmentTime = parseAppointmentTime(item.time);

      if (!appointmentTime) {
        return false;
      }

      const {
        hour: appointmentHour,
        minute: appointmentMinute,
      } = appointmentTime;

      const pakistanNow = getPakistanDateTime();

      const appointmentDateValue =
        appointmentYear * 10000 +
        appointmentMonth * 100 +
        appointmentDay;

      const currentDateValue =
        pakistanNow.year * 10000 +
        pakistanNow.month * 100 +
        pakistanNow.day;

      if (appointmentDateValue > currentDateValue) {
        return false;
      }

      if (appointmentDateValue < currentDateValue) {
        return true;
      }

      const appointmentMinutes =
        appointmentHour * 60 + appointmentMinute;

      const currentMinutes =
        pakistanNow.hour * 60 + pakistanNow.minute;

      return currentMinutes >= appointmentMinutes;
    } catch (error) {
      console.log("TIME CHECK ERROR:", error);
      return false;
    }
  };

  // =====================================================
  // GET APPOINTMENT SORT VALUE
  // =====================================================

  const getAppointmentValue = (item) => {
    if (!item?.date || !item?.time) {
      return Number.MAX_SAFE_INTEGER;
    }

    try {
      const dateString = String(item.date).split("T")[0];

      const [year, month, day] = dateString.split("-").map(Number);

      const parsedTime = parseAppointmentTime(item.time);

      if (!parsedTime) {
        return Number.MAX_SAFE_INTEGER;
      }

      const { hour, minute } = parsedTime;

      return Number(
        `${year}` +
          `${String(month).padStart(2, "0")}` +
          `${String(day).padStart(2, "0")}` +
          `${String(hour).padStart(2, "0")}` +
          `${String(minute).padStart(2, "0")}`
      );
    } catch {
      return Number.MAX_SAFE_INTEGER;
    }
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const updateStatus = async (appointmentId, status) => {
    try {
      const res = await fetch("/api/admin/staff/appointment", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          status,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(
          data.message ||
            `Appointment ${status.toLowerCase()} successfully!`
        );

        fetchAppointments();
      } else {
        setMessage(
          data.message || "Failed to update appointment."
        );
      }
    } catch (error) {
      console.log("UPDATE APPOINTMENT ERROR:", error);
      setMessage("Something went wrong.");
    }
  };

  // =====================================================
  // SORT APPOINTMENTS
  // =====================================================

  const pakistanNow = getPakistanDateTime();

  const currentValue = Number(
    `${pakistanNow.year}` +
      `${String(pakistanNow.month).padStart(2, "0")}` +
      `${String(pakistanNow.day).padStart(2, "0")}` +
      `${String(pakistanNow.hour).padStart(2, "0")}` +
      `${String(pakistanNow.minute).padStart(2, "0")}`
  );

  const sortedAppointments = [...appointments].sort((a, b) => {
    const aTime = getAppointmentValue(a);
    const bTime = getAppointmentValue(b);

    const aPast = aTime < currentValue;
    const bPast = bTime < currentValue;

    if (aPast && !bPast) {
      return 1;
    }

    if (!aPast && bPast) {
      return -1;
    }

    if (!aPast && !bPast) {
      return aTime - bTime;
    }

    return bTime - aTime;
  });

  // =====================================================
  // PAGINATION CALCULATIONS
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(sortedAppointments.length / ITEMS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const currentAppointments = sortedAppointments.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">

        {/* HEADER */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Staff Appointments
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage and track your assigned customer bookings.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 w-fit">
              <span>Total:</span>

              <span className="text-blue-600 dark:text-blue-400 font-extrabold">
                {appointments.length}
              </span>
            </div>
          </div>
        </div>

        {/* MESSAGE ALERT */}
        {message && (
          <div className="p-3.5 sm:p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs sm:text-sm rounded-xl flex items-start justify-between gap-3 shadow-sm">
            <span className="leading-relaxed break-words">
              {message}
            </span>

            <button
              onClick={() => setMessage("")}
              className="font-bold cursor-pointer text-blue-500 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* APPOINTMENTS LIST OR EMPTY */}
        {sortedAppointments.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-10 sm:p-12 text-center text-slate-400 dark:text-slate-500 text-sm shadow-sm dark:shadow-black/20">
            <div className="text-3xl mb-2">📅</div>

            <p className="font-semibold text-slate-700 dark:text-slate-200">
              No appointments found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentAppointments.map((item) => {
              const canStart =
                item.status === "CONFIRMED" &&
                isAppointmentTimeReached(item);

              const canComplete =
                item.status === "IN_PROGRESS";

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/30 transition duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-6">

                    {/* INFO SECTION */}
                    <div className="space-y-3 flex-1 min-w-0">

                      {/* SERVICE + STATUS */}
                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg break-words">
                          {item.service?.name || "Service"}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold border ${
                            item.status === "PENDING"
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                              : item.status === "CONFIRMED"
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : item.status === "COMPLETED"
                              ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* DETAILS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        <p className="break-words">
                          <strong className="text-slate-800 dark:text-slate-200">
                            Customer:
                          </strong>{" "}
                          {item.customer?.name || "-"}
                        </p>

                        <p className="break-all">
                          <strong className="text-slate-800 dark:text-slate-200">
                            Email:
                          </strong>{" "}
                          {item.customer?.email || "-"}
                        </p>

                        <p>
                          <strong className="text-slate-800 dark:text-slate-200">
                            Date:
                          </strong>{" "}
                          {new Date(item.date).toLocaleDateString()}
                        </p>

                        <p>
                          <strong className="text-slate-800 dark:text-slate-200">
                            Time:
                          </strong>{" "}
                          {item.time}
                        </p>
                      </div>

                      {/* TIME ALERTS */}
                      {item.status === "CONFIRMED" && !canStart && (
                        <p className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 px-3 py-1.5 rounded-lg inline-block">
                          ⏳ Start will be available when the appointment
                          time arrives.
                        </p>
                      )}

                      {item.status === "CONFIRMED" && canStart && (
                        <p className="text-[11px] sm:text-xs text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 px-3 py-1.5 rounded-lg inline-block">
                          ✅ Appointment time has arrived. You can start it
                          now.
                        </p>
                      )}

                      {item.status === "IN_PROGRESS" && (
                        <p className="text-[11px] sm:text-xs text-blue-700 dark:text-blue-300 font-medium bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 px-3 py-1.5 rounded-lg inline-block">
                          🔵 Appointment is currently in progress.
                        </p>
                      )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap items-stretch sm:items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">

                      {/* PENDING */}
                      {item.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              updateStatus(item.id, "CONFIRMED")
                            }
                            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              updateStatus(item.id, "REJECTED")
                            }
                            className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* CONFIRMED */}
                      {item.status === "CONFIRMED" && (
                        <button
                          onClick={() =>
                            updateStatus(item.id, "IN_PROGRESS")
                          }
                          disabled={!canStart}
                          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                            canStart
                              ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                          }`}
                        >
                          {canStart
                            ? "Start Appointment"
                            : "Waiting for Time"}
                        </button>
                      )}

                      {/* IN PROGRESS */}
                      {item.status === "IN_PROGRESS" && (
                        <button
                          onClick={() =>
                            updateStatus(item.id, "COMPLETED")
                          }
                          className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                        >
                          Complete
                        </button>
                      )}

                      {/* COMPLETED */}
                      {item.status === "COMPLETED" && (
                        <span className="text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2.5 rounded-xl">
                          ✓ Completed
                        </span>
                      )}

                      {/* REJECTED */}
                      {item.status === "REJECTED" && (
                        <span className="text-center text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-3.5 py-2.5 rounded-xl">
                          ✕ Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* =====================================================
                NUMBERED PAGINATION
            ===================================================== */}

            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center justify-center gap-3">

                <div className="flex items-center gap-2">

                  {/* PREVIOUS */}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(page - 1, 1)
                      )
                    }
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 transition"
                  >
                    ←
                  </button>

                  {/* PAGE NUMBERS */}

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-xs font-bold transition ${
                        currentPage === page
                          ? "bg-blue-600 dark:bg-blue-500 text-white shadow-sm"
                          : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* NEXT */}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(page + 1, totalPages)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 transition"
                  >
                    →
                  </button>

                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {startIndex + 1}–
                  {Math.min(
                    startIndex + ITEMS_PER_PAGE,
                    sortedAppointments.length
                  )}{" "}
                  of {sortedAppointments.length} appointments
                </p>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

