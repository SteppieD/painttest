-- Enhanced quote details for professional quotes

-- Add more detailed fields to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS quote_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS paint_specifications JSONB,
ADD COLUMN IF NOT EXISTS surface_breakdown JSONB,
ADD COLUMN IF NOT EXISTS preparation_included TEXT[],
ADD COLUMN IF NOT EXISTS terms_conditions TEXT[],
ADD COLUMN IF NOT EXISTS company_info JSONB;

-- Create a sequence for quote numbers
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 10000;

-- Function to generate quote numbers
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quote_number IS NULL THEN
    NEW.quote_number := 'Q-' || nextval('quote_number_seq')::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate quote numbers
CREATE TRIGGER set_quote_number
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION generate_quote_number();

-- Update the work_scope structure to match professional format
COMMENT ON COLUMN quotes.work_scope IS 'JSON structure: {
  "surfaces": [
    {
      "name": "Walls",
      "sqft": 800,
      "description": "Walls patched, prepped, and painted",
      "coats": 2,
      "paintType": "Premium Interior Eggshell"
    }
  ],
  "totalPaintArea": 1000,
  "totalTrim": 280,
  "doors": 1,
  "preparation": [
    "Light patching and sanding of wall surfaces",
    "Caulking gaps around trim and filling nail holes",
    "Surface cleaning and spot priming where needed",
    "Complete protection of floors, furniture and fixtures",
    "Thorough cleanup and debris removal upon completion"
  ],
  "paintSpecs": {
    "quality": "Premium quality interior paints for durability and washability",
    "application": "Industry standard application techniques for smooth, even finish",
    "equipment": "Professional equipment and tools for superior results",
    "colors": "Colors to be selected by client (samples available upon request)"
  }
}';