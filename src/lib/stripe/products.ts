// Configuration des produits Stripe
// IDs récupérés depuis le dashboard Stripe

export const STRIPE_PRODUCTS = {
  // Packs de sites web
  packs: {
    starter: {
      productId: 'prod_TV0CSgYLRE6jjg',
      priceId: 'price_1SY0By3d6o7Oyd5uy64PJAK6', // À REMPLIR : voir guide dans .claude/guide-setup-manuel.md
      name: 'Pack Starter - One Page',
      amount: 499,
      description: 'Site vitrine d\'une page unique',
    },
    essentiel: {
      productId: 'prod_TV0KeCDFVuKaLO',
      priceId: 'price_1SY0KI3d6o7Oyd5uEuRH4jj9', // À REMPLIR
      name: 'Pack Essentiel',
      amount: 800,
      description: 'Site vitrine professionnel jusqu\'à 4 pages',
    },
    premium: {
      productId: 'prod_TV0LoqyWVeaM9D',
      priceId: 'price_1SY0Kh3d6o7Oyd5u6HRmMXOe', // À REMPLIR
      name: 'Pack Premium',
      amount: 1500,
      description: 'Site professionnel complet jusqu\'à 8 pages avec blog',
    },
    ecommerce: {
      productId: 'prod_TV0L3vdAqVp1MF',
      priceId: 'price_1SY0L63d6o7Oyd5ukgECP7iX', // À REMPLIR
      name: 'Pack E-Commerce',
      amount: 2500,
      description: 'Boutique en ligne complète',
    },
  },

  // Codes promo
  coupons: {
    parrainage: 'promo_1SY0Y23d6o7Oyd5ue7qlz1XE',
    starter2025: 'promo_1SY0XW3d6o7Oyd5uVschqwsS',
    earlyBird: 'promo_1SY0SQ3d6o7Oyd5uVUuyWT8v',
  },
} as const

// Type pour les noms de packs
export type PackName = keyof typeof STRIPE_PRODUCTS.packs

// Type pour les noms de coupons
export type CouponName = keyof typeof STRIPE_PRODUCTS.coupons

/**
 * Récupère les informations d'un pack par son nom
 */
export function getPackInfo(packName: PackName) {
  return STRIPE_PRODUCTS.packs[packName]
}

/**
 * Récupère un coupon par son nom
 */
export function getCouponId(couponName: CouponName) {
  return STRIPE_PRODUCTS.coupons[couponName]
}

/**
 * Vérifie si tous les price IDs sont configurés
 */
export function areAllPricesConfigured(): boolean {
  return Object.values(STRIPE_PRODUCTS.packs).every((pack) => pack.priceId.startsWith('price_'))
}
