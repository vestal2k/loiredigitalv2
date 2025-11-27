// Script de test pour vérifier l'authentification
const bcrypt = require('bcryptjs')

// Le mot de passe en clair
const password = 'Test1234!'

// Génère un nouveau hash
const hash = bcrypt.hashSync(password, 10)
console.log('\n✅ Nouveau hash généré :')
console.log(hash)

// Teste la vérification avec le hash que tu as dans Sanity
console.log('\n🔍 Test de vérification :')
console.log('Entre le hash que tu as dans Sanity pour tester :')

// Pour tester, remplace ce hash par celui que tu as dans Sanity
const hashFromSanity = '$2a$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

// Test
const isValid = bcrypt.compareSync(password, hashFromSanity)
console.log(`Mot de passe valide : ${isValid}`)

console.log('\n📝 Instructions :')
console.log('1. Copie le nouveau hash ci-dessus')
console.log('2. Colle-le dans Sanity pour Jean Dupont')
console.log('3. Publish')
console.log('4. Réessaye la connexion avec : test@example.com / Test1234!')
