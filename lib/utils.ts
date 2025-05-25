import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function calculatePaintNeeded(sqft: number, coats: number, coverage: number = 350): number {
  return Math.ceil((sqft * coats) / coverage)
}

export function calculateLaborHours(sqft: number, paintingSpeed: number = 200): number {
  const paintingHours = sqft / paintingSpeed
  const prepHours = paintingHours * 0.2 // 20% prep time
  return paintingHours + prepHours
}

export function calculateMarkup(baseCost: number, markupPercentage: number): {
  markup: number
  finalPrice: number
  profit: number
} {
  const markup = markupPercentage / 100
  const finalPrice = baseCost * (1 + markup)
  const profit = finalPrice - baseCost
  
  return {
    markup: markupPercentage,
    finalPrice,
    profit
  }
}
