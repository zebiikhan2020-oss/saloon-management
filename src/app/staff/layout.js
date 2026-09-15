"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "../(public)/components/ThemeProvider";

export default function StaffLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] =
    useState(false);
  const [notificationLoading, setNotificationLoading] =
    useState(false);

  const notificationRef = useRef(null);

  // =====================================================
  // COLLAPSED SIDEBAR HOVER TOOLTIP
  // =====================================================

  const [hoveredItem, setHoveredItem] = useState(null);

  const [hoverPosition, setHoverPosition] = useState({
    top: 0,
    left: 0,
  });

  // =====================================================
  // SIDEBAR SCROLL
  // =====================================================

  const sidebarNavRef = useRef(null);
  const sidebarScrollTop = useRef(0);

  const SIDEBAR_SCROLL_KEY =
    "staff-sidebar-scroll-top";

  // =====================================================
  // GET SAVED SIDEBAR POSITION
  // =====================================================

  const getSavedSidebarScroll = () => {
    try {
      const saved = sessionStorage.getItem(
        SIDEBAR_SCROLL_KEY
      );

      if (saved !== null) {
        const value = Number(saved);

        if (!Number.isNaN(value)) {
          return value;
        }
      }
    } catch (error) {
      console.error(
        "GET STAFF SIDEBAR SCROLL ERROR:",
        error
      );
    }

    return sidebarScrollTop.current || 0;
  };

  // =====================================================
  // SAVE SIDEBAR POSITION
  // =====================================================

  const saveSidebarScrollPosition = () => {
    if (!sidebarNavRef.current) return;

    const position =
      sidebarNavRef.current.scrollTop;

    sidebarScrollTop.current = position;

    try {
      sessionStorage.setItem(
        SIDEBAR_SCROLL_KEY,
        String(position)
      );
    } catch (error) {
      console.error(
        "SAVE STAFF SIDEBAR SCROLL ERROR:",
        error
      );
    }
  };

  // =====================================================
  // RESTORE SIDEBAR POSITION
  // =====================================================

  const restoreSidebarScrollPosition = () => {
    const nav = sidebarNavRef.current;

    if (!nav) return;

    const savedPosition =
      getSavedSidebarScroll();

    sidebarScrollTop.current = savedPosition;

    nav.scrollTop = savedPosition;

    if (
      Math.abs(
        nav.scrollTop - savedPosition
      ) > 1
    ) {
      nav.scrollTo({
        top: savedPosition,
        behavior: "instant",
      });
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      try {
        sessionStorage.removeItem(
          SIDEBAR_SCROLL_KEY
        );
      } catch {}

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.log(
        "Staff logout error:",
        error
      );
    }
  }

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  async function loadNotifications() {
    try {
      setNotificationLoading(true);

      const response = await fetch(
        "/api/notifications",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      if (data.success) {
        const list = Array.isArray(
          data.notifications
        )
          ? data.notifications
          : [];

        setNotifications(list);

        setUnreadCount(
          Number(data.unreadCount || 0)
        );

        return;
      }

      if (Array.isArray(data)) {
        setNotifications(data);

        setUnreadCount(
          data.filter(
            (notification) =>
              !notification.isRead
          ).length
        );

        return;
      }

      if (
        Array.isArray(data.notifications)
      ) {
        const list = data.notifications;

        setNotifications(list);

        setUnreadCount(
          list.filter(
            (notification) =>
              !notification.isRead
          ).length
        );
      }
    } catch (error) {
      console.error(
        "LOAD STAFF NOTIFICATIONS ERROR:",
        error
      );
    } finally {
      setNotificationLoading(false);
    }
  }

  // =====================================================
  // NOTIFICATION POLLING
  // =====================================================

  useEffect(() => {
    let interval;

    const startNotificationPolling = () => {
      loadNotifications();

      interval = setInterval(() => {
        loadNotifications();
      }, 5000);
    };

    const timeout = setTimeout(() => {
      startNotificationPolling();
    }, 0);

    return () => {
      clearTimeout(timeout);

      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  // =====================================================
  // SAVE SCROLL BEFORE PAGE NAVIGATION
  // =====================================================

  useEffect(() => {
    const handlePointerDown = (event) => {
      const link =
        event.target.closest(
          "a[data-staff-sidebar-link]"
        );

      if (!link) return;

      saveSidebarScrollPosition();
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, []);

  // =====================================================
  // RESTORE AFTER PATHNAME CHANGE
  // =====================================================

  useLayoutEffect(() => {
    let timers = [];
    let animationFrames = [];

    const restore = () => {
      restoreSidebarScrollPosition();
    };

    restore();

    const frame1 =
      requestAnimationFrame(() => {
        restore();

        const frame2 =
          requestAnimationFrame(() => {
            restore();
          });

        animationFrames.push(frame2);
      });

    animationFrames.push(frame1);

    timers.push(
      setTimeout(() => {
        restore();
      }, 10)
    );

    timers.push(
      setTimeout(() => {
        restore();
      }, 50)
    );

    timers.push(
      setTimeout(() => {
        restore();
      }, 100)
    );

    timers.push(
      setTimeout(() => {
        restore();
      }, 200)
    );

    timers.push(
      setTimeout(() => {
        restore();
      }, 400)
    );

    timers.push(
      setTimeout(() => {
        restore();
      }, 700)
    );

    return () => {
      animationFrames.forEach((frame) => {
        cancelAnimationFrame(frame);
      });

      timers.forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, [pathname]);

  // =====================================================
  // SAVE SCROLL WHEN COMPONENT LEAVES
  // =====================================================

  useEffect(() => {
    return () => {
      saveSidebarScrollPosition();
    };
  }, []);

  // =====================================================
  // CLOSE NOTIFICATION DROPDOWN
  // =====================================================

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  // =====================================================
  // MARK SINGLE NOTIFICATION AS READ
  // =====================================================

  async function markNotificationAsRead(
    notificationId,
    notification
  ) {
    try {
      const response = await fetch(
        "/api/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: notificationId,
          }),
        }
      );

      if (!response.ok) return;

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );

      setUnreadCount((prev) =>
        Math.max(prev - 1, 0)
      );

      if (
        notification?.appointmentId &&
        notification?.type === "APPOINTMENT"
      ) {
        setShowNotifications(false);

        saveSidebarScrollPosition();

        router.push(
          `/staff/appointment/${notification.appointmentId}`
        );

        return;
      }

      if (
        notification?.type === "REVIEW"
      ) {
        setShowNotifications(false);

        saveSidebarScrollPosition();

        router.push(
          "/staff/appointment-reviews"
        );
      }
    } catch (error) {
      console.error(
        "MARK STAFF NOTIFICATION ERROR:",
        error
      );
    }
  }

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  async function markAllAsRead() {
    try {
      const response = await fetch(
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

      if (!response.ok) {
        const fallback = await fetch(
          "/api/notifications",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              markAllAsRead: true,
            }),
          }
        );

        if (!fallback.ok) return;
      }

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "MARK ALL STAFF NOTIFICATIONS ERROR:",
        error
      );
    }
  }

  // =====================================================
  // NOTIFICATION TIME
  // =====================================================

  function formatNotificationTime(date) {
    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return "";
    }

    return d.toLocaleString();
  }

  // =====================================================
  // MENU ITEMS
  // =====================================================

  const menuItems = [
    {
      href: "/staff/dashboard",
      label: "Dashboard",
      icon: "📊",
    },
    {
      href: "/staff/appointment",
      label: "Appointments",
      icon: "📅",
    },
    {
      href: "/staff/appointment-reviews",
      label: "Appointment Reviews",
      icon: "⭐",
    },
    {
      href: "/staff/appointment-history",
      label: "Appointment History",
      icon: "📜",
    },
    {
      href: "/staff/attendance",
      label: "Attendance",
      icon: "🕘",
    },
    {
      href: "/staff/availability",
      label: "Availability",
      icon: "🟢",
    },
    {
      href: "/staff/calendar",
      label: "Calendar",
      icon: "🗓️",
    },
    {
      href: "/staff/leaves",
      label: "Leaves",
      icon: "🏖️",
    },
    {
      href: "/staff/portfolio",
      label: "Portfolio",
      icon: "🖼️",
    },
    {
      href: "/staff/analytics",
      label: "Analytics",
      icon: "📈",
    },
    {
      href: "/staff/profile",
      label: "Profile",
      icon: "👤",
    },
  ];

  // =====================================================
  // ACTIVE LINK
  // =====================================================

  const isActive = (path) => {
    return (
      pathname === path ||
      pathname.startsWith(`${path}/`)
    );
  };

  // =====================================================
  // SHOW TOOLTIP
  // =====================================================

  const showTooltip = (event, label) => {
    if (!sidebarCollapsed) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    setHoveredItem(label);

    setHoverPosition({
      top:
        rect.top +
        rect.height / 2,

      left:
        rect.right + 10,
    });
  };

  // =====================================================
  // NAV ITEM
  // =====================================================

  const NavItem = ({ item }) => {
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        data-staff-sidebar-link="true"

        onPointerDown={() => {
          saveSidebarScrollPosition();
        }}

        onMouseDown={() => {
          saveSidebarScrollPosition();
        }}

        onClick={() => {
          saveSidebarScrollPosition();

          setSidebarOpen(false);
          setHoveredItem(null);
        }}

        onMouseEnter={(event) => {
          if (!sidebarCollapsed) return;

          const rect =
            event.currentTarget.getBoundingClientRect();

          setHoveredItem(item.label);

          setHoverPosition({
            top:
              rect.top +
              rect.height / 2,

            left:
              rect.right + 10,
          });
        }}

        onMouseLeave={() => {
          setHoveredItem(null);
        }}

        className={[
          "group",
          "flex items-center",
          "relative",
          "rounded-xl",
          "text-sm font-medium",
          "transition-all duration-200",
          "shrink-0",

          sidebarCollapsed
            ? "lg:justify-center lg:gap-0"
            : "justify-start gap-3",

          "px-4 py-2.5",

          active
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950/40"
            : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400",
        ].join(" ")}
      >
        {/* ICON */}

        <span className="text-base shrink-0 flex items-center justify-center">
          {item.icon}
        </span>

        {/* DESKTOP LABEL */}

        {!sidebarCollapsed && (
          <span className="hidden lg:block truncate">
            {item.label}
          </span>
        )}

        {/* MOBILE LABEL */}

        <span className="lg:hidden truncate ml-3">
          {item.label}
        </span>
      </Link>
    );
  };

  // =====================================================
  // PAGE TITLE
  // =====================================================

  const pageTitle =
    pathname?.startsWith(
      "/staff/appointment/"
    )
      ? "Appointment Details"
      : pathname
      ? pathname
          .split("/")
          .pop()
          .replaceAll("-", " ")
      : "Dashboard";

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden font-sans transition-colors duration-300">

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
          "flex flex-col",
          "transform transition-all duration-300",
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

              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-md shadow-indigo-100 dark:shadow-indigo-950/40 shrink-0">
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
              className="
                lg:hidden
                w-9 h-9
                rounded-lg
                bg-slate-50 dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-500 dark:text-slate-400
                hover:text-slate-800 dark:hover:text-slate-200
                hover:bg-slate-100 dark:hover:bg-slate-700
                transition
                flex items-center justify-center
                cursor-pointer
              "
              aria-label="Close sidebar"
            >
              ✕
            </button>

          </div>

          {/* =================================================
              COLLAPSE BUTTON
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
              onClick={() => {
                setSidebarCollapsed(
                  !sidebarCollapsed
                );

                setHoveredItem(null);
              }}
              className="
                hidden lg:flex
                w-9 h-9
                rounded-lg
                bg-slate-50 dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-500 dark:text-slate-400
                hover:text-indigo-600 dark:hover:text-indigo-400
                hover:bg-indigo-50 dark:hover:bg-slate-700
                items-center justify-center
                transition
                cursor-pointer
              "
              aria-label={
                sidebarCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              {sidebarCollapsed
                ? "→"
                : "←"}
            </button>

          </div>

        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav
          ref={sidebarNavRef}

          onScroll={(event) => {
            const scrollTop =
              event.currentTarget.scrollTop;

            sidebarScrollTop.current =
              scrollTop;

            try {
              sessionStorage.setItem(
                SIDEBAR_SCROLL_KEY,
                String(scrollTop)
              );
            } catch {}
          }}

          className="
            flex-1
            min-h-0
            px-3
            pb-24
            space-y-1.5
            overflow-y-auto
            overflow-x-visible
            overscroll-contain
            pr-2

            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-slate-300
            dark:[&::-webkit-scrollbar-thumb]:bg-slate-700
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-slate-400
            dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600
          "

          style={{
            scrollbarWidth: "thin",
            scrollbarColor:
              "#cbd5e1 transparent",
          }}
        >

          {/* MAIN */}

          <div
            className={[
              "pt-1 pb-1.5 px-3",
              "text-[10px]",
              "font-bold",
              "uppercase",
              "tracking-wider",
              "text-slate-400 dark:text-slate-500",

              sidebarCollapsed
                ? "lg:hidden"
                : "",
            ].join(" ")}
          >
            MAIN
          </div>

          {menuItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
            />
          ))}

        </nav>

        {/* =================================================
            FIXED TOOLTIP
        ================================================= */}

        {sidebarCollapsed &&
          hoveredItem && (
            <div
              className="
                hidden lg:block
                fixed
                z-[99999]
                -translate-y-1/2
                px-3 py-2
                rounded-lg
                bg-slate-900
                border border-slate-700
                text-white
                text-xs
                font-semibold
                whitespace-nowrap
                shadow-xl
                pointer-events-none
              "
              style={{
                top:
                  `${hoverPosition.top}px`,

                left:
                  `${hoverPosition.left}px`,
              }}
            >
              {hoveredItem}
            </div>
          )}

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="shrink-0 p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">

          <button
            onClick={handleLogout}

            onMouseEnter={(event) => {
              if (!sidebarCollapsed) return;

              const rect =
                event.currentTarget.getBoundingClientRect();

              setHoveredItem("Logout");

              setHoverPosition({
                top:
                  rect.top +
                  rect.height / 2,

                left:
                  rect.right + 10,
              });
            }}

            onMouseLeave={() => {
              setHoveredItem(null);
            }}

            className={[
              "group relative w-full flex items-center",

              sidebarCollapsed
                ? "lg:justify-center justify-center"
                : "justify-center gap-2",

              "bg-slate-50 dark:bg-slate-800 text-blue-500 dark:text-blue-400 border border-slate-200 dark:border-slate-700",
              "hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-100 dark:hover:border-slate-600 hover:text-blue-600 dark:hover:text-blue-300",
              "px-4 py-2.5",
              "rounded-xl",
              "transition-all duration-200",
              "text-xs font-semibold",
              "cursor-pointer",
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
          className="
            fixed inset-0
            bg-slate-900/30 dark:bg-black/60
            backdrop-blur-[2px]
            z-40
            lg:hidden
          "
        />
      )}

      {/* =================================================
          MAIN CONTENT
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
            STAFF HEADER
        ================================================= */}

        <header
          className="
            h-16
            bg-white dark:bg-slate-900
            border-b border-slate-100 dark:border-slate-800
            px-4 sm:px-6
            flex items-center justify-between
            sticky top-0
            z-30
            shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-black/20
          "
        >

          <div className="flex items-center gap-3 sm:gap-4 min-w-0">

            {/* MOBILE SIDEBAR */}

            <button
              onClick={() =>
                setSidebarOpen(
                  !sidebarOpen
                )
              }
              className="
                lg:hidden
                p-2
                rounded-lg
                bg-slate-50 dark:bg-slate-800
                border border-slate-100 dark:border-slate-700
                text-slate-600 dark:text-slate-300
                hover:bg-indigo-50 dark:hover:bg-slate-700
                hover:text-indigo-600 dark:hover:text-indigo-400
                transition
                shrink-0
              "
              aria-label="Open sidebar"
            >
              ☰
            </button>

            <h2
              className="
                font-bold
                text-base sm:text-lg
                text-slate-800 dark:text-slate-100
                capitalize
                truncate
              "
            >
              {pageTitle}
            </h2>

          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">

            {/* THEME BUTTON */}

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
              {theme === "dark"
                ? "☀️"
                : "🌙"}
            </button>

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <div
              ref={notificationRef}
              className="relative"
            >

              <button
                type="button"
                onClick={() =>
                  setShowNotifications(
                    (prev) => !prev
                  )
                }
                className="
                  relative
                  p-2.5
                  rounded-xl
                  bg-slate-50 dark:bg-slate-800
                  border border-slate-100 dark:border-slate-700
                  hover:bg-indigo-50 dark:hover:bg-slate-700
                  hover:border-indigo-100 dark:hover:border-slate-600
                  text-slate-500 dark:text-slate-300
                  hover:text-indigo-600 dark:hover:text-indigo-400
                  transition
                  cursor-pointer
                "
                aria-label="Notifications"
              >

                🔔

                {unreadCount > 0 && (
                  <span
                    className="
                      absolute
                      top-1
                      right-1
                      bg-indigo-600
                      text-white
                      text-[10px]
                      font-bold
                      rounded-full
                      h-4 w-4
                      flex items-center justify-center
                      shadow-sm
                    "
                  >
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}

              </button>

              {/* NOTIFICATION DROPDOWN */}

              {showNotifications && (
                <div
                  className="
                    absolute
                    right-0
                    mt-3
                    w-[360px]
                    max-w-[90vw]
                    bg-white dark:bg-slate-900
                    rounded-2xl
                    shadow-[0_15px_40px_rgba(15,23,42,0.12)] dark:shadow-black/40
                    border border-slate-100 dark:border-slate-800
                    z-[9999]
                    overflow-hidden
                  "
                >

                  {/* HEADER */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      px-5 py-4
                      border-b border-slate-100 dark:border-slate-800
                      bg-slate-50/70 dark:bg-slate-800/70
                    "
                  >

                    <div>

                      <h2
                        className="
                          font-bold
                          text-sm
                          text-slate-800 dark:text-slate-100
                        "
                      >
                        Notifications
                      </h2>

                      {unreadCount > 0 && (
                        <p
                          className="
                            text-[11px]
                            text-slate-500 dark:text-slate-400
                            mt-0.5
                          "
                        >
                          {unreadCount} unread messages
                        </p>
                      )}

                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="
                          text-xs
                          font-semibold
                          text-indigo-600 dark:text-indigo-400
                          hover:text-indigo-700 dark:hover:text-indigo-300
                          cursor-pointer
                        "
                      >
                        Mark all read
                      </button>
                    )}

                  </div>

                  {/* NOTIFICATION LIST */}

                  <div
                    className="
                      max-h-[380px]
                      overflow-y-auto
                      divide-y
                      divide-slate-100 dark:divide-slate-800
                    "
                  >

                    {notifications.length === 0 ? (

                      <div
                        className="
                          text-center
                          py-10
                          px-4
                        "
                      >

                        <div
                          className="
                            w-10 h-10
                            rounded-xl
                            bg-indigo-50 dark:bg-slate-800
                            text-indigo-600 dark:text-indigo-400
                            flex items-center justify-center
                            text-lg
                            mx-auto mb-2
                          "
                        >
                          🔔
                        </div>

                        <p
                          className="
                            text-slate-500 dark:text-slate-400
                            text-xs
                          "
                        >
                          No notifications yet.
                        </p>

                      </div>

                    ) : (

                      notifications.map((n) => (

                        <button
                          type="button"
                          key={n.id}
                          onClick={() =>
                            markNotificationAsRead(
                              n.id,
                              n
                            )
                          }
                          className={`
                            w-full
                            text-left
                            px-5 py-3.5
                            hover:bg-indigo-50/50 dark:hover:bg-slate-800
                            transition
                            flex
                            gap-3
                            cursor-pointer

                            ${
                              n.isRead
                                ? "bg-white dark:bg-slate-900"
                                : "bg-indigo-50/40 dark:bg-indigo-950/30"
                            }
                          `}
                        >

                          <div
                            className="
                              text-base
                              mt-0.5
                              shrink-0
                            "
                          >
                            {n.type ===
                            "APPOINTMENT"
                              ? "📅"
                              : n.type ===
                                "REVIEW"
                              ? "⭐"
                              : "🔔"}
                          </div>

                          <div
                            className="
                              flex-1
                              min-w-0
                            "
                          >

                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-2
                              "
                            >

                              <h3
                                className="
                                  font-semibold
                                  text-xs
                                  text-slate-800 dark:text-slate-100
                                "
                              >
                                {n.title ||
                                  "Notification"}
                              </h3>

                              {!n.isRead && (
                                <span
                                  className="
                                    w-2 h-2
                                    bg-indigo-600
                                    rounded-full
                                    mt-1
                                    flex-shrink-0
                                  "
                                />
                              )}

                            </div>

                            <p
                              className="
                                text-xs
                                text-slate-600 dark:text-slate-300
                                mt-1
                                leading-relaxed
                              "
                            >
                              {n.message ||
                                n.body ||
                                ""}
                            </p>

                            <p
                              className="
                                text-[10px]
                                text-slate-400 dark:text-slate-500
                                mt-1.5
                                font-medium
                              "
                            >
                              {formatNotificationTime(
                                n.createdAt
                              )}
                            </p>

                          </div>

                        </button>

                      ))

                    )}

                  </div>

                </div>
              )}

            </div>

            {/* =================================================
                STAFF PROFILE
            ================================================= */}

            <div
              className="
                flex
                items-center
                gap-2
                pl-2
                border-l
                border-slate-200 dark:border-slate-700
              "
            >

              <div
                className="
                  w-8 h-8
                  rounded-full
                  bg-indigo-600
                  flex items-center justify-center
                  text-white
                  text-xs
                  font-bold
                  shadow-sm
                  shadow-indigo-100 dark:shadow-indigo-950/40
                "
              >
                SU
              </div>

              <span
                className="
                  text-xs
                  font-semibold
                  text-slate-700 dark:text-slate-300
                  hidden sm:inline
                "
              >
                Staff
              </span>

            </div>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <div
          className="
            min-h-[calc(100vh-64px)]
          "
        >
          {children}
        </div>

      </main>

      {/* =================================================
          MOBILE NOTIFICATIONS
      ================================================= */}

      {showNotifications && (
        <div
          className="
            lg:hidden
            fixed
            top-16
            right-3
            z-[9999]
          "
        >

          <div
            className="
              w-[360px]
              max-w-[calc(100vw-24px)]
              bg-white dark:bg-slate-900
              rounded-2xl
              shadow-[0_15px_40px_rgba(15,23,42,0.12)] dark:shadow-black/40
              border border-slate-100 dark:border-slate-800
              overflow-hidden
            "
          >

            {/* MOBILE HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                px-5 py-4
                border-b border-slate-100 dark:border-slate-800
                bg-slate-50/70 dark:bg-slate-800/70
              "
            >

              <div>

                <h2
                  className="
                    font-bold
                    text-sm
                    text-slate-800 dark:text-slate-100
                  "
                >
                  Notifications
                </h2>

                {unreadCount > 0 && (
                  <p
                    className="
                      text-[11px]
                      text-slate-500 dark:text-slate-400
                      mt-0.5
                    "
                  >
                    {unreadCount} unread messages
                  </p>
                )}

              </div>

              <div className="flex items-center gap-3">

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="
                      text-xs
                      font-semibold
                      text-indigo-600 dark:text-indigo-400
                      hover:text-indigo-700 dark:hover:text-indigo-300
                    "
                  >
                    Mark all read
                  </button>
                )}

                <button
                  onClick={() =>
                    setShowNotifications(false)
                  }
                  className="
                    w-8 h-8
                    rounded-lg
                    hover:bg-slate-100 dark:hover:bg-slate-700
                    flex items-center justify-center
                    text-slate-500 dark:text-slate-400
                  "
                >
                  ✕
                </button>

              </div>

            </div>

            {/* MOBILE LIST */}

            <div
              className="
                max-h-[380px]
                overflow-y-auto
                divide-y
                divide-slate-100 dark:divide-slate-800
              "
            >

              {notifications.length === 0 ? (

                <div
                  className="
                    text-center
                    py-10
                    px-4
                  "
                >

                  <div
                    className="
                      w-10 h-10
                      rounded-xl
                      bg-indigo-50 dark:bg-slate-800
                      text-indigo-600 dark:text-indigo-400
                      flex items-center justify-center
                      text-lg
                      mx-auto mb-2
                    "
                  >
                    🔔
                  </div>

                  <p
                    className="
                      text-slate-500 dark:text-slate-400
                      text-xs
                    "
                  >
                    No notifications yet.
                  </p>

                </div>

              ) : (

                notifications.map((n) => (

                  <button
                    type="button"
                    key={n.id}
                    onClick={() =>
                      markNotificationAsRead(
                        n.id,
                        n
                      )
                    }
                    className={`
                      w-full
                      text-left
                      px-5 py-3.5
                      hover:bg-indigo-50/50 dark:hover:bg-slate-800
                      transition
                      flex
                      gap-3
                      cursor-pointer

                      ${
                        n.isRead
                          ? "bg-white dark:bg-slate-900"
                          : "bg-indigo-50/40 dark:bg-indigo-950/30"
                      }
                    `}
                  >

                    <div
                      className="
                        text-base
                        mt-0.5
                        shrink-0
                      "
                    >
                      {n.type ===
                      "APPOINTMENT"
                        ? "📅"
                        : n.type ===
                          "REVIEW"
                        ? "⭐"
                        : "🔔"}
                    </div>

                    <div
                      className="
                        flex-1
                        min-w-0
                      "
                    >

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-2
                        "
                      >

                        <h3
                          className="
                            font-semibold
                            text-xs
                            text-slate-800 dark:text-slate-100
                          "
                        >
                          {n.title ||
                            "Notification"}
                        </h3>

                        {!n.isRead && (
                          <span
                            className="
                              w-2 h-2
                              bg-indigo-600
                              rounded-full
                              mt-1
                              flex-shrink-0
                            "
                          />
                        )}

                      </div>

                      <p
                        className="
                          text-xs
                          text-slate-600 dark:text-slate-300
                          mt-1
                          leading-relaxed
                        "
                      >
                        {n.message ||
                          n.body ||
                          ""}
                      </p>

                      <p
                        className="
                          text-[10px]
                          text-slate-400 dark:text-slate-500
                          mt-1.5
                          font-medium
                        "
                      >
                        {formatNotificationTime(
                          n.createdAt
                        )}
                      </p>

                    </div>

                  </button>

                ))

              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}