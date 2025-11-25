import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormData } from '../schemas/contact.schema'

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setSubmitStatus('success')
      reset()

      // Scroll to success message
      setTimeout(() => {
        document.getElementById('success-message')?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }, 100)
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')

      // Scroll to error message
      setTimeout(() => {
        document.getElementById('error-message')?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }, 100)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-pale rounded-xl p-8 md:p-10">
      <h3 className="text-2xl font-bold text-black mb-3">Envoyez-nous un message</h3>
      <p className="text-black font-medium mb-8 pb-6 border-b border-gray-200">
        Réponse garantie sous 24h par email. Pas de démarchage téléphonique.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-black mb-2">
            Nom complet *
          </label>
          <input
            type="text"
            id="name"
            {...register('name')}
            className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-black ${
              errors.name ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="Jean Dupont"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            {...register('email')}
            className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-black ${
              errors.email ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="jean.dupont@exemple.fr"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Project Type Field */}
        <div>
          <label htmlFor="project" className="block text-sm font-semibold text-black mb-2">
            Type de projet *
          </label>
          <select
            id="project"
            {...register('project')}
            className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-black ${
              errors.project ? 'border-red-500' : 'border-gray-200'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Sélectionnez...</option>
            <option value="creation">Création de site</option>
            <option value="refonte">Refonte</option>
            <option value="maintenance">Maintenance</option>
            <option value="seo">SEO</option>
            <option value="autre">Autre</option>
          </select>
          {errors.project && (
            <p className="mt-1 text-sm text-red-600">{errors.project.message}</p>
          )}
        </div>

        {/* Message Field */}
        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-black mb-2">
            Votre message *
          </label>
          <textarea
            id="message"
            {...register('message')}
            rows={6}
            className={`w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none text-black ${
              errors.message ? 'border-red-500' : 'border-gray-200'
            }`}
            placeholder="Décrivez votre projet en quelques lignes..."
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-blue py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed relative"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Envoi en cours...
            </span>
          ) : (
            'Envoyer'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">* Champs obligatoires</p>
      </form>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div
          id="success-message"
          className="mt-6 p-6 bg-green-50 border-2 border-green-600 rounded-lg animate-fade-in"
        >
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-green-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h4 className="font-bold text-black mb-1">Message envoyé avec succès !</h4>
              <p className="text-sm text-gray-text">
                Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div
          id="error-message"
          className="mt-6 p-6 bg-red-50 border-2 border-red-600 rounded-lg animate-fade-in"
        >
          <div className="flex items-start space-x-3">
            <svg
              className="w-6 h-6 text-red-600 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <h4 className="font-bold text-black mb-1">Erreur d'envoi</h4>
              <p className="text-sm text-gray-text">
                Une erreur s'est produite. Veuillez réessayer ou nous contacter directement par
                email.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
