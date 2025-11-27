import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'client',
  title: 'Clients',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'firstName',
      title: 'Prénom',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lastName',
      title: 'Nom',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'company',
      title: 'Entreprise',
      type: 'string',
    }),
    defineField({
      name: 'phone',
      title: 'Téléphone',
      type: 'string',
    }),
    defineField({
      name: 'passwordHash',
      title: 'Mot de passe (hash)',
      type: 'string',
      description: 'Hash bcrypt du mot de passe. Générer sur https://bcrypt-generator.com/',
      // hidden: true, // Temporairement visible pour configuration initiale
    }),
    defineField({
      name: 'createdAt',
      title: 'Date de création',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'isActive',
      title: 'Compte actif',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      company: 'company',
    },
    prepare({ firstName, lastName, email, company }) {
      return {
        title: `${firstName} ${lastName}`,
        subtitle: company ? `${company} - ${email}` : email,
      }
    },
  },
})
