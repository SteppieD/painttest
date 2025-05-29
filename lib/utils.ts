import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  })
}

export function calculatePaintNeeded(sqft: number, coats: number, coverage: number = 350): number {
  return Math.ceil((sqft * coats) / coverage)
}

// Get consistent color from project ID
export function getProjectColor(projectId: string): string {
  // Hash the ID to get a consistent number
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = projectId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use HSL to ensure good readability with white text
  // Limit lightness to 40%-70% range for readability
  const h = Math.abs(hash) % 360;
  const s = 65 + (Math.abs(hash) % 25); // 65%-90% saturation
  const l = 40 + (Math.abs(hash) % 30); // 40%-70% lightness
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Extract first letter of street name
export function getFirstStreetLetter(address: string): string {
  if (!address) return '?';
  
  // Try to extract the street name by skipping any numbers at the beginning
  const match = address.match(/[a-zA-Z]/i);
  if (match) {
    return match[0].toUpperCase();
  }
  
  // Fallback
  return address.charAt(0).toUpperCase();
}

// Format currency values
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Calculate markup
export function calculateMarkup(baseCost: number, markupPercentage: number) {
  const markupAmount = baseCost * (markupPercentage / 100)
  const finalPrice = baseCost + markupAmount
  const profit = markupAmount
  
  return {
    baseCost,
    markupPercentage,
    markupAmount,
    finalPrice,
    profit,
  }
}
