#!/usr/bin/env node

/**
 * Script pour créer facilement un client dans Sanity
 * Usage: node create-client.js
 */

import { createClient } from '@sanity/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

// Client Sanity
const sanityClient = createClient({
  projectId: process.env.PUBLIC_SANITY_PROJECT_ID || 'r98l8u9o',
  dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // Token avec droits d'écriture
  apiVersion: '2025-01-01',
})

async function createClientAccount() {
  console.log('\n🎉 Création d\'un nouveau client Loire Digital\n')

  try {
    // Demander les infos
    const email = await question('📧 Email du client : ')
    const firstName = await question('👤 Prénom : ')
    const lastName = await question('👤 Nom : ')
    const company = await question('🏢 Entreprise (optionnel) : ')
    const phone = await question('📱 Téléphone (optionnel) : ')
    const password = await question('🔒 Mot de passe (ou laisse vide pour générer) : ')

    // Générer ou utiliser le mot de passe
    const finalPassword = password || generatePassword()
    console.log(`\n✅ Mot de passe : ${finalPassword}`)

    // Hasher le mot de passe
    console.log('🔐 Hashing du mot de passe...')
    const passwordHash = await bcrypt.hash(finalPassword, 10)

    // Créer le client dans Sanity
    console.log('📝 Création du client dans Sanity...')
    const client = await sanityClient.create({
      _type: 'client',
      email: email.toLowerCase(),
      firstName,
      lastName,
      company: company || undefined,
      phone: phone || undefined,
      passwordHash,
      createdAt: new Date().toISOString(),
      isActive: true,
    })

    console.log('\n✅ Client créé avec succès !\n')
    console.log('📋 Informations du client :')
    console.log(`   ID: ${client._id}`)
    console.log(`   Email: ${email}`)
    console.log(`   Mot de passe: ${finalPassword}`)
    console.log('\n⚠️  IMPORTANT : Envoie ces identifiants au client par email sécurisé !')
    console.log('\n🔗 Le client peut se connecter sur : https://loiredigital.fr/espace-client/connexion\n')
  } catch (error) {
    console.error('\n❌ Erreur:', error.message)
    if (error.message.includes('Token')) {
      console.log('\n💡 Astuce : Tu dois ajouter un SANITY_API_TOKEN dans ton .env')
      console.log('   1. Va sur https://www.sanity.io/manage')
      console.log('   2. Sélectionne ton projet')
      console.log('   3. API > Tokens > Add API token')
      console.log('   4. Permissions : Editor')
      console.log('   5. Copie le token dans .env : SANITY_API_TOKEN=sk...\n')
    }
  } finally {
    rl.close()
  }
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Lancer le script
createClientAccount()
