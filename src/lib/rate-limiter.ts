/**
 * Simple in-memory rate limiter for API endpoints
 * Tracks requests by IP address and enforces rate limits
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

// Store request counts in memory
const requestCounts = new Map<string, RateLimitRecord>()

/**
 * Check if a request from the given IP should be rate limited
 * @param ip - Client IP address
 * @param limit - Maximum number of requests allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limit exceeded
 */
export function checkRateLimit(
  ip: string,
  limit: number = 10,
  windowMs: number = 60000,
): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)

  // If no record exists or the time window has expired, create a new one
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    })
    return true
  }

  // If limit is exceeded, deny the request
  if (record.count >= limit) {
    return false
  }

  // Increment the count and allow the request
  record.count++
  return true
}

/**
 * Clean up expired rate limit records
 * Call this periodically to prevent memory leaks
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now()
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip)
    }
  }
}

// Clean up expired records every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredRecords, 5 * 60 * 1000)
}
