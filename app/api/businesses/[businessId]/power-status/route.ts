import { prisma } from "@/lib/prisma";
import { PowerState } from "@prisma/client";
import { NextResponse } from "next/server";

/**
 * GET latest power status for a business
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ businessId: string }> } // ← FIXED: params is a Promise!
) {
  try {
    // Await the params Promise first
    const { businessId } = await params; // ← FIXED: Must await!
    
    const powerStatus = await prisma.powerStatus.findFirst({
      where: { businessId },
      orderBy: { updatedAt: "desc" },
    });

    if (!powerStatus) {
      return NextResponse.json(
        { error: "No power status found" },
        { status: 404 }
      );
    }

    return NextResponse.json(powerStatus);
  } catch (error) {
    console.error("Error in GET power-status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST new power status update
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ businessId: string }> } // ← FIXED: params is a Promise!
) {
  try {
    // 1. Await the params Promise first
    const { businessId } = await params; // ← FIXED: Must await!
    console.log("Processing power status for business:", businessId);

    // 2. Parse request body
    const body = await req.json();
    const { status } = body;

    // 3. Validate status is provided
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // 4. Validate against PowerState enum
    const validStatuses = Object.values(PowerState); // [ONLINE, BACKUP, OFFLINE]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: "Invalid power status",
          validStatuses
        },
        { status: 400 }
      );
    }

    // 5. Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return NextResponse.json(
        { error: `Business with ID ${businessId} not found` },
        { status: 404 }
      );
    }

    // 6. Create power status record
    const powerStatus = await prisma.powerStatus.create({
      data: {
        status: status as PowerState,
        businessId: businessId,
      },
    });

    // 7. Return success response
    return NextResponse.json({
      success: true,
      message: "Power status updated successfully",
      data: {
        businessId,
        businessName: business.name,
        status: powerStatus.status,
        powerStatusId: powerStatus.id,
        updatedAt: powerStatus.updatedAt,
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error in POST power-status:", error);

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Invalid business ID or business does not exist" },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}