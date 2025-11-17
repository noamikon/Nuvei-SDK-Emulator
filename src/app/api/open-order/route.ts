import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentTimestamp,
  generateClientRequestId,
  calculateOpenOrderChecksum,
} from "@/lib/nuvei-utils";

const NUVEI_API_BASE_URL = process.env.NUVEI_API_URL || "https://ppp-test.safecharge.com/ppp/api/v1";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { merchantId, merchantSiteId, secretKey, amount, currency, clientUniqueId, userTokenId, notificationUrl } = body;

  if (!merchantId || !merchantSiteId || !secretKey || !amount || !currency) {
    return NextResponse.json(
      { error: "Missing required fields: merchantId, merchantSiteId, secretKey, amount, currency" },
      { status: 400 }
    );
  }

  try {
    const clientRequestId = generateClientRequestId();
    const timeStamp = getCurrentTimestamp();
    const checksum = calculateOpenOrderChecksum(
      merchantId,
      merchantSiteId,
      clientRequestId,
      amount,
      currency,
      timeStamp,
      secretKey
    );

    const payload: any = {
      merchantId,
      merchantSiteId,
      clientRequestId,
      clientUniqueId: clientUniqueId || `UNIQUE_${Date.now()}`,
      currency,
      amount,
      timeStamp,
      checksum,
    };

    // Add optional fields
    if (userTokenId) {
      payload.userTokenId = userTokenId;
    }
    
    // Add notification URL for DMN webhooks
    if (notificationUrl) {
      payload.urlDetails = {
        notificationUrl: notificationUrl
      };
    }
    
    payload.transactionType = "Sale"; // Transaction type for all flows

    // Call Nuvei's openOrder API
    const response = await fetch(`${NUVEI_API_BASE_URL}/openOrder.do`, {
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
          error: data.errorDescription || data.status || "Failed to open order",
          details: data,
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      sessionToken: data.sessionToken,
      orderId: data.orderId,
      response: data,
      message: "Order opened successfully",
    });
  } catch (err: any) {
    console.error("Error opening order:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Failed to open order",
      },
      { status: 500 }
    );
  }
}

