/*
  # Add cash drawer tables

  1. New Tables
    - `cash_drawer_sessions`
      - `id` (uuid, primary key)
      - `opening_balance` (numeric)
      - `closing_balance` (numeric)
      - `opened_at` (timestamptz)
      - `closed_at` (timestamptz)
      - `opened_by` (uuid, references users)
      - `closed_by` (uuid, references users)
      - `notes` (text)
      - `status` (text)

    - `cash_drawer_transactions`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references cash_drawer_sessions)
      - `amount` (numeric)
      - `type` (text)
      - `payment_method` (text)
      - `created_at` (timestamptz)
      - `created_by` (uuid, references users)
      - `notes` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for admins and cashiers
*/

-- Create cash drawer sessions table
CREATE TABLE IF NOT EXISTS cash_drawer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opening_balance numeric NOT NULL CHECK (opening_balance >= 0),
  closing_balance numeric CHECK (closing_balance >= 0),
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  opened_by uuid REFERENCES users(id) NOT NULL,
  closed_by uuid REFERENCES users(id),
  notes text,
  status text NOT NULL CHECK (status IN ('open', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cash drawer transactions table
CREATE TABLE IF NOT EXISTS cash_drawer_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES cash_drawer_sessions(id) NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('sale', 'refund', 'expense', 'deposit')),
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card', 'mobile')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) NOT NULL,
  notes text
);

-- Enable Row Level Security
ALTER TABLE cash_drawer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_drawer_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for cash drawer sessions
CREATE POLICY "Admins and cashiers can view cash drawer sessions" ON cash_drawer_sessions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier')
  ));

CREATE POLICY "Admins and cashiers can manage cash drawer sessions" ON cash_drawer_sessions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier')
  ));

-- Create policies for cash drawer transactions
CREATE POLICY "Admins and cashiers can view cash drawer transactions" ON cash_drawer_transactions
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier')
  ));

CREATE POLICY "Admins and cashiers can manage cash drawer transactions" ON cash_drawer_transactions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'cashier')
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cash_drawer_sessions_opened_by ON cash_drawer_sessions(opened_by);
CREATE INDEX IF NOT EXISTS idx_cash_drawer_sessions_closed_by ON cash_drawer_sessions(closed_by);
CREATE INDEX IF NOT EXISTS idx_cash_drawer_sessions_status ON cash_drawer_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cash_drawer_transactions_session_id ON cash_drawer_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_cash_drawer_transactions_created_by ON cash_drawer_transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_cash_drawer_transactions_type ON cash_drawer_transactions(type);