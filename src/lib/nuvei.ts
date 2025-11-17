type RunNuveiFlowArgs = {
  merchantId: string;
  merchantSiteId: string;
  secretKey: string;
  flow: string;
  flowParams: Record<string, string>;
  log: (msg: string) => void;
};

export async function runNuveiFlow({
  merchantId,
  merchantSiteId,
  secretKey,
  flow,
  flowParams,
  log
}: RunNuveiFlowArgs) {
  /* Here you'll call the real Nuvei SDK / REST endpoint */

  log("Preparing request payload");

  /* Base payload with merchant credentials */
  const basePayload = {
    merchantId,
    merchantSiteId,
    timeStamp: Date.now().toString(),
    ...flowParams
    /* ... whatever else Nuvei needs ... */
  };

  log(`Payload prepared: ${JSON.stringify(basePayload, null, 2)}`);

  // Handle different flow types
  switch (flow) {
    case "simpleCreditCardDeposit":
      log("=== Starting Simple Credit Card Deposit Flow ===");
      log("Step 1: Calling openOrder()");
      
      // Step 1: openOrder()
      const openOrderPayload = {
        ...basePayload,
        amount: flowParams.amount,
        currency: flowParams.currency,
        // Add other required fields for openOrder
      };
      
      log(`openOrder payload: ${JSON.stringify(openOrderPayload, null, 2)}`);
      
      /* TODO: replace with real SDK call, e.g. await nuveiSdk.openOrder(...) */
      const openOrderResponse = {
        status: "SUCCESS",
        orderId: `ORD-${Date.now()}`,
        response: {
          status: "SUCCESS",
          orderId: `ORD-${Date.now()}`,
          transactionId: `TXN-${Date.now()}`,
          message: "Order opened successfully"
        }
      };
      
      log(`openOrder response: ${JSON.stringify(openOrderResponse, null, 2)}`);
      log("Step 2: Calling createPayment()");
      
      if (openOrderResponse.status !== "SUCCESS") {
        throw new Error(`openOrder failed: ${JSON.stringify(openOrderResponse)}`);
      }
      
      // Step 2: createPayment()
      const createPaymentPayload = {
        ...basePayload,
        orderId: openOrderResponse.orderId,
        amount: flowParams.amount,
        currency: flowParams.currency,
        cardToken: flowParams.ccTempToken,
        // Add other required fields for createPayment
      };
      
      log(`createPayment payload: ${JSON.stringify(createPaymentPayload, null, 2)}`);
      
      /* TODO: replace with real SDK call, e.g. await nuveiSdk.createPayment(...) */
      const createPaymentResponse = {
        status: "SUCCESS",
        paymentId: `PAY-${Date.now()}`,
        response: {
          status: "SUCCESS",
          paymentId: `PAY-${Date.now()}`,
          transactionId: `TXN-${Date.now()}`,
          message: "Payment created successfully"
        }
      };
      
      log(`createPayment response: ${JSON.stringify(createPaymentResponse, null, 2)}`);
      log("=== Simple Credit Card Deposit Flow Completed ===");
      
      return {
        flow,
        status: "SUCCESS",
        message: "Credit card deposit completed successfully",
        methods: {
          openOrder: {
            method: "openOrder()",
            request: openOrderPayload,
            response: openOrderResponse.response
          },
          createPayment: {
            method: "createPayment()",
            request: createPaymentPayload,
            response: createPaymentResponse.response
          }
        },
        summary: {
          orderId: openOrderResponse.orderId,
          paymentId: createPaymentResponse.paymentId,
          finalStatus: createPaymentResponse.status
        }
      };

    case "threeDSCreditCardDeposit":
      log("Calling Nuvei 3DS Credit Card Deposit (placeholder)");
      log("3D Secure authentication required");
      /* TODO: replace with real SDK call, e.g. await nuveiSdk.creditCard3DSDeposit(...) */
      return {
        flow,
        status: "PENDING_3DS",
        message: "3DS authentication required",
        payloadSent: basePayload,
        redirectUrl: "https://example.com/3ds-authentication",
        transactionId: `TXN-${Date.now()}`
      };

    case "applePayDeposit":
      log("Calling Nuvei Apple Pay Deposit (placeholder)");
      /* TODO: replace with real SDK call, e.g. await nuveiSdk.applePayDeposit(...) */
      return {
        flow,
        status: "SUCCESS",
        message: "Apple Pay deposit processed",
        payloadSent: basePayload,
        transactionId: `TXN-${Date.now()}`
      };

    case "googlePayDeposit":
      log("Calling Nuvei Google Pay Deposit (placeholder)");
      /* TODO: replace with real SDK call, e.g. await nuveiSdk.googlePayDeposit(...) */
      return {
        flow,
        status: "SUCCESS",
        message: "Google Pay deposit processed",
        payloadSent: basePayload,
        transactionId: `TXN-${Date.now()}`
      };

    default:
      throw new Error(`Unknown flow: ${flow}`);
  }
}
