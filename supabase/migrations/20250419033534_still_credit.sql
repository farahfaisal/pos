/*
  # Create Reports Table

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `title` (text) - Report title
      - `type` (text) - Report type (sales, products, payment)
      - `period` (text) - Report period (daily, weekly, monthly, custom)
      - `start_date` (timestamptz) - Start date for report period
      - `end_date` (timestamptz) - End date for report period
      - `data` (jsonb) - Report data in JSON format
      - `created_by` (uuid) - Reference to users table
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `reports` table
    - Add policies for authenticated users to:
      - View reports they created
      - Create new reports
      - Admins can view all reports
*/

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('sales', 'products', 'payment')),
  period text NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'custom')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  data jsonb NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reports" ON reports
  FOR SELECT TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can create reports" ON reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_period ON reports(period);
CREATE INDEX IF NOT EXISTS idx_reports_dates ON reports(start_date, end_date);