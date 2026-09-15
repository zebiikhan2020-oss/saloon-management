import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  const hashedPassword = await bcrypt.hash(
    "zohaq@123",
    12
  );


  const admin = await prisma.user.upsert({

    where: {
      email: "webdev0317@gmail.com"
    },


    update: {
  password: hashedPassword,
  role: "ADMIN",
  isEmailVerified: true,
  isApproved: true
},


    create: {

      name: "Salon Admin",

      email: "webdev0317@gmail.com",

      password: hashedPassword,

      role: "ADMIN",

      isEmailVerified: true,

      isApproved: true

    }

  });


  console.log(
    "Admin created:",
    admin.email
  );

  // Seed default business hours
  const businessHours = [
    { day: "Monday", type: "NORMAL", openTime: "09:00", closeTime: "22:00" },
    { day: "Tuesday", type: "NORMAL", openTime: "09:00", closeTime: "22:00" },
    { day: "Wednesday", type: "NORMAL", openTime: "09:00", closeTime: "22:00" },
    { day: "Thursday", type: "NORMAL", openTime: "09:00", closeTime: "22:00" },
    { day: "Friday", type: "NORMAL", openTime: "09:00", closeTime: "22:00" },
    { day: "Saturday", type: "NORMAL", openTime: "09:00", closeTime: "22:00" },
    { day: "Sunday", type: "NORMAL", openTime: "09:00", closeTime: "22:00" },
  ];

  for (const hour of businessHours) {
    await prisma.businessHour.upsert({
      where: { day: hour.day },
      update: hour,
      create: hour,
    });
  }

  console.log("Business hours seeded successfully");

}


main()

.catch((error) => {

  console.log(error);

  process.exit(1);

})


.finally(async () => {

  await prisma.$disconnect();

});