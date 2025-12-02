import type { APIRoute } from 'astro'
import { getUserFromCookie } from '@/lib/auth'
import { getClientById } from '@/lib/sanity/queries'

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const user = getUserFromCookie(cookies)

    if (!user) {
      return new Response(
        JSON.stringify({
          error: 'Non authentifié',
        }),
        { status: 401 },
      )
    }

    // Récupérer les infos complètes du client
    const client = await getClientById(user.userId)

    if (!client) {
      return new Response(
        JSON.stringify({
          error: 'Client introuvable',
        }),
        { status: 404 },
      )
    }

    return new Response(
      JSON.stringify({
        user: {
          id: client._id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
          company: client.company,
          phone: client.phone,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error: any) {
    console.error('Me error:', error)

    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la récupération des informations',
      }),
      { status: 500 },
    )
  }
}
