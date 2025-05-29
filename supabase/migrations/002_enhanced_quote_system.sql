-- Enhanced Quote System Schema

-- Update cost_settings to include more defaults
ALTER TABLE cost_settings 
ADD COLUMN IF NOT EXISTS default_labor_percentage DECIMAL(5,2) DEFAULT 30.00,
ADD COLUMN IF NOT EXISTS spread_rate_per_gallon INTEGER DEFAULT 350,
ADD COLUMN IF NOT EXISTS products JSONB DEFAULT '[]'::jsonb;

-- Update quotes table with enhanced fields
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'completed')),
ADD COLUMN IF NOT EXISTS labor_percentage DECIMAL(5,2) DEFAULT 30.00,
ADD COLUMN IF NOT EXISTS materials_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS labor_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS supplies_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS profit_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS client_notes TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS work_scope JSONB,
ADD COLUMN IF NOT EXISTS gallons_needed DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_sqft DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS charge_rate DECIMAL(10,2);

-- Create job_actuals table for tracking completed jobs
CREATE TABLE IF NOT EXISTS job_actuals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  actual_materials_cost DECIMAL(10,2),
  actual_labor_cost DECIMAL(10,2),
  actual_profit DECIMAL(10,2),
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create products table for paint products
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('wall_paint', 'ceiling_paint', 'trim_paint', 'primer', 'other')),
  cost_per_gallon DECIMAL(10,2) NOT NULL,
  brand TEXT,
  quality_tier TEXT CHECK (quality_tier IN ('good', 'better', 'best')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create dashboard_stats view for quick metrics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
  p.user_id,
  COUNT(DISTINCT q.id) as total_quotes,
  SUM(q.final_price) as total_quote_value,
  COUNT(DISTINCT CASE WHEN q.status = 'accepted' THEN q.id END) as accepted_quotes,
  SUM(CASE WHEN q.status = 'accepted' THEN q.final_price ELSE 0 END) as accepted_quote_value,
  COUNT(DISTINCT ja.id) as completed_jobs,
  SUM(ja.actual_materials_cost) as total_actual_materials,
  SUM(ja.actual_labor_cost) as total_actual_labor,
  SUM(ja.actual_profit) as total_actual_profit
FROM projects p
LEFT JOIN quotes q ON p.id = q.project_id
LEFT JOIN job_actuals ja ON q.id = ja.quote_id
GROUP BY p.user_id;

-- Add RLS policies
ALTER TABLE job_actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Job actuals policies
CREATE POLICY "Users can view own job actuals" ON job_actuals
  FOR SELECT USING (
    quote_id IN (
      SELECT q.id FROM quotes q 
      JOIN projects p ON q.project_id = p.id 
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own job actuals" ON job_actuals
  FOR INSERT WITH CHECK (
    quote_id IN (
      SELECT q.id FROM quotes q 
      JOIN projects p ON q.project_id = p.id 
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own job actuals" ON job_actuals
  FOR UPDATE USING (
    quote_id IN (
      SELECT q.id FROM quotes q 
      JOIN projects p ON q.project_id = p.id 
      WHERE p.user_id = auth.uid()
    )
  );

-- Products policies
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_job_actuals_quote_id ON job_actuals(quote_id);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);

-- Add trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_actuals_updated_at BEFORE UPDATE ON job_actuals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();