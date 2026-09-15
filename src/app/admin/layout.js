"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

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
    "admin-sidebar-scroll-top";

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
        "GET SIDEBAR SCROLL ERROR:",
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
        "SAVE SIDEBAR SCROLL ERROR:",
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

    sidebarScrollTop.current =
      savedPosition;

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
      console.log("Logout error:", error);
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
        setNotifications(
          Array.isArray(data.notifications)
            ? data.notifications
            : []
        );

        setUnreadCount(
          Number(data.unreadCount || 0)
        );
      }
    } catch (error) {
      console.error(
        "LOAD NOTIFICATIONS ERROR:",
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
      }, 30000);
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
      const link = event.target.closest(
        "a[data-admin-sidebar-link]"
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
  // SAVE SCROLL WHEN PAGE / COMPONENT IS LEAVING
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

      // =================================================
      // APPOINTMENT
      // =================================================

      if (
        notification?.appointmentId &&
        notification?.type === "APPOINTMENT"
      ) {
        setShowNotifications(false);

        saveSidebarScrollPosition();

        router.push(
          `/admin/appointment/${notification.appointmentId}`
        );

        return;
      }

      // =================================================
      // REVIEW
      // =================================================

      if (notification?.type === "REVIEW") {
        setShowNotifications(false);

        saveSidebarScrollPosition();

        router.push(
          "/admin/appointment-reviews"
        );
      }
    } catch (error) {
      console.error(
        "MARK NOTIFICATION ERROR:",
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

      if (!response.ok) return;

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "MARK ALL NOTIFICATIONS ERROR:",
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

    if (isNaN(d.getTime())) return "";

    return d.toLocaleString();
  }

  // =====================================================
  // MENU ITEMS
  // =====================================================

  const menuItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: "📊",
    },
    {
      href: "/admin/appointment",
      label: "Appointments",
      icon: "📅",
    },
    {
      href: "/admin/today-appointment",
      label: "Today's Appointments",
      icon: "🗓️",
    },
    {
      href: "/admin/users",
      label: "Customers",
      icon: "👥",
    },
    {
      href: "/admin/staff",
      label: "Staff",
      icon: "👤",
    },
    {
      href: "/admin/services",
      label: "Services",
      icon: "✂️",
    },
    {
      href: "/admin/categories",
      label: "Categories",
      icon: "📂",
    },
    {
      href: "/admin/business-hours",
      label: "Business Hours",
      icon: "🕐",
    },
    {
      href: "/admin/attendance",
      label: "Attendance",
      icon: "🕘",
    },
    {
      href: "/admin/leaves",
      label: "Leave Requests",
      icon: "🏖️",
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: "📈",
    },
    {
      href: "/admin/calendar",
      label: "Calendars",
      icon: "🗓️",
    },
    {
      href: "/admin/staff-schedule",
      label: "Staff Schedule",
      icon: "⏰",
    },
  ];

  // =====================================================
  // ACTIVE LINK
  // =====================================================

  const isActive = (path) => {
    return pathname === path;
  };

  // =====================================================
  // NAV ITEM
  // =====================================================

  const NavItem = ({ item }) => {
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        data-admin-sidebar-link="true"
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
          "group relative",
          "flex items-center",
          "min-h-[42px]",
          "px-4 py-2.5",
          "rounded-xl",
          "text-sm font-medium",
          "transition-all duration-200",
          "shrink-0",

          sidebarCollapsed
            ? "lg:justify-center lg:gap-0"
            : "justify-start gap-3",

          active
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
            : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600",
        ].join(" ")}
      >
        {/* ICON */}

        <span className="text-base shrink-0 w-6 flex items-center justify-center">
          {item.icon}
        </span>

        {/* DESKTOP NORMAL LABEL */}

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
      "/admin/appointment/"
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
    <div className="min-h-screen bg-slate-100 text-slate-900 overflow-x-hidden font-sans">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={[
          "fixed top-0 left-0 right-auto z-50 h-screen",
          "w-64",
          "bg-white border-r border-slate-100",
          "flex flex-col",
          "transform transition-all duration-300",
          "lg:translate-x-0",
          "shadow-[4px_0_20px_rgba(15,23,42,0.04)]",

          sidebarCollapsed
            ? "lg:w-20"
            : "lg:w-64",

          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >

        {/* =================================================
            SIDEBAR TOP
        ================================================= */}

        <div className="shrink-0">

          {/* SIDEBAR HEADER */}

          <div
            className={[
              "p-5 border-b border-slate-100",
              "flex items-center",

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

              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-md shadow-indigo-100 shrink-0">
                S
              </div>

              {/* DESKTOP NORMAL */}

              {!sidebarCollapsed && (
                <div className="hidden lg:block">
                  <h1 className="text-base font-bold text-slate-800 tracking-wide">
                    Salon
                  </h1>

                  <p className="text-slate-400 text-xs">
                    Management
                  </p>
                </div>
              )}

              {/* MOBILE */}

              <div className="lg:hidden">
                <h1 className="text-base font-bold text-slate-800 tracking-wide">
                  Salon
                </h1>

                <p className="text-slate-400 text-xs">
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
                bg-slate-50
                border border-slate-200
                text-slate-500
                hover:text-slate-800
                hover:bg-slate-100
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
              onClick={() =>
                setSidebarCollapsed(
                  !sidebarCollapsed
                )
              }
              className="
                hidden lg:flex
                w-9 h-9
                rounded-lg
                bg-slate-50
                border border-slate-200
                text-slate-500
                hover:text-indigo-600
                hover:bg-indigo-50
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
            SCROLLBAR WORKS IN BOTH STATES
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
            } catch (error) {
              console.error(
                "SIDEBAR SCROLL SAVE ERROR:",
                error
              );
            }
          }}
          className="
            flex-1
            min-h-0
            px-3
            pb-5
            space-y-1.5
            overflow-y-auto
            overflow-x-visible
            overscroll-contain
            pr-2

            [&::-webkit-scrollbar]:w-1.5
            [&::-webkit-scrollbar-track]:bg-transparent
            [&::-webkit-scrollbar-thumb]:bg-slate-200
            [&::-webkit-scrollbar-thumb]:rounded-full
            hover:[&::-webkit-scrollbar-thumb]:bg-slate-300
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
              "text-slate-400",

              sidebarCollapsed
                ? "lg:hidden"
                : "",
            ].join(" ")}
          >
            MAIN
          </div>

          {/* DASHBOARD */}

          <NavItem
            item={menuItems[0]}
          />

          {/* =================================================
              APPOINTMENTS
          ================================================= */}

          <div
            className={[
              "pt-4 pb-1.5 px-3",
              "text-[10px]",
              "font-bold",
              "uppercase",
              "tracking-wider",
              "text-slate-400",

              sidebarCollapsed
                ? "lg:hidden"
                : "",
            ].join(" ")}
          >
            APPOINTMENTS
          </div>

          {menuItems
            .slice(1, 3)
            .map((item) => (
              <NavItem
                key={item.href}
                item={item}
              />
            ))}

          {/* =================================================
              MANAGEMENT
          ================================================= */}

          <div
            className={[
              "pt-4 pb-1.5 px-3",
              "text-[10px]",
              "font-bold",
              "uppercase",
              "tracking-wider",
              "text-slate-400",

              sidebarCollapsed
                ? "lg:hidden"
                : "",
            ].join(" ")}
          >
            MANAGEMENT
          </div>

          {menuItems
            .slice(3, 7)
            .map((item) => (
              <NavItem
                key={item.href}
                item={item}
              />
            ))}

          {/* =================================================
              OPERATIONS
          ================================================= */}

          <div
            className={[
              "pt-4 pb-1.5 px-3",
              "text-[10px]",
              "font-bold",
              "uppercase",
              "tracking-wider",
              "text-slate-400",

              sidebarCollapsed
                ? "lg:hidden"
                : "",
            ].join(" ")}
          >
            OPERATIONS
          </div>

          {menuItems
            .slice(7, 10)
            .map((item) => (
              <NavItem
                key={item.href}
                item={item}
              />
            ))}

          {/* =================================================
              REPORTS
          ================================================= */}

          <div
            className={[
              "pt-4 pb-1.5 px-3",
              "text-[10px]",
              "font-bold",
              "uppercase",
              "tracking-wider",
              "text-slate-400",

              sidebarCollapsed
                ? "lg:hidden"
                : "",
            ].join(" ")}
          >
            REPORTS
          </div>

          {menuItems
            .slice(10)
            .map((item) => (
              <NavItem
                key={item.href}
                item={item}
              />
            ))}

        </nav>

        {/* =================================================
            COLLAPSED SIDEBAR HOVER TOOLTIP
        ================================================= */}

        {sidebarCollapsed &&
          hoveredItem && (
            <div
              className="
                hidden lg:block
                fixed
                z-[99999]
                -translate-y-1/2
                px-3
                py-2
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

        <div className="
          shrink-0
          p-3
          border-t
          border-slate-100
          bg-white
        ">

          <button
            onClick={handleLogout}
            className={[
              "group relative",
              "w-full",
              "flex items-center",

              sidebarCollapsed
                ? "lg:justify-center justify-center"
                : "justify-center gap-2",

              "bg-slate-50",
              "text-blue-500",
              "border border-slate-200",
              "hover:bg-blue-50",
              "hover:border-blue-100",
              "hover:text-blue-600",
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

            {/* LOGOUT TOOLTIP */}

            {sidebarCollapsed && (
              <span
                className="
                  hidden lg:block
                  pointer-events-none
                  absolute
                  left-full
                  top-1/2
                  -translate-y-1/2
                  ml-3
                  px-3 py-2
                  rounded-lg
                  bg-slate-900
                  border border-slate-700
                  text-white
                  text-xs
                  font-semibold
                  whitespace-nowrap
                  opacity-0
                  invisible
                  translate-x-1
                  group-hover:opacity-100
                  group-hover:visible
                  group-hover:translate-x-0
                  transition-all
                  duration-200
                  z-[9999]
                  shadow-xl
                "
              >
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
          className="
            fixed
            inset-0
            bg-slate-900/30
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
          "min-h-screen",
          "transition-all duration-300",

          sidebarCollapsed
            ? "lg:ml-20"
            : "lg:ml-64",
        ].join(" ")}
      >

        {/* =================================================
            ADMIN HEADER
        ================================================= */}

        <header
          className="
            h-16
            bg-white
            border-b border-slate-100
            px-3
            sm:px-5
            lg:px-6
            flex items-center
            justify-between
            sticky top-0
            z-30
            shadow-[0_2px_12px_rgba(15,23,42,0.04)]
          "
        >

          {/* LEFT */}

          <div className="
            flex
            items-center
            gap-2
            sm:gap-4
            min-w-0
          ">

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
                bg-slate-50
                border border-slate-100
                text-slate-600
                hover:bg-indigo-50
                hover:text-indigo-600
                transition
                cursor-pointer
              "
              aria-label="Open sidebar"
            >
              ☰
            </button>

            <div className="min-w-0">

              <h2 className="
                font-bold
                text-base
                sm:text-lg
                text-slate-800
                capitalize
                truncate
              ">
                {pageTitle}
              </h2>

              <p className="
                hidden
                sm:block
                text-[11px]
                text-slate-400
                mt-0.5
              ">
                Admin Panel
              </p>

            </div>

          </div>

          {/* RIGHT */}

          <div className="
            flex
            items-center
            gap-2
            sm:gap-4
          ">

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
                  bg-slate-50
                  border border-slate-100
                  hover:bg-indigo-50
                  hover:border-indigo-100
                  text-slate-500
                  hover:text-indigo-600
                  transition
                  cursor-pointer
                "
                aria-label="Notifications"
              >

                🔔

                {unreadCount > 0 && (
                  <span className="
                    absolute
                    top-1
                    right-1
                    bg-indigo-600
                    text-white
                    text-[10px]
                    font-bold
                    rounded-full
                    h-4
                    min-w-4
                    px-1
                    flex
                    items-center
                    justify-center
                    shadow-sm
                  ">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}

              </button>

              {/* =================================================
                  NOTIFICATION DROPDOWN
              ================================================= */}

              {showNotifications && (
                <div className="
                  absolute
                  right-0
                  mt-3
                  w-[360px]
                  max-w-[calc(100vw-24px)]
                  bg-white
                  rounded-2xl
                  shadow-[0_15px_40px_rgba(15,23,42,0.12)]
                  border border-slate-100
                  z-[9999]
                  overflow-hidden
                ">

                  {/* DROPDOWN HEADER */}

                  <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    px-5
                    py-4
                    border-b
                    border-slate-100
                    bg-slate-50/70
                  ">

                    <div className="min-w-0">

                      <h2 className="
                        font-bold
                        text-sm
                        text-slate-800
                      ">
                        Notifications
                      </h2>

                      {unreadCount > 0 && (
                        <p className="
                          text-[11px]
                          text-slate-500
                          mt-0.5
                        ">
                          {unreadCount} unread messages
                        </p>
                      )}

                    </div>

                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="
                          shrink-0
                          text-xs
                          font-semibold
                          text-indigo-600
                          hover:text-indigo-700
                          cursor-pointer
                        "
                      >
                        Mark all read
                      </button>
                    )}

                  </div>

                  {/* =================================================
                      NOTIFICATION LIST
                  ================================================= */}

                  <div className="
                    max-h-[380px]
                    overflow-y-auto
                    divide-y
                    divide-slate-100
                  ">

                    {notificationLoading &&
                    notifications.length === 0 ? (

                      <div className="
                        py-10
                        text-center
                      ">

                        <div className="
                          w-8
                          h-8
                          border-2
                          border-slate-200
                          border-t-indigo-600
                          rounded-full
                          animate-spin
                          mx-auto
                        " />

                        <p className="
                          text-xs
                          text-slate-500
                          mt-3
                        ">
                          Loading notifications...
                        </p>

                      </div>

                    ) : notifications.length === 0 ? (

                      <div className="
                        text-center
                        py-10
                        px-4
                      ">

                        <div className="
                          w-10
                          h-10
                          rounded-xl
                          bg-indigo-50
                          text-indigo-600
                          flex
                          items-center
                          justify-center
                          text-lg
                          mx-auto
                          mb-2
                        ">
                          🔔
                        </div>

                        <p className="
                          text-slate-500
                          text-xs
                        ">
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
                            px-5
                            py-3.5
                            hover:bg-indigo-50/50
                            transition
                            flex
                            gap-3
                            cursor-pointer
                            ${
                              n.isRead
                                ? "bg-white"
                                : "bg-indigo-50/40"
                            }
                          `}
                        >

                          <div className="
                            text-base
                            mt-0.5
                            shrink-0
                          ">
                            {n.type ===
                            "APPOINTMENT"
                              ? "📅"
                              : n.type ===
                                "REVIEW"
                              ? "⭐"
                              : "🔔"}
                          </div>

                          <div className="
                            flex-1
                            min-w-0
                          ">

                            <div className="
                              flex
                              items-start
                              justify-between
                              gap-2
                            ">

                              <h3 className="
                                font-semibold
                                text-xs
                                text-slate-800
                                leading-5
                              ">
                                {n.title}
                              </h3>

                              {!n.isRead && (
                                <span className="
                                  w-2
                                  h-2
                                  bg-indigo-600
                                  rounded-full
                                  mt-1
                                  flex-shrink-0
                                " />
                              )}

                            </div>

                            <p className="
                              text-xs
                              text-slate-600
                              mt-1
                              leading-relaxed
                              break-words
                            ">
                              {n.message}
                            </p>

                            <p className="
                              text-[10px]
                              text-slate-400
                              mt-1.5
                              font-medium
                            ">
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
                ADMIN PROFILE
            ================================================= */}

            <div className="
              flex
              items-center
              gap-2
              pl-2
              sm:pl-3
              border-l
              border-slate-200
            ">

              <div className="
                w-8
                h-8
                rounded-full
                bg-indigo-600
                flex
                items-center
                justify-center
                text-white
                text-xs
                font-bold
                shadow-sm
                shadow-indigo-100
              ">
                AU
              </div>

              <div className="hidden sm:block">

                <span className="
                  block
                  text-xs
                  font-semibold
                  text-slate-700
                ">
                  Admin
                </span>

                <span className="
                  block
                  text-[10px]
                  text-slate-400
                ">
                  Administrator
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <div className="
          min-h-[calc(100vh-64px)]
          w-full
        ">
          {children}
        </div>

      </main>

    </div>
  );
}