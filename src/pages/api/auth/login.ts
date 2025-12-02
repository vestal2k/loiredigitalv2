import type { APIRoute } from 'astro'
import { getClientByEmail } from '@/lib/sanity/queries'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth'

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json()

    // Validation des champs
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          error: 'Email et mot de passe requis',
        }),
        { status: 400 },
      )
    }

    // Récupérer le client
    const client = await getClientByEmail(email.toLowerCase())

    if (!client) {
      return new Response(
        JSON.stringify({
          error: 'Email ou mot de passe incorrect',
        }),
        { status: 401 },
      )
    }

    // Vérifier si le compte est actif
    if (!client.isActive) {
      return new Response(
        JSON.stringify({
          error: 'Votre compte a été désactivé. Contactez-nous pour plus d\'informations.',
        }),
        { status: 403 },
      )
    }

    // Vérifier le mot de passe
    const isValid = await verifyPassword(password, client.passwordHash)

    if (!isValid) {
      return new Response(
        JSON.stringify({
          error: 'Email ou mot de passe incorrect',
        }),
        { status: 401 },
      )
    }

    // Créer le token JWT
    const token = createToken({
      userId: client._id,
      email: client.email,
    })

    // Définir le cookie
    setAuthCookie(cookies, token)

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: client._id,
          email: client.email,
          firstName: client.firstName,
          lastName: client.lastName,
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
    console.error('Login error:', error)

    return new Response(
      JSON.stringify({
        error: 'Erreur lors de la connexion',
      }),
      { status: 500 },
    )
  }
}
