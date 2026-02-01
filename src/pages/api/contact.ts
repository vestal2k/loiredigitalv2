import type { APIRoute } from 'astro'
import { Resend } from 'resend'
import { contactSchema } from '../../schemas/contact.schema'
import { checkRateLimit } from '../../lib/utils/rate-limiter'

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const data = await request.json()

    if (data._gotcha) {
      console.log('Spam detected via honeypot')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Votre message a été envoyé avec succès.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const validationResult = contactSchema.safeParse(data)

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Données invalides.',
          errors: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const { name, email, phone, project, message } = validationResult.data

    const ip = clientAddress || 'unknown'
    if (!checkRateLimit(ip, 5, 60000)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Trop de requêtes. Veuillez réessayer dans quelques instants.',
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const projectLabels: Record<string, string> = {
      creation: 'Création de site',
      refonte: 'Refonte',
      maintenance: 'Maintenance',
      seo: 'SEO',
      autre: 'Autre',
    }

    if (!import.meta.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email not sent.')
      console.log('Contact form submission:', { name, email, phone, project, message })

      return new Response(
        JSON.stringify({
          success: true,
          message:
            'Votre message a été reçu. Nous vous contacterons sous 24h. (Mode développement)',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    try {
      const resend = new Resend(import.meta.env.RESEND_API_KEY)
      const emailResult = await resend.emails.send({
        from: 'Loire Digital <contact@loiredigital.fr>',
        to: 'contact@loiredigital.fr',
        replyTo: email,
        subject: `Nouveau message de ${name} - ${projectLabels[project]}`,
        html: generateContactEmailHTML({
          name,
          email,
          phone,
          project: projectLabels[project],
          message,
        }),
      })

      if (emailResult.data) {
        console.log('Email sent successfully:', emailResult.data)
      } else {
        console.warn('Email sending failed - no data returned:', emailResult.error)
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Votre message a été envoyé avec succès. Nous vous contacterons sous 24h.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error processing contact form:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Une erreur est survenue. Veuillez réessayer plus tard.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

function generateContactEmailHTML(data: {
  name: string
  email: string
  phone?: string
  project: string
  message: string
}): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouveau message de contact</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            padding: 30px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 8px 8px;
          }
          .field {
            margin-bottom: 20px;
          }
          .field-label {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .field-value {
            color: #4b5563;
            background: white;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }
          .message-box {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Nouveau message de contact</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="field-label">Nom :</div>
            <div class="field-value">${data.name}</div>
          </div>

          <div class="field">
            <div class="field-label">Email :</div>
            <div class="field-value"><a href="mailto:${data.email}">${data.email}</a></div>
          </div>

          ${
            data.phone
              ? `
          <div class="field">
            <div class="field-label">Téléphone :</div>
            <div class="field-value"><a href="tel:${data.phone}">${data.phone}</a></div>
          </div>
          `
              : ''
          }

          <div class="field">
            <div class="field-label">Type de projet :</div>
            <div class="field-value">${data.project}</div>
          </div>

          <div class="field">
            <div class="field-label">Message :</div>
            <div class="message-box">${data.message}</div>
          </div>

          <div class="footer">
            Reçu via le formulaire de contact de <strong>loiredigital.fr</strong>
          </div>
        </div>
      </body>
    </html>
  `
}
