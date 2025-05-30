import { 
  SimpleQuoteInput, 
  SimpleQuoteResult, 
  SurfaceCalculation, 
  ProjectDetails,
  EnhancedRoomDetails,
  DoorType,
  BaseCosts,
  EnhancedBaseCosts,
  DoorTrimPricing,
  BaseboardPricing
} from '@/types/database';

/**
 * Simple Quote Calculator - calculates quote totals based on surface area and rates
 */
export function calculateSimpleQuote(input: SimpleQuoteInput): SimpleQuoteResult {
  const surfaceCalculations = input.surfaces.map(surface => {
    const totalPrice = surface.sqft * surface.ratePerSqft;
    const gallonsNeeded = Math.ceil(surface.sqft / surface.spreadRate);
    const paintCost = gallonsNeeded * surface.paintCostPerGallon;
    
    return {
      type: surface.type,
      sqft: surface.sqft,
      ratePerSqft: surface.ratePerSqft,
      paintProductId: surface.paintProductId,
      customPaintName: surface.customPaintName,
      paintCostPerGallon: surface.paintCostPerGallon,
      spreadRate: surface.spreadRate,
      gallonsNeeded,
      paintCost,
      surfaceTotal: totalPrice
    } as SurfaceCalculation;
  });
  
  const totalProjectPrice = surfaceCalculations.reduce((sum, s) => sum + s.surfaceTotal, 0);
  const totalMaterialsCost = surfaceCalculations.reduce((sum, s) => sum + s.paintCost, 0);
  const laborEstimate = totalProjectPrice * (input.laborPercentage / 100);
  const projectedProfit = totalProjectPrice - totalMaterialsCost - laborEstimate - input.sundries;
  
  return {
    surfaceCalculations,
    totalProjectPrice,
    totalMaterialsCost,
    laborEstimate,
    sundries: input.sundries,
    projectedProfit
  };
}

/**
 * Advanced Quote Calculator - implements industry-specific rules
 */
export interface AdvancedQuoteInput {
  rooms: EnhancedRoomDetails[];
  paintQuality: 'good' | 'better' | 'best';
  paintCosts: {
    good: number;
    better: number;
    best: number;
  };
  laborCostPerHour: number;
  doorTrimPricing: DoorTrimPricing;
  baseboardPricing: BaseboardPricing;
  sundries: number;
  coats: number;
}

export interface AdvancedQuoteResult {
  baseCosts: EnhancedBaseCosts;
  roomDetails: {
    name: string;
    paintGallons: number;
    paintCost: number;
    laborHours: number;
    laborCost: number;
    doorTrimCost: number;
    baseboardCost: number;
    totalCost: number;
    sqft: number;
  }[];
  totalSqft: number;
  totalLaborHours: number;
  totalGallons: number;
  totalCost: number;
}

export function calculateAdvancedQuote(input: AdvancedQuoteInput): AdvancedQuoteResult {
  const paintCostPerGallon = input.paintCosts[input.paintQuality];
  const rooms = input.rooms.map(room => {
    // Calculate wall area
    const perimeter = room.wallLengths.reduce((sum, length) => sum + length, 0);
    const wallArea = perimeter * room.ceilingHeight;
    
    // Subtract door and window area
    const doorArea = room.doorsCount * 20; // Assume 20 sqft per door
    const windowArea = room.windowsCount * 15; // Assume 15 sqft per window
    
    // Calculate net wall area
    const netWallArea = wallArea - doorArea - windowArea;
    
    // Calculate ceiling area if included
    const ceilingArea = room.ceilingIncluded ? 
      calculateAreaFromWallLengths(room.wallLengths) : 0;
    
    // Calculate total paint area
    const totalPaintArea = netWallArea + ceilingArea;
    
    // Calculate paint needed (always 2 coats)
    const paintGallons = Math.ceil((totalPaintArea * input.coats) / 350);
    
    // Calculate door paint separately (1 gallon per 4 doors)
    const doorPaintGallons = Math.ceil(room.doorsCount / 4);
    
    // Total paint gallons
    const totalPaintGallons = paintGallons + doorPaintGallons;
    
    // Calculate paint cost
    const paintCost = totalPaintGallons * paintCostPerGallon;
    
    // Calculate labor hours (2 rooms = 8 hours)
    // This is a simplification - adjust based on your specific formula
    const laborHours = (totalPaintArea / 350) * 4; // Assuming 350 sqft takes 4 hours
    
    // Calculate labor cost
    const laborCost = laborHours * input.laborCostPerHour;
    
    // Calculate door and trim costs
    const doorTrimCost = room.doorTypes.reduce((sum, door) => {
      return sum + (door.count * door.unitPrice);
    }, 0);
    
    // Calculate baseboard costs
    let baseboardCost = 0;
    if (input.baseboardPricing.charge_method === 'linear_foot') {
      baseboardCost = room.baseboardLength * input.baseboardPricing.price_per_linear_foot;
    }
    
    // Calculate total room cost
    const totalCost = paintCost + laborCost + doorTrimCost + baseboardCost;
    
    return {
      name: room.name,
      paintGallons: totalPaintGallons,
      paintCost,
      laborHours,
      laborCost,
      doorTrimCost,
      baseboardCost,
      totalCost,
      sqft: totalPaintArea
    };
  });
  
  // Calculate totals
  const totalSqft = rooms.reduce((sum, room) => sum + room.sqft, 0);
  const totalLaborHours = rooms.reduce((sum, room) => sum + room.laborHours, 0);
  const totalGallons = rooms.reduce((sum, room) => sum + room.paintGallons, 0);
  const totalPaintCost = rooms.reduce((sum, room) => sum + room.paintCost, 0);
  const totalLaborCost = rooms.reduce((sum, room) => sum + room.laborCost, 0);
  const totalDoorTrimCost = rooms.reduce((sum, room) => sum + room.doorTrimCost, 0);
  const totalBaseboardCost = rooms.reduce((sum, room) => sum + room.baseboardCost, 0);
  const totalCost = totalPaintCost + totalLaborCost + totalDoorTrimCost + totalBaseboardCost + input.sundries;
  
  // Create enhanced base costs
  const baseCosts: EnhancedBaseCosts = {
    paint: totalPaintCost,
    labor: totalLaborCost,
    supplies: 0, // This will be replaced by sundries
    doorTrimWork: totalDoorTrimCost,
    baseboards: totalBaseboardCost,
    sundries: input.sundries
  };
  
  return {
    baseCosts,
    roomDetails: rooms,
    totalSqft,
    totalLaborHours,
    totalGallons,
    totalCost
  };
}

/**
 * Calculate area from wall lengths (for rectangular and non-rectangular rooms)
 */
function calculateAreaFromWallLengths(wallLengths: number[]): number {
  // For a rectangular room
  if (wallLengths.length === 4) {
    return wallLengths[0] * wallLengths[1];
  }
  
  // For more complex rooms, use a more advanced algorithm
  // This is a simplified approach using triangulation
  // For more accurate calculation, you might need a more sophisticated algorithm
  let area = 0;
  const n = wallLengths.length;
  
  // If we have fewer than 3 walls, we can't form a proper polygon
  if (n < 3) return 0;
  
  // Approximate area using an average dimension
  const avgDimension = Math.sqrt(wallLengths.reduce((sum, length) => sum + (length * length), 0) / n);
  area = avgDimension * avgDimension;
  
  return area;
}

/**
 * Calculate markup and final price
 */
export function calculateMarkup(baseCost: number, markupPercentage: number): number {
  return baseCost * (1 + markupPercentage / 100);
}

/**
 * Calculate total price from base costs and markup percentage
 */
export function calculateTotalPrice({ 
  baseCosts, 
  markupPercentage 
}: { 
  baseCosts: Partial<EnhancedBaseCosts> & { 
    wallsSquareFootage?: number;
    ceilingsSquareFootage?: number;
    wallsRate?: number;
    ceilingsRate?: number;
  }; 
  markupPercentage: number 
}): number {
  // Get the base costs
  const { paint = 0, labor = 0, supplies = 0, sundries = 0, doorTrimWork = 0, baseboards = 0 } = baseCosts;
  
  // Calculate subtotal
  const subtotal = paint + labor + supplies + (sundries || 0) + (doorTrimWork || 0) + (baseboards || 0);
  
  // Apply markup
  return subtotal + (subtotal * (markupPercentage / 100));
}
