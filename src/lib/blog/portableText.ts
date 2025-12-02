import { toHTML } from '@portabletext/to-html'
import type { PortableTextBlock } from '@portabletext/types'
import { urlForImage } from './sanity'

// Configuration pour convertir le Portable Text de Sanity en HTML
export function portableTextToHtml(blocks: PortableTextBlock[]): string {
  return toHTML(blocks, {
    components: {
      types: {
        image: ({ value }) => {
          if (!value?.asset) return ''
          const imageUrl = urlForImage(value).width(800).url()
          const alt = value.alt || ''
          return `<img src="${imageUrl}" alt="${alt}" class="rounded-lg my-8" loading="lazy" />`
        },
      },
      marks: {
        link: ({ children, value }) => {
          const href = value?.href || ''
          const rel = href.startsWith('http') ? 'noopener noreferrer' : undefined
          const target = href.startsWith('http') ? '_blank' : undefined
          return `<a href="${href}" ${rel ? `rel="${rel}"` : ''} ${target ? `target="${target}"` : ''}>${children}</a>`
        },
      },
      block: {
        h1: ({ children }) => `<h1>${children}</h1>`,
        h2: ({ children }) => `<h2>${children}</h2>`,
        h3: ({ children }) => `<h3>${children}</h3>`,
        h4: ({ children }) => `<h4>${children}</h4>`,
        blockquote: ({ children }) => `<blockquote>${children}</blockquote>`,
        normal: ({ children }) => `<p>${children}</p>`,
      },
      list: {
        bullet: ({ children }) => `<ul>${children}</ul>`,
        number: ({ children }) => `<ol>${children}</ol>`,
      },
      listItem: {
        bullet: ({ children }) => `<li>${children}</li>`,
        number: ({ children }) => `<li>${children}</li>`,
      },
    },
  })
}
