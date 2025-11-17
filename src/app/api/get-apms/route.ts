import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentTimestamp,
  generateClientRequestId,
} from "@/lib/nuvei-utils";
import crypto from "crypto";

const NUVEI_API_BASE_URL = process.env.NUVEI_API_URL || "https://ppp-test.safecharge.com/ppp/api/v1";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { merchantId, merchantSiteId, secretKey, sessionToken, currencyCode, countryCode, languageCode } = body;

  if (!merchantId || !merchantSiteId || !secretKey || !sessionToken) {
    return NextResponse.json(
      { error: "Missing required fields: merchantId, merchantSiteId, secretKey, sessionToken" },
      { status: 400 }
    );
  }

  try {
    // Use the provided session token to call getMerchantPaymentMethods
    const clientRequestId = generateClientRequestId();
    const timeStamp = getCurrentTimestamp();
    const checksumString = merchantId + merchantSiteId + clientRequestId + timeStamp + secretKey;
    const checksum = crypto.createHash('sha256').update(checksumString, 'utf8').digest('hex');

    const payload: any = {
      sessionToken,
      merchantId,
      merchantSiteId,
      clientRequestId,
      timeStamp,
      checksum,
    };

    // Add optional parameters
    if (currencyCode) payload.currencyCode = currencyCode;
    if (countryCode) payload.countryCode = countryCode;
    if (languageCode) payload.languageCode = languageCode;

    console.log('Calling getMerchantPaymentMethods with payload:', payload);

    // Call Nuvei's getMerchantPaymentMethods API
    const response = await fetch(`${NUVEI_API_BASE_URL}/getMerchantPaymentMethods.do`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('getMerchantPaymentMethods response:', data);

    if (!response.ok || data.status !== "SUCCESS") {
      return NextResponse.json(
        {
          ok: false,
          error: data.errorDescription || data.status || "Failed to get payment methods",
          details: data,
        },
        { status: response.status || 500 }
      );
    }

    // Filter out credit card and wallet APMs (Apple Pay, Google Pay, Moneybookers)
    const apms = (data.paymentMethods || []).filter((pm: any) => {
      const pmName = (pm.paymentMethod || '').toLowerCase();
      
      // Exclude credit cards
      if (pmName === 'cc_card' || pmName.includes('cc_card')) {
        return false;
      }
      
      // Exclude Apple Pay (various formats: apmgw_applepay, ppp_applepay, etc.)
      if (pmName.includes('applepay')) {
        return false;
      }
      
      // Exclude Google Pay (various formats: apmgw_googlepay, ppp_googlepay, etc.)
      if (pmName.includes('googlepay')) {
        return false;
      }
      
      // Exclude Moneybookers (various formats: apmgw_moneybookers, moneybookers, etc.)
      if (pmName.includes('moneybookers')) {
        return false;
      }
      
      return true;
    });

    return NextResponse.json({
      ok: true,
      apms: apms,
      message: "Payment methods retrieved successfully",
    });
  } catch (err: any) {
    console.error("Error getting payment methods:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Failed to get payment methods",
      },
      { status: 500 }
    );
  }
}

