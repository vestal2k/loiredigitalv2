import { useMemo } from 'react'
import type { QuoteOptions } from '@/types/quote'
import { calculateQuotePrice } from '../calculatePrice'

export function useQuoteCalculation(options: QuoteOptions) {
  const calculation = useMemo(() => {
    return calculateQuotePrice(options)
  }, [options])

  return calculation
}
