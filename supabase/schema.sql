-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  company_name TEXT,
  phone TEXT,
  business_info JSONB DEFAULT '{}',
  logo_url TEXT,
  logo_storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_name TEXT NOT NULL,
  property_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  base_costs JSONB NOT NULL,
  markup_percentage NUMERIC NOT NULL,
  final_price NUMERIC NOT NULL,
  details JSONB NOT NULL,
  valid_until DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create cost_settings table
CREATE TABLE IF NOT EXISTS cost_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  labor_cost_per_hour NUMERIC DEFAULT 25,
  paint_costs JSONB DEFAULT '{"good": 25, "better": 35, "best": 50}',
  supplies_base_cost NUMERIC DEFAULT 100,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_quotes_project_id ON quotes(project_id);
CREATE INDEX idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX idx_cost_settings_user_id ON cost_settings(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Quotes policies
CREATE POLICY "Users can view quotes for own projects" ON quotes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = quotes.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create quotes for own projects" ON quotes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = quotes.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update quotes for own projects" ON quotes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = quotes.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Chat messages policies
CREATE POLICY "Users can view messages for own projects" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for own projects" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chat_messages.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Cost settings policies
CREATE POLICY "Users can view own cost settings" ON cost_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cost settings" ON cost_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cost settings" ON cost_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create access_codes table for testing and demos
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT NULL, -- NULL means unlimited
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_by TEXT, -- Who created this code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  notes TEXT
);

-- Create access_code_sessions table to track which users are using access codes
CREATE TABLE IF NOT EXISTS access_code_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  access_code_id UUID REFERENCES access_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (TIMEZONE('utc', NOW()) + INTERVAL '7 days')
);

-- Create indexes for access codes
CREATE INDEX idx_access_codes_code ON access_codes(code);
CREATE INDEX idx_access_codes_active ON access_codes(is_active);
CREATE INDEX idx_access_code_sessions_user_id ON access_code_sessions(user_id);
CREATE INDEX idx_access_code_sessions_access_code_id ON access_code_sessions(access_code_id);

-- Enable Row Level Security for access codes
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_code_sessions ENABLE ROW LEVEL SECURITY;

-- Access codes policies (only service role can manage these)
CREATE POLICY "Service role can manage access codes" ON access_codes
  FOR ALL USING (auth.role() = 'service_role');

-- Access code sessions policies
CREATE POLICY "Users can view own access code sessions" ON access_code_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage access code sessions" ON access_code_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_settings_updated_at BEFORE UPDATE ON cost_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
