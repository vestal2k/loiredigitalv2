import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, cleanupExpiredRecords } from '../lib/rate-limiter'

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Reset the rate limiter state before each test
    vi.useFakeTimers()
  })

  describe('checkRateLimit', () => {
    it('should allow first request from new IP', () => {
      const result = checkRateLimit('192.168.1.1', 5, 60000)
      expect(result).toBe(true)
    })

    it('should allow requests within limit', () => {
      const ip = '192.168.1.2'
      const limit = 5

      // Make 5 requests - all should succeed
      for (let i = 0; i < limit; i++) {
        const result = checkRateLimit(ip, limit, 60000)
        expect(result).toBe(true)
      }
    })

    it('should deny requests exceeding limit', () => {
      const ip = '192.168.1.3'
      const limit = 3

      // Make requests up to the limit
      for (let i = 0; i < limit; i++) {
        checkRateLimit(ip, limit, 60000)
      }

      // Next request should be denied
      const result = checkRateLimit(ip, limit, 60000)
      expect(result).toBe(false)
    })

    it('should reset after time window expires', () => {
      const ip = '192.168.1.4'
      const limit = 2
      const windowMs = 60000

      // Exhaust the limit
      checkRateLimit(ip, limit, windowMs)
      checkRateLimit(ip, limit, windowMs)

      // Next request should be denied
      expect(checkRateLimit(ip, limit, windowMs)).toBe(false)

      // Advance time past the window
      vi.advanceTimersByTime(windowMs + 1000)

      // Should allow new requests after reset
      expect(checkRateLimit(ip, limit, windowMs)).toBe(true)
    })

    it('should handle different IPs independently', () => {
      const limit = 2

      // IP 1 exhausts limit
      checkRateLimit('192.168.1.5', limit, 60000)
      checkRateLimit('192.168.1.5', limit, 60000)
      expect(checkRateLimit('192.168.1.5', limit, 60000)).toBe(false)

      // IP 2 should still have full quota
      expect(checkRateLimit('192.168.1.6', limit, 60000)).toBe(true)
    })
  })

  describe('cleanupExpiredRecords', () => {
    it('should remove expired records', () => {
      const ip = '192.168.1.7'
      const windowMs = 60000

      // Create a record
      checkRateLimit(ip, 5, windowMs)

      // Advance time past expiration
      vi.advanceTimersByTime(windowMs + 1000)

      // Cleanup should remove the expired record
      cleanupExpiredRecords()

      // After cleanup, should be able to make full quota of requests again
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(ip, 5, windowMs)
        expect(result).toBe(true)
      }
    })

    it('should not remove active records', () => {
      const ip = '192.168.1.8'
      const windowMs = 60000
      const limit = 3

      // Create a record and use some quota
      checkRateLimit(ip, limit, windowMs)
      checkRateLimit(ip, limit, windowMs)

      // Cleanup before expiration
      cleanupExpiredRecords()

      // Should still have used quota
      checkRateLimit(ip, limit, windowMs) // This is the 3rd request
      expect(checkRateLimit(ip, limit, windowMs)).toBe(false) // 4th should fail
    })
  })
})
