import { NextRequest, NextResponse } from "next/server";
import {
    getCurrentTimestamp,
    calculateUpdateOrderChecksum,
} from "@/lib/nuvei-utils";

const NUVEI_API_BASE_URL = process.env.NUVEI_API_URL || "https://ppp-test.safecharge.com/ppp/api/v1";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { merchantId, merchantSiteId, sessionToken, orderId, currency, clientRequestId, amount } = body;
    const secretKey = req.headers.get('X-Secret-Key');

    if (!merchantId || !merchantSiteId || !secretKey || !sessionToken || !orderId || !currency) {
        return NextResponse.json(
            { error: "Missing required fields: merchantId, merchantSiteId, secretKey (header), sessionToken, orderId, currency" },
            { status: 400 }
        );
    }

    try {
        const timeStamp = getCurrentTimestamp();
        const checksum = calculateUpdateOrderChecksum(
            merchantId,
            merchantSiteId,
            clientRequestId || `${Date.now()}`,
            currency,
            timeStamp,
            secretKey
        );

        const payload: any = {
            merchantId,
            merchantSiteId,
            sessionToken,
            orderId,
            clientRequestId: clientRequestId || `${Date.now()}`,
            currency,
            timeStamp,
            checksum,
        };

        // Call Nuvei's updateOrder API
        const response = await fetch(`${NUVEI_API_BASE_URL}/updateOrder.do`, {
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
                    error: data.errorDescription || data.reason || data.status || "Failed to update order",
                    response: data,
                },
                { status: response.status || 500 }
            );
        }

        return NextResponse.json({
            ok: true,
            response: data,
            message: "Order updated successfully",
        });
    } catch (err: any) {
        console.error("Error updating order:", err);
        return NextResponse.json(
            {
                ok: false,
                error: err.message || "Failed to update order",
            },
            { status: 500 }
        );
    }
}
