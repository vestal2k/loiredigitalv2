import type { APIRoute } from 'astro'
import { getUserFromCookie } from '@/lib/auth'
import { getClientProjects } from '@/lib/sanity/queries'

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

    // Récupérer les projets du client
    const projects = await getClientProjects(user.userId)

    return new Response(JSON.stringify({ projects }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('Get projects error:', error)

    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la récupération des projets',
      }),
      { status: 500 },
    )
  }
}
