import type { APIRoute } from 'astro'
import { getUserFromCookie } from '@/lib/auth'
import { getProjectById } from '@/lib/sanity-client'

export const GET: APIRoute = async ({ params, cookies }) => {
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

    const projectId = params.id

    if (!projectId) {
      return new Response(
        JSON.stringify({
          error: 'ID de projet requis',
        }),
        { status: 400 },
      )
    }

    // Récupérer le projet
    const project = await getProjectById(projectId)

    if (!project) {
      return new Response(
        JSON.stringify({
          error: 'Projet introuvable',
        }),
        { status: 404 },
      )
    }

    // Vérifier que le projet appartient au client
    if (project.client._ref !== user.userId) {
      return new Response(
        JSON.stringify({
          error: 'Accès non autorisé',
        }),
        { status: 403 },
      )
    }

    return new Response(JSON.stringify({ project }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('Get project error:', error)

    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la récupération du projet',
      }),
      { status: 500 },
    )
  }
}
