import { z } from 'zod'

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  phone: z
    .string()
    .regex(/^(?:\+33|0)[1-9](?:[0-9]{8})$/, 'Numéro de téléphone invalide (ex: 0612345678)')
    .optional()
    .or(z.literal('')),
  project: z.enum(['creation', 'refonte', 'maintenance', 'seo', 'autre'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un type de projet' }),
  }),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
  gdprConsent: z.literal(true, {
    errorMap: () => ({
      message: 'Vous devez accepter la politique de confidentialité pour continuer',
    }),
  }),
  // Honeypot field - must be empty (bots will fill it, humans won't see it)
  website: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
})

export type ContactFormData = z.infer<typeof contactSchema>
