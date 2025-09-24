-- Simple Pots Table Creation for Manual Execution
-- Copy and paste this into the Supabase SQL Editor

-- Create the main pots table
CREATE TABLE IF NOT EXISTS pots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    priority INTEGER DEFAULT 0,
    allocation_rule JSONB DEFAULT '{}',
    auto_transfer_enabled BOOLEAN DEFAULT true,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'piggy-bank',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE pots ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for pots
CREATE POLICY "Users can manage their own pots" ON pots
    FOR ALL USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_pots_user_id ON pots(user_id);
CREATE INDEX IF NOT EXISTS idx_pots_priority ON pots(priority);

-- Update trigger for pots
CREATE OR REPLACE FUNCTION update_pots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pots_updated_at
    BEFORE UPDATE ON pots
    FOR EACH ROW EXECUTE FUNCTION update_pots_updated_at();
