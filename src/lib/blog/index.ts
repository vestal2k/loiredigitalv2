import { getCollection } from 'astro:content'
import { getBlogPosts, type SanityBlogPost } from './sanity'
import { portableTextToHtml } from './portableText'
import { urlForImage } from './sanity'

// Type unifié pour les posts (Astro + Sanity)
export interface UnifiedBlogPost {
  slug: string
  title: string
  description: string
  pubDate: Date
  author: string
  tags: string[]
  image?: string
  content?: string // HTML content from Sanity
  _source: 'sanity' | 'astro' // Pour savoir d'où vient le post
  _raw?: any // Données brutes pour le rendu
}

// Convertir un post Sanity en post unifié
function sanityPostToUnified(post: SanityBlogPost): UnifiedBlogPost {
  return {
    slug: post.slug.current,
    title: post.title,
    description: post.description,
    pubDate: new Date(post.publishedAt),
    author: post.author,
    tags: post.tags,
    image: post.mainImage ? urlForImage(post.mainImage).width(1200).url() : undefined,
    content: post.body ? portableTextToHtml(post.body) : undefined,
    _source: 'sanity',
    _raw: post,
  }
}

// Récupérer tous les posts (Sanity + Astro Content Collections)
export async function getAllBlogPosts(): Promise<UnifiedBlogPost[]> {
  const posts: UnifiedBlogPost[] = []

  // Récupérer depuis Sanity (si configuré)
  try {
    const sanityPosts = await getBlogPosts()
    posts.push(...sanityPosts.map(sanityPostToUnified))
  } catch (error) {
    console.log('Sanity not configured yet, using only Astro Content Collections')
  }

  // Récupérer depuis Astro Content Collections
  try {
    const astroPosts = await getCollection('blog')
    const astroUnified = astroPosts
      .filter((post) => !post.data.draft)
      .map((post) => ({
        slug: post.slug,
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        author: post.data.author,
        tags: post.data.tags,
        image: post.data.image,
        _source: 'astro' as const,
        _raw: post,
      }))
    posts.push(...astroUnified)
  } catch (error) {
    console.log('Error loading Astro Content Collections:', error)
  }

  // Trier par date (plus récent en premier) et supprimer les doublons
  const uniquePosts = Array.from(
    new Map(posts.map((post) => [post.slug, post])).values(),
  )

  return uniquePosts.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
}

// Récupérer un post spécifique par slug
export async function getBlogPostBySlug(slug: string): Promise<UnifiedBlogPost | null> {
  // Chercher dans Sanity d'abord
  try {
    const sanityPost = await getBlogPosts()
    const post = sanityPost.find((p) => p.slug.current === slug)
    if (post) {
      return sanityPostToUnified(post)
    }
  } catch (error) {
    console.log('Sanity not configured yet')
  }

  // Sinon chercher dans Astro Content Collections
  try {
    const astroPosts = await getCollection('blog')
    const post = astroPosts.find((p) => p.slug === slug && !p.data.draft)
    if (post) {
      return {
        slug: post.slug,
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        author: post.data.author,
        tags: post.data.tags,
        image: post.data.image,
        _source: 'astro',
        _raw: post,
      }
    }
  } catch (error) {
    console.log('Error loading from Astro Content Collections')
  }

  return null
}
