-- PAINTING BUSINESS MANAGEMENT SYSTEM ENHANCEMENTS

-- Company Settings (extend existing cost_settings)
ALTER TABLE cost_settings ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE cost_settings ADD COLUMN IF NOT EXISTS contact_name TEXT; 
ALTER TABLE cost_settings ADD COLUMN IF NOT EXISTS default_labor_percentage NUMERIC DEFAULT 30;
ALTER TABLE cost_settings ADD COLUMN IF NOT EXISTS default_spread_rate NUMERIC DEFAULT 350;
ALTER TABLE cost_settings ADD COLUMN IF NOT EXISTS door_trim_pricing JSONB DEFAULT '{"door_unit_price": 45, "trim_linear_foot_price": 3}';
ALTER TABLE cost_settings ADD COLUMN IF NOT EXISTS baseboard_pricing JSONB DEFAULT '{"charge_method": "linear_foot", "price_per_linear_foot": 2.5}';
ALTER TABLE cost_settings ADD COLUMN IF NOT EXISTS default_rates JSONB DEFAULT '{
  "walls": 3.00,
  "ceilings": 2.00, 
  "trim_doors": 5.00
}';
ALTER TABLE cost_settings ADD COLUMN IF NOT EXISTS default_paint_costs JSONB DEFAULT '{
  "walls": 26,
  "ceilings": 25,
  "trim_doors": 35
}';

-- Paint Product Inventory System
CREATE TABLE IF NOT EXISTS paint_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  product_name TEXT NOT NULL,
  use_case TEXT NOT NULL, -- 'walls', 'ceilings', 'trim', 'doors'
  cost_per_gallon NUMERIC NOT NULL,
  sheen TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enhanced Quotes Table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS quote_method VARCHAR(20) DEFAULT 'simple';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS job_status VARCHAR(20) DEFAULT 'quoted'; -- 'quoted', 'accepted', 'denied', 'completed'
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS actual_labor_cost NUMERIC;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS actual_materials_cost NUMERIC;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS actual_supplies_cost NUMERIC;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS actual_profit_loss NUMERIC;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS job_notes TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS sundries_cost NUMERIC DEFAULT 0;

-- Quote Surfaces (for simple quote method)
CREATE TABLE IF NOT EXISTS quote_surfaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  surface_type VARCHAR(50) NOT NULL,
  square_footage NUMERIC NOT NULL,
  rate_per_sqft NUMERIC NOT NULL,
  paint_product_id UUID REFERENCES paint_products(id),
  custom_paint_name TEXT,
  paint_cost_per_gallon NUMERIC NOT NULL,
  spread_rate NUMERIC DEFAULT 350,
  gallons_needed INTEGER NOT NULL,
  paint_cost NUMERIC NOT NULL,
  surface_total NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Room Details (for advanced quote method)
CREATE TABLE IF NOT EXISTS room_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  wall_lengths JSONB NOT NULL, -- Array of wall lengths for perimeter calculation
  ceiling_height NUMERIC DEFAULT 8,
  door_count INTEGER DEFAULT 0,
  door_types JSONB DEFAULT '[]', -- Array of door types and their unit prices
  window_count INTEGER DEFAULT 0,
  baseboard_length NUMERIC DEFAULT 0,
  ceiling_included BOOLEAN DEFAULT false,
  trim_included BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add Row Level Security
ALTER TABLE paint_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_surfaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_details ENABLE ROW LEVEL SECURITY;

-- Create policies for paint_products
CREATE POLICY "Users can view own paint_products" ON paint_products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own paint_products" ON paint_products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own paint_products" ON paint_products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own paint_products" ON paint_products
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for quote_surfaces
CREATE POLICY "Users can view quote_surfaces for own quotes" ON quote_surfaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quotes
      JOIN projects ON projects.id = quotes.project_id
      WHERE quotes.id = quote_surfaces.quote_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert quote_surfaces for own quotes" ON quote_surfaces
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      JOIN projects ON projects.id = quotes.project_id
      WHERE quotes.id = quote_surfaces.quote_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update quote_surfaces for own quotes" ON quote_surfaces
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM quotes
      JOIN projects ON projects.id = quotes.project_id
      WHERE quotes.id = quote_surfaces.quote_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete quote_surfaces for own quotes" ON quote_surfaces
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM quotes
      JOIN projects ON projects.id = quotes.project_id
      WHERE quotes.id = quote_surfaces.quote_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create policies for room_details
CREATE POLICY "Users can view room_details for own projects" ON room_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = room_details.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert room_details for own projects" ON room_details
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = room_details.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update room_details for own projects" ON room_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = room_details.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete room_details for own projects" ON room_details
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = room_details.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_paint_products_updated_at BEFORE UPDATE ON paint_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_paint_products_user_id ON paint_products(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_surfaces_quote_id ON quote_surfaces(quote_id);
CREATE INDEX IF NOT EXISTS idx_room_details_project_id ON room_details(project_id);
