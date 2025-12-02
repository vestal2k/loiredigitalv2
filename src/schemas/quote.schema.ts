import { z } from 'zod'

export const quoteSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z
    .string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone français invalide')
    .optional()
    .or(z.literal('')),
  packId: z.enum(['vitrine', 'business', 'premium'], {
    errorMap: () => ({ message: 'Pack invalide' }),
  }),
  pages: z.number().min(1, 'Au moins 1 page requise').max(100, 'Maximum 100 pages'),
  optionIds: z.array(z.string()).optional(),
  maintenance: z.enum(['none', 'essential', 'pro', 'premium'], {
    errorMap: () => ({ message: 'Type de maintenance invalide' }),
  }),
  totalPrice: z.number().min(0, 'Le prix ne peut pas être négatif'),
  message: z.string().max(1000, 'Le message est trop long (max 1000 caractères)').optional(),
  // Honeypot field - must be empty (bots will fill it, humans won't see it)
  website: z.string().max(0, 'Spam detected').optional().or(z.literal('')),
})

export type QuoteFormData = z.infer<typeof quoteSchema>
