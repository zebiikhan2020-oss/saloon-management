
import { prisma } from "@/lib/prisma";

// ========================================
// DATE HELPERS (PAKISTAN TIME)
// ========================================

function getPeriodFilter(period, field = "date") {
  if (period === "all_time") {
    return {};
  }

  const now = new Date();

  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number);

  const [year, month, day] = dateParts;

  const todayStart = new Date(
    Date.UTC(year, month - 1, day) - 5 * 60 * 60 * 1000
  );

  let days = 0;

  if (period === "last_7_days") days = 6;
  if (period === "last_30_days") days = 29;

  const startDate = new Date(
    todayStart.getTime() - days * 24 * 60 * 60 * 1000
  );

  return {
    [field]: {
      gte: startDate,
      lte: now,
    },
  };
}

function validatePeriod(period) {
  const allowed = [
    "today",
    "last_7_days",
    "last_30_days",
    "all_time",
  ];

  if (!allowed.includes(period)) {
    throw new Error("Invalid period");
  }
}

// ========================================
// 1. APPOINTMENT STATISTICS
// ========================================

async function getAppointmentStats({ period }) {
  validatePeriod(period);

  const where = getPeriodFilter(period);

  const grouped = await prisma.appointment.groupBy({
    by: ["status"],
    where,
    _count: {
      _all: true,
    },
  });

  const stats = {
    total: 0,
    PENDING: 0,
    CONFIRMED: 0,
    REJECTED: 0,
    CANCELLED: 0,
    COMPLETED: 0,
    IN_PROGRESS: 0,
  };

  for (const item of grouped) {
    stats[item.status] = item._count._all;
    stats.total += item._count._all;
  }

  return {
    period,
    ...stats,
  };
}

// ========================================
// 2. REVENUE STATISTICS
// ========================================

async function getRevenueStats({ period }) {
  validatePeriod(period);

  const dateFilter = getPeriodFilter(period);

  const where = {
    ...dateFilter,
    status: "COMPLETED",
  };

  const [revenue, missingPriceCount] = await Promise.all([
    prisma.appointment.aggregate({
      where: {
        ...where,
        priceAtBooking: {
          not: null,
        },
      },
      _sum: {
        priceAtBooking: true,
      },
      _count: {
        _all: true,
      },
    }),

    prisma.appointment.count({
      where: {
        ...where,
        priceAtBooking: null,
      },
    }),
  ]);

  return {
    period,
    currency: "PKR",
    totalRevenue: revenue._sum.priceAtBooking || 0,
    completedAppointmentsWithSavedPrice:
      revenue._count._all,
    completedAppointmentsWithMissingPrice:
      missingPriceCount,
    note:
      "Revenue includes only completed appointments with a saved booking-time price. Missing historical prices are excluded.",
  };
}

// ========================================
// 3. POPULAR SERVICES
// ========================================

async function getServiceStats({ period }) {
  validatePeriod(period);

  const dateFilter = getPeriodFilter(period);

  const grouped = await prisma.appointment.groupBy({
    by: ["serviceId"],
    where: dateFilter,
    _count: {
      _all: true,
    },
  });

  const services = await prisma.service.findMany({
    where: {
      id: {
        in: grouped.map((item) => item.serviceId),
      },
    },
    select: {
      id: true,
      name: true,
      price: true,
      status: true,
    },
  });

  const results = grouped
    .map((item) => {
      const service = services.find(
        (s) => s.id === item.serviceId
      );

      return {
        serviceName: service?.name || "Unknown Service",
        currentPrice: service?.price ?? null,
        isActive: service?.status ?? false,
        appointmentCount: item._count._all,
      };
    })
    .sort(
      (a, b) =>
        b.appointmentCount - a.appointmentCount
    );

  return {
    period,
    totalServicesBooked: results.length,
    services: results,
  };
}

// ========================================
// 4. STAFF PERFORMANCE
// ========================================

async function getStaffStats({ period }) {
  validatePeriod(period);

  const dateFilter = getPeriodFilter(period);

  const grouped = await prisma.appointment.groupBy({
    by: ["staffId"],
    where: {
      ...dateFilter,
      staffId: {
        not: null,
      },
      status: "COMPLETED",
    },
    _count: {
      _all: true,
    },
  });

  const staffMembers = await prisma.user.findMany({
    where: {
      id: {
        in: grouped.map((item) => item.staffId),
      },
      role: "STAFF",
    },
    select: {
      id: true,
      name: true,
    },
  });

  const results = grouped
    .map((item) => {
      const staff = staffMembers.find(
        (s) => s.id === item.staffId
      );

      return {
        staffName: staff?.name || "Unknown Staff",
        completedAppointments: item._count._all,
      };
    })
    .sort(
      (a, b) =>
        b.completedAppointments -
        a.completedAppointments
    );

  return {
    period,
    staff: results,
  };
}

// ========================================
// 5. CUSTOMER REVIEWS
// ========================================

async function getReviewStats({ period }) {
  validatePeriod(period);

  const where = getPeriodFilter(period, "createdAt");

  const [summary, grouped] = await Promise.all([
    prisma.appointmentReview.aggregate({
      where,
      _avg: {
        rating: true,
      },
      _count: {
        _all: true,
      },
    }),

    prisma.appointmentReview.groupBy({
      by: ["rating"],
      where,
      _count: {
        _all: true,
      },
    }),
  ]);

  return {
    period,
    totalReviews: summary._count._all,
    averageRating: summary._avg.rating
      ? Number(summary._avg.rating.toFixed(2))
      : 0,
    ratings: grouped
      .sort((a, b) => b.rating - a.rating)
      .map((item) => ({
        rating: item.rating,
        count: item._count._all,
      })),
  };
}

// ========================================
// 6. STAFF ATTENDANCE AND LEAVES
// ========================================

async function getStaffAttendanceStats({ period }) {
  validatePeriod(period);

  const dateFilter = getPeriodFilter(period);

  const [attendance, leaves] = await Promise.all([
    prisma.attendance.groupBy({
      by: ["status"],
      where: dateFilter,
      _count: {
        _all: true,
      },
    }),

    prisma.leaveRequest.groupBy({
      by: ["status"],
      where: getPeriodFilter(period, "startDate"),
      _count: {
        _all: true,
      },
    }),
  ]);

  return {
    period,

    attendance: attendance.map((item) => ({
      status: item.status,
      count: item._count._all,
    })),

    leaves: leaves.map((item) => ({
      status: item.status,
      count: item._count._all,
    })),
  };
}

// ========================================
// AI TOOL DEFINITIONS
// ========================================

const periodSchema = {
  type: "string",
  enum: [
    "today",
    "last_7_days",
    "last_30_days",
    "all_time",
  ],
};

const makeTool = (name, description) => ({
  type: "function",
  name,
  description,
  strict: true,
  parameters: {
    type: "object",
    properties: {
      period: periodSchema,
    },
    required: ["period"],
    additionalProperties: false,
  },
});

export const aiTools = [
  makeTool(
    "get_appointment_stats",
    "Get appointment counts grouped by status for the requested period."
  ),

  makeTool(
    "get_revenue_stats",
    "Get completed appointment revenue using saved booking-time prices. Never estimate missing historical prices."
  ),

  makeTool(
    "get_service_stats",
    "Get the most booked salon services for the requested period."
  ),

  makeTool(
    "get_staff_stats",
    "Get staff performance based on completed appointments."
  ),

  makeTool(
    "get_review_stats",
    "Get customer appointment review counts and average ratings."
  ),

  makeTool(
    "get_staff_attendance_stats",
    "Get staff attendance and leave status counts for the requested period."
  ),
];

// ========================================
// TOOL EXECUTION
// ========================================

export async function executeAiTool(name, args) {
  switch (name) {
    case "get_appointment_stats":
      return await getAppointmentStats(args);

    case "get_revenue_stats":
      return await getRevenueStats(args);

    case "get_service_stats":
      return await getServiceStats(args);

    case "get_staff_stats":
      return await getStaffStats(args);

    case "get_review_stats":
      return await getReviewStats(args);

    case "get_staff_attendance_stats":
      return await getStaffAttendanceStats(args);

    default:
      throw new Error("Unknown AI tool");
  }
}
