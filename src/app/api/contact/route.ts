import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/schemas/contact.schema";

export async function POST(request: Request) {
  try {
    const correlationId = request.headers.get("x-correlation-id") || crypto.randomUUID();
    const body = await request.json();

    const parseResult = contactSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          statusCode: 400,
          correlationId,
          message: "Validation failed",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Demo response simulating secure CRM or backend dispatch
    return NextResponse.json(
      {
        statusCode: 200,
        correlationId,
        message: "Your message has been securely received. Our team will contact you shortly.",
        data: {
          referenceId: `TICK-${Math.floor(100000 + Math.random() * 900000)}`,
          name: parseResult.data.name,
          email: parseResult.data.email,
          receivedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        statusCode: 500,
        message: "Failed to process contact submission",
      },
      { status: 500 }
    );
  }
}
