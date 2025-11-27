import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'clientProject',
  title: 'Projets Clients',
  type: 'document',
  fields: [
    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Titre du projet',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'pack',
      title: 'Pack choisi',
      type: 'string',
      options: {
        list: [
          { title: 'Starter One-Page', value: 'starter' },
          { title: 'Essentiel', value: 'essentiel' },
          { title: 'Premium', value: 'premium' },
          { title: 'E-commerce', value: 'ecommerce' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: '⏳ En attente de paiement', value: 'pending-payment' },
          { title: '🎨 En conception', value: 'design' },
          { title: '💻 En développement', value: 'development' },
          { title: '🔍 En révision', value: 'review' },
          { title: '✅ Terminé', value: 'completed' },
          { title: '🚀 Déployé', value: 'deployed' },
        ],
      },
      initialValue: 'pending-payment',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'progress',
      title: 'Progression (%)',
      type: 'number',
      validation: (Rule) => Rule.min(0).max(100),
      initialValue: 0,
    }),
    defineField({
      name: 'totalAmount',
      title: 'Montant total (€)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'paidAmount',
      title: 'Montant payé (€)',
      type: 'number',
      validation: (Rule) => Rule.min(0),
      initialValue: 0,
    }),
    defineField({
      name: 'paymentType',
      title: 'Type de paiement',
      type: 'string',
      options: {
        list: [
          { title: 'Paiement intégral', value: 'full' },
          { title: 'Paiement en 2 fois', value: 'deposit' },
        ],
      },
    }),
    defineField({
      name: 'stripeSessionId',
      title: 'Stripe Session ID',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'startDate',
      title: 'Date de début',
      type: 'datetime',
    }),
    defineField({
      name: 'estimatedDelivery',
      title: 'Livraison estimée',
      type: 'datetime',
    }),
    defineField({
      name: 'deliveryDate',
      title: 'Date de livraison réelle',
      type: 'datetime',
    }),
    defineField({
      name: 'mockups',
      title: 'Maquettes',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'title',
              title: 'Titre',
              type: 'string',
            },
            {
              name: 'image',
              title: 'Image',
              type: 'image',
            },
            {
              name: 'status',
              title: 'Statut',
              type: 'string',
              options: {
                list: [
                  { title: '⏳ En attente', value: 'pending' },
                  { title: '✅ Validée', value: 'approved' },
                  { title: '🔄 À réviser', value: 'revision' },
                ],
              },
              initialValue: 'pending',
            },
            {
              name: 'feedback',
              title: 'Commentaires du client',
              type: 'text',
            },
            {
              name: 'uploadedAt',
              title: 'Date d\'upload',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'invoices',
      title: 'Factures',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'invoiceNumber',
              title: 'Numéro de facture',
              type: 'string',
            },
            {
              name: 'amount',
              title: 'Montant (€)',
              type: 'number',
            },
            {
              name: 'type',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Acompte', value: 'deposit' },
                  { title: 'Solde', value: 'balance' },
                  { title: 'Complète', value: 'full' },
                ],
              },
            },
            {
              name: 'status',
              title: 'Statut',
              type: 'string',
              options: {
                list: [
                  { title: '⏳ En attente', value: 'pending' },
                  { title: '✅ Payée', value: 'paid' },
                  { title: '❌ Échue', value: 'overdue' },
                ],
              },
            },
            {
              name: 'pdfUrl',
              title: 'Lien PDF',
              type: 'url',
            },
            {
              name: 'issuedAt',
              title: 'Date d\'émission',
              type: 'datetime',
            },
            {
              name: 'paidAt',
              title: 'Date de paiement',
              type: 'datetime',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'updates',
      title: 'Mises à jour',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'message',
              title: 'Message',
              type: 'text',
            },
            {
              name: 'createdAt',
              title: 'Date',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'notes',
      title: 'Notes internes',
      type: 'text',
      description: 'Visible uniquement par Loire Digital',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      clientName: 'client.firstName',
      clientLastName: 'client.lastName',
      status: 'status',
    },
    prepare({ title, clientName, clientLastName, status }) {
      const statusLabels: Record<string, string> = {
        'pending-payment': '⏳ En attente',
        design: '🎨 Conception',
        development: '💻 Développement',
        review: '🔍 Révision',
        completed: '✅ Terminé',
        deployed: '🚀 Déployé',
      }
      return {
        title: title,
        subtitle: `${clientName} ${clientLastName} - ${statusLabels[status] || status}`,
      }
    },
  },
})
