"use client";

import { useEffect, useState } from "react";

export default function StaffAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [formData, setFormData] = useState({
    status: "PRESENT",
    note: "",
  });

  useEffect(() => {
    fetchAttendance();
    fetchTodayAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch("/api/staff/attendance", {
        cache: "no-store",
      });

      const data = await response.json();

      if (Array.isArray(data)) {
        setAttendance(data);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const response = await fetch(
        `/api/staff/attendance?date=${today}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setTodayAttendance(data[0]);
      }
    } catch (error) {
      console.error(
        "Error fetching today's attendance:",
        error
      );
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setMarking(true);

    try {
      const response = await fetch("/api/staff/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setTodayAttendance(data.attendance);

        setFormData({
          status: "PRESENT",
          note: "",
        });

        fetchAttendance();
      } else {
        alert(data.message || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("Something went wrong");
    } finally {
      setMarking(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PRESENT":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";

      case "ABSENT":
        return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800";

      case "LEAVE":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800";

      default:
        return "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-6 lg:px-8 lg:py-8 transition-colors duration-300">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">

        {/* HEADER */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm dark:shadow-black/20">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            My Attendance
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mark your daily attendance and check past history.
          </p>
        </div>

        {/* MARK ATTENDANCE SECTION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-sm dark:shadow-black/20 space-y-5">

          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Mark Today's Attendance
            </h2>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Select your attendance status and optionally add a note.
            </p>
          </div>

          {todayAttendance ? (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-3">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <p className="text-emerald-800 dark:text-emerald-300 font-semibold text-xs sm:text-sm">
                  ✓ Attendance already marked for today
                </p>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold w-fit ${getStatusBadge(
                    todayAttendance.status
                  )}`}
                >
                  {todayAttendance.status}
                </span>

              </div>

              {todayAttendance.note && (
                <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 bg-white/70 dark:bg-slate-900/60 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800 break-words">
                  <strong>Note:</strong>{" "}
                  {todayAttendance.note}
                </p>
              )}

            </div>
          ) : (
            <form
              onSubmit={handleMarkAttendance}
              className="space-y-4"
            >

              {/* STATUS */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>

                <select
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950 focus:border-blue-500 transition"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>

              {/* NOTE */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Note (optional)
                </label>

                <textarea
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950 focus:border-blue-500 transition resize-none"
                  rows="3"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      note: e.target.value,
                    })
                  }
                  placeholder="Add a note about your attendance..."
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={marking}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition cursor-pointer disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed shadow-sm"
              >
                {marking
                  ? "Marking..."
                  : "Mark Attendance"}
              </button>

            </form>
          )}
        </div>

        {/* ATTENDANCE HISTORY */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-sm dark:shadow-black/20 space-y-5">

          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Attendance History
            </h2>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              View your previous attendance records.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-10">

              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Loading history...
              </p>

            </div>
          ) : attendance.length === 0 ? (
            <div className="text-center py-10">

              <div className="text-3xl mb-2">
                📋
              </div>

              <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm">
                No attendance records found.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl p-4"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    {/* DATE + NOTE */}
                    <div className="space-y-2 min-w-0">

                      <div className="flex flex-wrap items-center gap-2.5">

                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                          📅{" "}
                          {new Date(
                            record.date
                          ).toLocaleDateString()}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${getStatusBadge(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>

                      </div>

                      {record.note && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic break-words leading-relaxed">
                          "{record.note}"
                        </p>
                      )}

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}