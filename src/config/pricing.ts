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

export const PRICING_PACKS: PricingPack[] = [
  {
    id: 'starter',
    name: 'Starter',
    basePrice: 400,
    pagesIncluded: 1,
    description: 'Tester votre présence en ligne rapidement',
    deliveryTime: '7–10 jours ouvrés',
    features: [
      '1 page qui présente votre activité',
      'Les clients vous contactent directement',
      'Lisible sur mobile comme sur ordinateur',
      'Votre vitrine en ligne en moins de 2 semaines',
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
    description: 'Artisans et commerçants qui veulent être trouvés sur Google',
    deliveryTime: '2–3 semaines',
    features: [
      'Présentez vos services en détail (4 pages)',
      'Apparaissez sur Google dans votre ville',
      'Vos clients vous trouvent facilement',
      'Montrez vos réalisations en photos',
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
    description: 'Activité établie qui veut se démarquer durablement',
    deliveryTime: '3–4 semaines',
    features: [
      'Site complet avec toutes vos pages (8 pages)',
      'Publiez des actualités pour fidéliser vos clients',
      'Positionnement renforcé sur Google',
      'Collectez des demandes détaillées',
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
    description: 'Vendez vos produits en ligne 24h/24',
    deliveryTime: '4–6 semaines',
    features: [
      'Vos clients achètent directement en ligne',
      'Ajoutez et modifiez vos produits facilement',
      'Paiements sécurisés par carte bancaire',
      'Suivez vos commandes en temps réel',
      'Panier et tunnel de vente optimisés',
    ],
    paymentOptions: {
      upfront: true,
      installments3x: true,
      installments6x: true,
    },
  },
]

export const PRICE_PER_EXTRA_PAGE = 100

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

export const PAYMENT_INFO = {
  deposit: {
    name: 'Acompte 50%',
    description: '50% au lancement, 50% à la livraison',
  },
  methods: {
    name: 'Moyens de paiement',
    description: 'Virement bancaire ou chèque',
  },
}

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
    label: 'Contenu du site',
    starter: '1 page',
    essentiel: 'Jusqu\'à 4 pages',
    complet: 'Jusqu\'à 8 pages',
  },
  {
    id: 'design',
    label: 'Design personnalisé',
    starter: true,
    essentiel: true,
    complet: true,
  },
  {
    id: 'seo',
    label: 'Visibilité sur Google',
    starter: false,
    essentiel: 'Référencement local',
    complet: 'Référencement renforcé',
  },
  {
    id: 'blog',
    label: 'Actualités / Blog',
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
    label: 'Délai de livraison',
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

export function calculateQuoteTotal(
  packId: string,
  extraPages: number,
  optionIds: string[],
  _maintenanceMonths = 12
): number {
  const pack = PRICING_PACKS.find((p) => p.id === packId)
  if (!pack) return 0

  let total = pack.basePrice

  if (extraPages > 0) {
    total += extraPages * PRICE_PER_EXTRA_PAGE
  }

  optionIds.forEach((optionId) => {
    const option = PRICING_OPTIONS.find((o) => o.id === optionId)
    if (option) {
      total += option.price
    }
  })

  return total
}
