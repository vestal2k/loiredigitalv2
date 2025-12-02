import { useState } from 'react'
import {
  PRICING_PACKS,
  PRICING_OPTIONS,
  PRICE_PER_EXTRA_PAGE,
  MAINTENANCE_PLANS,
} from '../config/pricing'

interface QuoteOptions {
  packId: string
  pages: number
  optionIds: string[]
  maintenance: string
}

const QuoteCalculator = () => {
  const [step, setStep] = useState(1)
  const [options, setOptions] = useState<QuoteOptions>({
    packId: '',
    pages: 3,
    optionIds: [],
    maintenance: 'none',
  })

  const [showResult, setShowResult] = useState(false)

  // Pricing logic
  const calculatePrice = () => {
    const pack = PRICING_PACKS.find((p) => p.id === options.packId)
    if (!pack) return 0

    let total = pack.basePrice

    // Calculate extra pages beyond what's included in the pack
    const extraPages = Math.max(0, options.pages - pack.pagesIncluded)
    total += extraPages * PRICE_PER_EXTRA_PAGE

    // Add selected options
    options.optionIds.forEach((optionId) => {
      const option = PRICING_OPTIONS.find((o) => o.id === optionId)
      if (option) {
        total += option.price
      }
    })

    return total
  }

  const getMaintenancePrice = () => {
    const plan = MAINTENANCE_PLANS.find((p) => p.id === options.maintenance)
    return plan ? plan.pricePerMonth : 0
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      setShowResult(true)
    }
  }

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const toggleOption = (optionId: string) => {
    if (options.optionIds.includes(optionId)) {
      setOptions({
        ...options,
        optionIds: options.optionIds.filter((id) => id !== optionId),
      })
    } else {
      setOptions({
        ...options,
        optionIds: [...options.optionIds, optionId],
      })
    }
  }

  const resetCalculator = () => {
    setStep(1)
    setShowResult(false)
    setOptions({
      packId: '',
      pages: 3,
      optionIds: [],
      maintenance: 'none',
    })
  }

  const generatePDF = async () => {
    // Chargement dynamique de jsPDF uniquement quand nécessaire
    const jsPDF = (await import('jspdf')).default
    const doc = new jsPDF()
    const totalPrice = calculatePrice()
    const maintenancePrice = getMaintenancePrice()
    const pack = PRICING_PACKS.find((p) => p.id === options.packId)
    const maintenancePlan = MAINTENANCE_PLANS.find((p) => p.id === options.maintenance)

    // Header
    doc.setFontSize(24)
    doc.setTextColor(37, 99, 235) // Blue color
    doc.text('Loire Digital', 105, 20, { align: 'center' })

    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    doc.text('Devis Estimatif', 105, 35, { align: 'center' })

    // Date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 45, { align: 'center' })

    // Price section
    doc.setFontSize(28)
    doc.setTextColor(37, 99, 235)
    doc.text(`${totalPrice.toLocaleString('fr-FR')} €`, 105, 65, { align: 'center' })

    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text('Prix de création (paiement unique)', 105, 73, { align: 'center' })

    if (maintenancePrice > 0) {
      doc.setFontSize(16)
      doc.setTextColor(37, 99, 235)
      doc.text(`+ ${maintenancePrice} €/mois`, 105, 85, { align: 'center' })
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Maintenance ${maintenancePlan?.name || ''}`, 105, 92, { align: 'center' })
    }

    // Project details
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('Récapitulatif de votre projet', 20, maintenancePrice > 0 ? 110 : 100)

    let yPos = maintenancePrice > 0 ? 120 : 110
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)

    if (pack) {
      doc.text(`• Pack : ${pack.name}`, 25, yPos)
      yPos += 8
    }

    doc.text(`• Nombre de pages : ${options.pages}`, 25, yPos)
    yPos += 8

    if (options.optionIds.length > 0) {
      const selectedOptions = options.optionIds
        .map((id) => PRICING_OPTIONS.find((o) => o.id === id)?.name)
        .filter(Boolean)
        .join(', ')
      doc.text(`• Options : ${selectedOptions}`, 25, yPos)
      yPos += 8
    }

    // Note section
    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(37, 99, 235)
    doc.text('Note :', 20, yPos)
    doc.setTextColor(60, 60, 60)
    const noteText =
      'Le calculateur donne une estimation fiable. Le devis final peut bouger\nlégèrement si le projet devient plus complexe.'
    const splitNote = doc.splitTextToSize(noteText, 170)
    doc.text(splitNote, 20, yPos + 5)

    // Footer
    doc.setFontSize(9)
    doc.setTextColor(150, 150, 150)
    doc.text('Loire Digital - Sites web professionnels à Saint-Étienne', 105, 280, {
      align: 'center',
    })
    doc.text('contact@loiredigital.fr | loiredigital.fr', 105, 285, { align: 'center' })

    // Save PDF
    doc.save(`devis-loire-digital-${Date.now()}.pdf`)
  }

  if (showResult) {
    const totalPrice = calculatePrice()
    const maintenancePrice = getMaintenancePrice()
    const pack = PRICING_PACKS.find((p) => p.id === options.packId)
    const maintenancePlan = MAINTENANCE_PLANS.find((p) => p.id === options.maintenance)

    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-4xl font-display font-bold text-black mb-2">Votre devis estimatif</h2>
          <p className="text-gray-600">Estimation basée sur vos choix</p>
        </div>

        <div className="bg-gray-50 border border-blue-100 rounded-xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-5xl font-display font-bold text-blue-600 mb-2">
              {totalPrice.toLocaleString('fr-FR')} €
            </div>
            <p className="text-gray-600">Prix de création (paiement unique)</p>
          </div>

          {maintenancePrice > 0 && (
            <div className="text-center pt-6 border-t border-gray-200">
              <div className="text-3xl font-display font-bold text-blue-600 mb-2">
                + {maintenancePrice} €/mois
              </div>
              <p className="text-gray-600">Maintenance {maintenancePlan?.name || ''}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="font-display font-bold text-lg text-black mb-4">
            Récapitulatif de votre projet :
          </h3>
          <ul className="space-y-2 text-gray-700">
            {pack && (
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Pack : {pack.name}
              </li>
            )}
            <li className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Nombre de pages : {options.pages}
            </li>
            {options.optionIds.length > 0 && (
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <div>
                  Options :{' '}
                  {options.optionIds
                    .map((id) => PRICING_OPTIONS.find((o) => o.id === id)?.name)
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </li>
            )}
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700">
            <strong className="text-blue-600">Note :</strong> Le calculateur donne une estimation
            fiable. Le devis final peut bouger légèrement si le projet devient plus complexe.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={resetCalculator}
              className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Recommencer
            </button>
            <button
              onClick={generatePDF}
              className="flex-1 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Télécharger PDF
            </button>
          </div>
          <a
            href="/#contact"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Demander un devis détaillé
          </a>
        </div>
      </div>
    )
  }

  const stepTitles = ['Pack', 'Nombre de pages', 'Options', 'Maintenance']

  // Get current selections for summary
  const currentPack = PRICING_PACKS.find((p) => p.id === options.packId)
  const currentPrice = calculatePrice()
  const currentMaintenance = getMaintenancePrice()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Calculator */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                  stepNumber < step
                    ? 'bg-blue-600 text-white'
                    : stepNumber === step
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {stepNumber < step ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`text-xs text-center hidden md:block ${stepNumber === step ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
              >
                {stepTitles[stepNumber - 1]}
              </span>
              {stepNumber < 4 && (
                <div
                  className={`hidden md:block absolute h-0.5 w-full translate-x-1/2 top-5 ${stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'}`}
                  style={{ left: `${(stepNumber - 1) * 25}%`, width: '25%' }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-2 md:hidden">
          <span className="text-sm font-semibold text-gray-600">Étape {step} sur 4</span>
          <span className="text-sm font-semibold text-blue-600">{stepTitles[step - 1]}</span>
        </div>
      </div>

      {/* Step 1: Pack Selection */}
      {step === 1 && (
        <div>
          <h2 className="text-3xl font-display font-bold text-black mb-2">Choisissez votre pack</h2>
          <p className="text-gray-600 mb-6">Sélectionnez le pack qui correspond le mieux à vos besoins</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRICING_PACKS.map((pack) => (
              <button
                key={pack.id}
                onClick={() =>
                  setOptions({ ...options, packId: pack.id, pages: pack.pagesIncluded })
                }
                className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                  options.packId === pack.id
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                } ${pack.popular ? 'ring-2 ring-blue-200' : ''}`}
              >
                {pack.popular && (
                  <div className="absolute -top-3 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Populaire
                  </div>
                )}
                {options.packId === pack.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
                <h3 className="font-display font-bold text-2xl text-black mb-2">{pack.name}</h3>
                <div className="text-3xl font-display font-bold text-blue-600 mb-4">
                  {pack.basePrice}€
                </div>
                <ul className="space-y-2 mb-4">
                  {pack.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <svg
                        className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Number of Pages */}
      {step === 2 && (
        <div>
          <h2 className="text-3xl font-display font-bold text-black mb-2">Nombre de pages</h2>
          <p className="text-gray-600 mb-6">Combien de pages aura votre site ?</p>

          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center mb-6">
              <span className="text-5xl font-display font-bold text-blue-600">{options.pages}</span>
              <span className="text-2xl text-gray-600 ml-2">
                page{options.pages > 1 ? 's' : ''}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="20"
              value={options.pages}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                if (value >= 1 && value <= 20) {
                  setOptions({ ...options, pages: value })
                }
              }}
              aria-label={`Nombre de pages : ${options.pages}`}
              aria-valuemin={1}
              aria-valuemax={20}
              aria-valuenow={options.pages}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                accentColor: '#2563eb',
              }}
            />

            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>1 page</span>
              <span>20 pages</span>
            </div>

            {PRICING_PACKS.find((p) => p.id === options.packId) && (
              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong className="text-black">Votre pack inclut :</strong>{' '}
                  {PRICING_PACKS.find((p) => p.id === options.packId)?.pagesIncluded} pages
                  {options.pages >
                    (PRICING_PACKS.find((p) => p.id === options.packId)?.pagesIncluded || 0) && (
                    <>
                      <br />
                      <strong className="text-blue-600">Pages supplémentaires :</strong>{' '}
                      {options.pages -
                        (PRICING_PACKS.find((p) => p.id === options.packId)?.pagesIncluded || 0)}{' '}
                      × {PRICE_PER_EXTRA_PAGE}€ ={' '}
                      {(options.pages -
                        (PRICING_PACKS.find((p) => p.id === options.packId)?.pagesIncluded || 0)) *
                        PRICE_PER_EXTRA_PAGE}
                      €
                    </>
                  )}
                </p>
              </div>
            )}

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong className="text-black">Exemples :</strong> Accueil, Services, À propos,
                Portfolio, Contact, Blog, etc.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Options */}
      {step === 3 && (
        <div>
          <h2 className="text-3xl font-display font-bold text-black mb-2">Options supplémentaires</h2>
          <p className="text-gray-600 mb-6">Ajoutez des fonctionnalités à votre site (optionnel)</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRICING_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleOption(option.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left relative ${
                  options.optionIds.includes(option.id)
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                {options.optionIds.includes(option.id) && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-black mb-1">{option.name}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  <span className="font-semibold text-blue-600 ml-2">+{option.price}€</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Maintenance */}
      {step === 4 && (
        <div>
          <h2 className="text-3xl font-display font-bold text-black mb-2">Maintenance</h2>
          <p className="text-gray-600 mb-6">Souhaitez-vous un forfait de maintenance ?</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setOptions({ ...options, maintenance: 'none' })}
              className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                options.maintenance === 'none'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              {options.maintenance === 'none' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              <h3 className="font-display font-bold text-lg text-black mb-2">Pas de maintenance</h3>
              <p className="text-sm text-gray-600 mb-3">Vous gérez vous-même votre site</p>
              <div className="text-2xl font-display font-bold text-gray-700">0€/mois</div>
            </button>

            {MAINTENANCE_PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setOptions({ ...options, maintenance: plan.id })}
                className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                  options.maintenance === plan.id
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                {options.maintenance === plan.id && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
                {plan.id === 'premium' && (
                  <div className="absolute -top-3 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Populaire
                  </div>
                )}
                <h3 className="font-display font-bold text-lg text-black mb-2 capitalize">
                  {plan.name}
                </h3>
                <ul className="text-sm text-gray-600 space-y-1 mb-3">
                  {plan.features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
                <div className="text-2xl font-display font-bold text-blue-600">
                  {plan.pricePerMonth}€/mois
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-8">
        {step > 1 && (
          <button
            onClick={handlePrev}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            ← Précédent
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={step === 1 && !options.packId}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            step === 1 && !options.packId
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {step === 4 ? 'Voir le devis 📊' : 'Suivant →'}
        </button>
      </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6 sticky top-4">
            <h3 className="text-xl font-display font-bold text-black mb-4">Récapitulatif</h3>

            {!options.packId ? (
              <p className="text-gray-600 text-sm italic">Sélectionnez un pack pour commencer</p>
            ) : (
              <div className="space-y-4">
                {/* Pack */}
                {currentPack && (
                  <div className="pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold text-gray-700">Pack {currentPack.name}</span>
                      <span className="text-sm font-bold text-blue-600">{currentPack.basePrice}€</span>
                    </div>
                    <p className="text-xs text-gray-600">{currentPack.pagesIncluded} pages incluses</p>
                  </div>
                )}

                {/* Pages */}
                {currentPack && options.pages > currentPack.pagesIncluded && (
                  <div className="pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm text-gray-700">
                        Pages supplémentaires ({options.pages - currentPack.pagesIncluded})
                      </span>
                      <span className="text-sm text-gray-700">
                        {(options.pages - currentPack.pagesIncluded) * PRICE_PER_EXTRA_PAGE}€
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {options.pages - currentPack.pagesIncluded} × {PRICE_PER_EXTRA_PAGE}€
                    </p>
                  </div>
                )}

                {/* Options */}
                {options.optionIds.length > 0 && (
                  <div className="pb-4 border-b border-gray-200">
                    <span className="text-sm font-semibold text-gray-700 block mb-2">Options</span>
                    {options.optionIds.map((optionId) => {
                      const option = PRICING_OPTIONS.find((o) => o.id === optionId)
                      return (
                        option && (
                          <div key={optionId} className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">{option.name}</span>
                            <span className="text-xs text-gray-700">+{option.price}€</span>
                          </div>
                        )
                      )
                    })}
                  </div>
                )}

                {/* Maintenance */}
                {currentMaintenance > 0 && (
                  <div className="pb-4 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-700">Maintenance</span>
                      <span className="text-sm text-gray-700">{currentMaintenance}€/mois</span>
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-display font-bold text-black">Total</span>
                    <span className="text-2xl font-display font-bold text-blue-600">
                      {currentPrice.toLocaleString('fr-FR')}€
                    </span>
                  </div>
                  {currentMaintenance > 0 && (
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      + {currentMaintenance}€/mois
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteCalculator
