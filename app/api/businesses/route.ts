import { prisma } from "@/lib/prisma";

export async function GET() {
  const businesses = await prisma.business.findMany({
    select: {
      name: true,
      suburb: true,
      hasBackupPower: true,
      powerStatuses: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: {
          status: true,
          updatedAt: true,
        },
      },
    },
  });

  const result = businesses.map((b) => ({
    name: b.name,
    suburb: b.suburb,
    hasBackupPower: b.hasBackupPower,
    powerStatus: b.powerStatuses[0]?.status ?? "UNKNOWN",
    updatedAt: b.powerStatuses[0]?.updatedAt ?? null,
  }));

  return Response.json(result);
}
