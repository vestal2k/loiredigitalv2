import { defineType } from 'sanity'

export default defineType({
  name: 'quoteLead',
  title: 'Simulations de devis',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nom',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: 'phone',
      title: 'Téléphone',
      type: 'string',
    },
    {
      name: 'packId',
      title: 'Pack sélectionné',
      type: 'string',
      options: {
        list: [
          { title: 'Vitrine', value: 'vitrine' },
          { title: 'Business', value: 'business' },
          { title: 'Premium', value: 'premium' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'pages',
      title: 'Nombre de pages',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(100),
    },
    {
      name: 'options',
      title: 'Options sélectionnées',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'maintenance',
      title: 'Type de maintenance',
      type: 'string',
      options: {
        list: [
          { title: 'Aucune', value: 'none' },
          { title: 'Essentielle', value: 'essential' },
          { title: 'Pro', value: 'pro' },
          { title: 'Premium', value: 'premium' },
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'totalPrice',
      title: 'Prix total estimé',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    },
    {
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 5,
    },
    {
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: '🆕 Nouveau', value: 'new' },
          { title: '📄 Devis envoyé', value: 'quoted' },
          { title: '✅ Converti', value: 'converted' },
          { title: '🔒 Fermé', value: 'closed' },
        ],
      },
      initialValue: 'new',
    },
    {
      name: 'createdAt',
      title: 'Date de création',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'notes',
      title: 'Notes internes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'text',
              title: 'Note',
              type: 'text',
              rows: 3,
            },
            {
              name: 'date',
              title: 'Date',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
            },
          ],
          preview: {
            select: {
              text: 'text',
              date: 'date',
            },
            prepare({ text, date }) {
              const dateStr = date ? new Date(date).toLocaleDateString('fr-FR') : 'Sans date'
              return {
                title: text?.substring(0, 50) + (text?.length > 50 ? '...' : ''),
                subtitle: dateStr,
              }
            },
          },
        },
      ],
    },
  ],
  orderings: [
    {
      title: 'Date de création (récents en premier)',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Prix (décroissant)',
      name: 'priceDesc',
      by: [{ field: 'totalPrice', direction: 'desc' }],
    },
    {
      title: 'Statut',
      name: 'statusAsc',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'createdAt', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      price: 'totalPrice',
      pack: 'packId',
      status: 'status',
    },
    prepare({ title, subtitle, price, pack, status }) {
      const statusEmoji: Record<string, string> = {
        new: '🆕',
        quoted: '📄',
        converted: '✅',
        closed: '🔒',
      }

      const packLabels: Record<string, string> = {
        vitrine: 'Vitrine',
        business: 'Business',
        premium: 'Premium',
      }

      const priceStr = price?.toLocaleString('fr-FR') || '0'

      return {
        title: `${statusEmoji[status] || ''} ${title}`,
        subtitle: `${subtitle} - ${packLabels[pack] || pack} - ${priceStr} €`,
      }
    },
  },
})
