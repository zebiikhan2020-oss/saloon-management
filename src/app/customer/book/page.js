
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function CustomerBookPage() {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);

  const [businessHours, setBusinessHours] = useState([]);
  const [specialBusinessHours, setSpecialBusinessHours] = useState([]);

  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PAY_AT_SALON");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // =====================================================
  // LOAD ALL BOOKING DATA
  // =====================================================

  useEffect(() => {
    loadBookingData();
  }, []);

  // Load available slots when service, date, or staff changes
  useEffect(() => {
    if (serviceId && date) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setTime("");
    }
  }, [serviceId, date, staffId]);

  async function loadAvailableSlots() {
    try {
      setLoadingSlots(true);
      setError("");

      const params = new URLSearchParams({
        date,
        serviceId,
      });

      if (staffId) {
        params.append("staffId", staffId);
      }

      const response = await fetch(
        `/api/customer/available-slots?${params}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load available slots"
        );
      }

      setAvailableSlots(data.availableSlots || []);

      if (
        time &&
        !data.availableSlots?.find(
          (slot) => slot.time === time
        )
      ) {
        setTime("");
      }
    } catch (err) {
      console.error("LOAD SLOTS ERROR:", err);
      setError(
        err.message ||
          "Failed to load available time slots"
      );
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function loadBookingData() {
    try {
      setLoading(true);
      setError("");

      const [
        servicesRes,
        staffRes,
        businessHoursRes,
      ] = await Promise.all([
        fetch("/api/admin/services"),
        fetch("/api/customer/staff"),
        fetch("/api/customer/business-hours"),
      ]);

      if (!servicesRes.ok) {
        throw new Error("Failed to load services");
      }

      const servicesData = await servicesRes.json();

      const servicesList = Array.isArray(servicesData)
        ? servicesData
        : Array.isArray(servicesData.services)
        ? servicesData.services
        : [];

      setServices(servicesList);

      if (!staffRes.ok) {
        throw new Error("Failed to load staff");
      }

      const staffData = await staffRes.json();

      const staffList = Array.isArray(staffData)
        ? staffData
        : Array.isArray(staffData.staff)
        ? staffData.staff
        : [];

      setStaff(staffList);

      if (!businessHoursRes.ok) {
        throw new Error(
          "Failed to load business hours"
        );
      }

      const businessHoursData =
        await businessHoursRes.json();

      const weeklyHours = Array.isArray(
        businessHoursData.businessHours
      )
        ? businessHoursData.businessHours
        : [];

      const specialHours = Array.isArray(
        businessHoursData.specialBusinessHours
      )
        ? businessHoursData.specialBusinessHours
        : [];

      setBusinessHours(weeklyHours);
      setSpecialBusinessHours(specialHours);
    } catch (err) {
      console.error(
        "BOOKING DATA ERROR:",
        err
      );

      setError(
        err.message ||
          "Failed to load booking data"
      );
    } finally {
      setLoading(false);
    }
  }

  function normalizeTime(value) {
    if (!value) return "";
    return String(value).trim().slice(0, 5);
  }

  function normalizeDay(value) {
    if (!value) return "";
    return String(value).trim().toLowerCase();
  }

  function getDayNameFromDate(dateString) {
    if (!dateString) return null;

    const parts = dateString.split("-");

    if (parts.length !== 3) return null;

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const selectedDate = new Date(
      year,
      month - 1,
      day
    );

    if (isNaN(selectedDate.getTime())) {
      return null;
    }

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return dayNames[selectedDate.getDay()];
  }

  function getDateOnly(value) {
    if (!value) return "";

    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}/.test(value)
    ) {
      return value.slice(0, 10);
    }

    const parsed = new Date(value);

    if (isNaN(parsed.getTime())) {
      return "";
    }

    const year = parsed.getFullYear();

    const month = String(
      parsed.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      parsed.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getSelectedBusinessHour() {
    if (!date) return null;

    const selectedDay =
      getDayNameFromDate(date);

    if (!selectedDay) return null;

    const special =
      specialBusinessHours.find((item) => {
        const itemDate = getDateOnly(
          item.date
        );

        return itemDate === date;
      });

    if (special) {
      return {
        ...special,
        type: String(
          special.type || "NORMAL"
        ).toUpperCase(),
        openTime: normalizeTime(
          special.openTime
        ),
        closeTime: normalizeTime(
          special.closeTime
        ),
      };
    }

    const weeklyHour =
      businessHours.find((item) => {
        const apiDay = normalizeDay(
          item.day
        );

        const selectedDayNormalized =
          normalizeDay(selectedDay);

        return (
          apiDay ===
          selectedDayNormalized
        );
      });

    if (!weeklyHour) return null;

    return {
      ...weeklyHour,
      type: String(
        weeklyHour.type || "NORMAL"
      ).toUpperCase(),
      openTime: normalizeTime(
        weeklyHour.openTime
      ),
      closeTime: normalizeTime(
        weeklyHour.closeTime
      ),
    };
  }

  const selectedBusinessHour =
    getSelectedBusinessHour();

  function timeToMinutes(value) {
    if (!value) return null;

    const normalized =
      normalizeTime(value);

    const parts =
      normalized.split(":");

    if (parts.length !== 2) return null;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return null;
    }

    return hours * 60 + minutes;
  }

  function isTimeAllowed(selectedTime) {
    if (
      !selectedBusinessHour ||
      !selectedTime
    ) {
      return false;
    }

    const type = String(
      selectedBusinessHour.type || ""
    ).toUpperCase();

    if (type === "CLOSED") {
      return false;
    }

    if (type === "FULL_DAY") {
      return true;
    }

    if (type !== "NORMAL") {
      return false;
    }

    const openingMinutes =
      timeToMinutes(
        selectedBusinessHour.openTime
      );

    const closingMinutes =
      timeToMinutes(
        selectedBusinessHour.closeTime
      );

    const requestedMinutes =
      timeToMinutes(selectedTime);

    if (
      openingMinutes === null ||
      closingMinutes === null ||
      requestedMinutes === null
    ) {
      return false;
    }

    return (
      requestedMinutes >=
        openingMinutes &&
      requestedMinutes <=
        closingMinutes
    );
  }

  function getTimeMessage() {
    if (!selectedBusinessHour) {
      return "Business hours are not configured for this date.";
    }

    const type = String(
      selectedBusinessHour.type || ""
    ).toUpperCase();

    if (type === "CLOSED") {
      return (
        selectedBusinessHour.reason ||
        "The salon is closed on this date."
      );
    }

    if (type === "FULL_DAY") {
      return "The salon is available 24 hours.";
    }

    if (
      selectedBusinessHour.openTime &&
      selectedBusinessHour.closeTime
    ) {
      return `Appointments are available from ${normalizeTime(
        selectedBusinessHour.openTime
      )} to ${normalizeTime(
        selectedBusinessHour.closeTime
      )}.`;
    }

    return "Business hours are not configured correctly for this date.";
  }

  async function handleDateChange(e) {
    const selectedDate = e.target.value;

    setDate(selectedDate);
    setTime("");
    setStaffId("");
    setError("");
    setMessage("");

    if (!selectedDate) {
      setStaff([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/customer/staff?date=${selectedDate}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load staff"
        );
      }

      const staffList = Array.isArray(data)
        ? data
        : Array.isArray(data.staff)
        ? data.staff
        : [];

      setStaff(staffList);
    } catch (error) {
      console.error(
        "DATE STAFF ERROR:",
        error
      );

      setStaff([]);

      setError(
        error.message ||
          "Failed to load available staff"
      );
    }
  }

  async function handleBooking(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!serviceId) {
      setError("Please select a service.");
      return;
    }

    if (!staffId) {
      setError(
        "Please select a staff member."
      );
      return;
    }

    if (!date) {
      setError(
        "Please select appointment date."
      );
      return;
    }

    if (!selectedBusinessHour) {
      setError(
        "Business hours are not configured for this date."
      );
      return;
    }

    if (
      selectedBusinessHour.type ===
      "CLOSED"
    ) {
      setError(getTimeMessage());
      return;
    }

    if (!time) {
      setError(
        "Please select appointment time."
      );
      return;
    }

    if (!isTimeAllowed(time)) {
      setError(getTimeMessage());
      return;
    }

    try {
      setBooking(true);

      const response = await fetch(
        "/api/customer/appointment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId,
            staffId,
            date,
            time,
            paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to book appointment"
        );
      }

      const successMessage =
        data.message ||
        "Appointment booked successfully!";

      setMessage(successMessage);

      setToast({
        type: "success",
        message: successMessage,
      });

      setTimeout(() => {
        setToast(null);
      }, 2000);

      setServiceId("");
      setStaffId("");
      setDate("");
      setTime("");
    } catch (err) {
      console.error(
        "BOOK APPOINTMENT ERROR:",
        err
      );

      const errorMessage =
        err.message ||
        "Failed to book appointment";

      setError(errorMessage);

      setToast({
        type: "error",
        message: errorMessage,
      });

      setTimeout(() => {
        setToast(null);
      }, 3500);
    } finally {
      setBooking(false);
    }
  }

  const today = new Date();

  const todayString = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)] border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium text-sm">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Loading booking portal...
        </div>
      </div>
    );
  }

  return (
    <>
      {/* =================================================
          TOAST
      ================================================= */}

      {toast &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed z-[99999] w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border px-4 py-3 shadow-[0_15px_40px_rgba(15,23,42,0.14)] flex items-center gap-3 ${
              toast.type === "success"
                ? "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                : "bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
            }`}
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              left: "auto",
              transform: "none",
            }}
          >
            <span
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                toast.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40"
                  : "bg-rose-50 dark:bg-rose-950/40"
              }`}
            >
              {toast.type === "success"
                ? "✅"
                : "❌"}
            </span>

            <span className="text-sm font-semibold leading-relaxed">
              {toast.message}
            </span>

            <div className="absolute bottom-0 left-0 h-1 w-full overflow-hidden rounded-b-2xl">
              <div
                className={`h-full ${
                  toast.type === "success"
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
                style={{
                  animation:
                    "toastProgress 2s linear forwards",
                }}
              />
            </div>
          </div>,
          document.body
        )}

      {/* =================================================
          PAGE
      ================================================= */}

      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-3xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-5 sm:mb-7">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(15,23,42,0.04)] px-5 py-5 sm:px-7 sm:py-6">

              <div className="flex items-start gap-3">

                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shadow-md shadow-indigo-100 dark:shadow-indigo-950/40 shrink-0">
                  📅
                </div>

                <div className="min-w-0">
                  <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-2.5 py-1 rounded-full">
                    Customer Portal
                  </span>

                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
                    Book an Appointment
                  </h1>

                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Choose your preferred service,
                    professional stylist, date and
                    convenient time slot.
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* =================================================
              SUCCESS ALERT
          ================================================= */}

          {message && (
            <div className="mb-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-sm text-emerald-800 dark:text-emerald-300 shadow-sm flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
                ✅
              </span>

              <div className="mt-1 font-medium leading-relaxed">
                {message}
              </div>
            </div>
          )}

          {/* =================================================
              ERROR ALERT
          ================================================= */}

          {error && (
            <div className="mb-5 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-sm text-rose-800 dark:text-rose-300 shadow-sm flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
                ⚠️
              </span>

              <div className="mt-1 font-medium leading-relaxed">
                {error}
              </div>
            </div>
          )}

          {/* =================================================
              MAIN FORM CARD
          ================================================= */}

          <form
            onSubmit={handleBooking}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_5px_25px_rgba(15,23,42,0.05)] border border-slate-100 dark:border-slate-800 p-4 sm:p-6 lg:p-7 space-y-6"
          >

            {/* =================================================
                SERVICE
            ================================================= */}

            <div className="space-y-2.5">

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Select Service
              </label>

              <select
                value={serviceId}
                onChange={(e) =>
                  setServiceId(e.target.value)
                }
                className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 dark:hover:border-slate-600"
              >
                <option value="">
                  -- Choose a service --
                </option>

                {services.map((service) => (
                  <option
                    key={service.id}
                    value={service.id}
                  >
                    {service.name}{" "}
                    {service.price !==
                    undefined
                      ? `(Rs. ${service.price})`
                      : ""}
                  </option>
                ))}
              </select>

              {services.length === 0 && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pt-1">
                  No services available right
                  now.
                </p>
              )}

            </div>

            {/* =================================================
                STAFF
            ================================================= */}

            <div className="space-y-2.5">

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Select Staff Member
              </label>

              <select
                value={staffId}
                onChange={(e) =>
                  setStaffId(e.target.value)
                }
                className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 dark:hover:border-slate-600"
              >
                <option value="">
                  -- Choose a professional --
                </option>

                {staff.map((person) => (
                  <option
                    key={person.id}
                    value={person.id}
                  >
                    {person.name}
                  </option>
                ))}
              </select>

              {staff.length === 0 && (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium pt-1">
                  No available staff for
                  this date.
                </p>
              )}

            </div>

            {/* =================================================
                DATE
            ================================================= */}

            <div className="space-y-2.5">

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Appointment Date
              </label>

              <input
                type="date"
                value={date}
                min={todayString}
                onChange={handleDateChange}
                className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 dark:hover:border-slate-600"
              />

              {date && (
                <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 space-y-2">

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Day:{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {getDayNameFromDate(
                        date
                      )}
                    </span>
                  </p>

                  {selectedBusinessHour && (
                    <div>

                      {selectedBusinessHour.type ===
                        "CLOSED" && (
                        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-start gap-2 leading-relaxed">
                          <span>🔴</span>

                          <span>
                            {selectedBusinessHour.reason ||
                              "Salon is closed on this date."}
                          </span>
                        </p>
                      )}

                      {selectedBusinessHour.type ===
                        "NORMAL" && (
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed">
                          <span>🕒</span>

                          <span>
                            Working Hours:{" "}
                            <span className="text-slate-900 dark:text-white">
                              {normalizeTime(
                                selectedBusinessHour.openTime
                              )}{" "}
                              -{" "}
                              {normalizeTime(
                                selectedBusinessHour.closeTime
                              )}
                            </span>
                          </span>
                        </p>
                      )}

                      {selectedBusinessHour.type ===
                        "FULL_DAY" && (
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                          <span>🟢</span>

                          <span>
                            Special Schedule:
                            Open 24 Hours
                          </span>
                        </p>
                      )}

                    </div>
                  )}

                  {!selectedBusinessHour && (
                    <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                      Business hours are not
                      set for this date.
                    </p>
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                TIME
            ================================================= */}

            <div className="space-y-2.5">

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Appointment Time Slot
              </label>

              {!serviceId || !date ? (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3.5">
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic leading-relaxed">
                    Please select a service
                    and date to view available
                    time slots.
                  </p>
                </div>
              ) : loadingSlots ? (
                <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-4 py-3.5">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                    Fetching available
                    slots...
                  </p>
                </div>
              ) : availableSlots.length ===
                0 ? (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 px-4 py-3.5">
                  <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                    No available time slots
                    found for this
                    selection.
                  </p>
                </div>
              ) : (
                <select
                  value={time}
                  onChange={(e) =>
                    setTime(e.target.value)
                  }
                  className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-none transition-all focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 dark:hover:border-slate-600"
                >
                  <option value="">
                    -- Choose a time slot --
                  </option>

                  {availableSlots.map(
                    (slot) => (
                      <option
                        key={slot.time}
                        value={slot.time}
                      >
                        {slot.time}{" "}
                        {slot.endTime
                          ? `- ${slot.endTime}`
                          : ""}
                      </option>
                    )
                  )}
                </select>
              )}

              {time && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />

                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Selected Time: {time}
                  </p>
                </div>
              )}

            </div>

            {/* =================================================
                PAYMENT METHOD
            ================================================= */}

            <div className="space-y-2.5">

              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Payment Method
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">

                {[
                  {
                    id: "PAY_AT_SALON",
                    label: "Pay at Salon",
                  },
                  {
                    id: "EASYPAISA",
                    label: "Easypaisa",
                  },
                  {
                    id: "JAZZCASH",
                    label: "JazzCash",
                  },
                  {
                    id: "SADAPAY",
                    label: "SadaPay",
                  },
                  {
                    id: "CARD",
                    label:
                      "Debit / Credit Card",
                  },
                  {
                    id: "BANK_TRANSFER",
                    label:
                      "Bank Transfer",
                  },
                  {
                    id: "RAAST",
                    label: "Raast",
                  },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 min-h-[52px] cursor-pointer transition-all ${
                      paymentMethod ===
                      method.id
                        ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/10 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800"
                    }`}
                  >

                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={
                        paymentMethod ===
                        method.id
                      }
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value
                        )
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 shrink-0"
                    />

                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {method.label}
                    </span>

                  </label>
                ))}

              </div>

            </div>

            {/* =================================================
                SUBMIT BUTTON
            ================================================= */}

            <button
              type="submit"
              disabled={
                booking ||
                services.length === 0 ||
                staff.length === 0 ||
                !date ||
                !selectedBusinessHour ||
                selectedBusinessHour.type ===
                  "CLOSED"
              }
              className="w-full min-h-[50px] rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/40 transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-950/50 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none"
            >
              {booking
                ? "Processing Booking..."
                : "Confirm & Book Appointment"}
            </button>

          </form>

        </div>
      </div>

      <style jsx>{`
        @keyframes toastProgress {
          from {
            width: 0%;
          }

          to {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          input[type="date"] {
            font-size: 16px;
          }

          select {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}

