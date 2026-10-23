import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// =====================================================
// CREATE APPOINTMENT
// =====================================================

export async function POST(request) {
  try {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized. Please login first",
        },
        {
          status: 401,
        }
      );
    }

    const decoded = await verifyToken(token);

    console.log("CUSTOMER TOKEN:", decoded);

    if (!decoded) {
      return NextResponse.json(
        {
          message: "Invalid token",
        },
        {
          status: 401,
        }
      );
    }

    const customerId =
      decoded.id ||
      decoded.userId ||
      decoded.customerId;

    if (!customerId) {
      return NextResponse.json(
        {
          message: "Customer id not found in token",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // CHECK CUSTOMER
    // =====================================================

    const customerUser = await prisma.user.findUnique({
      where: {
        id: customerId,
      },
      select: {
        id: true,
        role: true,
        isBlocked: true,
        isEmailVerified: true,
        email: true,
      },
    });

    if (!customerUser) {
      return NextResponse.json(
        {
          message: "Customer account not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (customerUser.role !== "CUSTOMER") {
      return NextResponse.json(
        {
          message: "Only customers can book appointments.",
        },
        {
          status: 403,
        }
      );
    }

    if (!customerUser.isEmailVerified) {
      return NextResponse.json(
        {
          message: "Please verify your email first.",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // BLOCKED CUSTOMER
    // =====================================================

    if (customerUser.isBlocked) {
      return NextResponse.json(
        {
          message: "Your account has been blocked by admin.",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // REQUEST DATA
    // =====================================================

    const {
      serviceId,
      staffId,
      date,
      time,
      paymentMethod,
    } = await request.json();

    if (!serviceId || !date || !time) {
      return NextResponse.json(
        {
          message: "Service, date and time are required.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // PAYMENT METHOD VALIDATION
    // =====================================================

    const allowedPaymentMethods = [
      "PAY_AT_SALON",
      "EASYPAISA",
      "JAZZCASH",
      "SADAPAY",
      "CARD",
      "BANK_TRANSFER",
      "RAAST",
    ];

    if (!paymentMethod) {
      return NextResponse.json(
        {
          message: "Please select a payment method.",
        },
        {
          status: 400,
        }
      );
    }

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          message: "Invalid payment method.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // EASYPAISA CREDENTIAL CHECK
    // =====================================================

    if (paymentMethod === "EASYPAISA") {
      const hasCredentials =
        process.env.EASYPAISA_MERCHANT_ID &&
        process.env.EASYPAISA_MERCHANT_ID !==
          "your_easypaisa_merchant_id_here" &&
        process.env.EASYPAISA_STORE_ID &&
        process.env.EASYPAISA_STORE_ID !==
          "your_easypaisa_store_id_here" &&
        process.env.EASYPAISA_PASSWORD &&
        process.env.EASYPAISA_PASSWORD !==
          "your_easypaisa_password_here";

      if (!hasCredentials) {
        return NextResponse.json(
          {
            message:
              "Easypaisa payment is not available. Real Easypaisa merchant credentials are required to process Easypaisa payments. Please contact the administrator to configure Easypaisa credentials or select a different payment method.",
          },
          {
            status: 503,
          }
        );
      }
    }

    // =====================================================
    // CHECK SERVICE
    // =====================================================

    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
    });

    if (!service) {
      return NextResponse.json(
        {
          message: "Service not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!service.status) {
      return NextResponse.json(
        {
          message: "This service is currently unavailable.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // BOOKING DATE
    // =====================================================

    const bookingDate = new Date(`${date}T00:00:00`);

    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json(
        {
          message: "Invalid appointment date.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // PAST DATE CHECK
    // =====================================================

    const pakistanToday = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
    }).format(new Date());

    if (date < pakistanToday) {
      return NextResponse.json(
        {
          message: "Past date not allowed.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // GET SELECTED DAY
    // =====================================================

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const selectedDay =
      dayNames[bookingDate.getDay()];

    console.log(
      "SELECTED APPOINTMENT DAY:",
      selectedDay
    );

    // =====================================================
    // BUSINESS HOURS
    // =====================================================

    const specialBusinessHour =
      await prisma.specialBusinessHour.findUnique({
        where: {
          date: bookingDate,
        },
      });

    let businessHour;

    if (specialBusinessHour) {
      businessHour = specialBusinessHour;
    } else {
      businessHour =
        await prisma.businessHour.findUnique({
          where: {
            day: selectedDay,
          },
        });
    }

    // =====================================================
    // NO BUSINESS HOURS
    // =====================================================

    if (!businessHour) {
      return NextResponse.json(
        {
          message:
            "Business hours are not configured for this day.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // CLOSED
    // =====================================================

    if (businessHour.type === "CLOSED") {
      return NextResponse.json(
        {
          message:
            "The salon is closed on this date.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // TIME FORMAT CHECK
    // =====================================================

    if (!/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json(
        {
          message: "Invalid appointment time.",
        },
        {
          status: 400,
        }
      );
    }

    const [hours, minutes] =
      time.split(":").map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return NextResponse.json(
        {
          message: "Invalid appointment time.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // TIME TO MINUTES HELPER
    // =====================================================

    function timeToMinutes(timeStr) {
      if (!timeStr) return null;

      const [h, m] =
        timeStr.split(":").map(Number);

      if (
        Number.isNaN(h) ||
        Number.isNaN(m)
      ) {
        return null;
      }

      return h * 60 + m;
    }

    const requestedMinutes =
      hours * 60 + minutes;

    // =====================================================
    // PAST TIME CHECK FOR TODAY
    // =====================================================

    if (date === pakistanToday) {
      const pakistanTimeString =
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Karachi",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date());

      const [
        currentHour,
        currentMinute,
      ] = pakistanTimeString
        .split(":")
        .map(Number);

      const currentMinutes =
        currentHour * 60 +
        currentMinute;

      if (
        requestedMinutes <= currentMinutes
      ) {
        return NextResponse.json(
          {
            message:
              "This time has already passed. Please select a future time.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // =====================================================
    // FULL DAY
    // =====================================================

    if (businessHour.type === "FULL_DAY") {
      console.log(
        "FULL DAY BUSINESS HOURS - TIME ALLOWED:",
        time
      );
    }

    // =====================================================
    // NORMAL BUSINESS HOURS
    // =====================================================

    let closingMinutes = null;

    if (businessHour.type === "NORMAL") {
      if (
        !businessHour.openTime ||
        !businessHour.closeTime
      ) {
        return NextResponse.json(
          {
            message:
              "Business hours are not properly configured.",
          },
          {
            status: 400,
          }
        );
      }

      const [
        openHour,
        openMinute,
      ] = businessHour.openTime
        .split(":")
        .map(Number);

      const [
        closeHour,
        closeMinute,
      ] = businessHour.closeTime
        .split(":")
        .map(Number);

      const openingMinutes =
        openHour * 60 +
        openMinute;

      closingMinutes =
        closeHour * 60 +
        closeMinute;

      if (
        requestedMinutes < openingMinutes ||
        requestedMinutes >= closingMinutes
      ) {
        return NextResponse.json(
          {
            message: `Appointments are available only from ${businessHour.openTime} to ${businessHour.closeTime}.`,
          },
          {
            status: 400,
          }
        );
      }
    }

    // =====================================================
    // CALCULATE APPOINTMENT END TIME
    // =====================================================

    const startTotalMinutes =
      requestedMinutes;

    const endTotalMinutes =
      startTotalMinutes +
      service.duration;

    const endHour =
      Math.floor(
        endTotalMinutes / 60
      );

    const endMinute =
      endTotalMinutes % 60;

    const endTime =
      `${String(endHour).padStart(
        2,
        "0"
      )}:${String(endMinute).padStart(
        2,
        "0"
      )}`;

    console.log(
      "SERVICE DURATION:",
      service.duration
    );

    console.log(
      "START TIME:",
      time
    );

    console.log(
      "END TIME:",
      endTime
    );

    // =====================================================
    // SERVICE MUST FINISH BEFORE CLOSING
    // =====================================================

    if (
      businessHour.type === "NORMAL" &&
      endTotalMinutes > closingMinutes
    ) {
      return NextResponse.json(
        {
          message:
            `This service takes ${service.duration} minutes and cannot be completed before the salon closes at ${businessHour.closeTime}. Please select an earlier time.`,
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // STAFF AVAILABILITY
    // =====================================================

    if (staffId) {
      const staff =
        await prisma.user.findFirst({
          where: {
            id: staffId,
            role: "STAFF",
            isApproved: true,
            isEmailVerified: true,
          },
        });

      if (!staff) {
        return NextResponse.json(
          {
            message:
              "Selected staff member is not available.",
          },
          {
            status: 404,
          }
        );
      }

      // ===================================================
      // BLOCKED STAFF
      // ===================================================

      if (staff.isBlocked) {
        return NextResponse.json(
          {
            message:
              "Selected staff member is currently unavailable.",
          },
          {
            status: 400,
          }
        );
      }

      // ===================================================
      // CHECK STAFF SCHEDULE
      // ===================================================

      const staffSchedule =
        await prisma.staffSchedule.findFirst({
          where: {
            staffId,
            day: selectedDay,
          },
        });

      if (
        staffSchedule &&
        staffSchedule.status === "OFF"
      ) {
        return NextResponse.json(
          {
            message:
              `This staff member is off on ${selectedDay}. Please select another staff or another day.`,
          },
          {
            status: 400,
          }
        );
      }
    }

    // =====================================================
    // CUSTOMER TIME CONFLICT CHECK
    // =====================================================

    const existingCustomerAppointments =
      await prisma.appointment.findMany({
        where: {
          customerId,

          date: bookingDate,

          status: {
  in: [
    "PENDING",
    "CONFIRMED",
  ],
},
        },

        select: {
          time: true,
          endTime: true,
        },
      });

    for (const existing of
      existingCustomerAppointments) {
      if (!existing.endTime) continue;

      const existingStartMinutes =
        timeToMinutes(existing.time);

      const existingEndMinutes =
        timeToMinutes(existing.endTime);

      if (
        existingStartMinutes === null ||
        existingEndMinutes === null
      ) {
        continue;
      }

      if (
        startTotalMinutes <
          existingEndMinutes &&
        endTotalMinutes >
          existingStartMinutes
      ) {
        return NextResponse.json(
          {
            message:
              "You already have an appointment that overlaps with this time slot.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // =====================================================
    // STAFF TIME CONFLICT CHECK
    // =====================================================

    if (staffId) {
      const existingStaffAppointments =
        await prisma.appointment.findMany({
          where: {
            staffId,

            date: bookingDate,

            status: {
              in: [
                "PENDING",
                "CONFIRMED",
              ],
            },
          },

          select: {
            time: true,
            endTime: true,
          },
        });

      for (const existing of
        existingStaffAppointments) {
        if (!existing.endTime) continue;

        const existingStartMinutes =
          timeToMinutes(existing.time);

        const existingEndMinutes =
          timeToMinutes(existing.endTime);

        if (
          existingStartMinutes === null ||
          existingEndMinutes === null
        ) {
          continue;
        }

        if (
          startTotalMinutes <
            existingEndMinutes &&
          endTotalMinutes >
            existingStartMinutes
        ) {
          return NextResponse.json(
            {
              message:
                "This staff member is already booked during this time slot. Please select another staff or another time.",
            },
            {
              status: 400,
            }
          );
        }
      }
    }

    // =====================================================
    // EASYPAISA PAYMENT FLOW
    // =====================================================

    if (paymentMethod === "EASYPAISA") {
      const bookingData = {
        customerId,
        serviceId,
        staffId: staffId || null,
        date: bookingDate,
        time,
        paymentMethod,
        endTime,
        serviceName: service.name,
        servicePrice: service.price,
      };

      return NextResponse.json(
        {
          message:
            "Booking details validated. Please complete Easypaisa payment to confirm your appointment.",

          bookingData,

          paymentRequired: true,

          paymentInstructions: {
            initiatePaymentUrl:
              "/api/payment/easypaisa/initiate",

            method: "POST",

            body: {
              serviceId,
              staffId:
                staffId || null,
              date,
              time,
              paymentMethod,
              transactionType:
                "OTC or MA",
              msisdn:
                "03xxxxxxxxx",
              emailAddress:
                customerUser.email,
            },

            note:
              "Complete the payment initiation to start the Easypaisa payment process. Your appointment will be created only after successful payment verification.",
          },
        },
        {
          status: 200,
        }
      );
    }

    // =====================================================
    // CREATE APPOINTMENT
    // =====================================================

    const appointment =
      await prisma.appointment.create({
        data: {
          customerId,

          serviceId,

          staffId:
            staffId || null,

          date: bookingDate,

          time,

          paymentMethod,

          endTime,

           priceAtBooking: service.price,

          status: "PENDING",
        },
      });

    // =====================================================
    // GET CUSTOMER
    // =====================================================

    const customer =
      await prisma.user.findUnique({
        where: {
          id: customerId,
        },

        select: {
          name: true,
        },
      });

    // =====================================================
    // GET ADMINS
    // =====================================================

    const admins =
      await prisma.user.findMany({
        where: {
          role: "ADMIN",
        },

        select: {
          id: true,
        },
      });

    // =====================================================
    // ADMIN NOTIFICATIONS
    // =====================================================

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(
          (admin) => ({
            userId: admin.id,

            title:
              "New Appointment",

            message: `${
              customer?.name ||
              "A customer"
            } booked an appointment for ${
              service.name
            } on ${date} at ${time}.`,

            type:
              "APPOINTMENT",

            appointmentId:
              appointment.id,
          })
        ),
      });
    }

    // =====================================================
    // STAFF NOTIFICATION
    // =====================================================

    if (staffId) {
      await prisma.notification.create({
        data: {
          userId: staffId,

          title:
            "New Appointment",

          message: `${
            customer?.name ||
            "A customer"
          } booked an appointment for ${
            service.name
          } on ${date} at ${time}.`,

          type:
            "APPOINTMENT",

          appointmentId:
            appointment.id,
        },
      });
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json(
      {
        message:
          "Appointment booked successfully",

        appointment,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.log(
      "BOOK APPOINTMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error.message ||
          "Failed to book appointment",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// GET CUSTOMER APPOINTMENTS
// =====================================================

export async function GET() {
  try {
    const cookieStore =
      await cookies();

    const token =
      cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const decoded =
      await verifyToken(token);

    console.log(
      "CUSTOMER GET TOKEN:",
      decoded
    );

    if (!decoded) {
      return NextResponse.json(
        {
          message:
            "Invalid token",
        },
        {
          status: 401,
        }
      );
    }

    const customerId =
      decoded.id ||
      decoded.userId ||
      decoded.customerId;

    if (!customerId) {
      return NextResponse.json(
        {
          message:
            "Customer id missing",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // CHECK CUSTOMER
    // =====================================================

    const customer =
      await prisma.user.findUnique({
        where: {
          id: customerId,
        },

        select: {
          role: true,
          isBlocked: true,
        },
      });

    if (!customer) {
      return NextResponse.json(
        {
          message:
            "Customer not found",
        },
        {
          status: 404,
        }
      );
    }

    if (customer.isBlocked) {
      return NextResponse.json(
        {
          message:
            "Your account has been blocked by admin.",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // GET APPOINTMENTS
    // =====================================================

    const appointments =
      await prisma.appointment.findMany({
        where: {
          customerId,
        },

        include: {
          service: true,

          staff: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      appointments
    );
  } catch (error) {
    console.log(
      "GET APPOINTMENTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}