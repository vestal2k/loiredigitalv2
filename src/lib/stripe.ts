import Stripe from 'stripe'

// Initialiser le client Stripe côté serveur
export const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

// Types pour les produits et paiements
export interface PaymentProduct {
  name: string
  description: string
  amount: number // en centimes
  currency: string
  metadata?: Record<string, string>
}

export interface CreateCheckoutSessionParams {
  products: PaymentProduct[]
  successUrl: string
  cancelUrl: string
  customerEmail?: string
  mode?: 'payment' | 'subscription'
  paymentType?: 'full' | 'deposit' // Complet ou acompte
  depositPercentage?: number // Pourcentage de l'acompte (ex: 30 pour 30%)
}

/**
 * Créer une session de paiement Stripe Checkout
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
): Promise<Stripe.Checkout.Session> {
  const {
    products,
    successUrl,
    cancelUrl,
    customerEmail,
    mode = 'payment',
    paymentType = 'full',
    depositPercentage = 30,
  } = params

  // Calculer le montant en fonction du type de paiement
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = products.map((product) => {
    let finalAmount = product.amount

    // Si c'est un acompte, calculer le pourcentage
    if (paymentType === 'deposit') {
      finalAmount = Math.round((product.amount * depositPercentage) / 100)
    }

    return {
      price_data: {
        currency: product.currency,
        product_data: {
          name: product.name,
          description: product.description,
          metadata: {
            ...product.metadata,
            paymentType,
            ...(paymentType === 'deposit' && {
              depositPercentage: depositPercentage.toString(),
              fullAmount: product.amount.toString(),
            }),
          },
        },
        unit_amount: finalAmount,
      },
      quantity: 1,
    }
  })

  const session = await stripe.checkout.sessions.create({
    mode,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    ...(customerEmail && { customer_email: customerEmail }),
    payment_method_types: ['card'],
    billing_address_collection: 'required',
    metadata: {
      paymentType,
      ...(paymentType === 'deposit' && {
        depositPercentage: depositPercentage.toString(),
      }),
    },
  })

  return session
}

/**
 * Récupérer une session de paiement
 */
export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.retrieve(sessionId)
}

/**
 * Créer un lien de paiement pour le solde restant après un acompte
 */
export async function createBalancePaymentLink(params: {
  originalAmount: number
  depositAmount: number
  currency: string
  productName: string
  customerEmail: string
}): Promise<Stripe.PaymentLink> {
  const { originalAmount, depositAmount, currency, productName, customerEmail } = params

  const remainingAmount = originalAmount - depositAmount

  const product = await stripe.products.create({
    name: `${productName} - Solde restant`,
    description: `Paiement du solde pour ${productName}`,
  })

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: remainingAmount,
    currency,
  })

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: {
      type: 'balance',
      customerEmail,
    },
  })

  return paymentLink
}

/**
 * Vérifier le statut d'un paiement
 */
export async function getPaymentStatus(
  sessionId: string,
): Promise<'paid' | 'pending' | 'failed'> {
  try {
    const session = await getCheckoutSession(sessionId)

    if (session.payment_status === 'paid') {
      return 'paid'
    } else if (session.payment_status === 'unpaid') {
      return 'pending'
    } else {
      return 'failed'
    }
  } catch (error) {
    console.error('Error getting payment status:', error)
    return 'failed'
  }
}
