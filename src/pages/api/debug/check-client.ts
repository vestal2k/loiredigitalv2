import type { APIRoute } from 'astro'
import { getClientByEmail } from '@/lib/sanity/queries'

/**
 * API de debug pour vérifier si un client existe
 */
export const GET: APIRoute = async ({ url }) => {
  const email = url.searchParams.get('email')

  if (!email) {
    return new Response(
      JSON.stringify({
        error: 'Email requis. Utilise ?email=test@example.com',
      }),
      { status: 400 },
    )
  }

  try {
    const client = await getClientByEmail(email.toLowerCase())

    if (!client) {
      return new Response(
        JSON.stringify({
          found: false,
          message: `Aucun client trouvé avec l'email: ${email}`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    // Retourne les infos (sans le hash pour la sécurité)
    return new Response(
      JSON.stringify({
        found: true,
        client: {
          id: client._id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          isActive: client.isActive,
          hasPassword: !!client.passwordHash,
          passwordHashLength: client.passwordHash?.length || 0,
          passwordHashStart: client.passwordHash?.substring(0, 10) || 'N/A',
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      { status: 500 },
    )
  }
}
