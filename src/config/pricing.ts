/**
 * Pricing configuration for Loire Digital services
 * Single source of truth for all pricing across the site
 */

export interface PricingPack {
  id: string
  name: string
  basePrice: number
  pagesIncluded: number
  features: string[]
  popular?: boolean
  description?: string
  deliveryTime?: string
  paymentOptions?: {
    upfront: boolean
    installments3x?: boolean
    installments6x?: boolean
  }
}

export interface PricingOption {
  id: string
  name: string
  price: number
  description: string
}

/**
 * Main pricing packs
 */
export const PRICING_PACKS: PricingPack[] = [
  {
    id: 'starter',
    name: 'Starter',
    basePrice: 400,
    pagesIncluded: 1,
    description: 'Démarrer vite avec une présence propre en ligne',
    deliveryTime: '7–10 jours ouvrés',
    features: [
      'Landing page (1 page)',
      'Design sobre et professionnel',
      'Formulaire de contact',
      'Optimisation mobile',
    ],
    paymentOptions: {
      upfront: true,
      installments3x: false,
      installments6x: false,
    },
  },
  {
    id: 'essentiel',
    name: 'Essentiel',
    basePrice: 800,
    pagesIncluded: 4,
    popular: true,
    description: 'Artisans/commerçants qui veulent un site complet',
    deliveryTime: '2–3 semaines',
    features: [
      'Jusqu\'à 4 pages',
      'SEO de base',
      'Google Maps',
      'Galerie photos',
    ],
    paymentOptions: {
      upfront: true,
      installments3x: true,
      installments6x: false,
    },
  },
  {
    id: 'complet',
    name: 'Complet',
    basePrice: 1500,
    pagesIncluded: 8,
    description: 'Activité installée qui veut un site premium complet',
    deliveryTime: '3–4 semaines',
    features: [
      'Jusqu\'à 8 pages',
      'Blog intégré',
      'SEO avancé',
      'Formulaires avancés',
    ],
    paymentOptions: {
      upfront: true,
      installments3x: true,
      installments6x: true,
    },
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    basePrice: 2500,
    pagesIncluded: 10,
    description: 'Boutique en ligne complète avec paiement sécurisé, gestion des produits et des commandes',
    deliveryTime: '4–6 semaines',
    features: [
      'Boutique en ligne complète',
      'Gestion des produits',
      'Paiement en ligne sécurisé',
      'Gestion des commandes',
      'Système de panier',
    ],
    paymentOptions: {
      upfront: true,
      installments3x: true,
      installments6x: true,
    },
  },
]

/**
 * Price per additional page beyond what's included in the pack
 */
export const PRICE_PER_EXTRA_PAGE = 100

/**
 * Optional features/addons with fixed prices
 */
export const PRICING_OPTIONS: PricingOption[] = [
  {
    id: 'blog',
    name: 'Blog',
    price: 300,
    description: 'Blog avec système de gestion de contenus et pagination',
  },
  {
    id: 'gallery',
    name: 'Galerie photo avancée',
    price: 200,
    description: 'Galerie photos illimitée avec lightbox et catégories',
  },
  {
    id: 'seo',
    name: 'SEO avancé',
    price: 300,
    description: 'Optimisation SEO complète + Google Business + balises avancées',
  },
  {
    id: 'booking',
    name: 'Système de réservation',
    price: 500,
    description: 'Calendrier de réservation en ligne avec gestion des créneaux',
  },
  {
    id: 'ecommerce-addon',
    name: 'Module E-commerce',
    price: 800,
    description: 'Ajout boutique en ligne à un pack existant (max 30 produits)',
  },
]

/**
 * Maintenance plans (monthly)
 */
export const MAINTENANCE_PLANS = [
  {
    id: 'basic',
    name: 'Maintenance',
    pricePerMonth: 29,
    description: 'Sans engagement',
    features: ['Mises à jour', 'Petites modifs', 'Sauvegardes', 'Support'],
  },
  {
    id: 'premium',
    name: 'Maintenance premium',
    pricePerMonth: 59,
    description: 'Sans engagement',
    features: [
      'Tout de la maintenance basique',
      'Sauvegardes quotidiennes',
      'Support prioritaire',
      '2h de modifications/mois incluses',
      'Monitoring 24/7',
    ],
  },
]

/**
 * Payment options info
 */
export const PAYMENT_INFO = {
  installments3x: {
    name: 'Paiement en 3 fois',
    description: 'Sans frais via Stripe',
    minAmount: 600,
  },
  installments6x: {
    name: 'Paiement en 6 fois',
    description: 'Sans frais via Stripe',
    minAmount: 1200,
  },
}

/**
 * Comparison criteria for pricing table
 */
export interface ComparisonCriterion {
  id: string
  label: string
  starter: string | boolean
  essentiel: string | boolean
  complet: string | boolean
}

export const COMPARISON_CRITERIA: ComparisonCriterion[] = [
  {
    id: 'pages',
    label: 'Nombre de pages incluses',
    starter: '1 page',
    essentiel: 'Jusqu\'à 4 pages',
    complet: 'Jusqu\'à 8 pages',
  },
  {
    id: 'design',
    label: 'Design sur-mesure',
    starter: true,
    essentiel: true,
    complet: true,
  },
  {
    id: 'seo',
    label: 'SEO local',
    starter: false,
    essentiel: 'SEO de base',
    complet: 'SEO avancé',
  },
  {
    id: 'blog',
    label: 'Blog & rédaction',
    starter: false,
    essentiel: false,
    complet: true,
  },
  {
    id: 'maintenance',
    label: 'Maintenance (optionnelle)',
    starter: '29 €/mois',
    essentiel: '29 €/mois',
    complet: '29 €/mois',
  },
  {
    id: 'delivery',
    label: 'Délai',
    starter: '7–10 jours',
    essentiel: '2–3 semaines',
    complet: '3–4 semaines',
  },
  {
    id: 'payment',
    label: 'Paiement en plusieurs fois',
    starter: false,
    essentiel: '3x sans frais',
    complet: '3x ou 6x sans frais',
  },
]

/**
 * Helper function to calculate total price for a custom quote
 */
export function calculateQuoteTotal(
  packId: string,
  extraPages: number,
  optionIds: string[],
  _maintenanceMonths = 12
): number {
  const pack = PRICING_PACKS.find((p) => p.id === packId)
  if (!pack) return 0

  let total = pack.basePrice

  // Add extra pages cost
  if (extraPages > 0) {
    total += extraPages * PRICE_PER_EXTRA_PAGE
  }

  // Add options cost
  optionIds.forEach((optionId) => {
    const option = PRICING_OPTIONS.find((o) => o.id === optionId)
    if (option) {
      total += option.price
    }
  })

  // Note: maintenance is not included in initial total
  // as it's a recurring monthly cost

  return total
}
