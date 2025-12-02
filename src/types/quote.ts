export interface QuoteOptions {
  packId: string
  pages: number
  optionIds: string[]
  maintenance: string
}

export interface QuoteCalculation {
  basePrice: number
  extraPagesPrice: number
  optionsPrice: number
  totalPrice: number
  maintenancePrice: number
}

export interface QuoteFormData {
  name: string
  email: string
  phone?: string
  company?: string
  message?: string
  options: QuoteOptions
}
