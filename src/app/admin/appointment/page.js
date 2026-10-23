
"use client";

import { useEffect, useState } from "react";

export default function AdminAppointmentPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [staffList, setStaffList] = useState([]);

  const [darkMode, setDarkMode] = useState(false);

  // ==============================
  // PAGINATION
  // ==============================

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ==============================
  // DARK MODE
  // ==============================

  useEffect(() => {
    const updateTheme = () => {
      setDarkMode(
        document.documentElement.classList.contains("dark")
      );
    };

    updateTheme();

    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // ==============================
  // FETCH APPOINTMENTS + STAFF
  // ==============================

  useEffect(() => {
    setCurrentPage(1);

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
  // PAGINATION
  // ==============================

  const totalPages = Math.ceil(
    appointments.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const currentAppointments =
    appointments.slice(startIndex, endIndex);

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
    if (darkMode) {
      switch (appointmentStatus) {
        case "PENDING":
          return "bg-amber-500/15 text-amber-400 border border-amber-500/30";

        case "CONFIRMED":
          return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";

        case "REJECTED":
          return "bg-rose-500/15 text-rose-400 border border-rose-500/30";

        case "COMPLETED":
          return "bg-sky-500/15 text-sky-400 border border-sky-500/30";

        case "CANCELLED":
          return "bg-slate-700 text-slate-300 border border-slate-600";

        case "IN_PROGRESS":
          return "bg-blue-500/15 text-blue-400 border border-blue-500/30";

        default:
          return "bg-slate-700 text-slate-300 border border-slate-600";
      }
    }

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
    <div
      className={`min-h-screen px-4 py-6 sm:px-6 lg:px-8 ${
        darkMode
          ? "bg-slate-950"
          : "bg-slate-50"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className={`border-b pb-5 ${
            darkMode
              ? "border-slate-800"
              : "border-slate-100"
          }`}
        >
          <div className="flex flex-col gap-3">
            <div>
              <span
                className={`inline-flex items-center text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  darkMode
                    ? "text-blue-400 bg-blue-500/15 border border-blue-500/30"
                    : "text-blue-600 bg-blue-50 border border-blue-100"
                }`}
              >
                Salon Management
              </span>

              <h1
                className={`text-2xl sm:text-3xl font-bold mt-2 ${
                  darkMode
                    ? "text-slate-100"
                    : "text-slate-900"
                }`}
              >
                Appointments
              </h1>

              <p
                className={`text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed ${
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
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

        <div
          className={`rounded-2xl shadow-sm border p-4 sm:p-5 ${
            darkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-100"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* SEARCH */}

            <div className="md:col-span-8">
              <label
                className={`block text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 ${
                  darkMode
                    ? "text-slate-300"
                    : "text-slate-600"
                }`}
              >
                Search Appointments
              </label>

              <div className="relative">
                <span
                  className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                    darkMode
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                >
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
                  className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                    darkMode
                      ? "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:bg-slate-800"
                      : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* STATUS */}

            <div className="md:col-span-4">
              <label
                className={`block text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 ${
                  darkMode
                    ? "text-slate-300"
                    : "text-slate-600"
                }`}
              >
                Filter Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-slate-100 focus:bg-slate-800"
                    : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white"
                }`}
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
            <p
              className={`text-xs font-medium ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              Showing{" "}
              <span
                className={`font-bold ${
                  darkMode
                    ? "text-slate-100"
                    : "text-slate-900"
                }`}
              >
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
          <div
            className={`rounded-2xl border p-12 sm:p-16 text-center shadow-sm ${
              darkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-100"
            }`}
          >
            <div
              className={`animate-spin h-7 w-7 border-2 border-t-blue-500 rounded-full mx-auto mb-3 ${
                darkMode
                  ? "border-slate-700"
                  : "border-slate-200"
              }`}
            />

            <p
              className={`text-sm font-medium ${
                darkMode
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              Loading appointments...
            </p>
          </div>
        ) : appointments.length === 0 ? (
          /* =================================================
              EMPTY
          ================================================= */

          <div
            className={`rounded-2xl border p-10 sm:p-12 text-center shadow-sm ${
              darkMode
                ? "bg-slate-900 border-slate-800"
                : "bg-white border-slate-100"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-lg ${
                darkMode
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-blue-50 text-blue-500"
              }`}
            >
              📅
            </div>

            <h3
              className={`font-semibold text-sm ${
                darkMode
                  ? "text-slate-100"
                  : "text-slate-800"
              }`}
            >
              No appointments found
            </h3>

            <p
              className={`text-xs mt-1 ${
                darkMode
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
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
              {currentAppointments.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border shadow-sm overflow-hidden ${
                    darkMode
                      ? "bg-slate-900 border-slate-800"
                      : "bg-white border-slate-100"
                  }`}
                >
                  {/* CARD TOP */}

                  <div
                    className={`p-4 border-b ${
                      darkMode
                        ? "border-slate-800"
                        : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          Client
                        </p>

                        <h3
                          className={`text-sm font-bold truncate ${
                            darkMode
                              ? "text-slate-100"
                              : "text-slate-900"
                          }`}
                        >
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
                        <p
                          className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          Service
                        </p>

                        <p
                          className={`text-xs font-semibold truncate ${
                            darkMode
                              ? "text-slate-200"
                              : "text-slate-800"
                          }`}
                        >
                          {item.service?.name ||
                            "Custom Service"}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          Category
                        </p>

                        <span
                          className={`inline-block px-2 py-1 rounded-lg text-[10px] font-medium max-w-full truncate ${
                            darkMode
                              ? "bg-slate-800 text-slate-300"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.service?.category?.name ||
                            "General"}
                        </span>
                      </div>
                    </div>

                    {/* DATE + TIME */}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p
                          className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          Date
                        </p>

                        <p
                          className={`text-xs font-semibold ${
                            darkMode
                              ? "text-slate-300"
                              : "text-slate-700"
                          }`}
                        >
                          {formatDate(item.date)}
                        </p>
                      </div>

                      <div>
                        <p
                          className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          Time
                        </p>

                        <p
                          className={`text-xs font-bold ${
                            darkMode
                              ? "text-slate-100"
                              : "text-slate-900"
                          }`}
                        >
                          {item.time}
                        </p>
                      </div>
                    </div>

                    {/* STAFF */}

                    <div>
                      <label
                        className={`block text-[10px] uppercase tracking-wider font-bold mb-1.5 ${
                          darkMode
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        Staff Member
                      </label>

                      <select
                        className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer ${
                          darkMode
                            ? "bg-slate-800 border-slate-700 text-slate-200 focus:bg-slate-800"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                        value={
                          item.staff?.id || ""
                        }
                        onChange={(e) => {
                          if (e.target.value) {
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
                        <div
                          className={`border rounded-xl px-3 py-2.5 text-center ${
                            darkMode
                              ? "bg-slate-800 border-slate-700"
                              : "bg-slate-50 border-slate-100"
                          }`}
                        >
                          <span
                            className={`italic text-[11px] ${
                              darkMode
                                ? "text-slate-500"
                                : "text-slate-400"
                            }`}
                          >
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

            <div
              className={`hidden lg:block rounded-2xl shadow-sm border overflow-hidden ${
                darkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-100"
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">

                  <thead>
                    <tr
                      className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                        darkMode
                          ? "bg-slate-800/60 border-slate-800 text-slate-500"
                          : "bg-slate-50/70 border-slate-100 text-slate-400"
                      }`}
                    >
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

                  <tbody
                    className={`divide-y text-xs ${
                      darkMode
                        ? "divide-slate-800"
                        : "divide-slate-50"
                    }`}
                  >
                    {currentAppointments.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className={`transition ${
                            darkMode
                              ? "hover:bg-slate-800/50"
                              : "hover:bg-blue-50/20"
                          }`}
                        >
                          {/* CLIENT */}

                          <td
                            className={`py-4 px-4 font-semibold whitespace-nowrap ${
                              darkMode
                                ? "text-slate-100"
                                : "text-slate-900"
                            }`}
                          >
                            {item.customer?.name ||
                              "Walk-in Client"}
                          </td>

                          {/* SERVICE */}

                          <td
                            className={`py-4 px-4 font-medium whitespace-nowrap ${
                              darkMode
                                ? "text-slate-300"
                                : "text-slate-700"
                            }`}
                          >
                            {item.service?.name ||
                              "Custom Service"}
                          </td>

                          {/* CATEGORY */}

                          <td
                            className={`py-4 px-4 whitespace-nowrap ${
                              darkMode
                                ? "text-slate-400"
                                : "text-slate-500"
                            }`}
                          >
                            <span
                              className={`px-2 py-1 rounded-lg text-[10px] font-medium ${
                                darkMode
                                  ? "bg-slate-800 text-slate-300"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.service?.category
                                ?.name ||
                                "General"}
                            </span>
                          </td>

                          {/* STAFF */}

                          <td className="py-4 px-4 whitespace-nowrap">
                            <select
                              className={`border rounded-xl px-3 py-1.5 text-xs min-w-[150px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer ${
                                darkMode
                                  ? "bg-slate-800 border-slate-700 text-slate-200 focus:bg-slate-800"
                                  : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white"
                              }`}
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

                          <td
                            className={`py-4 px-4 whitespace-nowrap font-medium ${
                              darkMode
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                          >
                            {formatDate(item.date)}
                          </td>

                          {/* TIME */}

                          <td
                            className={`py-4 px-4 font-semibold whitespace-nowrap ${
                              darkMode
                                ? "text-slate-200"
                                : "text-slate-800"
                            }`}
                          >
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
                              <span
                                className={`italic text-[11px] ${
                                  darkMode
                                    ? "text-slate-500"
                                    : "text-slate-400"
                                }`}
                              >
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

            {/* =================================================
                PAGINATION
            ================================================= */}

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">

                <p
                  className={`text-xs font-medium ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  Page{" "}
                  <span
                    className={`font-bold ${
                      darkMode
                        ? "text-slate-100"
                        : "text-slate-900"
                    }`}
                  >
                    {currentPage}
                  </span>{" "}
                  of{" "}
                  <span
                    className={`font-bold ${
                      darkMode
                        ? "text-slate-100"
                        : "text-slate-900"
                    }`}
                  >
                    {totalPages}
                  </span>
                </p>

                <div className="flex items-center gap-1.5">

                  {/* PREVIOUS */}

                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.max(prev - 1, 1)
                      )
                    }
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                      currentPage === 1
                        ? darkMode
                          ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                          : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                        : darkMode
                        ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    ← Previous
                  </button>

                  {/* PAGE NUMBERS */}

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() =>
                          setCurrentPage(page)
                        }
                        className={`min-w-9 h-9 px-2 rounded-xl text-xs font-bold transition ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-sm"
                            : darkMode
                            ? "bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* NEXT */}

                  <button
                    type="button"
                    disabled={
                      currentPage === totalPages
                    }
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          totalPages
                        )
                      )
                    }
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                      currentPage === totalPages
                        ? darkMode
                          ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                          : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                        : darkMode
                        ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Next →
                  </button>

                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

