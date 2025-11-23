import { useState } from 'react';
import jsPDF from 'jspdf';

interface QuoteOptions {
  projectType: string;
  pages: number;
  features: string[];
  design: string;
  seo: boolean;
  maintenance: string;
}

const QuoteCalculator = () => {
  const [step, setStep] = useState(1);
  const [options, setOptions] = useState<QuoteOptions>({
    projectType: '',
    pages: 1,
    features: [],
    design: 'template',
    seo: false,
    maintenance: 'none',
  });

  const [showResult, setShowResult] = useState(false);

  // Pricing logic
  const calculatePrice = () => {
    let basePrice = 0;

    // Base price by project type
    switch (options.projectType) {
      case 'vitrine':
        basePrice = 800;
        break;
      case 'ecommerce':
        basePrice = 2500;
        break;
      case 'custom':
        basePrice = 1500;
        break;
      default:
        basePrice = 800;
    }

    // Price per page (beyond first 3)
    if (options.pages > 3) {
      basePrice += (options.pages - 3) * 150;
    }

    // Features
    const featurePrices: Record<string, number> = {
      contact: 0, // included
      booking: 300,
      blog: 200,
      gallery: 150,
      maps: 0, // included
      multilang: 400,
    };

    options.features.forEach(feature => {
      basePrice += featurePrices[feature] || 0;
    });

    // Design
    if (options.design === 'custom') {
      basePrice += 500;
    }

    // SEO
    if (options.seo) {
      basePrice += 300;
    }

    return basePrice;
  };

  const getMaintenancePrice = () => {
    switch (options.maintenance) {
      case 'essential':
        return 29;
      case 'premium':
        return 99;
      default:
        return 0;
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleFeature = (feature: string) => {
    if (options.features.includes(feature)) {
      setOptions({
        ...options,
        features: options.features.filter(f => f !== feature),
      });
    } else {
      setOptions({
        ...options,
        features: [...options.features, feature],
      });
    }
  };

  const resetCalculator = () => {
    setStep(1);
    setShowResult(false);
    setOptions({
      projectType: '',
      pages: 1,
      features: [],
      design: 'template',
      seo: false,
      maintenance: 'none',
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const totalPrice = calculatePrice();
    const maintenancePrice = getMaintenancePrice();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text('Loire Digital', 105, 20, { align: 'center' });

    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Devis Estimatif', 105, 35, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 45, { align: 'center' });

    // Price section
    doc.setFontSize(28);
    doc.setTextColor(37, 99, 235);
    doc.text(`${totalPrice.toLocaleString('fr-FR')} €`, 105, 65, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Prix de création (paiement unique)', 105, 73, { align: 'center' });

    if (maintenancePrice > 0) {
      doc.setFontSize(16);
      doc.setTextColor(37, 99, 235);
      doc.text(`+ ${maintenancePrice} €/mois`, 105, 85, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Maintenance ${options.maintenance === 'essential' ? 'Essentielle' : 'Premium'}`, 105, 92, { align: 'center' });
    }

    // Project details
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Récapitulatif de votre projet', 20, maintenancePrice > 0 ? 110 : 100);

    let yPos = maintenancePrice > 0 ? 120 : 110;
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);

    const projectTypeLabel = options.projectType === 'vitrine' ? 'Site vitrine' :
                             options.projectType === 'ecommerce' ? 'Site e-commerce' : 'Site sur-mesure';
    doc.text(`• Type : ${projectTypeLabel}`, 25, yPos);
    yPos += 8;

    doc.text(`• Nombre de pages : ${options.pages}`, 25, yPos);
    yPos += 8;

    const designLabel = options.design === 'custom' ? 'Sur-mesure' : 'À partir d\'un template';
    doc.text(`• Design : ${designLabel}`, 25, yPos);
    yPos += 8;

    if (options.features.length > 0) {
      doc.text(`• Fonctionnalités : ${options.features.join(', ')}`, 25, yPos);
      yPos += 8;
    }

    if (options.seo) {
      doc.text('• Pack SEO local inclus', 25, yPos);
      yPos += 8;
    }

    // Note section
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text('Note :', 20, yPos);
    doc.setTextColor(60, 60, 60);
    const noteText = 'Le calculateur donne une estimation fiable. Le devis final peut bouger\nlégèrement si le projet devient plus complexe.';
    const splitNote = doc.splitTextToSize(noteText, 170);
    doc.text(splitNote, 20, yPos + 5);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Loire Digital - Sites web professionnels à Saint-Étienne', 105, 280, { align: 'center' });
    doc.text('contact@loiredigital.fr | loiredigital.fr', 105, 285, { align: 'center' });

    // Save PDF
    doc.save(`devis-loire-digital-${Date.now()}.pdf`);
  };

  if (showResult) {
    const totalPrice = calculatePrice();
    const maintenancePrice = getMaintenancePrice();

    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              <p className="text-gray-600">Maintenance {options.maintenance === 'essential' ? 'Essentielle' : 'Premium'}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="font-display font-bold text-lg text-black mb-4">Récapitulatif de votre projet :</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Type : {options.projectType === 'vitrine' ? 'Site vitrine' : options.projectType === 'ecommerce' ? 'Site e-commerce' : 'Site sur-mesure'}
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Nombre de pages : {options.pages}
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Design : {options.design === 'custom' ? 'Sur-mesure' : 'À partir d\'un template'}
            </li>
            {options.features.length > 0 && (
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  Fonctionnalités : {options.features.join(', ')}
                </div>
              </li>
            )}
            {options.seo && (
              <li className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Pack SEO local inclus
              </li>
            )}
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700">
            <strong className="text-blue-600">Note :</strong> Le calculateur donne une estimation fiable.
            Le devis final peut bouger légèrement si le projet devient plus complexe.
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger PDF
            </button>
          </div>
          <a
            href="/contact"
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Demander un devis détaillé
          </a>
        </div>
      </div>
    );
  }

  const stepTitles = ['Type de projet', 'Nombre de pages', 'Fonctionnalités', 'Design & SEO', 'Maintenance'];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4, 5].map((stepNumber) => (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                stepNumber < step ? 'bg-blue-600 text-white' :
                stepNumber === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                'bg-gray-200 text-gray-400'
              }`}>
                {stepNumber < step ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : stepNumber}
              </div>
              <span className={`text-xs text-center hidden md:block ${stepNumber === step ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                {stepTitles[stepNumber - 1]}
              </span>
              {stepNumber < 5 && (
                <div className={`hidden md:block absolute h-0.5 w-full translate-x-1/2 top-5 ${stepNumber < step ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ left: `${(stepNumber - 1) * 20}%`, width: '20%' }} />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-2 md:hidden">
          <span className="text-sm font-semibold text-gray-600">Étape {step} sur 5</span>
          <span className="text-sm font-semibold text-blue-600">{stepTitles[step - 1]}</span>
        </div>
      </div>

      {/* Step 1: Project Type */}
      {step === 1 && (
        <div>
          <h2 className="text-3xl font-display font-bold text-black mb-2">Type de projet</h2>
          <p className="text-gray-600 mb-6">Quel type de site souhaitez-vous créer ?</p>
          <p className="text-sm text-gray-500 mb-6 italic">Vous ne savez pas ? Choisissez "Site vitrine", on ajustera ensuite.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setOptions({ ...options, projectType: 'vitrine' })}
              className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                options.projectType === 'vitrine'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              {options.projectType === 'vitrine' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-black mb-2">Site Vitrine</h3>
              <p className="text-sm text-gray-600 mb-3">
                Présenter votre activité, vos services et être trouvé en ligne
              </p>
              <div className="text-xs text-blue-600 font-semibold">À partir de 800€</div>
            </button>

            <button
              onClick={() => setOptions({ ...options, projectType: 'ecommerce' })}
              className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                options.projectType === 'ecommerce'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              {options.projectType === 'ecommerce' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-black mb-2">E-commerce</h3>
              <p className="text-sm text-gray-600 mb-3">
                Vendre vos produits en ligne avec panier et paiement sécurisé
              </p>
              <div className="text-xs text-blue-600 font-semibold">À partir de 2500€</div>
            </button>

            <button
              onClick={() => setOptions({ ...options, projectType: 'custom' })}
              className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                options.projectType === 'custom'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              {options.projectType === 'custom' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-display font-bold text-lg text-black mb-2">Sur-mesure</h3>
              <p className="text-sm text-gray-600 mb-3">
                Site avec fonctionnalités spécifiques adaptées à vos besoins
              </p>
              <div className="text-xs text-blue-600 font-semibold">À partir de 1500€</div>
            </button>
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
              <span className="text-2xl text-gray-600 ml-2">page{options.pages > 1 ? 's' : ''}</span>
            </div>

            <input
              type="range"
              min="1"
              max="15"
              value={options.pages}
              onChange={(e) => setOptions({ ...options, pages: parseInt(e.target.value) })}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                accentColor: '#2563eb'
              }}
            />

            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>1 page</span>
              <span>15 pages</span>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong className="text-black">Exemples :</strong> Accueil, Services, À propos, Portfolio, Contact, Blog, etc.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Features */}
      {step === 3 && (
        <div>
          <h2 className="text-3xl font-display font-bold text-black mb-2">Fonctionnalités</h2>
          <p className="text-gray-600 mb-6">Quelles fonctionnalités souhaitez-vous ? (optionnel)</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'contact', title: 'Formulaire de contact', desc: 'Permettez aux visiteurs de vous contacter', price: 'Inclus', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )},
              { key: 'booking', title: 'Système de réservation', desc: 'Prise de RDV en ligne', price: '+300€', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )},
              { key: 'blog', title: 'Blog / Actualités', desc: 'Partagez du contenu régulièrement', price: '+200€', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )},
              { key: 'gallery', title: 'Galerie photos', desc: 'Présentez vos réalisations', price: '+150€', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )},
              { key: 'maps', title: 'Google Maps', desc: 'Carte interactive avec votre adresse', price: 'Inclus', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )},
              { key: 'multilang', title: 'Multilingue', desc: 'Site en plusieurs langues', price: '+400€', icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              )},
            ].map((feature) => (
              <button
                key={feature.key}
                onClick={() => toggleFeature(feature.key)}
                className={`p-4 rounded-xl border-2 transition-all text-left relative ${
                  options.features.includes(feature.key)
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                {options.features.includes(feature.key) && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center mb-2 text-blue-600">
                      {feature.icon}
                    </div>
                    <h3 className="font-display font-bold text-black mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                  <span className={`font-semibold text-sm ml-2 ${feature.price === 'Inclus' ? 'text-green-600' : 'text-blue-600'}`}>
                    {feature.price}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Design & SEO */}
      {step === 4 && (
        <div>
          <h2 className="text-3xl font-display font-bold text-black mb-2">Design et référencement</h2>
          <p className="text-gray-600 mb-6">Personnalisez votre projet</p>

          <div className="space-y-6">
            <div>
              <h3 className="font-display font-semibold text-lg text-black mb-4">Type de design</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setOptions({ ...options, design: 'template' })}
                  className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                    options.design === 'template'
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  {options.design === 'template' && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-lg text-black mb-2">À partir d'un template</h3>
                  <p className="text-sm text-gray-600">
                    Design professionnel personnalisable selon votre image
                  </p>
                  <div className="mt-3 text-xs text-green-600 font-semibold">Inclus dans le prix de base</div>
                </button>

                <button
                  onClick={() => setOptions({ ...options, design: 'custom' })}
                  className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                    options.design === 'custom'
                      ? 'border-blue-600 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  {options.design === 'custom' && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-lg text-black mb-2">Design sur-mesure</h3>
                  <p className="text-sm text-gray-600">
                    Design 100% unique créé spécifiquement pour vous
                  </p>
                  <div className="mt-3 text-xs text-blue-600 font-semibold">+500€</div>
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-display font-semibold text-lg text-black mb-4">Référencement SEO</h3>
              <button
                onClick={() => setOptions({ ...options, seo: !options.seo })}
                className={`w-full p-6 rounded-xl border-2 transition-all text-left relative ${
                  options.seo
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                {options.seo && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="font-display font-bold text-lg text-black mb-2">Pack SEO Local</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Optimisation complète pour être trouvé sur Google à Saint-Étienne
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Optimisation Google My Business</li>
                      <li>✓ Recherche de mots-clés locaux</li>
                      <li>✓ Optimisation technique complète</li>
                      <li>✓ Soumission aux annuaires locaux</li>
                    </ul>
                  </div>
                  <span className="text-blue-600 font-semibold ml-4">+300€</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Maintenance */}
      {step === 5 && (
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
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <h3 className="font-display font-bold text-lg text-black mb-2">Pas de maintenance</h3>
              <p className="text-sm text-gray-600 mb-3">
                Vous gérez vous-même votre site
              </p>
              <div className="text-2xl font-display font-bold text-gray-700">0€/mois</div>
            </button>

            <button
              onClick={() => setOptions({ ...options, maintenance: 'essential' })}
              className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                options.maintenance === 'essential'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              {options.maintenance === 'essential' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <h3 className="font-display font-bold text-lg text-black mb-2">Essentiel</h3>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                <li>✓ Mises à jour de sécurité</li>
                <li>✓ Sauvegardes hebdomadaires</li>
                <li>✓ Support par email</li>
                <li>✓ Monitoring 24/7</li>
              </ul>
              <div className="text-2xl font-display font-bold text-blue-600">29€/mois</div>
            </button>

            <button
              onClick={() => setOptions({ ...options, maintenance: 'premium' })}
              className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                options.maintenance === 'premium'
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              {options.maintenance === 'premium' && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="absolute -top-3 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Populaire
              </div>
              <h3 className="font-display font-bold text-lg text-black mb-2">Premium</h3>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                <li>✓ Tout Essentiel +</li>
                <li>✓ Modifications (2h/mois)</li>
                <li>✓ Support prioritaire</li>
                <li>✓ Optimisations SEO</li>
                <li>✓ Rapport analytics</li>
              </ul>
              <div className="text-2xl font-display font-bold text-blue-600">99€/mois</div>
            </button>
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
          disabled={step === 1 && !options.projectType}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
            step === 1 && !options.projectType
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {step === 5 ? 'Voir le devis 📊' : 'Suivant →'}
        </button>
      </div>
    </div>
  );
};

export default QuoteCalculator;
