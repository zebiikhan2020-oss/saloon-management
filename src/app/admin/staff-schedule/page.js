"use client";

import { useEffect, useState } from "react";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AdminStaffSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      fetchSchedules();
    }
  }, [selectedStaff]);

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/admin/staff");
      const data = await response.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaff([]);
    }
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/staff-schedule?staffId=${selectedStaff}`
      );

      const data = await response.json();

      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (day, status) => {
    try {
      const response = await fetch("/api/admin/staff-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          staffId: selectedStaff,
          day,
          status,
        }),
      });

      if (response.ok) {
        fetchSchedules();
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const handleUpdateSchedule = async (id, status) => {
    try {
      const response = await fetch("/api/admin/staff-schedule", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          status,
        }),
      });

      if (response.ok) {
        fetchSchedules();
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      const response = await fetch(
        `/api/admin/staff-schedule?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchSchedules();
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  const getScheduleForDay = (day) => {
    return schedules.find((s) => s.day === day);
  };

  // =====================================================
  // STATUS STYLING
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "WORKING":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "OFF":
        return "bg-rose-50 text-rose-700 border-rose-100";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200/60";
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case "WORKING":
        return "bg-emerald-500";

      case "OFF":
        return "bg-rose-500";

      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">

        <div>
          <span className="inline-flex text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Staff Management
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Staff Working Schedule
          </h1>

          <p className="text-slate-500 text-sm mt-1">
            Manage weekly working days and off days for salon staff.
          </p>
        </div>

      </div>


      {/* =================================================
          STAFF SELECTION CARD
      ================================================= */}

      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-5 sm:p-6 lg:p-8">

        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Select Staff Member
        </label>

        <select
          className="w-full sm:max-w-md bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
        >
          <option value="">
            Choose a staff member...
          </option>

          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

      </div>


      {/* =================================================
          SCHEDULE CONTENT
      ================================================= */}

      {selectedStaff ? (

        <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">

          {/* HEADER */}

          <div className="p-5 sm:p-6 lg:p-8 border-b border-slate-100 bg-slate-50/50">

            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Weekly Timetable
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Set availability status for each day of the week.
            </p>

          </div>


          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="hidden md:block overflow-x-auto">

            <table className="min-w-full divide-y divide-slate-100">

              <thead className="bg-slate-50/70">
                <tr>

                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                    Day
                  </th>

                  <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                    Status
                  </th>

                  <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-600">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">

                {loading ? (

                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-16 text-center"
                    >

                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>

                      <p className="text-slate-500 text-xs font-medium">
                        Loading schedules...
                      </p>

                    </td>
                  </tr>

                ) : (

                  DAYS.map((day) => {

                    const schedule =
                      getScheduleForDay(day);

                    return (

                      <tr
                        key={day}
                        className="hover:bg-slate-50/50 transition"
                      >

                        {/* DAY */}

                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                          {day}
                        </td>


                        {/* STATUS */}

                        <td className="px-6 py-4 whitespace-nowrap">

                          {schedule ? (

                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(
                                schedule.status
                              )}`}
                            >

                              <span
                                className={`w-2 h-2 rounded-full ${getStatusDot(
                                  schedule.status
                                )}`}
                              />

                              {schedule.status}

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200/60">

                              <span className="w-2 h-2 rounded-full bg-slate-400" />

                              Not Set

                            </span>

                          )}

                        </td>


                        {/* ACTIONS */}

                        <td className="px-6 py-4 whitespace-nowrap text-right">

                          {schedule ? (

                            <div className="flex items-center justify-end gap-2">

                              <button
                                onClick={() =>
                                  handleUpdateSchedule(
                                    schedule.id,
                                    "WORKING"
                                  )
                                }
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100/60 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
                              >
                                Set Working
                              </button>

                              <button
                                onClick={() =>
                                  handleUpdateSchedule(
                                    schedule.id,
                                    "OFF"
                                  )
                                }
                                className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100/60 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
                              >
                                Set Off
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteSchedule(
                                    schedule.id
                                  )
                                }
                                className="px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200/70 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
                              >
                                Delete
                              </button>

                            </div>

                          ) : (

                            <div className="flex items-center justify-end gap-2">

                              <button
                                onClick={() =>
                                  handleCreateSchedule(
                                    day,
                                    "WORKING"
                                  )
                                }
                                className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100/60 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
                              >
                                Set Working
                              </button>

                              <button
                                onClick={() =>
                                  handleCreateSchedule(
                                    day,
                                    "OFF"
                                  )
                                }
                                className="px-3.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100/60 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
                              >
                                Set Off
                              </button>

                            </div>

                          )}

                        </td>

                      </tr>

                    );
                  })

                )}

              </tbody>

            </table>

          </div>


          {/* =================================================
              MOBILE VIEW
          ================================================= */}

          <div className="md:hidden p-4 space-y-3">

            {loading ? (

              <div className="py-12 text-center">

                <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>

                <p className="text-slate-500 text-xs font-medium">
                  Loading schedules...
                </p>

              </div>

            ) : (

              DAYS.map((day) => {

                const schedule =
                  getScheduleForDay(day);

                return (

                  <div
                    key={day}
                    className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4"
                  >

                    {/* DAY + STATUS */}

                    <div className="flex items-center justify-between gap-3 mb-4">

                      <div className="flex items-center gap-2 min-w-0">

                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                          {day.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900">
                            {day}
                          </p>

                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Weekly schedule
                          </p>
                        </div>

                      </div>


                      {schedule ? (

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${getStatusStyle(
                            schedule.status
                          )}`}
                        >

                          <span
                            className={`w-1.5 h-1.5 rounded-full ${getStatusDot(
                              schedule.status
                            )}`}
                          />

                          {schedule.status}

                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/60 shrink-0">

                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />

                          Not Set

                        </span>

                      )}

                    </div>


                    {/* ACTIONS */}

                    {schedule ? (

                      <div className="grid grid-cols-3 gap-2">

                        <button
                          onClick={() =>
                            handleUpdateSchedule(
                              schedule.id,
                              "WORKING"
                            )
                          }
                          className="px-2 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100/60 rounded-xl text-[10px] sm:text-xs font-semibold transition cursor-pointer"
                        >
                          Working
                        </button>

                        <button
                          onClick={() =>
                            handleUpdateSchedule(
                              schedule.id,
                              "OFF"
                            )
                          }
                          className="px-2 py-2 bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100/60 rounded-xl text-[10px] sm:text-xs font-semibold transition cursor-pointer"
                        >
                          Set Off
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteSchedule(
                              schedule.id
                            )
                          }
                          className="px-2 py-2 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200/70 rounded-xl text-[10px] sm:text-xs font-semibold transition cursor-pointer"
                        >
                          Delete
                        </button>

                      </div>

                    ) : (

                      <div className="grid grid-cols-2 gap-2">

                        <button
                          onClick={() =>
                            handleCreateSchedule(
                              day,
                              "WORKING"
                            )
                          }
                          className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100/60 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                          Set Working
                        </button>

                        <button
                          onClick={() =>
                            handleCreateSchedule(
                              day,
                              "OFF"
                            )
                          }
                          className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100/60 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                          Set Off
                        </button>

                      </div>

                    )}

                  </div>

                );
              })

            )}

          </div>

        </div>

      ) : (

        /* =================================================
           NO STAFF SELECTED
        ================================================= */

        <div className="bg-white rounded-2xl border border-slate-100 p-12 sm:p-16 text-center shadow-xs">

          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl mx-auto mb-3 font-bold">
            📅
          </div>

          <h3 className="text-base font-bold text-slate-900">
            No Staff Selected
          </h3>

          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Please select a staff member from the dropdown above to
            view and manage their weekly working schedule.
          </p>

        </div>

      )}

    </div>
  );
}