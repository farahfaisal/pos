-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "All authenticated users can view settings" ON settings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage settings" ON settings
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Insert default settings
INSERT INTO settings (key, value, category) VALUES
  ('store', jsonb_build_object(
    'name', 'متجر التكنولوجيا',
    'email', 'info@techstore.com',
    'phone', '+970 5XXXXXXXX',
    'address', 'فلسطين',
    'vat', '123456789',
    'website', 'www.techstore.com'
  ), 'store'),
  ('receipt', jsonb_build_object(
    'showLogo', true,
    'showVAT', true,
    'showAddress', true,
    'showPhone', true,
    'footerText', 'شكراً لتسوقكم معنا',
    'receiptCopies', 1
  ), 'receipt'),
  ('localization', jsonb_build_object(
    'language', 'ar',
    'currency', 'ILS',
    'dateFormat', 'dd/mm/yyyy',
    'timezone', 'Asia/Gaza'
  ), 'localization');

-- Create index
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);