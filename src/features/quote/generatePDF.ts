import type { QuoteOptions } from '@/types/quote'
import { calculateQuotePrice, getPackDetails, getMaintenancePlanDetails, getOptionDetails } from './calculatePrice'
import { PRICING_OPTIONS } from '@/config/pricing'

export async function generateQuotePDF(options: QuoteOptions): Promise<void> {
  // Chargement dynamique de jsPDF uniquement quand nécessaire
  const jsPDF = (await import('jspdf')).default
  const doc = new jsPDF()

  const calculation = calculateQuotePrice(options)
  const pack = getPackDetails(options.packId)
  const maintenancePlan = getMaintenancePlanDetails(options.maintenance)

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
  doc.text(`${calculation.totalPrice.toLocaleString('fr-FR')} €`, 105, 65, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text('Prix de création (paiement unique)', 105, 73, { align: 'center' })

  if (calculation.maintenancePrice > 0) {
    doc.setFontSize(16)
    doc.setTextColor(37, 99, 235)
    doc.text(`+ ${calculation.maintenancePrice} €/mois`, 105, 85, { align: 'center' })
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Maintenance ${maintenancePlan?.name || ''}`, 105, 92, { align: 'center' })
  }

  // Project details
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text('Récapitulatif de votre projet', 20, calculation.maintenancePrice > 0 ? 110 : 100)

  let yPos = calculation.maintenancePrice > 0 ? 120 : 110
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
      .map((id) => getOptionDetails(id)?.name)
      .filter(Boolean)
      .join(', ')
    doc.text(`• Options : ${selectedOptions}`, 25, yPos)
    yPos += 8
  }

  // Note section
  yPos += 10
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('Note :', 20, yPos)
  yPos += 7
  doc.text('Ceci est un devis estimatif généré automatiquement.', 20, yPos)
  yPos += 5
  doc.text('Le prix final peut varier en fonction de vos besoins spécifiques.', 20, yPos)
  yPos += 5
  doc.text('Contactez-nous pour obtenir un devis personnalisé détaillé.', 20, yPos)

  // Footer
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Loire Digital - contact@loiredigital.fr', 105, 280, { align: 'center' })

  // Save PDF
  doc.save(`devis-loire-digital-${new Date().getTime()}.pdf`)
}
