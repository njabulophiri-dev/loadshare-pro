import { PrismaClient, UserRole, PowerState } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean slate (safe for dev only)
  await prisma.powerStatus.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: "admin@loadsharepro.co.za",
      role: UserRole.ADMIN,
    },
  });

  const businessOwner = await prisma.user.create({
    data: {
      email: "owner@loadsharepro.co.za",
      role: UserRole.BUSINESS,
    },
  });

  const spar = await prisma.business.create({
    data: {
      name: "SPAR Melville",
      city: "Johannesburg",
      suburb: "Melville",
      hasBackupPower: true,
      ownerId: businessOwner.id,
    },
  });

  const clicks = await prisma.business.create({
    data: {
      name: "Clicks Rosebank",
      city: "Johannesburg",
      suburb: "Rosebank",
      hasBackupPower: false,
      ownerId: businessOwner.id,
    },
  });

  await prisma.powerStatus.createMany({
    data: [
      {
        businessId: spar.id,
        status: PowerState.ONLINE,
      },
      {
        businessId: clicks.id,
        status: PowerState.OFFLINE,
      },
    ],
  });

  console.log("Seed data created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
