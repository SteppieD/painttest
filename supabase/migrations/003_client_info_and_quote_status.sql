-- Add client contact information to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_email VARCHAR;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_phone VARCHAR;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS preferred_contact VARCHAR DEFAULT 'email';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_notes TEXT;

-- Add quote status and tracking fields
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'draft';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Create quote versions table for tracking changes
CREATE TABLE IF NOT EXISTS quote_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  base_costs JSONB,
  markup_percentage INTEGER,
  final_price NUMERIC(10,2),
  details JSONB,
  changes JSONB, -- Track what changed from previous version
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_expires_at ON quotes(expires_at);
CREATE INDEX IF NOT EXISTS idx_quote_versions_quote_id ON quote_versions(quote_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_email ON projects(client_email);

-- Update RLS policies for quote_versions
ALTER TABLE quote_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quote versions" ON quote_versions
  FOR SELECT USING (
    quote_id IN (
      SELECT q.id FROM quotes q
      JOIN projects p ON q.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create quote versions for their quotes" ON quote_versions
  FOR INSERT WITH CHECK (
    quote_id IN (
      SELECT q.id FROM quotes q
      JOIN projects p ON q.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Add constraint to ensure valid status values
ALTER TABLE quotes ADD CONSTRAINT quotes_status_check 
  CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired'));

-- Add constraint to ensure valid contact preferences
ALTER TABLE projects ADD CONSTRAINT projects_preferred_contact_check 
  CHECK (preferred_contact IN ('email', 'phone', 'either'));