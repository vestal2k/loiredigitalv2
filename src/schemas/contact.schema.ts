import { z } from 'zod'

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  project: z.enum(['creation', 'refonte', 'maintenance', 'seo', 'autre'], {
    errorMap: () => ({ message: 'Veuillez sélectionner un type de projet' }),
  }),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères'),
})

export type ContactFormData = z.infer<typeof contactSchema>
