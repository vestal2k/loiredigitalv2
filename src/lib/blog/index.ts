import { getCollection } from 'astro:content'

// Type unifié pour les posts
export interface UnifiedBlogPost {
  slug: string
  title: string
  description: string
  pubDate: Date
  author: string
  tags: string[]
  image?: string
  ogImage?: string
  keywords?: string[]
  content?: string
  _source: 'astro'
  _raw?: any
}

// Récupérer tous les posts depuis Astro Content Collections
export async function getAllBlogPosts(): Promise<UnifiedBlogPost[]> {
  try {
    const astroPosts = await getCollection('blog')
    return astroPosts
      .filter((post) => !post.data.draft)
      .map((post) => ({
        slug: post.slug,
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        author: post.data.author,
        tags: post.data.tags,
        image: post.data.image,
        ogImage: post.data.ogImage,
        keywords: post.data.keywords,
        _source: 'astro' as const,
        _raw: post,
      }))
      .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
  } catch (error) {
    console.log('Error loading Astro Content Collections:', error)
    return []
  }
}

// Récupérer un post spécifique par slug
export async function getBlogPostBySlug(slug: string): Promise<UnifiedBlogPost | null> {
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
        ogImage: post.data.ogImage,
        keywords: post.data.keywords,
        _source: 'astro',
        _raw: post,
      }
    }
  } catch (error) {
    console.log('Error loading from Astro Content Collections')
  }

  return null
}
