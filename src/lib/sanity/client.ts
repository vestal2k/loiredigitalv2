import { createClient } from '@sanity/client'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import imageUrlBuilder from '@sanity/image-url'

// Configuration du client Sanity (lecture seule avec CDN)
export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  useCdn: true, // `false` si vous voulez garantir des données fraîches
  apiVersion: '2025-01-01', // Utiliser la date du jour pour la dernière API
})

// Client Sanity pour les opérations d'écriture (leads, clients, etc.)
export const sanityWriteClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  useCdn: false, // Pas de CDN pour les écritures
  apiVersion: '2025-01-01',
  token: import.meta.env.SANITY_API_TOKEN, // Token avec droits Editor
})

// Helper pour générer les URLs d'images optimisées
const builder = imageUrlBuilder(sanityClient)

// Export imageBuilder pour utilisation directe
export const imageBuilder = builder

export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max')
}

// Types pour les données Sanity
export interface SanityBlogPost {
  _id: string
  _createdAt: string
  title: string
  slug: {
    current: string
  }
  description: string
  mainImage?: {
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt?: string
  }
  tags: string[]
  publishedAt: string
  author: string
  body: any[] // Block content
  draft: boolean
}

export interface SanityProject {
  _id: string
  _createdAt: string
  title: string
  slug: {
    current: string
  }
  category: string
  description: string
  challenge: string
  solution: string
  results: string[]
  features: string[]
  icon: string
  deliveryTime: string
  mainImage?: {
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt?: string
  }
  gallery?: Array<{
    asset: {
      _ref: string
      _type: 'reference'
    }
    alt?: string
  }>
  order?: number
  published: boolean
}

// Requêtes GROQ pour récupérer les données
export async function getBlogPosts(): Promise<SanityBlogPost[]> {
  const posts = await sanityClient.fetch<SanityBlogPost[]>(
    `*[_type == "post" && draft != true] | order(publishedAt desc) {
      _id,
      _createdAt,
      title,
      slug,
      description,
      mainImage,
      tags,
      publishedAt,
      author,
      body,
      draft
    }`,
  )
  return posts
}

export async function getBlogPost(slug: string): Promise<SanityBlogPost | null> {
  const post = await sanityClient.fetch<SanityBlogPost | null>(
    `*[_type == "post" && slug.current == $slug && draft != true][0] {
      _id,
      _createdAt,
      title,
      slug,
      description,
      mainImage,
      tags,
      publishedAt,
      author,
      body,
      draft
    }`,
    { slug },
  )
  return post
}

export async function getProjects(): Promise<SanityProject[]> {
  const projects = await sanityClient.fetch<SanityProject[]>(
    `*[_type == "project" && published == true] | order(order asc) {
      _id,
      _createdAt,
      title,
      slug,
      category,
      description,
      challenge,
      solution,
      results,
      features,
      icon,
      deliveryTime,
      mainImage,
      gallery,
      order,
      published
    }`,
  )
  return projects
}

export async function getProject(slug: string): Promise<SanityProject | null> {
  const project = await sanityClient.fetch<SanityProject | null>(
    `*[_type == "project" && slug.current == $slug && published == true][0] {
      _id,
      _createdAt,
      title,
      slug,
      category,
      description,
      challenge,
      solution,
      results,
      features,
      icon,
      deliveryTime,
      mainImage,
      gallery,
      order,
      published
    }`,
    { slug },
  )
  return project
}
