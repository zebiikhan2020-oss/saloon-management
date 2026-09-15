"use client";

import { useEffect, useState } from "react";

export default function TodayAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAppointments();

    const interval = setInterval(fetchTodayAppointments, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/appointment/today", {
        cache: "no-store",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.log("FETCH TODAY'S APPOINTMENTS ERROR:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-600 border border-blue-200/60";

      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200/60";

      case "COMPLETED":
        return "bg-sky-50 text-sky-600 border border-sky-200/60";

      default:
        return "bg-slate-100 text-slate-600 border border-slate-200/60";
    }
  };

  const inProgressAppointments = appointments.filter(
    (apt) => apt.status === "IN_PROGRESS"
  );

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "CONFIRMED"
  );

  const completedAppointments = appointments.filter(
    (apt) => apt.status === "COMPLETED"
  );

  const AppointmentCard = ({ item, type }) => {
    return (
      <div
        className={`p-4 sm:p-5 transition hover:bg-slate-50/60 ${
          type === "completed" ? "bg-slate-50/30" : "bg-white"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="font-semibold text-slate-900 text-sm sm:text-base truncate max-w-full">
                {item.customer?.name || "Walk-in Client"}
              </span>

              <span
                className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide ${getStatusStyle(
                  item.status
                )}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {item.status}
              </span>
            </div>

            <p className="text-slate-700 text-sm font-medium break-words">
              {item.service?.name || "Custom Service"}
            </p>

            <div className="mt-2.5 flex flex-col gap-1.5">
              <p className="text-slate-500 text-xs">
                <span className="font-medium text-slate-600">Staff:</span>{" "}
                {item.staff?.name || "No staff assigned"}
              </p>

              <p className="text-slate-500 text-xs">
                <span className="font-medium text-slate-600">Time:</span>{" "}
                {item.time}
              </p>
            </div>
          </div>

          <div className="sm:shrink-0 sm:text-right">
            {type === "progress" && (
              <span className="inline-flex items-center text-blue-500 text-[11px] font-medium italic">
                Staff will complete
              </span>
            )}

            {type === "upcoming" && (
              <span className="inline-flex items-center text-emerald-500 text-[11px] font-medium italic">
                Auto-starts at scheduled time
              </span>
            )}

            {type === "completed" && (
              <span className="inline-flex items-center text-slate-400 text-[11px] font-medium italic">
                Completed
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const EmptySection = ({ children }) => (
    <div className="px-5 py-8 sm:py-10 text-center">
      <p className="text-slate-400 text-sm">{children}</p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5 mb-5 sm:mb-6">
        <div className="min-w-0">
          <span className="inline-flex text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Salon Management
          </span>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Today's Appointments
          </h1>

          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage today's appointments in real time.
          </p>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 sm:p-16 text-center shadow-sm">
          <div className="animate-spin h-7 w-7 border-2 border-slate-200 border-t-blue-500 rounded-full mx-auto mb-3" />

          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            Loading today's appointments...
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">

          {/* IN PROGRESS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-blue-50 border-b border-blue-100 px-4 sm:px-5 py-3.5">
              <h2 className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />

                In Progress

                <span className="ml-1 text-[10px] font-semibold bg-white/70 px-2 py-0.5 rounded-full">
                  {inProgressAppointments.length}
                </span>
              </h2>
            </div>

            {inProgressAppointments.length === 0 ? (
              <EmptySection>
                No appointments in progress
              </EmptySection>
            ) : (
              <div className="divide-y divide-slate-100">
                {inProgressAppointments.map((item) => (
                  <AppointmentCard
                    key={item.id}
                    item={item}
                    type="progress"
                  />
                ))}
              </div>
            )}
          </div>

          {/* UPCOMING */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-emerald-50 border-b border-emerald-100 px-4 sm:px-5 py-3.5">
              <h2 className="text-xs sm:text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                Upcoming

                <span className="text-[10px] font-semibold bg-white/70 px-2 py-0.5 rounded-full">
                  {upcomingAppointments.length}
                </span>
              </h2>
            </div>

            {upcomingAppointments.length === 0 ? (
              <EmptySection>
                No upcoming appointments
              </EmptySection>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingAppointments.map((item) => (
                  <AppointmentCard
                    key={item.id}
                    item={item}
                    type="upcoming"
                  />
                ))}
              </div>
            )}
          </div>

          {/* COMPLETED */}
          {completedAppointments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-sky-50 border-b border-sky-100 px-4 sm:px-5 py-3.5">
                <h2 className="text-xs sm:text-sm font-bold text-sky-700 uppercase tracking-wider flex items-center gap-2">
                  Completed

                  <span className="text-[10px] font-semibold bg-white/70 px-2 py-0.5 rounded-full">
                    {completedAppointments.length}
                  </span>
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                {completedAppointments.map((item) => (
                  <AppointmentCard
                    key={item.id}
                    item={item}
                    type="completed"
                  />
                ))}
              </div>
            </div>
          )}

          {/* NO APPOINTMENTS */}
          {appointments.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 sm:p-12 text-center shadow-sm">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 text-lg">
                📅
              </div>

              <h3 className="text-slate-800 font-semibold text-sm">
                No appointments today
              </h3>

              <p className="text-slate-400 text-xs mt-1">
                Check back later for new appointments.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}