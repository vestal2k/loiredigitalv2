import { describe, it, expect } from 'vitest'
import { quoteSchema } from '../schemas/quote.schema'

describe('Quote Schema Validation', () => {
  describe('Valid data', () => {
    it('should validate complete and valid quote form data', () => {
      const validData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        phone: '0612345678',
        packId: 'vitrine' as const,
        pages: 5,
        optionIds: ['blog', 'seo'],
        maintenance: 'essential' as const,
        totalPrice: 1200,
        message: 'Je souhaite obtenir un devis pour mon projet.',
      }

      const result = quoteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate with optional fields omitted', () => {
      const validData = {
        name: 'Marie Martin',
        email: 'marie@example.com',
        packId: 'business' as const,
        pages: 3,
        maintenance: 'none' as const,
        totalPrice: 800,
      }

      const result = quoteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate with empty phone string', () => {
      const validData = {
        name: 'Pierre Durand',
        email: 'pierre@example.com',
        phone: '',
        packId: 'premium' as const,
        pages: 10,
        maintenance: 'pro' as const,
        totalPrice: 2500,
      }

      const result = quoteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate with +33 phone format', () => {
      const validData = {
        name: 'Sophie Bernard',
        email: 'sophie@example.com',
        phone: '+33612345678',
        packId: 'vitrine' as const,
        pages: 4,
        maintenance: 'premium' as const,
        totalPrice: 1500,
      }

      const result = quoteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate with empty optionIds array', () => {
      const validData = {
        name: 'Luc Petit',
        email: 'luc@example.com',
        packId: 'vitrine' as const,
        pages: 3,
        optionIds: [],
        maintenance: 'none' as const,
        totalPrice: 600,
      }

      const result = quoteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate with maximum number of pages', () => {
      const validData = {
        name: 'Antoine Laurent',
        email: 'antoine@example.com',
        packId: 'premium' as const,
        pages: 100,
        maintenance: 'premium' as const,
        totalPrice: 15000,
      }

      const result = quoteSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Invalid data', () => {
    it('should reject name that is too short', () => {
      const invalidData = {
        name: 'A',
        email: 'test@example.com',
        packId: 'vitrine' as const,
        pages: 3,
        maintenance: 'none' as const,
        totalPrice: 600,
      }

      const result = quoteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('au moins 2 caractères')
      }
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'invalid-email',
        packId: 'vitrine' as const,
        pages: 3,
        maintenance: 'none' as const,
        totalPrice: 600,
      }

      const result = quoteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email invalide')
      }
    })

    it('should reject invalid phone format', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        phone: '123',
        packId: 'vitrine' as const,
        pages: 3,
        maintenance: 'none' as const,
        totalPrice: 600,
      }

      const result = quoteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('téléphone')
      }
    })

    it('should reject invalid pack ID', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        packId: 'invalid-pack',
        pages: 3,
        maintenance: 'none' as const,
        totalPrice: 600,
      }

      const result = quoteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject zero pages', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        packId: 'vitrine' as const,
        pages: 0,
        maintenance: 'none' as const,
        totalPrice: 600,
      }

      const result = quoteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Au moins 1 page')
      }
    })

    it('should reject too many pages', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        packId: 'vitrine' as const,
        pages: 101,
        maintenance: 'none' as const,
        totalPrice: 10000,
      }

      const result = quoteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('100 pages')
      }
    })

    it('should reject invalid maintenance type', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        packId: 'vitrine' as const,
        pages: 3,
        maintenance: 'invalid-maintenance',
        totalPrice: 600,
      }

      const result = quoteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject negative total price', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        packId: 'vitrine' as const,
        pages: 3,
        maintenance: 'none' as const,
        totalPrice: -100,
      }

      const result = quoteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('négatif')
      }
    })

    it('should reject message that is too long', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        packId: 'vitrine' as const,
        pages: 3,
        maintenance: 'none' as const,
        totalPrice: 600,
        message: 'A'.repeat(1001),
      }

      const result = quoteSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('1000 caractères')
      }
    })
  })
})
