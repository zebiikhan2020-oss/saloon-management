"use client";

import { useEffect, useState } from "react";

export default function AdminAppointmentPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [staffList, setStaffList] = useState([]);

  // ==============================
  // FETCH APPOINTMENTS + STAFF
  // ==============================

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchAppointments();
    }, 300);

    fetchStaff();

    return () => clearTimeout(delay);
  }, [search, status]);

  // ==============================
  // FETCH STAFF
  // ==============================

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();

      if (Array.isArray(data)) {
        setStaffList(data);
      }
    } catch (error) {
      console.log("FETCH STAFF ERROR:", error);
    }
  };

  // ==============================
  // FETCH APPOINTMENTS
  // ==============================

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/appointment?search=${encodeURIComponent(
          search
        )}&status=${status}`
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.log("FETCH APPOINTMENTS ERROR:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // STAFF AVAILABILITY
  // ==============================

  const getStaffAvailability = async (
    staffId,
    appointmentDate
  ) => {
    try {
      const res = await fetch(
        `/api/admin/staff/availability?staffId=${staffId}&date=${appointmentDate}`
      );

      const data = await res.json();

      return data;
    } catch (error) {
      console.log("STAFF AVAILABILITY ERROR:", error);

      return {
        available: false,
        message:
          "Unable to verify staff schedule at the moment.",
      };
    }
  };

  // ==============================
  // ASSIGN STAFF
  // ==============================

  const assignStaff = async (
    appointmentId,
    staffId
  ) => {
    try {
      const appointment = appointments.find(
        (item) => item.id === appointmentId
      );

      if (!appointment) {
        alert("Appointment record not found.");
        return;
      }

      const appointmentDate = new Date(
        appointment.date
      )
        .toISOString()
        .split("T")[0];

      const availability =
        await getStaffAvailability(
          staffId,
          appointmentDate
        );

      if (!availability.available) {
        alert(
          availability.message ||
            "Selected staff member is unavailable on this date."
        );

        fetchAppointments();
        return;
      }

      const res = await fetch(
        "/api/admin/appointment",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentId,
            staffId,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(
          "Staff successfully assigned to appointment!"
        );

        fetchAppointments();
      } else {
        alert(
          data.message ||
            "Failed to assign staff member."
        );

        fetchAppointments();
      }
    } catch (error) {
      console.log("ASSIGN STAFF ERROR:", error);
      alert("An unexpected error occurred.");
    }
  };

  // ==============================
  // UPDATE STATUS
  // ==============================

  const updateStatus = async (
    appointmentId,
    newStatus
  ) => {
    try {
      const res = await fetch(
        "/api/admin/appointment",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointmentId,
            status: newStatus,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to update appointment status."
        );
        return;
      }

      alert(
        newStatus === "CONFIRMED"
          ? "Appointment has been successfully confirmed."
          : "Appointment has been rejected."
      );

      fetchAppointments();
    } catch (error) {
      console.log(
        "UPDATE STATUS ERROR:",
        error
      );

      alert("An unexpected error occurred.");
    }
  };

  // ==============================
  // STATUS STYLE
  // ==============================

  const getStatusStyle = (
    appointmentStatus
  ) => {
    switch (appointmentStatus) {
      case "PENDING":
        return "bg-amber-50 text-amber-600 border border-amber-200";

      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";

      case "REJECTED":
        return "bg-rose-50 text-rose-600 border border-rose-200";

      case "COMPLETED":
        return "bg-sky-50 text-sky-600 border border-sky-200";

      case "CANCELLED":
        return "bg-slate-100 text-slate-600 border border-slate-200";

      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-600 border border-blue-200";

      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

  // ==============================
  // DATE FORMAT
  // ==============================

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">

      <div className="w-full max-w-7xl mx-auto space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="border-b border-slate-100 pb-5">

          <div className="flex flex-col gap-3">

            <div>
              <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                Salon Management
              </span>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
                Appointments
              </h1>

              <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
                Monitor client bookings, allocate
                specialized staff members, and track
                schedules.
              </p>
            </div>

          </div>

        </div>

        {/* =================================================
            SEARCH + FILTER
        ================================================= */}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* SEARCH */}

            <div className="md:col-span-8">

              <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Search Appointments
              </label>

              <div className="relative">

                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">

                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>

                </span>

                <input
                  type="text"
                  placeholder="Search by client name, service or category..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />

              </div>

            </div>

            {/* STATUS */}

            <div className="md:col-span-4">

              <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Filter Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="PENDING">
                  Pending
                </option>

                <option value="CONFIRMED">
                  Confirmed
                </option>

                <option value="REJECTED">
                  Rejected
                </option>

                <option value="COMPLETED">
                  Completed
                </option>

                <option value="CANCELLED">
                  Cancelled
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>
              </select>

            </div>

          </div>

        </div>

        {/* =================================================
            RESULT COUNT
        ================================================= */}

        {!loading && (
          <div className="flex items-center justify-between px-1">

            <p className="text-xs text-slate-500 font-medium">

              Showing{" "}

              <span className="text-slate-900 font-bold">
                {appointments.length}
              </span>{" "}

              appointment{" "}
              {appointments.length === 1
                ? "record"
                : "records"}

            </p>

          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="bg-white rounded-2xl border border-slate-100 p-12 sm:p-16 text-center shadow-sm">

            <div className="animate-spin h-7 w-7 border-2 border-slate-200 border-t-blue-500 rounded-full mx-auto mb-3" />

            <p className="text-slate-400 text-sm font-medium">
              Loading appointments...
            </p>

          </div>

        ) : appointments.length === 0 ? (

          /* =================================================
              EMPTY
          ================================================= */

          <div className="bg-white rounded-2xl border border-slate-100 p-10 sm:p-12 text-center shadow-sm">

            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 text-lg">
              📅
            </div>

            <h3 className="text-slate-800 font-semibold text-sm">
              No appointments found
            </h3>

            <p className="text-slate-400 text-xs mt-1">
              Try adjusting your search query or
              filter settings.
            </p>

          </div>

        ) : (

          <>
            {/* =================================================
                MOBILE APPOINTMENT CARDS
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 lg:hidden">

              {appointments.map((item) => (

                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                >

                  {/* CARD TOP */}

                  <div className="p-4 border-b border-slate-100">

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Client
                        </p>

                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {item.customer?.name ||
                            "Walk-in Client"}
                        </h3>

                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${getStatusStyle(
                          item.status
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {item.status}
                      </span>

                    </div>

                  </div>

                  {/* CARD DETAILS */}

                  <div className="p-4 space-y-4">

                    {/* SERVICE */}

                    <div className="grid grid-cols-2 gap-4">

                      <div className="min-w-0">

                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                          Service
                        </p>

                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {item.service?.name ||
                            "Custom Service"}
                        </p>

                      </div>

                      <div className="min-w-0">

                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                          Category
                        </p>

                        <span className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-medium max-w-full truncate">
                          {item.service?.category?.name ||
                            "General"}
                        </span>

                      </div>

                    </div>

                    {/* DATE + TIME */}

                    <div className="grid grid-cols-2 gap-4">

                      <div>

                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                          Date
                        </p>

                        <p className="text-xs font-semibold text-slate-700">
                          {formatDate(item.date)}
                        </p>

                      </div>

                      <div>

                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
                          Time
                        </p>

                        <p className="text-xs font-bold text-slate-900">
                          {item.time}
                        </p>

                      </div>

                    </div>

                    {/* STAFF */}

                    <div>

                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                        Staff Member
                      </label>

                      <select
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-slate-50 text-slate-700 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                        value={
                          item.staff?.id || ""
                        }
                        onChange={(e) => {

                          if (
                            e.target.value
                          ) {
                            assignStaff(
                              item.id,
                              e.target.value
                            );
                          }

                        }}
                      >

                        <option value="">
                          Select Staff...
                        </option>

                        {staffList.map(
                          (staff) => (
                            <option
                              key={staff.id}
                              value={staff.id}
                            >
                              {staff.name}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    {/* ACTIONS */}

                    <div className="pt-1">

                      {item.status ===
                      "PENDING" ? (

                        <div className="grid grid-cols-2 gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(
                                item.id,
                                "CONFIRMED"
                              )
                            }
                            className="bg-emerald-600 text-white px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-emerald-700 active:scale-[0.98] transition shadow-sm cursor-pointer"
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(
                                item.id,
                                "REJECTED"
                              )
                            }
                            className="bg-rose-600 text-white px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-rose-700 active:scale-[0.98] transition shadow-sm cursor-pointer"
                          >
                            Decline
                          </button>

                        </div>

                      ) : (

                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-center">

                          <span className="text-slate-400 italic text-[11px]">
                            No actions available
                          </span>

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              ))}

            </div>

            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>

                    <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">

                      <th className="py-4 px-4">
                        Client
                      </th>

                      <th className="py-4 px-4">
                        Service
                      </th>

                      <th className="py-4 px-4">
                        Category
                      </th>

                      <th className="py-4 px-4">
                        Staff Member
                      </th>

                      <th className="py-4 px-4">
                        Date
                      </th>

                      <th className="py-4 px-4">
                        Time
                      </th>

                      <th className="py-4 px-4">
                        Status
                      </th>

                      <th className="py-4 px-4 text-right">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-50 text-xs">

                    {appointments.map(
                      (item) => (

                        <tr
                          key={item.id}
                          className="hover:bg-blue-50/20 transition"
                        >

                          {/* CLIENT */}

                          <td className="py-4 px-4 font-semibold text-slate-900 whitespace-nowrap">
                            {item.customer?.name ||
                              "Walk-in Client"}
                          </td>

                          {/* SERVICE */}

                          <td className="py-4 px-4 text-slate-700 font-medium whitespace-nowrap">
                            {item.service?.name ||
                              "Custom Service"}
                          </td>

                          {/* CATEGORY */}

                          <td className="py-4 px-4 text-slate-500 whitespace-nowrap">

                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-medium">
                              {item.service?.category
                                ?.name ||
                                "General"}
                            </span>

                          </td>

                          {/* STAFF */}

                          <td className="py-4 px-4 whitespace-nowrap">

                            <select
                              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-slate-50 text-slate-700 min-w-[150px] outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
                              value={
                                item.staff?.id ||
                                ""
                              }
                              onChange={(e) => {

                                if (
                                  e.target.value
                                ) {
                                  assignStaff(
                                    item.id,
                                    e.target.value
                                  );
                                }

                              }}
                            >

                              <option value="">
                                Select Staff...
                              </option>

                              {staffList.map(
                                (staff) => (
                                  <option
                                    key={staff.id}
                                    value={staff.id}
                                  >
                                    {staff.name}
                                  </option>
                                )
                              )}

                            </select>

                          </td>

                          {/* DATE */}

                          <td className="py-4 px-4 text-slate-600 whitespace-nowrap font-medium">
                            {formatDate(item.date)}
                          </td>

                          {/* TIME */}

                          <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
                            {item.time}
                          </td>

                          {/* STATUS */}

                          <td className="py-4 px-4 whitespace-nowrap">

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${getStatusStyle(
                                item.status
                              )}`}
                            >

                              <span className="w-1.5 h-1.5 rounded-full bg-current" />

                              {item.status}

                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td className="py-4 px-4 text-right whitespace-nowrap">

                            {item.status ===
                            "PENDING" ? (

                              <div className="flex items-center justify-end gap-1.5">

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatus(
                                      item.id,
                                      "CONFIRMED"
                                    )
                                  }
                                  className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-sm cursor-pointer"
                                >
                                  Approve
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    updateStatus(
                                      item.id,
                                      "REJECTED"
                                    )
                                  }
                                  className="bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-rose-700 transition shadow-sm cursor-pointer"
                                >
                                  Decline
                                </button>

                              </div>

                            ) : (

                              <span className="text-slate-400 italic text-[11px]">
                                No actions
                              </span>

                            )}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          </>

        )}

      </div>
    </div>
  );
}