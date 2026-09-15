"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "../(public)/components/ThemeProvider";

export default function CustomerLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const { theme, toggleTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] =
    useState(false);

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.log(
          "NOTIFICATION API ERROR:",
          data
        );
        return;
      }

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.log(
        "NOTIFICATION FETCH ERROR:",
        error
      );
    }
  };

  // =====================================================
  // MARK SINGLE NOTIFICATION
  // =====================================================

  const markNotificationRead = async (
    notification
  ) => {
    try {
      if (!notification.isRead) {
        const res = await fetch(
          "/api/notifications",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: notification.id,
            }),
          }
        );

        const data = await res.json();

        if (res.ok && data.success) {
          setNotifications((prev) =>
            prev.map((item) =>
              item.id === notification.id
                ? {
                    ...item,
                    isRead: true,
                  }
                : item
            )
          );

          setUnreadCount((prev) =>
            prev > 0 ? prev - 1 : 0
          );
        }
      }

      if (notification.appointmentId) {
        setShowNotifications(false);

        router.push(
          `/customer/appointment/${notification.appointmentId}`
        );
      }
    } catch (error) {
      console.log(
        "NOTIFICATION CLICK ERROR:",
        error
      );
    }
  };

  // =====================================================
  // MARK ALL READ
  // =====================================================

  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch(
        "/api/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            markAll: true,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );

        setUnreadCount(0);
      }
    } catch (error) {
      console.log(
        "MARK ALL NOTIFICATIONS ERROR:",
        error
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.log("LOGOUT ERROR:", error);
    }
  };

  // =====================================================
  // ACTIVE LINK
  // =====================================================

  const isActive = (path) => {
    return pathname === path;
  };

  // =====================================================
  // NAV LINK CLASS
  // =====================================================

  const navClass = (path) => {
    return [
      "group",
      "flex items-center",
      sidebarCollapsed
        ? "lg:justify-center lg:gap-0"
        : "justify-start gap-3",
      "px-4 py-2.5",
      "rounded-xl",
      "text-sm font-medium",
      "transition-all duration-200",
      "relative",
      isActive(path)
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/40"
        : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400",
    ].join(" ");
  };

  // =====================================================
  // NAV ITEM
  // =====================================================

  const NavItem = ({ href, icon, label }) => {
    return (
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={navClass(href)}
      >
        <span className="text-base shrink-0">
          {icon}
        </span>

        {/* DESKTOP NORMAL */}

        {!sidebarCollapsed && (
          <span className="hidden lg:block truncate">
            {label}
          </span>
        )}

        {/* MOBILE LABEL */}

        <span className="lg:hidden truncate ml-3">
          {label}
        </span>

        {/* COLLAPSED TOOLTIP - DESKTOP ONLY */}

        {sidebarCollapsed && (
          <span className="hidden lg:block pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] shadow-xl">
            {label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={[
          "fixed top-0 left-0 right-auto z-50 h-screen overflow-visible",
          "w-64",
          sidebarCollapsed
            ? "lg:w-20"
            : "lg:w-64",
          "bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800",
          "flex flex-col transform transition-all duration-300",
          "lg:translate-x-0",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full",
          "shadow-[4px_0_20px_rgba(15,23,42,0.04)] dark:shadow-black/20",
        ].join(" ")}
      >

        {/* =================================================
            SIDEBAR TOP
        ================================================= */}

        <div className="shrink-0">

          {/* SIDEBAR HEADER */}

          <div
            className={[
              "p-5 border-b border-slate-100 dark:border-slate-800 flex items-center",
              sidebarCollapsed
                ? "lg:justify-center justify-between"
                : "justify-between",
            ].join(" ")}
          >

            {/* LOGO */}

            <div
              className={[
                "flex items-center",
                sidebarCollapsed
                  ? "lg:justify-center lg:gap-0 gap-3.5"
                  : "gap-3.5",
              ].join(" ")}
            >

              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-md shadow-indigo-100 dark:shadow-indigo-950/40 shrink-0">
                S
              </div>

              {/* DESKTOP NORMAL */}

              {!sidebarCollapsed && (
                <div className="hidden lg:block">
                  <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                    Salon
                  </h1>

                  <p className="text-slate-400 dark:text-slate-500 text-xs">
                    Management
                  </p>
                </div>
              )}

              {/* MOBILE */}

              <div className="lg:hidden">
                <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                  Salon
                </h1>

                <p className="text-slate-400 dark:text-slate-500 text-xs">
                  Management
                </p>
              </div>

            </div>

            {/* MOBILE CLOSE */}

            <button
              onClick={() =>
                setSidebarOpen(false)
              }
              className="lg:hidden w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center cursor-pointer"
              aria-label="Close sidebar"
            >
              ✕
            </button>

          </div>

          {/* =================================================
              COLLAPSE BUTTON - DESKTOP ONLY
          ================================================= */}

          <div
            className={[
              "p-3",
              sidebarCollapsed
                ? "lg:flex lg:justify-center"
                : "flex justify-end",
            ].join(" ")}
          >

            <button
              onClick={() =>
                setSidebarCollapsed(
                  !sidebarCollapsed
                )
              }
              className="hidden lg:flex w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 items-center justify-center transition cursor-pointer"
              aria-label={
                sidebarCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              {sidebarCollapsed ? "→" : "←"}
            </button>

          </div>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav
          className={[
            "flex-1 min-h-0 px-3 pb-24 space-y-1.5",
            sidebarCollapsed
              ? "overflow-visible"
              : "overflow-y-auto",
          ].join(" ")}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 #ffffff",
          }}
        >

          {/* MAIN */}

          <div
            className={[
              "pt-1 pb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500",
              sidebarCollapsed
                ? "lg:hidden"
                : "",
            ].join(" ")}
          >
            MAIN
          </div>

          <NavItem
            href="/customer/dashboard"
            icon="📊"
            label="Dashboard"
          />

          {/* BOOKINGS */}

          <div
            className={[
              "pt-4 pb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500",
              sidebarCollapsed
                ? "lg:hidden"
                : "",
            ].join(" ")}
          >
            BOOKINGS
          </div>

          <NavItem
            href="/customer/book"
            icon="📅"
            label="Book Appointment"
          />

          <NavItem
            href="/customer/appointment"
            icon="🗓️"
            label="My Appointments"
          />

          <NavItem
            href="/customer/appointment-history"
            icon="📋"
            label="Appointment History"
          />

          {/* STAFF DIRECTORY */}

          <div
            className={[
              "pt-4 pb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500",
              sidebarCollapsed
                ? "lg:hidden"
                : "",
            ].join(" ")}
          >
            STAFF DIRECTORY
          </div>

          <NavItem
            href="/customer/staff-profile"
            icon="👨‍💼"
            label="Staff Profile"
          />

          <NavItem
            href="/customer/portfolio"
            icon="🖼️"
            label="Staff Portfolio"
          />

          <NavItem
            href="/customer/appointment-review"
            icon="⭐"
            label="Reviews"
          />

        </nav>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="shrink-0 p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">

          <button
            onClick={handleLogout}
            className={[
              "group relative w-full flex items-center",
              sidebarCollapsed
                ? "lg:justify-center justify-center"
                : "justify-center gap-2",
              "bg-slate-50 dark:bg-slate-800 text-blue-500 dark:text-blue-400 border border-slate-200 dark:border-slate-700",
              "hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-100 dark:hover:border-slate-600 hover:text-blue-600 dark:hover:text-blue-300",
              "px-4 py-2.5 rounded-xl",
              "transition-all duration-200 text-xs font-semibold cursor-pointer",
            ].join(" ")}
          >

            <span className="text-base">
              🚪
            </span>

            {/* DESKTOP NORMAL */}

            {!sidebarCollapsed && (
              <span className="hidden lg:inline">
                Logout
              </span>
            )}

            {/* MOBILE */}

            <span className="lg:hidden">
              Logout
            </span>

            {/* LOGOUT TOOLTIP */}

            {sidebarCollapsed && (
              <span className="hidden lg:block pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold whitespace-nowrap opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 z-[200] shadow-xl">
                Logout
              </span>
            )}

          </button>

        </div>

      </aside>

      {/* =================================================
          MOBILE OVERLAY
      ================================================= */}

      {sidebarOpen && (
        <div
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 bg-slate-900/30 dark:bg-black/60 backdrop-blur-[2px] z-40 lg:hidden"
        />
      )}

      {/* =================================================
          PAGE CONTENT
      ================================================= */}

      <main
        className={[
          "min-h-screen transition-all duration-300",
          sidebarCollapsed
            ? "lg:ml-20"
            : "lg:ml-64",
        ].join(" ")}
      >

        {/* =================================================
            CUSTOMER HEADER + NOTIFICATIONS
        ================================================= */}

        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-black/20">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
              className="lg:hidden p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              ☰
            </button>

            <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 capitalize">
              {pathname
                ? pathname
                    .split("/")
                    .pop()
                    .replace("-", " ")
                : "Dashboard"}
            </h2>

          </div>

          <div className="flex items-center gap-4">

            {/* DARK / LIGHT THEME */}

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-100 dark:hover:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                theme === "dark"
                  ? "Light mode"
                  : "Dark mode"
              }
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {/* NOTIFICATIONS */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (prev) => !prev
                  )
                }
                className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-100 dark:hover:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
              >
                🔔

                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[360px] max-w-[90vw] bg-white dark:bg-slate-900 rounded-2xl shadow-[0_15px_40px_rgba(15,23,42,0.12)] dark:shadow-black/40 border border-slate-100 dark:border-slate-800 z-[9999] overflow-hidden">

                  {/* DROPDOWN HEADER */}

                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70">

                    <div>

                      <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        Notifications
                      </h2>

                      {unreadCount > 0 && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {unreadCount} unread messages
                        </p>
                      )}

                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={
                          markAllNotificationsRead
                        }
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}

                  </div>

                  {/* NOTIFICATION LIST */}

                  <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">

                    {notifications.length === 0 ? (

                      <div className="text-center py-10 px-4">

                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg mx-auto mb-2">
                          🔔
                        </div>

                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          No notifications yet.
                        </p>

                      </div>

                    ) : (

                      notifications.map(
                        (notification) => (

                          <button
                            key={notification.id}
                            onClick={() =>
                              markNotificationRead(
                                notification
                              )
                            }
                            className={`w-full text-left px-5 py-3.5 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition flex gap-3 ${
                              notification.isRead
                                ? "bg-white dark:bg-slate-900"
                                : "bg-indigo-50/40 dark:bg-indigo-950/30"
                            }`}
                          >

                            <div className="text-base mt-0.5">
                              {notification.type ===
                              "APPOINTMENT"
                                ? "📅"
                                : "🔔"}
                            </div>

                            <div className="flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                                  {notification.title}
                                </h3>

                                {!notification.isRead && (
                                  <span className="w-2 h-2 bg-indigo-600 rounded-full mt-1 flex-shrink-0" />
                                )}

                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                {notification.message}
                              </p>

                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                                {notification.createdAt
                                  ? new Date(
                                      notification.createdAt
                                    ).toLocaleString()
                                  : ""}
                              </p>

                            </div>

                          </button>

                        )
                      )

                    )}

                  </div>

                </div>
              )}

            </div>

            {/* CUSTOMER PROFILE */}

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">

              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-indigo-100 dark:shadow-indigo-950/40">
                CU
              </div>

              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
                Customer
              </span>

            </div>

          </div>

        </header>

        {/* =================================================
            PAGE
        ================================================= */}

        {children}

      </main>

    </div>
  );
}