import { describe, it, expect } from 'vitest'
import { contactSchema } from '../schemas/contact.schema'

describe('Contact Schema Validation', () => {
  describe('Valid data', () => {
    it('should validate complete and valid contact form data', () => {
      const validData = {
        name: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        phone: '0612345678',
        project: 'creation' as const,
        message: 'Je souhaite créer un site web pour mon entreprise.',
        gdprConsent: true,
      }

      const result = contactSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate with optional phone field empty', () => {
      const validData = {
        name: 'Marie Martin',
        email: 'marie.martin@example.com',
        phone: '',
        project: 'refonte' as const,
        message: 'Je souhaite refondre mon site existant.',
        gdprConsent: true,
      }

      const result = contactSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate with phone field omitted', () => {
      const validData = {
        name: 'Pierre Durand',
        email: 'pierre.durand@example.com',
        project: 'seo' as const,
        message: 'J\'aimerais améliorer le SEO de mon site.',
        gdprConsent: true,
      }

      const result = contactSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should validate with +33 phone format', () => {
      const validData = {
        name: 'Sophie Bernard',
        email: 'sophie@example.com',
        phone: '+33612345678',
        project: 'maintenance' as const,
        message: 'Je recherche un contrat de maintenance.',
        gdprConsent: true,
      }

      const result = contactSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('Invalid data', () => {
    it('should reject name that is too short', () => {
      const invalidData = {
        name: 'A',
        email: 'test@example.com',
        project: 'creation' as const,
        message: 'Un message valide de test.',
        gdprConsent: true,
      }

      const result = contactSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('au moins 2 caractères')
      }
    })

    it('should reject name that is too long', () => {
      const invalidData = {
        name: 'A'.repeat(101),
        email: 'test@example.com',
        project: 'creation' as const,
        message: 'Un message valide de test.',
        gdprConsent: true,
      }

      const result = contactSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('100 caractères')
      }
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'not-an-email',
        project: 'creation' as const,
        message: 'Un message valide de test.',
        gdprConsent: true,
      }

      const result = contactSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email valide')
      }
    })

    it('should reject invalid phone format', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        phone: '123456',
        project: 'creation' as const,
        message: 'Un message valide de test.',
        gdprConsent: true,
      }

      const result = contactSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('téléphone invalide')
      }
    })

    it('should reject invalid project type', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        project: 'invalid-project',
        message: 'Un message valide de test.',
        gdprConsent: true,
      }

      const result = contactSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject message that is too short', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        project: 'creation' as const,
        message: 'Court',
        gdprConsent: true,
      }

      const result = contactSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('au moins 10 caractères')
      }
    })

    it('should reject message that is too long', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        project: 'creation' as const,
        message: 'A'.repeat(1001),
        gdprConsent: true,
      }

      const result = contactSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('1000 caractères')
      }
    })

    it('should reject when GDPR consent is not given', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        project: 'creation' as const,
        message: 'Un message valide de test.',
        gdprConsent: false,
      }

      const result = contactSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('politique de confidentialité')
      }
    })

    it('should reject when GDPR consent is missing', () => {
      const invalidData = {
        name: 'Jean Dupont',
        email: 'jean@example.com',
        project: 'creation' as const,
        message: 'Un message valide de test.',
      }

      const result = contactSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
