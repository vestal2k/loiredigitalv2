import type { APIRoute } from 'astro'
import { getUserFromCookie } from '@/lib/auth'
import { getProjectById, updateMockupFeedback } from '@/lib/sanity/queries'

export const POST: APIRoute = async ({ request, cookies }) => {
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

    const { projectId, mockupIndex, feedback, status } = await request.json()

    // Validation
    if (!projectId || mockupIndex === undefined || !feedback || !status) {
      return new Response(
        JSON.stringify({
          error: 'Données manquantes',
        }),
        { status: 400 },
      )
    }

    // Vérifier que le projet appartient au client
    const project = await getProjectById(projectId)

    if (!project) {
      return new Response(
        JSON.stringify({
          error: 'Projet introuvable',
        }),
        { status: 404 },
      )
    }

    if (project.client._ref !== user.userId) {
      return new Response(
        JSON.stringify({
          error: 'Accès non autorisé',
        }),
        { status: 403 },
      )
    }

    // Mettre à jour le feedback
    await updateMockupFeedback(projectId, mockupIndex, feedback, status)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Feedback enregistré avec succès',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error: any) {
    console.error('Mockup feedback error:', error)

    return new Response(
      JSON.stringify({
        error: 'Erreur lors de l\'enregistrement du feedback',
      }),
      { status: 500 },
    )
  }
}
