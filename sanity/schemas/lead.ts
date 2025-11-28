import { defineType } from 'sanity'

export default defineType({
  name: 'lead',
  title: 'Leads (Contacts)',
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
      name: 'projectType',
      title: 'Type de projet',
      type: 'string',
      options: {
        list: [
          { title: 'Création de site', value: 'creation' },
          { title: 'Refonte', value: 'refonte' },
          { title: 'Maintenance', value: 'maintenance' },
          { title: 'SEO', value: 'seo' },
          { title: 'Autre', value: 'autre' },
        ],
      },
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
          { title: '⏳ En cours', value: 'in_progress' },
          { title: '✅ Converti', value: 'converted' },
          { title: '🔒 Fermé', value: 'closed' },
        ],
      },
      initialValue: 'new',
    },
    {
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Formulaire de contact', value: 'contact_form' },
          { title: 'Calculateur de devis', value: 'quote_calculator' },
          { title: 'Manuel', value: 'manual' },
        ],
      },
      initialValue: 'contact_form',
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
      status: 'status',
      projectType: 'projectType',
    },
    prepare({ title, subtitle, status, projectType }) {
      const statusEmoji: Record<string, string> = {
        new: '🆕',
        in_progress: '⏳',
        converted: '✅',
        closed: '🔒',
      }

      const projectLabels: Record<string, string> = {
        creation: 'Création',
        refonte: 'Refonte',
        maintenance: 'Maintenance',
        seo: 'SEO',
        autre: 'Autre',
      }

      return {
        title: `${statusEmoji[status] || ''} ${title}`,
        subtitle: `${subtitle} - ${projectLabels[projectType] || projectType || 'Non spécifié'}`,
      }
    },
  },
})
