"use client";

import { useEffect, useState } from "react";

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchSchedule = async () => {
    try {
      const res = await fetch("/api/staff/availability", {
        cache: "no-store",
      });

      const data = await res.json();

      if (Array.isArray(data)) {
        setSchedule(data);
      }
    } catch (error) {
      console.log("FETCH AVAILABILITY ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const toggleStatus = async (item) => {
    try {
      setUpdating(item.id);

      const newStatus =
        item.status === "WORKING" ? "OFF" : "WORKING";

      const res = await fetch("/api/staff/availability", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day: item.day,
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSchedule((prev) =>
          prev.map((schedule) =>
            schedule.id === item.id
              ? {
                  ...schedule,
                  status: newStatus,
                }
              : schedule
          )
        );
      }
    } catch (error) {
      console.log("UPDATE AVAILABILITY ERROR:", error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

          <div className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
            Loading availability...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">

        {/* HEADER */}
        <div className="bg-white dark:bg-slate-900 px-4 py-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Staff Availability
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your weekly working schedule and days off.
          </p>
        </div>

        {/* SCHEDULE LIST */}
        <div className="space-y-3 sm:space-y-4">

          {schedule.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 lg:p-6 shadow-sm dark:shadow-black/20 hover:shadow-md dark:hover:shadow-black/30 transition duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                {/* DAY + STATUS */}
                <div className="min-w-0 space-y-2">

                  <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                    {item.day}
                  </h2>

                  <div>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold ${
                        item.status === "WORKING"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                </div>

                {/* BUTTON */}
                <button
                  disabled={updating === item.id}
                  onClick={() => toggleStatus(item)}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed shadow-sm ${
                    item.status === "WORKING"
                      ? "bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {updating === item.id
                    ? "Updating..."
                    : item.status === "WORKING"
                    ? "Set OFF"
                    : "Set Working"}
                </button>

              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}