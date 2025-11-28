import type { APIRoute } from 'astro'
import { Resend } from 'resend'
import { quoteSchema } from '../../schemas/quote.schema'
import { sanityWriteClient } from '../../lib/sanity'
import { checkRateLimit } from '../../lib/rate-limiter'

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const data = await request.json()

    // Validate with Zod schema first (before rate limiting)
    const validationResult = quoteSchema.safeParse(data)

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

    const validData = validationResult.data

    // Rate limiting: max 5 requests per minute per IP (after validation)
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

    // Check if Resend API key is configured
    if (!import.meta.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured. Email not sent.')
      console.log('Quote request received:', {
        ...data,
        timestamp: new Date().toISOString(),
      })

      return new Response(
        JSON.stringify({
          success: true,
          message:
            'Votre demande de devis a été reçue. Nous vous contacterons sous 24h. (Mode développement)',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Send email using Resend
    let emailSent = false
    try {
      const resend = new Resend(import.meta.env.RESEND_API_KEY)
      const emailResult = await resend.emails.send({
        from: 'Loire Digital <onboarding@resend.dev>', // Replace with your verified domain
        to: 'contact@loiredigital.fr',
        replyTo: validData.email,
        subject: `Nouveau devis de ${validData.name}`,
        html: generateQuoteEmailHTML(validData),
      })

      if (emailResult.data) {
        emailSent = true
        console.log('Email sent successfully:', emailResult.data)
      } else {
        console.warn('Email sending failed - no data returned:', emailResult.error)
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Continue anyway - we'll still save the lead to Sanity
    }

    // Save quote lead to Sanity CRM
    try {
      const quoteLeadData = {
        _type: 'quoteLead',
        name: validData.name,
        email: validData.email,
        phone: validData.phone || null,
        packId: validData.packId,
        pages: validData.pages,
        options: validData.optionIds || [],
        maintenance: validData.maintenance,
        totalPrice: validData.totalPrice,
        message: validData.message || null,
        status: 'new',
        createdAt: new Date().toISOString(),
      }

      await sanityWriteClient.create(quoteLeadData)
      console.log('Quote lead saved to Sanity CRM:', {
        name: validData.name,
        email: validData.email,
        totalPrice: validData.totalPrice,
      })
    } catch (sanityError) {
      // Log error but don't fail the request if Sanity fails
      console.error('Failed to save quote lead to Sanity:', sanityError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Votre demande de devis a été envoyée avec succès. Nous vous contacterons sous 24h.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    // Enhanced error logging
    console.error('Error processing quote request:', {
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

// Helper function to generate email HTML
function generateQuoteEmailHTML(data: {
  name: string
  email: string
  phone?: string
  packId: string
  pages: number
  optionIds?: string[]
  maintenance: string
  totalPrice: number
  message?: string
}): string {
  // Map pack IDs to French labels
  const packLabels: Record<string, string> = {
    vitrine: 'Vitrine',
    business: 'Business',
    premium: 'Premium',
  }

  // Map maintenance types to French labels
  const maintenanceLabels: Record<string, string> = {
    none: 'Aucune',
    essential: 'Essentielle',
    pro: 'Pro',
    premium: 'Premium',
  }

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouvelle demande de devis</title>
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
          .price-total {
            font-size: 24px;
            font-weight: 700;
            color: #2563eb;
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            background: white;
            border-radius: 8px;
            border: 2px solid #2563eb;
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
          <h1>💼 Nouvelle demande de devis</h1>
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
            <div class="field-value">${data.phone}</div>
          </div>
          `
              : ''
          }

          <div class="field">
            <div class="field-label">Pack choisi :</div>
            <div class="field-value">${packLabels[data.packId] || data.packId}</div>
          </div>

          <div class="field">
            <div class="field-label">Nombre de pages :</div>
            <div class="field-value">${data.pages}</div>
          </div>

          ${
            data.optionIds && data.optionIds.length > 0
              ? `
          <div class="field">
            <div class="field-label">Options sélectionnées :</div>
            <div class="field-value">${data.optionIds.join(', ')}</div>
          </div>
          `
              : ''
          }

          <div class="field">
            <div class="field-label">Maintenance :</div>
            <div class="field-value">${maintenanceLabels[data.maintenance] || data.maintenance}</div>
          </div>

          ${
            data.message
              ? `
          <div class="field">
            <div class="field-label">Message :</div>
            <div class="message-box">${data.message}</div>
          </div>
          `
              : ''
          }

          <div class="price-total">
            Prix total : ${data.totalPrice.toLocaleString('fr-FR')} €
          </div>

          <div class="footer">
            Reçu via le calculateur de devis de <strong>loiredigital.fr</strong>
          </div>
        </div>
      </body>
    </html>
  `
}
