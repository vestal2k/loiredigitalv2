/**
 * Script de test automatique RAPIDE pour la Phase 8
 * Version sans rate limiting pour tests quotidiens (~10 secondes)
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
    console.log(`${colors.green}✅ ${name}${colors.reset}`)
  } else {
    results.failed++
    console.log(`${colors.red}❌ ${name}: ${message}${colors.reset}`)
  }
}

function addWarning(message) {
  results.warnings++
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`)
}

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ============================================================================
// Tests
// ============================================================================

async function testStructure() {
  console.log(`\n${colors.blue}📋 Tests de structure${colors.reset}`)

  const files = [
    'sanity/schemas/lead.ts',
    'sanity/schemas/quoteLead.ts',
    'src/lib/rate-limiter.ts',
    'src/schemas/quote.schema.ts',
    'src/schemas/contact.schema.ts',
  ]

  files.forEach((file) => {
    const exists = fs.existsSync(path.join(__dirname, '..', file))
    addResult(`${file}`, exists, exists ? '' : 'Fichier manquant')
  })
}

async function testAPIs() {
  console.log(`\n${colors.blue}📋 Tests des APIs${colors.reset}`)

  // Test 1: API Contact valide
  const validContact = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '0612345678',
    project: 'creation',
    message: 'Ceci est un message de test automatique pour valider le système',
    gdprConsent: true,
  }

  let result = await fetchAPI('/api/contact', {
    method: 'POST',
    body: JSON.stringify(validContact),
  })

  addResult(
    'API Contact - données valides (200)',
    result.status === 200,
    `Status: ${result.status}`,
  )

  await sleep(1500)

  // Test 2: API Contact invalide (email)
  result = await fetchAPI('/api/contact', {
    method: 'POST',
    body: JSON.stringify({ ...validContact, email: 'invalide' }),
  })

  addResult(
    'API Contact - email invalide (400)',
    result.status === 400,
    `Status: ${result.status}`,
  )

  await sleep(1500)

  // Test 3: API Devis valide
  const validQuote = {
    name: 'Test Quote',
    email: 'quote@example.com',
    phone: '0687654321',
    packId: 'premium',
    pages: 8,
    optionIds: ['blog', 'seo'],
    maintenance: 'pro',
    totalPrice: 2500,
    message: 'Test de simulation de devis automatique',
  }

  result = await fetchAPI('/api/devis', {
    method: 'POST',
    body: JSON.stringify(validQuote),
  })

  addResult(
    'API Devis - données valides (200)',
    result.status === 200,
    `Status: ${result.status}`,
  )

  await sleep(1500)

  // Test 4: API Devis invalide (pack)
  result = await fetchAPI('/api/devis', {
    method: 'POST',
    body: JSON.stringify({ ...validQuote, packId: 'invalide' }),
  })

  addResult(
    'API Devis - pack invalide (400)',
    result.status === 400,
    `Status: ${result.status}`,
  )
}

// ============================================================================
// Rapport final
// ============================================================================

function printReport() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.cyan}📊 RAPPORT DE TESTS RAPIDES${colors.reset}`)
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`)

  console.log(`\n${colors.blue}Résumé :${colors.reset}`)
  console.log(`  ${colors.green}✅ Tests réussis : ${results.passed}${colors.reset}`)
  console.log(`  ${colors.red}❌ Tests échoués : ${results.failed}${colors.reset}`)

  const total = results.passed + results.failed
  const percentage = total > 0 ? Math.round((results.passed / total) * 100) : 0

  console.log(`\n${colors.blue}Score :${colors.reset}`)
  if (percentage === 100) {
    console.log(`  ${colors.green}${percentage}% - Excellent ! 🎉${colors.reset}`)
  } else if (percentage >= 80) {
    console.log(`  ${colors.green}${percentage}% - Bon${colors.reset}`)
  } else {
    console.log(`  ${colors.red}${percentage}% - À vérifier${colors.reset}`)
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

  console.log(
    `\n${colors.gray}Pour les tests complets (avec rate limiting) : npm run test:phase8${colors.reset}`,
  )
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`)
}

// ============================================================================
// Exécution
// ============================================================================

async function runQuickTests() {
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.cyan}⚡ TESTS RAPIDES - PHASE 8 (sans rate limiting)${colors.reset}`)
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.gray}URL : ${BASE_URL}${colors.reset}\n`)

  try {
    await testStructure()

    console.log(`${colors.gray}\nVérification du serveur...${colors.reset}`)
    const serverCheck = await fetchAPI('/')

    if (serverCheck.ok || serverCheck.status > 0) {
      console.log(`${colors.green}✅ Serveur accessible${colors.reset}`)
      await testAPIs()
    } else {
      addWarning('Serveur non accessible - Lancez `npm run dev`')
    }
  } catch (error) {
    console.log(`${colors.red}❌ Erreur : ${error.message}${colors.reset}`)
  }

  printReport()
  process.exit(results.failed > 0 ? 1 : 0)
}

runQuickTests()
