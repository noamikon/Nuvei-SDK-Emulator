import { NextRequest, NextResponse } from "next/server";
import { getCurrentTimestamp } from "@/lib/nuvei-utils";
import crypto from "crypto";

const NUVEI_API_BASE_URL = process.env.NUVEI_API_URL || "https://ppp-test.safecharge.com/ppp/api/v1";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { merchantId, merchantSiteId, sessionToken } = body;
    const secretKey = req.headers.get('X-Secret-Key');

    if (!merchantId || !merchantSiteId || !secretKey || !sessionToken) {
        return NextResponse.json(
            { error: "Missing required fields: merchantId, merchantSiteId, secretKey (header), sessionToken" },
            { status: 400 }
        );
    }

    try {
        const clientRequestId = crypto.randomBytes(8).toString('hex');
        const timeStamp = getCurrentTimestamp();

        // Calculate checksum for getPaymentStatus
        // Format: merchantId + merchantSiteId + clientRequestId + timeStamp + secretKey
        const checksumString = merchantId + merchantSiteId + clientRequestId + timeStamp + secretKey;
        const checksum = crypto.createHash('sha256').update(checksumString).digest('hex');

        const payload: any = {
            merchantId,
            merchantSiteId,
            clientRequestId,
            sessionToken,
            timeStamp,
            checksum,
        };

        // Call Nuvei's getPaymentStatus API
        const response = await fetch(`${NUVEI_API_BASE_URL}/getPaymentStatus.do`, {
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
                    error: data.errorDescription || data.reason || data.status || "Failed to get payment status",
                    response: data,
                },
                { status: response.status || 500 }
            );
        }

        return NextResponse.json({
            ok: true,
            response: data,
            message: "Payment status retrieved successfully",
        });
    } catch (err: any) {
        console.error("Error getting payment status:", err);
        return NextResponse.json(
            {
                ok: false,
                error: err.message || "Failed to get payment status",
            },
            { status: 500 }
        );
    }
}
