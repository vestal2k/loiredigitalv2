import { getProjects, type SanityProject } from './sanity'
import { urlForImage } from './sanity'

// Type unifié pour les projets (statique + Sanity)
export interface UnifiedProject {
  slug: string
  title: string
  category: string
  description: string
  challenge: string
  solution: string
  results: string[]
  features: string[]
  icon: string
  deliveryTime: string
  mainImage?: string
  gallery?: string[]
  order?: number
  _source: 'sanity' | 'static'
  _raw?: any
}

// Projets statiques (actuellement dans portfolio.astro)
const staticProjects: UnifiedProject[] = [
  {
    slug: 'boulangerie-artisanale',
    title: 'Boulangerie Artisanale',
    category: 'Restauration',
    description: 'Site vitrine avec présentation produits et système de pré-commande.',
    challenge:
      'Moderniser la présence en ligne pour attirer une clientèle plus jeune tout en conservant l\'authenticité artisanale.',
    solution:
      'Design chaleureux mettant en valeur les produits avec photos haute qualité, système de pré-commande simple, et optimisation SEO local pour apparaître dans les recherches "boulangerie Saint-Étienne".',
    results: [
      '+150% de visibilité en ligne en 3 mois',
      '40 pré-commandes/semaine en moyenne',
      'Top 3 Google pour "boulangerie Saint-Étienne"',
    ],
    features: ['Design moderne', 'Galerie produits', 'Commande en ligne', 'SEO local'],
    icon: 'bakery',
    deliveryTime: '2 semaines',
    order: 1,
    _source: 'static',
  },
  {
    slug: 'pizzeria-bella-napoli',
    title: 'Pizzeria Bella Napoli',
    category: 'Restauration',
    description: 'Menu interactif, commande en ligne et intégration livraison.',
    challenge:
      'Simplifier le processus de commande en ligne et se démarquer face à la concurrence des plateformes type Uber Eats.',
    solution:
      'Menu digital avec photos appétissantes, système de commande fluide sans commission, intégration Google Maps pour la livraison, et promotion du "click & collect".',
    results: [
      '+200% de commandes directes',
      '0% commission (vs 30% Uber Eats)',
      'Temps de commande réduit de 60%',
    ],
    features: ['Menu digital', 'Commande en ligne', 'Responsive', 'Google Maps'],
    icon: 'pizza',
    deliveryTime: '2 semaines',
    order: 2,
    _source: 'static',
  },
  {
    slug: 'salon-coiffure-elegance',
    title: 'Salon de Coiffure Élégance',
    category: 'Beauté & Bien-être',
    description: 'Site élégant avec galerie et prise de rendez-vous en ligne.',
    challenge:
      'Réduire le temps passé au téléphone pour les prises de rendez-vous et valoriser le travail du salon.',
    solution:
      'Site au design élégant reflétant le standing du salon, système de réservation en ligne 24/7, galerie avant/après, et section blog pour conseils beauté et SEO.',
    results: [
      '70% des RDV pris en ligne',
      '-5h/semaine au téléphone',
      '+80% de nouveaux clients via le site',
    ],
    features: ['Réservation en ligne', 'Galerie photos', 'Blog beauté', 'SEO optimisé'],
    icon: 'salon',
    deliveryTime: '3 semaines',
    order: 3,
    _source: 'static',
  },
  {
    slug: 'garage-mecanique-pro',
    title: 'Garage Mécanique Pro',
    category: 'Automobile',
    description: 'Site professionnel avec services, tarifs et rendez-vous.',
    challenge:
      'Inspirer confiance aux clients potentiels et clarifier la gamme de services proposés.',
    solution:
      'Design professionnel et rassurant, présentation détaillée des services avec tarifs transparents, formulaire de devis en ligne, et section témoignages clients certifiés.',
    results: [
      '+120% de demandes de devis',
      'Taux de conversion de 45%',
      'Note moyenne 4.8/5 (Google Reviews)',
    ],
    features: ['Services détaillés', 'Devis en ligne', 'Témoignages', 'Responsive'],
    icon: 'garage',
    deliveryTime: '2 semaines',
    order: 4,
    _source: 'static',
  },
  {
    slug: 'boutique-mode-style',
    title: 'Boutique Mode & Style',
    category: 'Commerce',
    description: 'E-commerce avec catalogue et paiement sécurisé.',
    challenge:
      'Lancer une boutique en ligne performante sans les coûts prohibitifs d\'une grosse plateforme e-commerce.',
    solution:
      'Site e-commerce léger et rapide avec catalogue photo soigné, panier simplifié, paiement sécurisé Stripe, et optimisation mobile-first pour capter les achats sur smartphone.',
    results: [
      '€12,000 de CA en ligne le premier mois',
      '65% des ventes sur mobile',
      'Taux de conversion de 3.2%',
    ],
    features: ['Catalogue en ligne', 'Panier', 'Paiement sécurisé', 'Mobile-first'],
    icon: 'boutique',
    deliveryTime: '3 semaines',
    order: 5,
    _source: 'static',
  },
  {
    slug: 'cabinet-dentaire',
    title: 'Cabinet Dentaire',
    category: 'Santé',
    description: 'Site médical avec informations soins et rendez-vous.',
    challenge:
      'Rassurer les patients anxieux et faciliter la prise de rendez-vous pour limiter les désistements.',
    solution:
      'Site au design apaisant et professionnel, présentation claire des soins avec explications détaillées, système de prise de RDV en ligne avec rappels automatiques, et section urgences bien visible.',
    results: [
      '-30% de désistements',
      '60% des RDV pris en ligne',
      '+50% de nouveaux patients',
    ],
    features: ['Présentation soins', 'RDV en ligne', 'Infos pratiques', 'Urgences'],
    icon: 'dental',
    deliveryTime: '2-3 semaines',
    order: 6,
    _source: 'static',
  },
]

// Convertir un projet Sanity en projet unifié
function sanityProjectToUnified(project: SanityProject): UnifiedProject {
  return {
    slug: project.slug.current,
    title: project.title,
    category: project.category,
    description: project.description,
    challenge: project.challenge,
    solution: project.solution,
    results: project.results,
    features: project.features,
    icon: project.icon,
    deliveryTime: project.deliveryTime,
    mainImage: project.mainImage ? urlForImage(project.mainImage).width(1200).url() : undefined,
    gallery: project.gallery
      ? project.gallery.map((img) => urlForImage(img).width(800).url())
      : undefined,
    order: project.order,
    _source: 'sanity',
    _raw: project,
  }
}

// Récupérer tous les projets (Sanity + statiques)
export async function getAllProjects(): Promise<UnifiedProject[]> {
  const projects: UnifiedProject[] = []

  // Récupérer depuis Sanity (si configuré)
  try {
    const sanityProjects = await getProjects()
    projects.push(...sanityProjects.map(sanityProjectToUnified))
  } catch (error) {
    console.log('Sanity not configured yet, using only static projects')
  }

  // Ajouter les projets statiques
  projects.push(...staticProjects)

  // Trier par ordre (si défini) puis supprimer les doublons
  const uniqueProjects = Array.from(new Map(projects.map((p) => [p.slug, p])).values())

  return uniqueProjects.sort((a, b) => {
    const orderA = a.order ?? 999
    const orderB = b.order ?? 999
    return orderA - orderB
  })
}

// Récupérer un projet spécifique par slug
export async function getProjectBySlug(slug: string): Promise<UnifiedProject | null> {
  // Chercher dans Sanity d'abord
  try {
    const sanityProjects = await getProjects()
    const project = sanityProjects.find((p) => p.slug.current === slug)
    if (project) {
      return sanityProjectToUnified(project)
    }
  } catch (error) {
    console.log('Sanity not configured yet')
  }

  // Sinon chercher dans les projets statiques
  const staticProject = staticProjects.find((p) => p.slug === slug)
  return staticProject || null
}
