import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'project',
  title: 'Projet Portfolio',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Titre',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: {
        list: [
          { title: 'Restauration', value: 'Restauration' },
          { title: 'Beauté & Bien-être', value: 'Beauté & Bien-être' },
          { title: 'Automobile', value: 'Automobile' },
          { title: 'Commerce', value: 'Commerce' },
          { title: 'Santé', value: 'Santé' },
          { title: 'Services', value: 'Services' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description courte',
      type: 'text',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'challenge',
      title: 'Défi',
      type: 'text',
      description: 'Le défi ou problème à résoudre',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'solution',
      title: 'Solution',
      type: 'text',
      description: 'La solution apportée',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'results',
      title: 'Résultats',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required().min(2).max(4),
    }),
    defineField({
      name: 'features',
      title: 'Fonctionnalités',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icône',
      type: 'string',
      options: {
        list: [
          { title: 'Boulangerie', value: 'bakery' },
          { title: 'Pizza', value: 'pizza' },
          { title: 'Salon', value: 'salon' },
          { title: 'Garage', value: 'garage' },
          { title: 'Boutique', value: 'boutique' },
          { title: 'Dentiste', value: 'dental' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'deliveryTime',
      title: 'Délai de livraison',
      type: 'string',
      description: 'Ex: "2 semaines" ou "2-3 semaines"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Image principale',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texte alternatif',
        },
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Galerie d\'images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Texte alternatif',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'order',
      title: 'Ordre d\'affichage',
      type: 'number',
      description: 'Ordre d\'affichage dans le portfolio (plus petit = en premier)',
    }),
    defineField({
      name: 'published',
      title: 'Publié',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      media: 'mainImage',
    },
    prepare(selection) {
      const { category, title, media } = selection
      return {
        title,
        subtitle: category,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Ordre d\'affichage',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})
