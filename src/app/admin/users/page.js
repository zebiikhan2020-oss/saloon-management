"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [profileLoading, setProfileLoading] = useState(null);

  // ===============================
  // PAGINATION
  // ===============================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ===============================
  // DARK MODE
  // ===============================
  const [darkMode, setDarkMode] = useState(false);

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

  // ===============================
  // FETCH USERS
  // ===============================
  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error("FETCH USERS ERROR:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===============================
  // BLOCK / UNBLOCK
  // ===============================
  async function handleToggleBlock(user) {
    try {
      setActionLoading(user.id);
      setMessage("");
      setError("");

      const newBlockedStatus = !user.isBlocked;

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          isBlocked: newBlockedStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update user");
      }

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? {
                ...item,
                isBlocked: newBlockedStatus,
              }
            : item
        )
      );

      setMessage(
        newBlockedStatus
          ? `${user.name} has been blocked successfully.`
          : `${user.name} has been unblocked successfully.`
      );

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("BLOCK/UNBLOCK ERROR:", err);
      setError(err.message || "Failed to update user");
      setTimeout(() => setError(""), 3000);
    } finally {
      setActionLoading(null);
    }
  }

  // ===============================
  // VIEW STAFF PROFILE
  // ===============================
  async function handleViewProfile(staffId) {
    try {
      setProfileLoading(staffId);
      setError("");

      const res = await fetch(
        `/api/admin/staff/profile?staffId=${staffId}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to fetch staff profile"
        );
      }

      setSelectedStaff(data.staff);
    } catch (err) {
      console.error("VIEW STAFF PROFILE ERROR:", err);
      setError(err.message || "Failed to load staff profile");
      setTimeout(() => setError(""), 3000);
    } finally {
      setProfileLoading(null);
    }
  }

  // ===============================
  // FILTER USERS
  // ===============================
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        user.name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText);

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && !user.isBlocked) ||
        (statusFilter === "BLOCKED" && user.isBlocked);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // ===============================
  // RESET PAGE WHEN FILTER CHANGES
  // ===============================
  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter]);

  // ===============================
  // PAGINATION CALCULATIONS
  // ===============================
  const totalPages = Math.ceil(
    filteredUsers.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const currentUsers = filteredUsers.slice(
    startIndex,
    endIndex
  );

  // ===============================
  // COUNTS
  // ===============================
  const totalUsers = users.length;

  const totalCustomers = users.filter(
    (user) => user.role === "CUSTOMER"
  ).length;

  const totalStaff = users.filter(
    (user) => user.role === "STAFF"
  ).length;

  const blockedUsers = users.filter(
    (user) => user.isBlocked
  ).length;

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-4 sm:py-6 ${
        darkMode ? "bg-slate-950 text-slate-100" : ""
      }`}
    >
      {/* ===============================
          HEADER
      =============================== */}
      <div
        className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-5 mb-5 sm:mb-6 ${
          darkMode
            ? "border-slate-800"
            : "border-slate-100"
        }`}
      >
        <div className="min-w-0">
          <span
            className={`inline-flex text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              darkMode
                ? "text-blue-400 bg-blue-500/15"
                : "text-blue-600 bg-blue-50"
            }`}
          >
            User Management
          </span>

          <h1
            className={`text-xl sm:text-2xl font-bold mt-2 ${
              darkMode
                ? "text-slate-100"
                : "text-slate-900"
            }`}
          >
            Customers & Staff
          </h1>

          <p
            className={`text-xs sm:text-sm mt-1 ${
              darkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            Manage account roles, permissions, and monitor
            user statuses.
          </p>
        </div>
      </div>

      {/* ===============================
          MESSAGES
      =============================== */}
      {message && (
        <div
          className={`mb-4 flex items-start sm:items-center gap-3 rounded-2xl border px-4 py-3 text-xs sm:text-sm shadow-sm ${
            darkMode
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-emerald-200/60 bg-emerald-50 text-emerald-700"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              darkMode
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-emerald-100 text-emerald-600"
            }`}
          >
            ✓
          </span>

          <span>{message}</span>
        </div>
      )}

      {error && (
        <div
          className={`mb-4 flex items-start sm:items-center gap-3 rounded-2xl border px-4 py-3 text-xs sm:text-sm shadow-sm ${
            darkMode
              ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
              : "border-rose-200/60 bg-rose-50 text-rose-700"
          }`}
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              darkMode
                ? "bg-rose-500/15 text-rose-400"
                : "bg-rose-100 text-rose-600"
            }`}
          >
            ✕
          </span>

          <span>{error}</span>
        </div>
      )}

      {/* ===============================
          STAT CARDS
      =============================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 sm:mb-6">

        {/* TOTAL USERS */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 ${
            darkMode
              ? "bg-blue-500/10 border-blue-500/20"
              : "bg-blue-50/60 border-blue-100/80"
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div
              className={`p-2 rounded-lg text-sm sm:text-base ${
                darkMode
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              👥
            </div>

            <p
              className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                darkMode
                  ? "text-blue-400"
                  : "text-blue-700"
              }`}
            >
              Total Users
            </p>
          </div>

          <h2
            className={`text-xl sm:text-2xl font-bold ${
              darkMode
                ? "text-slate-100"
                : "text-slate-900"
            }`}
          >
            {totalUsers}
          </h2>
        </div>

        {/* CUSTOMERS */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 ${
            darkMode
              ? "bg-sky-500/10 border-sky-500/20"
              : "bg-sky-50/60 border-sky-100/80"
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div
              className={`p-2 rounded-lg text-sm sm:text-base ${
                darkMode
                  ? "bg-sky-500/15 text-sky-400"
                  : "bg-sky-100 text-sky-600"
              }`}
            >
              🛍️
            </div>

            <p
              className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                darkMode
                  ? "text-sky-400"
                  : "text-sky-700"
              }`}
            >
              Customers
            </p>
          </div>

          <h2
            className={`text-xl sm:text-2xl font-bold ${
              darkMode
                ? "text-slate-100"
                : "text-slate-900"
            }`}
          >
            {totalCustomers}
          </h2>
        </div>

        {/* STAFF */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 ${
            darkMode
              ? "bg-emerald-500/10 border-emerald-500/20"
              : "bg-emerald-50/60 border-emerald-100/80"
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div
              className={`p-2 rounded-lg text-sm sm:text-base ${
                darkMode
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              ✂️
            </div>

            <p
              className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                darkMode
                  ? "text-emerald-400"
                  : "text-emerald-700"
              }`}
            >
              Staff Members
            </p>
          </div>

          <h2
            className={`text-xl sm:text-2xl font-bold ${
              darkMode
                ? "text-slate-100"
                : "text-slate-900"
            }`}
          >
            {totalStaff}
          </h2>
        </div>

        {/* BLOCKED */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 ${
            darkMode
              ? "bg-rose-500/10 border-rose-500/20"
              : "bg-rose-50/60 border-rose-100/80"
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div
              className={`p-2 rounded-lg text-sm sm:text-base ${
                darkMode
                  ? "bg-rose-500/15 text-rose-400"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              🚫
            </div>

            <p
              className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
                darkMode
                  ? "text-rose-400"
                  : "text-rose-700"
              }`}
            >
              Blocked
            </p>
          </div>

          <h2
            className={`text-xl sm:text-2xl font-bold ${
              darkMode
                ? "text-rose-400"
                : "text-rose-600"
            }`}
          >
            {blockedUsers}
          </h2>
        </div>
      </div>

      {/* ===============================
          FILTERS & SEARCH
      =============================== */}
      <div
        className={`rounded-2xl shadow-sm border p-4 sm:p-5 mb-5 sm:mb-6 ${
          darkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-100"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* SEARCH */}
          <div className="md:col-span-6">
            <label
              className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              Search Directory
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
                placeholder="Search by name or email address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                  darkMode
                    ? "bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:bg-slate-800"
                    : "bg-slate-50/50 border border-slate-200/80 text-slate-900 focus:bg-white"
                }`}
              />
            </div>
          </div>

          {/* ROLE */}
          <div className="md:col-span-3">
            <label
              className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              Filter By Role
            </label>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                darkMode
                  ? "bg-slate-800 border border-slate-700 text-slate-100"
                  : "bg-slate-50/50 border border-slate-200/80 text-slate-900 focus:bg-white"
              }`}
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Customers Only</option>
              <option value="STAFF">Staff Only</option>
            </select>
          </div>

          {/* STATUS */}
          <div className="md:col-span-3">
            <label
              className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              Filter By Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition ${
                darkMode
                  ? "bg-slate-800 border border-slate-700 text-slate-100"
                  : "bg-slate-50/50 border border-slate-200/80 text-slate-900 focus:bg-white"
              }`}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Users</option>
              <option value="BLOCKED">Blocked Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* ===============================
          USER RECORDS
      =============================== */}
      <div
        className={`rounded-2xl shadow-sm border overflow-hidden ${
          darkMode
            ? "bg-slate-900 border-slate-800"
            : "bg-white border-slate-100"
        }`}
      >
        <div
          className={`px-4 sm:px-5 py-4 border-b flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 ${
            darkMode
              ? "border-slate-800 bg-slate-800/40"
              : "border-slate-100 bg-slate-50/30"
          }`}
        >
          <h2
            className={`text-sm font-bold ${
              darkMode
                ? "text-slate-200"
                : "text-slate-800"
            }`}
          >
            User Records
          </h2>

          <span
            className={`w-fit text-[10px] sm:text-[11px] font-semibold px-2 py-1 rounded-md ${
              darkMode
                ? "text-slate-400 bg-slate-800"
                : "text-slate-500 bg-slate-100"
            }`}
          >
            Showing {filteredUsers.length} results
          </span>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="py-14 sm:py-16 text-center">
            <div
              className={`animate-spin h-7 w-7 border-2 border-t-blue-500 rounded-full mx-auto mb-3 ${
                darkMode
                  ? "border-slate-700"
                  : "border-slate-200"
              }`}
            />

            <p
              className={`text-xs sm:text-sm font-medium ${
                darkMode
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              Loading user data...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          /* EMPTY */
          <div className="py-14 sm:py-16 text-center px-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl ${
                darkMode
                  ? "bg-slate-800 text-slate-500"
                  : "bg-slate-50 text-slate-400"
              }`}
            >
              🤷‍♂️
            </div>

            <h3
              className={`font-semibold text-sm ${
                darkMode
                  ? "text-slate-200"
                  : "text-slate-800"
              }`}
            >
              No users found
            </h3>

            <p
              className={`mt-1 text-xs ${
                darkMode
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              Try adjusting your search query or filter settings.
            </p>
          </div>
        ) : (
          <>
            {/* ===============================
                DESKTOP TABLE
            =============================== */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr
                    className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                      darkMode
                        ? "bg-slate-800/50 border-slate-800 text-slate-500"
                        : "bg-slate-50/70 border-slate-100 text-slate-400"
                    }`}
                  >
                    <th className="px-5 py-4">
                      User Details
                    </th>

                    <th className="px-5 py-4">
                      Role
                    </th>

                    <th className="px-5 py-4">
                      Email Status
                    </th>

                    <th className="px-5 py-4">
                      Account Status
                    </th>

                    <th className="px-5 py-4 text-right">
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
                  {currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`transition ${
                        darkMode
                          ? "hover:bg-slate-800/40"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      {/* USER */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                              darkMode
                                ? "bg-blue-500/15 text-blue-400"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`font-semibold text-sm ${
                                darkMode
                                  ? "text-slate-100"
                                  : "text-slate-900"
                              }`}
                            >
                              {user.name}
                            </p>

                            <p
                              className={`truncate max-w-[220px] ${
                                darkMode
                                  ? "text-slate-500"
                                  : "text-slate-500"
                              }`}
                            >
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border ${
                            user.role === "STAFF"
                              ? darkMode
                                ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                                : "bg-indigo-50 text-indigo-600 border-indigo-200/60"
                              : darkMode
                              ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                              : "bg-sky-50 text-sky-600 border-sky-200/60"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />

                          {user.role === "STAFF"
                            ? "Staff"
                            : "Customer"}
                        </span>
                      </td>

                      {/* EMAIL */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {user.isEmailVerified ? (
                          <span
                            className={`font-medium flex items-center gap-1.5 ${
                              darkMode
                                ? "text-emerald-400"
                                : "text-emerald-600"
                            }`}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>

                            Verified
                          </span>
                        ) : (
                          <span
                            className={`font-medium flex items-center gap-1.5 ${
                              darkMode
                                ? "text-amber-400"
                                : "text-amber-500"
                            }`}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>

                            Pending
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {user.isBlocked ? (
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                              darkMode
                                ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                : "bg-rose-50 text-rose-600 border-rose-100"
                            }`}
                          >
                            Blocked
                          </span>
                        ) : (
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                              darkMode
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                            }`}
                          >
                            Active
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {user.role === "STAFF" && (
                            <button
                              onClick={() =>
                                handleViewProfile(user.id)
                              }
                              disabled={
                                profileLoading === user.id
                              }
                              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                darkMode
                                  ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-blue-400"
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                              }`}
                            >
                              {profileLoading === user.id
                                ? "Loading..."
                                : "Profile"}
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleToggleBlock(user)
                            }
                            disabled={
                              actionLoading === user.id
                            }
                            className={`rounded-xl px-3 py-1.5 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              user.isBlocked
                                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                : "bg-rose-600 text-white hover:bg-rose-700"
                            }`}
                          >
                            {actionLoading === user.id
                              ? "Wait..."
                              : user.isBlocked
                              ? "Unblock"
                              : "Block"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===============================
                MOBILE CARDS
            =============================== */}
            <div
              className={`md:hidden divide-y ${
                darkMode
                  ? "divide-slate-800"
                  : "divide-slate-100"
              }`}
            >
              {currentUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 sm:p-5 transition ${
                    darkMode
                      ? "hover:bg-slate-800/40"
                      : "hover:bg-slate-50/50"
                  }`}
                >
                  {/* TOP */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold ${
                          darkMode
                            ? "bg-blue-500/15 text-blue-400"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {user.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`font-semibold text-sm truncate ${
                            darkMode
                              ? "text-slate-100"
                              : "text-slate-900"
                          }`}
                        >
                          {user.name}
                        </p>

                        <p
                          className={`text-xs truncate ${
                            darkMode
                              ? "text-slate-500"
                              : "text-slate-500"
                          }`}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {user.isBlocked ? (
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          darkMode
                            ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                            : "bg-rose-50 border-rose-100 text-rose-600"
                        }`}
                      >
                        Blocked
                      </span>
                    ) : (
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          darkMode
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                            : "bg-emerald-50 border-emerald-100 text-emerald-600"
                        }`}
                      >
                        Active
                      </span>
                    )}
                  </div>

                  {/* DETAILS */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div
                      className={`rounded-xl border p-3 ${
                        darkMode
                          ? "bg-slate-800/60 border-slate-700"
                          : "bg-slate-50/80 border-slate-100"
                      }`}
                    >
                      <p
                        className={`text-[10px] uppercase font-bold tracking-wider ${
                          darkMode
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        Role
                      </p>

                      <p
                        className={`mt-1 text-xs font-semibold ${
                          user.role === "STAFF"
                            ? darkMode
                              ? "text-indigo-400"
                              : "text-indigo-600"
                            : darkMode
                            ? "text-sky-400"
                            : "text-sky-600"
                        }`}
                      >
                        {user.role === "STAFF"
                          ? "Staff Member"
                          : "Customer"}
                      </p>
                    </div>

                    <div
                      className={`rounded-xl border p-3 ${
                        darkMode
                          ? "bg-slate-800/60 border-slate-700"
                          : "bg-slate-50/80 border-slate-100"
                      }`}
                    >
                      <p
                        className={`text-[10px] uppercase font-bold tracking-wider ${
                          darkMode
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        Email Status
                      </p>

                      <p
                        className={`mt-1 text-xs font-semibold ${
                          user.isEmailVerified
                            ? darkMode
                              ? "text-emerald-400"
                              : "text-emerald-600"
                            : darkMode
                            ? "text-amber-400"
                            : "text-amber-500"
                        }`}
                      >
                        {user.isEmailVerified
                          ? "Verified"
                          : "Pending"}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-4 flex flex-col xs:flex-row gap-2">
                    {user.role === "STAFF" && (
                      <button
                        onClick={() =>
                          handleViewProfile(user.id)
                        }
                        disabled={
                          profileLoading === user.id
                        }
                        className={`flex-1 rounded-xl border px-4 py-2.5 text-xs font-semibold shadow-sm transition disabled:opacity-50 ${
                          darkMode
                            ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-blue-400"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                        }`}
                      >
                        {profileLoading === user.id
                          ? "Loading..."
                          : "View Profile"}
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleToggleBlock(user)
                      }
                      disabled={
                        actionLoading === user.id
                      }
                      className={`flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50 ${
                        user.isBlocked
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-rose-600 hover:bg-rose-700"
                      }`}
                    >
                      {actionLoading === user.id
                        ? "Wait..."
                        : user.isBlocked
                        ? "Unblock User"
                        : "Block User"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ===============================
                PAGINATION
            =============================== */}
            {!loading && totalPages > 1 && (
              <div
                className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t ${
                  darkMode
                    ? "border-slate-800"
                    : "border-slate-100"
                }`}
              >
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

      {/* ===============================
          STAFF PROFILE MODAL
      =============================== */}
      {selectedStaff && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-4"
          onClick={() => setSelectedStaff(null)}
        >
          <div
            className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl ${
              darkMode
                ? "bg-slate-900"
                : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div
              className={`flex items-center justify-between border-b px-4 sm:px-6 py-4 sm:py-5 ${
                darkMode
                  ? "border-slate-800 bg-slate-800/40"
                  : "border-slate-100 bg-slate-50/50"
              }`}
            >
              <div className="min-w-0">
                <h2
                  className={`text-base sm:text-lg font-bold ${
                    darkMode
                      ? "text-slate-100"
                      : "text-slate-900"
                  }`}
                >
                  Staff Profile
                </h2>

                <p
                  className={`text-[11px] sm:text-xs mt-0.5 ${
                    darkMode
                      ? "text-slate-500"
                      : "text-slate-500"
                  }`}
                >
                  Professional details and expertise
                </p>
              </div>

              <button
                onClick={() => setSelectedStaff(null)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                  darkMode
                    ? "bg-slate-800 text-slate-400 hover:bg-rose-500/15 hover:text-rose-400"
                    : "bg-slate-200/50 text-slate-500 hover:bg-rose-100 hover:text-rose-600"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-4 sm:p-8">

              {/* PROFILE HEADER */}
              <div className="flex flex-col items-center text-center">
                {selectedStaff.staffProfile?.profilePicture ? (
                  <img
                    src={
                      selectedStaff.staffProfile
                        .profilePicture
                    }
                    alt={selectedStaff.name}
                    className={`h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 object-cover shadow-sm ${
                      darkMode
                        ? "border-blue-500/20"
                        : "border-blue-50"
                    }`}
                  />
                ) : (
                  <div
                    className={`flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full text-2xl sm:text-3xl font-bold shadow-sm border-4 ${
                      darkMode
                        ? "bg-blue-500/15 text-blue-400 border-blue-500/20"
                        : "bg-blue-100 text-blue-600 border-blue-50"
                    }`}
                  >
                    {(
                      selectedStaff.staffProfile
                        ?.fullName ||
                      selectedStaff.name ||
                      "S"
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <h3
                  className={`mt-4 text-lg sm:text-xl font-bold ${
                    darkMode
                      ? "text-slate-100"
                      : "text-slate-900"
                  }`}
                >
                  {selectedStaff.staffProfile?.fullName ||
                    selectedStaff.name ||
                    "No Name"}
                </h3>

                <p
                  className={`mt-1 text-xs sm:text-sm font-medium px-3 py-1 rounded-full ${
                    darkMode
                      ? "text-blue-400 bg-blue-500/15"
                      : "text-blue-600 bg-blue-50"
                  }`}
                >
                  {selectedStaff.staffProfile?.profession ||
                    "Staff Member"}
                </p>
              </div>

              {/* BASIC INFORMATION */}
              <div className="mt-7 sm:mt-8">
                <h4
                  className={`mb-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-b pb-2 ${
                    darkMode
                      ? "text-slate-500 border-slate-800"
                      : "text-slate-400 border-slate-100"
                  }`}
                >
                  Basic Information
                </h4>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div
                    className={`rounded-xl border p-3.5 sm:p-4 ${
                      darkMode
                        ? "bg-slate-800/60 border-slate-700"
                        : "bg-slate-50/70 border-slate-100"
                    }`}
                  >
                    <p
                      className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold ${
                        darkMode
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      Email Address
                    </p>

                    <p
                      className={`mt-1 break-all text-xs sm:text-sm font-semibold ${
                        darkMode
                          ? "text-slate-200"
                          : "text-slate-800"
                      }`}
                    >
                      {selectedStaff.staffProfile?.email ||
                        selectedStaff.email ||
                        "Not provided"}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border p-3.5 sm:p-4 ${
                      darkMode
                        ? "bg-slate-800/60 border-slate-700"
                        : "bg-slate-50/70 border-slate-100"
                    }`}
                  >
                    <p
                      className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold ${
                        darkMode
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      Phone Number
                    </p>

                    <p
                      className={`mt-1 text-xs sm:text-sm font-semibold ${
                        darkMode
                          ? "text-slate-200"
                          : "text-slate-800"
                      }`}
                    >
                      {selectedStaff.staffProfile?.phoneNumber ||
                        "Not provided"}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border p-3.5 sm:p-4 ${
                      darkMode
                        ? "bg-slate-800/60 border-slate-700"
                        : "bg-slate-50/70 border-slate-100"
                    }`}
                  >
                    <p
                      className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold ${
                        darkMode
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      Experience
                    </p>

                    <p
                      className={`mt-1 text-xs sm:text-sm font-semibold ${
                        darkMode
                          ? "text-slate-200"
                          : "text-slate-800"
                      }`}
                    >
                      {selectedStaff.staffProfile
                        ?.yearsOfExperience !== null &&
                      selectedStaff.staffProfile
                        ?.yearsOfExperience !== undefined
                        ? `${selectedStaff.staffProfile.yearsOfExperience} ${
                            selectedStaff.staffProfile
                              .yearsOfExperience === 1
                              ? "Year"
                              : "Years"
                          }`
                        : "Not provided"}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border p-3.5 sm:p-4 ${
                      darkMode
                        ? "bg-slate-800/60 border-slate-700"
                        : "bg-slate-50/70 border-slate-100"
                    }`}
                  >
                    <p
                      className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-bold ${
                        darkMode
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      Account Status
                    </p>

                    <p
                      className={`mt-1 text-xs sm:text-sm font-bold ${
                        selectedStaff.isBlocked
                          ? darkMode
                            ? "text-rose-400"
                            : "text-rose-600"
                          : darkMode
                          ? "text-emerald-400"
                          : "text-emerald-600"
                      }`}
                    >
                      {selectedStaff.isBlocked
                        ? "Temporarily Blocked"
                        : "Active & Verified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* EXPERTISE & SERVICES */}
              <div className="mt-7 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4
                    className={`mb-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-b pb-2 ${
                      darkMode
                        ? "text-slate-500 border-slate-800"
                        : "text-slate-400 border-slate-100"
                    }`}
                  >
                    Expertise
                  </h4>

                  {selectedStaff.staffProfile?.expertise
                    ?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedStaff.staffProfile.expertise.map(
                        (item, index) => (
                          <span
                            key={index}
                            className={`rounded-md border px-2.5 py-1 text-[11px] sm:text-xs font-semibold ${
                              darkMode
                                ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                                : "bg-indigo-50 border-indigo-100 text-indigo-700"
                            }`}
                          >
                            {item}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p
                      className={`text-xs italic ${
                        darkMode
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      No expertise added yet.
                    </p>
                  )}
                </div>

                <div>
                  <h4
                    className={`mb-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-b pb-2 ${
                      darkMode
                        ? "text-slate-500 border-slate-800"
                        : "text-slate-400 border-slate-100"
                    }`}
                  >
                    Specialized Services
                  </h4>

                  {selectedStaff.staffProfile
                    ?.specializedServices?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedStaff.staffProfile.specializedServices.map(
                        (item, index) => (
                          <span
                            key={index}
                            className={`rounded-md border px-2.5 py-1 text-[11px] sm:text-xs font-semibold ${
                              darkMode
                                ? "bg-sky-500/15 border-sky-500/30 text-sky-400"
                                : "bg-sky-50 border-sky-100 text-sky-700"
                            }`}
                          >
                            {item}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p
                      className={`text-xs italic ${
                        darkMode
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      No services linked yet.
                    </p>
                  )}
                </div>
              </div>

              {/* BIO */}
              <div className="mt-7 sm:mt-8">
                <h4
                  className={`mb-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border-b pb-2 ${
                    darkMode
                      ? "text-slate-500 border-slate-800"
                      : "text-slate-400 border-slate-100"
                  }`}
                >
                  Professional Bio
                </h4>

                <div
                  className={`rounded-2xl border p-4 sm:p-5 ${
                    darkMode
                      ? "bg-slate-800/60 border-slate-700"
                      : "bg-slate-50/70 border-slate-100"
                  }`}
                >
                  <p
                    className={`whitespace-pre-line text-xs sm:text-sm leading-relaxed ${
                      darkMode
                        ? "text-slate-300"
                        : "text-slate-600"
                    }`}
                  >
                    {selectedStaff.staffProfile?.bio || (
                      <span
                        className={`italic ${
                          darkMode
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        This staff member hasn't added a bio yet.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div
              className={`border-t px-4 sm:px-6 py-4 flex justify-end ${
                darkMode
                  ? "border-slate-800 bg-slate-800/40"
                  : "border-slate-100 bg-slate-50/50"
              }`}
            >
              <button
                onClick={() => setSelectedStaff(null)}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-5 sm:px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}