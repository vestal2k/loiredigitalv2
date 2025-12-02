export interface PricingPack {
  id: string
  name: string
  basePrice: number
  pagesIncluded: number
  description: string
  features: string[]
  deliveryTime: string
  popular?: boolean
  paymentOptions?: {
    installments3x?: boolean
    installments6x?: boolean
  }
}

export interface PricingOption {
  id: string
  name: string
  price: number
  description: string
  icon?: string
}

export interface MaintenancePlan {
  id: string
  name: string
  pricePerMonth: number
  description: string
  features: string[]
}
