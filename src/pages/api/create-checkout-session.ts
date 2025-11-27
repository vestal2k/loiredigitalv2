import type { APIRoute } from 'astro'
import { createCheckoutSession } from '../../lib/stripe'

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const body = await request.json()
    const { products, customerEmail, paymentType, depositPercentage } = body

    if (!products || !Array.isArray(products) || products.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Produits invalides',
        }),
        { status: 400 },
      )
    }

    // URLs de succès et d'annulation
    const baseUrl = url.origin
    const successUrl = `${baseUrl}/paiement/succes?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/paiement/annule`

    // Créer la session Stripe
    const session = await createCheckoutSession({
      products,
      successUrl,
      cancelUrl,
      customerEmail,
      paymentType: paymentType || 'full',
      depositPercentage: depositPercentage || 30,
    })

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error: any) {
    console.error('Error creating checkout session:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Erreur lors de la création de la session de paiement',
      }),
      { status: 500 },
    )
  }
}
