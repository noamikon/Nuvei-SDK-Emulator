import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentTimestamp,
  generateClientRequestId,
  calculateSessionTokenChecksum,
} from "@/lib/nuvei-utils";

const NUVEI_API_BASE_URL = process.env.NUVEI_API_URL || "https://ppp-test.safecharge.com/ppp/api/v1";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { merchantId, merchantSiteId, secretKey } = body;

  if (!merchantId || !merchantSiteId || !secretKey) {
    return NextResponse.json({ error: "Missing merchant credentials" }, { status: 400 });
  }

  try {
    const clientRequestId = generateClientRequestId();
    const timeStamp = getCurrentTimestamp();
    const checksum = calculateSessionTokenChecksum(
      merchantId,
      merchantSiteId,
      clientRequestId,
      timeStamp,
      secretKey
    );

    const payload = {
      merchantId,
      merchantSiteId,
      clientRequestId,
      timeStamp,
      checksum,
    };

    // Call Nuvei's getSessionToken API
    const response = await fetch(`${NUVEI_API_BASE_URL}/getSessionToken.do`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.status !== "SUCCESS") {
      return NextResponse.json(
        {
          ok: false,
          error: data.errorDescription || data.status || "Failed to get session token",
          details: data,
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      sessionToken: data.sessionToken,
      message: "Session token obtained successfully",
    });
  } catch (err: any) {
    console.error("Error getting session token:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Failed to get session token",
      },
      { status: 500 }
    );
  }
}

