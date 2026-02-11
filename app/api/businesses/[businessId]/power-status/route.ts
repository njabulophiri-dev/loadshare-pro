import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PowerState } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ businessId: string }> }
) {
  const { businessId } = await params;
  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!["ADMIN", "BUSINESS"].includes(session.user.role)) {
    return new Response("Forbidden", { status: 403 });
  }

  const body = await req.json();

  if (!Object.values(PowerState).includes(body.status)) {
    return new Response("Invalid power status", { status: 400 });
  }

  const business = await prisma.business.findUnique({
    where: { id: businessId },
  });

  if (!business) {
    return new Response("Business not found", { status: 404 });
  }

  const powerStatus = await prisma.powerStatus.create({
    data: {
      businessId: business.id,
      status: body.status,
    },
  });

  return Response.json(powerStatus, { status: 201 });
}
