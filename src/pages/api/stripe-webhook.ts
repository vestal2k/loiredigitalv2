import type { APIRoute } from 'astro'
import { stripe } from '@/lib/stripe/client'
import {
  createClient,
  createClientProject,
  getClientByEmail,
  updateProjectStatus,
  addInvoice,
} from '@/lib/sanity/queries'
import { hashPassword, generateTemporaryPassword } from '@/lib/auth'
import { Resend } from 'resend'

const resend = new Resend(import.meta.env.RESEND_API_KEY)
const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET

/**
 * Webhook Stripe pour gérer les événements de paiement
 * Appelé automatiquement par Stripe quand un paiement est effectué
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return new Response('No signature', { status: 400 })
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return new Response('Webhook secret not configured', { status: 500 })
    }

    // Vérifier la signature Stripe
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Gérer l'événement
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return new Response(`Webhook Error: ${error.message}`, { status: 500 })
  }
}

/**
 * Gère un paiement complété
 */
async function handleCheckoutCompleted(session: any) {
  console.log('💳 Checkout completed:', session.id)

  const customerEmail = session.customer_details?.email || session.customer_email
  const customerName = session.customer_details?.name || ''
  const [firstName = '', lastName = ''] = customerName.split(' ')

  const amountPaid = session.amount_total / 100 // Convertir centimes en euros
  const paymentType = session.metadata?.paymentType || 'full'

  if (!customerEmail) {
    console.error('No customer email in session')
    return
  }

  try {
    // Vérifier si le client existe déjà
    let client = await getClientByEmail(customerEmail)

    // Si le client n'existe pas, le créer
    if (!client) {
      console.log('Creating new client:', customerEmail)

      const tempPassword = generateTemporaryPassword()
      const passwordHash = await hashPassword(tempPassword)

      client = await createClient({
        email: customerEmail.toLowerCase(),
        firstName: firstName || 'Client',
        lastName: lastName || 'Loire Digital',
        passwordHash,
      })

      // Envoyer l'email avec les identifiants
      await sendWelcomeEmail(customerEmail, firstName || 'Client', tempPassword)
    }

    // Créer le projet
    const productName = session.metadata?.productName || 'Nouveau projet'
    const totalAmount = parseInt(session.metadata?.originalAmount || amountPaid.toString())

    const project = await createClientProject(client._id, {
      title: productName,
      pack: determinePackFromAmount(totalAmount),
      totalAmount,
      paidAmount: amountPaid,
      paymentType: paymentType as 'full' | 'deposit',
      stripeSessionId: session.id,
    })

    console.log('✅ Project created:', project._id)

    // Mettre à jour le statut selon le type de paiement
    if (paymentType === 'full' && amountPaid >= totalAmount) {
      await updateProjectStatus(project._id, 'design', 10)
    } else {
      await updateProjectStatus(project._id, 'design', 5)
    }

    // Ajouter la facture
    await addInvoice(project._id, {
      invoiceNumber: `FAC-${new Date().getFullYear()}-${session.id.slice(-6)}`,
      amount: amountPaid,
      type: paymentType === 'full' ? 'full' : 'deposit',
      status: 'paid',
      issuedAt: new Date().toISOString(),
    })

    // Envoyer un email de confirmation de paiement
    await sendPaymentConfirmationEmail(
      customerEmail,
      firstName || 'Client',
      productName,
      amountPaid,
      paymentType,
    )
  } catch (error) {
    console.error('Error handling checkout completed:', error)
    throw error
  }
}

/**
 * Gère un paiement réussi
 */
async function handlePaymentSucceeded(paymentIntent: any) {
  console.log('✅ Payment succeeded:', paymentIntent.id)
  // Logique supplémentaire si nécessaire
}

/**
 * Gère un paiement échoué
 */
async function handlePaymentFailed(paymentIntent: any) {
  console.log('❌ Payment failed:', paymentIntent.id)
  // Envoyer un email à l'admin ou au client
}

/**
 * Détermine le pack à partir du montant
 */
function determinePackFromAmount(amount: number): 'starter' | 'essentiel' | 'premium' | 'ecommerce' {
  if (amount <= 499) return 'starter'
  if (amount <= 800) return 'essentiel'
  if (amount <= 1500) return 'premium'
  return 'ecommerce'
}

/**
 * Envoie l'email de bienvenue avec les identifiants
 */
async function sendWelcomeEmail(email: string, firstName: string, password: string) {
  try {
    await resend.emails.send({
      from: 'Loire Digital <contact@loiredigital.fr>',
      to: email,
      subject: '🎉 Bienvenue sur Loire Digital - Accès à votre espace client',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur Loire Digital !</h1>
            </div>
            <div class="content">
              <p>Bonjour ${firstName},</p>

              <p>Merci pour votre confiance ! Votre paiement a été confirmé et votre espace client est maintenant actif.</p>

              <h2>🔐 Vos identifiants de connexion</h2>
              <div class="credentials">
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Mot de passe temporaire :</strong> <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
              </div>

              <div class="warning">
                <strong>⚠️ Important :</strong> Ce mot de passe est temporaire. Pour votre sécurité, nous vous recommandons de le changer lors de votre première connexion.
              </div>

              <a href="https://loiredigital.fr/espace-client/connexion" class="button">
                Accéder à mon espace client
              </a>

              <h2>📊 Que pouvez-vous faire dans votre espace client ?</h2>
              <ul>
                <li>✅ Suivre l'avancement de votre projet en temps réel</li>
                <li>✅ Valider ou demander des modifications sur les maquettes</li>
                <li>✅ Consulter et télécharger vos factures</li>
                <li>✅ Recevoir des notifications sur les mises à jour</li>
                <li>✅ Communiquer directement avec notre équipe</li>
              </ul>

              <p>Notre équipe va maintenant commencer à travailler sur votre projet. Vous recevrez très prochainement une mise à jour avec les prochaines étapes.</p>

              <p>À très bientôt,<br><strong>L'équipe Loire Digital</strong></p>

              <div class="footer">
                <p>Loire Digital - Création de sites web professionnels<br>
                Saint-Étienne, France<br>
                <a href="https://loiredigital.fr">loiredigital.fr</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })
    console.log('✅ Welcome email sent to:', email)
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

/**
 * Envoie l'email de confirmation de paiement
 */
async function sendPaymentConfirmationEmail(
  email: string,
  firstName: string,
  productName: string,
  amount: number,
  paymentType: string,
) {
  try {
    await resend.emails.send({
      from: 'Loire Digital <contact@loiredigital.fr>',
      to: email,
      subject: '✅ Paiement confirmé - Loire Digital',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .amount { font-size: 32px; font-weight: bold; color: #10b981; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Paiement confirmé</h1>
            </div>
            <div class="content">
              <p>Bonjour ${firstName},</p>

              <p>Nous avons bien reçu votre paiement de <span class="amount">${amount} €</span></p>

              <div class="payment-details">
                <p><strong>Projet :</strong> ${productName}</p>
                <p><strong>Type de paiement :</strong> ${paymentType === 'full' ? 'Paiement intégral' : 'Acompte (30%)'}</p>
                <p><strong>Montant :</strong> ${amount} € TTC</p>
              </div>

              ${
                paymentType === 'deposit'
                  ? `
              <p><strong>Solde restant :</strong> Vous recevrez une facture pour le solde à la livraison de votre projet.</p>
              `
                  : ''
              }

              <p>Votre facture sera disponible dans votre espace client d'ici quelques instants.</p>

              <p>Merci pour votre confiance !</p>

              <p>Cordialement,<br><strong>L'équipe Loire Digital</strong></p>

              <div class="footer">
                <p>Loire Digital - Création de sites web professionnels<br>
                <a href="https://loiredigital.fr">loiredigital.fr</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })
    console.log('✅ Payment confirmation email sent to:', email)
  } catch (error) {
    console.error('Error sending payment confirmation email:', error)
  }
}
