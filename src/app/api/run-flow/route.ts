import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentTimestamp,
  generateClientRequestId,
} from "@/lib/nuvei-utils";
import crypto from "crypto";

const NUVEI_API_BASE_URL = process.env.NUVEI_API_URL || "https://ppp-test.safecharge.com/ppp/api/v1";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { merchantId, merchantSiteId, secretKey, flow, orderId, ccTempToken, amount, currency, sessionToken } = body;

  if (!merchantId || !merchantSiteId || !secretKey || !flow) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  /* Collect logs in an array so we can send to frontend */
  const logs: string[] = [];

  function log(msg: string) {
    const line = `[${new Date().toISOString()}] ${msg}`;
    logs.push(line);
    console.log(line);
  }

  try {
    log(`Starting flow ${flow}`);

    // Handle different flow types
    switch (flow) {
      case "simpleCreditCardDeposit":
        if (!orderId || !ccTempToken || !amount || !currency || !sessionToken) {
          return NextResponse.json(
            { error: "Missing required fields for createPayment: orderId, ccTempToken, amount, currency, sessionToken" },
            { status: 400 }
          );
        }

        log("Calling createPayment() with token and sessionToken");

        const clientRequestId = generateClientRequestId();
        const timeStamp = getCurrentTimestamp();
        
        // Calculate checksum for payment API
        // Exact format: merchantId + merchantSiteId + amount + currency + timeStamp + merchantSecretKey
        const checksumString = 
          merchantId +
          merchantSiteId +
          amount +
          currency +
          timeStamp +
          secretKey;
        
        const checksum = crypto.createHash('sha256').update(checksumString, 'utf8').digest('hex');
        
        log(`Checksum format: merchantId + merchantSiteId + amount + currency + timeStamp + secretKey`);
        log(`Checksum string (excluding secretKey): ${merchantId + merchantSiteId + amount + currency + timeStamp}...`);

        const createPaymentPayload: any = {
          sessionToken, // REQUIRED: Session token from openOrder
          merchantId,
          merchantSiteId,
          clientRequestId,
          clientUniqueId: `PAY_${Date.now()}`,
          currency,
          amount,
          orderId,
          paymentOption: {
            card: {
              cardToken: ccTempToken, // Token from Nuvei Fields getToken()
            },
          },
          billingAddress: {
            email: "test@example.com", // Required field
            country: "US", // Required field
          },
          deviceDetails: {
            ipAddress: "192.168.1.1", // Required field - in production, get from request
          },
          timeStamp,
          checksum,
          transactionType: "Sale",
        };

        log(`createPayment payload: ${JSON.stringify(createPaymentPayload, null, 2)}`);

        // Call Nuvei's payment API
        const paymentResponse = await fetch(`${NUVEI_API_BASE_URL}/payment.do`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createPaymentPayload),
        });

        const paymentData = await paymentResponse.json();

        log(`createPayment response: ${JSON.stringify(paymentData, null, 2)}`);

        if (!paymentResponse.ok || paymentData.status !== "SUCCESS") {
          return NextResponse.json(
            {
              ok: false,
              error: paymentData.errorDescription || paymentData.status || "Payment failed",
              details: paymentData,
              logs,
            },
            { status: paymentResponse.status || 500 }
          );
        }

        log("=== Simple Credit Card Deposit Flow Completed ===");

        return NextResponse.json({
          ok: true,
          result: {
            flow,
            status: "SUCCESS",
            message: "Credit card deposit completed successfully",
            methods: {
              createPayment: {
                method: "createPayment()",
                request: createPaymentPayload,
                response: paymentData,
              },
            },
            summary: {
              orderId: orderId,
              transactionId: paymentData.transactionId,
              finalStatus: paymentData.status,
            },
          },
          logs,
        });

      case "threeDSCreditCardDeposit":
        log("Calling Nuvei 3DS Credit Card Deposit (placeholder)");
        log("3D Secure authentication required");
        return NextResponse.json({
          ok: true,
          result: {
            flow,
            status: "PENDING_3DS",
            message: "3DS authentication required",
            redirectUrl: "https://example.com/3ds-authentication",
            transactionId: `TXN-${Date.now()}`,
          },
          logs,
        });

      case "applePayDeposit":
        log("Calling Nuvei Apple Pay Deposit (placeholder)");
        return NextResponse.json({
          ok: true,
          result: {
            flow,
            status: "SUCCESS",
            message: "Apple Pay deposit processed",
            transactionId: `TXN-${Date.now()}`,
          },
          logs,
        });

      case "googlePayDeposit":
        log("Calling Nuvei Google Pay Deposit (placeholder)");
        return NextResponse.json({
          ok: true,
          result: {
            flow,
            status: "SUCCESS",
            message: "Google Pay deposit processed",
            transactionId: `TXN-${Date.now()}`,
          },
          logs,
        });

      default:
        return NextResponse.json({ ok: false, error: `Unknown flow: ${flow}`, logs }, { status: 400 });
    }
  } catch (err: any) {
    log(`Error: ${err.message || "unknown error"}`);
    return NextResponse.json({ ok: false, error: err.message, logs }, { status: 500 });
  }
}
