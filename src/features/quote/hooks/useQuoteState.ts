import { useState } from 'react'
import type { QuoteOptions } from '@/types/quote'

export function useQuoteState() {
  const [step, setStep] = useState(1)
  const [showResult, setShowResult] = useState(false)
  const [options, setOptions] = useState<QuoteOptions>({
    packId: '',
    pages: 3,
    optionIds: [],
    maintenance: 'none',
  })

  const updateOptions = (updates: Partial<QuoteOptions>) => {
    setOptions((prev) => ({ ...prev, ...updates }))
  }

  const toggleOption = (optionId: string) => {
    setOptions((prev) => ({
      ...prev,
      optionIds: prev.optionIds.includes(optionId)
        ? prev.optionIds.filter((id) => id !== optionId)
        : [...prev.optionIds, optionId],
    }))
  }

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      setShowResult(true)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const reset = () => {
    setStep(1)
    setShowResult(false)
    setOptions({
      packId: '',
      pages: 3,
      optionIds: [],
      maintenance: 'none',
    })
  }

  return {
    step,
    showResult,
    options,
    updateOptions,
    toggleOption,
    nextStep,
    prevStep,
    reset,
  }
}
