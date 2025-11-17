import crypto from 'crypto';

/**
 * Generate current timestamp in Nuvei format: YYYYMMDDHHmmss
 */
export function getCurrentTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

/**
 * Generate unique client request ID
 */
export function generateClientRequestId(): string {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Calculate checksum for getSessionToken
 * Format: merchantId + merchantSiteId + clientRequestId + timeStamp + secretKey
 */
export function calculateSessionTokenChecksum(
  merchantId: string,
  merchantSiteId: string,
  clientRequestId: string,
  timeStamp: string,
  secretKey: string
): string {
  const toHash = merchantId + merchantSiteId + clientRequestId + timeStamp + secretKey;
  return crypto.createHash('sha256').update(toHash).digest('hex');
}

/**
 * Calculate checksum for openOrder
 * Format: merchantId + merchantSiteId + clientRequestId + amount + currency + timeStamp + secretKey
 */
export function calculateOpenOrderChecksum(
  merchantId: string,
  merchantSiteId: string,
  clientRequestId: string,
  amount: string,
  currency: string,
  timeStamp: string,
  secretKey: string
): string {
  const toHash = merchantId + merchantSiteId + clientRequestId + amount + currency + timeStamp + secretKey;
  return crypto.createHash('sha256').update(toHash).digest('hex');
}

/**
 * Calculate checksum for payment methods
 * The exact format depends on the API method - this is a general one
 */
export function calculatePaymentChecksum(
  merchantId: string,
  merchantSiteId: string,
  clientRequestId: string,
  amount: string,
  currency: string,
  timeStamp: string,
  secretKey: string,
  additionalParams?: string
): string {
  const base = merchantId + merchantSiteId + clientRequestId + amount + currency + timeStamp;
  const toHash = additionalParams ? base + additionalParams + secretKey : base + secretKey;
  return crypto.createHash('sha256').update(toHash).digest('hex');
}

