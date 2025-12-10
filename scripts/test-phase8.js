/**
 * Script de test automatique pour les APIs
 * Teste les APIs de contact et devis, la validation, le rate limiting
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Pour obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:4321'

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

// Utilitaires
const log = {
  title: (text) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`),
  section: (text) => console.log(`\n${colors.blue}📋 ${text}${colors.reset}`),
  success: (text) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}❌ ${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`),
  info: (text) => console.log(`${colors.gray}ℹ️  ${text}${colors.reset}`),
}

// Résultats des tests
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
}

function addResult(name, passed, message = '') {
  results.tests.push({ name, passed, message })
  if (passed) {
    results.passed++
    log.success(name)
  } else {
    results.failed++
    log.error(`${name}: ${message}`)
  }
}

function addWarning(message) {
  results.warnings++
  log.warning(message)
}

// Helper pour faire des requêtes
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json().catch(() => ({}))

    return {
      ok: response.ok,
      status: response.status,
      data,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
    }
  }
}

// Helper pour attendre
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ============================================================================
// Tests
// ============================================================================

async function testContactAPIValid() {
  log.section('Test 1: API Contact - Données valides')

  const validData = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '0612345678',
    project: 'creation',
    message: 'Ceci est un message de test automatique pour valider le système',
    gdprConsent: true,
  }

  const result = await fetchAPI('/api/contact', {
    method: 'POST',
    body: JSON.stringify(validData),
  })

  addResult(
    'Requête acceptée (200)',
    result.status === 200,
    `Status: ${result.status}`,
  )
  addResult(
    'Réponse contient success: true',
    result.data?.success === true,
    `Success: ${result.data?.success}`,
  )
  addResult(
    'Message de confirmation présent',
    result.data?.message?.includes('succès'),
    `Message: ${result.data?.message}`,
  )
}

async function testContactAPIInvalid() {
  log.section('Test 2: API Contact - Données invalides')

  // Test 1: Email invalide
  const invalidEmail = {
    name: 'Test User',
    email: 'email-invalide',
    project: 'creation',
    message: 'Test',
    rgpdConsent: true,
  }

  let result = await fetchAPI('/api/contact', {
    method: 'POST',
    body: JSON.stringify(invalidEmail),
  })

  addResult(
    'Email invalide rejeté (400)',
    result.status === 400,
    `Status: ${result.status}`,
  )

  // Test 2: Nom trop court
  const shortName = {
    name: 'A',
    email: 'test@example.com',
    project: 'creation',
    message: 'Test message court',
    gdprConsent: true,
  }

  result = await fetchAPI('/api/contact', {
    method: 'POST',
    body: JSON.stringify(shortName),
  })

  addResult(
    'Nom trop court rejeté (400)',
    result.status === 400,
    `Status: ${result.status}`,
  )

  // Test 3: Champs manquants
  const missingFields = {
    name: 'Test User',
  }

  result = await fetchAPI('/api/contact', {
    method: 'POST',
    body: JSON.stringify(missingFields),
  })

  addResult(
    'Champs manquants rejetés (400)',
    result.status === 400,
    `Status: ${result.status}`,
  )
}

async function testQuoteAPIValid() {
  log.section('Test 3: API Devis - Données valides')

  const validData = {
    name: 'Test Quote User',
    email: 'quote@example.com',
    phone: '0687654321',
    packId: 'premium',
    pages: 8,
    optionIds: ['blog', 'seo'],
    maintenance: 'pro',
    totalPrice: 2500,
    message: 'Test de simulation de devis',
  }

  const result = await fetchAPI('/api/devis', {
    method: 'POST',
    body: JSON.stringify(validData),
  })

  addResult(
    'Requête acceptée (200)',
    result.status === 200,
    `Status: ${result.status}`,
  )
  addResult(
    'Réponse contient success: true',
    result.data?.success === true,
    `Success: ${result.data?.success}`,
  )
}

async function testQuoteAPIInvalid() {
  log.section('Test 4: API Devis - Données invalides')

  // Test 1: Pack invalide
  const invalidPack = {
    name: 'Test',
    email: 'test@example.com',
    packId: 'pack-invalide',
    pages: 5,
    maintenance: 'none',
    totalPrice: 1000,
  }

  let result = await fetchAPI('/api/devis', {
    method: 'POST',
    body: JSON.stringify(invalidPack),
  })

  addResult(
    'Pack invalide rejeté (400)',
    result.status === 400,
    `Status: ${result.status}`,
  )

  // Test 2: Pages invalides (0)
  const invalidPages = {
    name: 'Test',
    email: 'test@example.com',
    packId: 'vitrine',
    pages: 0,
    maintenance: 'none',
    totalPrice: 1000,
  }

  result = await fetchAPI('/api/devis', {
    method: 'POST',
    body: JSON.stringify(invalidPages),
  })

  addResult(
    'Pages invalides rejetées (400)',
    result.status === 400,
    `Status: ${result.status}`,
  )

  // Test 3: Prix négatif
  const negativePri = {
    name: 'Test',
    email: 'test@example.com',
    packId: 'vitrine',
    pages: 5,
    maintenance: 'none',
    totalPrice: -100,
  }

  result = await fetchAPI('/api/devis', {
    method: 'POST',
    body: JSON.stringify(negativePri),
  })

  addResult(
    'Prix négatif rejeté (400)',
    result.status === 400,
    `Status: ${result.status}`,
  )
}

async function testRateLimiting() {
  log.section('Test 5: Rate Limiting')

  // Attendre 65 secondes pour que le rate limiter des tests précédents soit réinitialisé
  log.info('Attente de 65 secondes pour réinitialiser le rate limiter...')
  for (let i = 65; i > 0; i--) {
    process.stdout.write(`\r${colors.gray}  Temps restant: ${i}s ${colors.reset}`)
    await sleep(1000)
  }
  console.log() // Nouvelle ligne

  log.info('Envoi de 6 requêtes consécutives...')

  const testData = {
    name: 'Rate Limit Test',
    email: 'ratelimit@example.com',
    project: 'creation',
    message: 'Test rate limiting automatique du système',
    gdprConsent: true,
  }

  const testResults = []

  // Envoyer 6 requêtes rapidement
  for (let i = 0; i < 6; i++) {
    const result = await fetchAPI('/api/contact', {
      method: 'POST',
      body: JSON.stringify(testData),
    })
    testResults.push(result.status)
    log.info(`  Requête ${i + 1}/6: Status ${result.status}`)
    await sleep(50) // Petit délai entre les requêtes
  }

  // Vérifier que les 5 premières passent
  const first5Pass = testResults.slice(0, 5).every((status) => status === 200)
  addResult('Les 5 premières requêtes passent (200)', first5Pass)

  // Vérifier que la 6ème est bloquée
  const sixth429 = testResults[5] === 429
  addResult('La 6ème requête est bloquée (429)', sixth429)

  if (sixth429) {
    log.info('Attente de 61 secondes pour réinitialisation du rate limit...')

    // Afficher un compte à rebours
    for (let i = 61; i > 0; i--) {
      process.stdout.write(`\r${colors.gray}  Temps restant: ${i}s ${colors.reset}`)
      await sleep(1000)
    }
    console.log() // Nouvelle ligne

    // Tester qu'on peut à nouveau faire des requêtes
    const afterWait = await fetchAPI('/api/contact', {
      method: 'POST',
      body: JSON.stringify(testData),
    })

    addResult(
      'Requête passe après réinitialisation',
      afterWait.status === 200,
      `Status: ${afterWait.status}`,
    )
  } else {
    addWarning('Rate limit non testé complètement (6ème requête non bloquée)')
  }
}

async function testFileStructure() {
  log.section('Test 6: Structure des fichiers')

  const files = [
    'src/lib/utils/rate-limiter.ts',
    'src/schemas/quote.schema.ts',
    'src/schemas/contact.schema.ts',
  ]

  files.forEach((file) => {
    const exists = fs.existsSync(path.join(__dirname, '..', file))
    addResult(`Fichier ${file} existe`, exists)
  })
}

async function checkEnvironmentVariables() {
  log.section('Test 7: Variables d\'environnement')

  const envFile = path.join(__dirname, '../.env')

  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf-8')

    const vars = ['RESEND_API_KEY']

    vars.forEach((varName) => {
      const hasVar = content.includes(varName)
      if (hasVar) {
        log.success(`${varName} présent dans .env`)
      } else {
        addWarning(`${varName} manquant dans .env`)
      }
    })
  } else {
    addWarning('Fichier .env non trouvé (normal en production)')
  }
}

// ============================================================================
// Rapport final
// ============================================================================

function printReport() {
  log.title()
  console.log(`${colors.cyan}📊 RAPPORT DE TESTS${colors.reset}`)
  log.title()

  console.log(`\n${colors.blue}Résumé :${colors.reset}`)
  console.log(`  ${colors.green}✅ Tests réussis : ${results.passed}${colors.reset}`)
  console.log(`  ${colors.red}❌ Tests échoués : ${results.failed}${colors.reset}`)
  console.log(
    `  ${colors.yellow}⚠️  Avertissements : ${results.warnings}${colors.reset}`,
  )

  const total = results.passed + results.failed
  const percentage = total > 0 ? Math.round((results.passed / total) * 100) : 0

  console.log(`\n${colors.blue}Score :${colors.reset}`)
  if (percentage === 100) {
    console.log(`  ${colors.green}${percentage}% - Excellent ! 🎉${colors.reset}`)
  } else if (percentage >= 80) {
    console.log(`  ${colors.green}${percentage}% - Bon${colors.reset}`)
  } else if (percentage >= 60) {
    console.log(`  ${colors.yellow}${percentage}% - À améliorer${colors.reset}`)
  } else {
    console.log(`  ${colors.red}${percentage}% - Attention !${colors.reset}`)
  }

  if (results.failed > 0) {
    console.log(`\n${colors.red}Tests échoués :${colors.reset}`)
    results.tests
      .filter((t) => !t.passed)
      .forEach((t) => {
        console.log(`  ❌ ${t.name}`)
        if (t.message) {
          console.log(`     ${colors.gray}${t.message}${colors.reset}`)
        }
      })
  }

  log.title()
}

// ============================================================================
// Exécution des tests
// ============================================================================

async function runAllTests() {
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.cyan}🧪 TESTS AUTOMATIQUES - APIs Contact & Devis${colors.reset}`)
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.gray}URL de test : ${BASE_URL}${colors.reset}\n`)

  try {
    // Tests de structure
    await testFileStructure()
    await checkEnvironmentVariables()

    // Tests des APIs (nécessitent que le serveur tourne)
    log.info('\nVérification que le serveur est accessible...')
    const serverCheck = await fetchAPI('/')

    if (serverCheck.ok || serverCheck.status > 0) {
      log.success('Serveur accessible !')

      await testContactAPIValid()
      await sleep(2000) // Attendre 2s pour éviter le rate limiting
      await testContactAPIInvalid()
      await sleep(2000)
      await testQuoteAPIValid()
      await sleep(2000)
      await testQuoteAPIInvalid()
      await sleep(2000)

      // Demander confirmation pour le test de rate limiting (long)
      console.log(
        `\n${colors.yellow}⚠️  Le test de rate limiting prend ~2 minutes (délais d'attente)${colors.reset}`,
      )
      console.log(`${colors.gray}Voulez-vous le lancer ? (Sinon, Ctrl+C)${colors.reset}`)
      console.log(`${colors.gray}Lancement dans 3 secondes...${colors.reset}`)

      await sleep(3000)
      await testRateLimiting()
    } else {
      addWarning(
        'Serveur non accessible - Tests des APIs ignorés (lancez `npm run dev`)',
      )
    }
  } catch (error) {
    log.error(`Erreur lors des tests : ${error.message}`)
  }

  // Afficher le rapport
  printReport()

  // Code de sortie
  process.exit(results.failed > 0 ? 1 : 0)
}

// Lancer les tests
runAllTests()
