-- Create pots system tables for MoneyLens MVP

-- Pots table for envelope budgeting
CREATE TABLE pots (
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

-- Allocation rules table
CREATE TABLE allocation_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pot_id UUID REFERENCES pots(id) ON DELETE CASCADE,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('daily', 'weekly', 'monthly', 'custom')),
    amount DECIMAL(12,2) NOT NULL,
    schedule JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Allocation transactions table
CREATE TABLE allocation_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pot_id UUID REFERENCES pots(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES allocation_rules(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    allocation_date DATE NOT NULL,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend transactions table to support pot assignments
ALTER TABLE transactions ADD COLUMN pot_id UUID REFERENCES pots(id) ON DELETE SET NULL;

-- Create default pots for new users
CREATE OR REPLACE FUNCTION create_default_pots_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO pots (user_id, name, description, target_amount, priority, color, icon, allocation_rule) VALUES
    (NEW.id, 'Petrol', 'Daily petrol expenses', 20.00, 1, '#EF4444', 'fuel', '{"type": "daily", "amount": 20}'),
    (NEW.id, 'Food', 'Weekly food shopping', 50.00, 2, '#10B981', 'shopping-cart', '{"type": "weekly", "amount": 50, "day": "monday"}'),
    (NEW.id, 'Car Rent', 'Weekly car rental', 120.00, 3, '#8B5CF6', 'car', '{"type": "weekly", "amount": 120}'),
    (NEW.id, 'Bills', 'Monthly utility bills', 990.00, 4, '#F59E0B', 'file-text', '{"type": "monthly", "amount": 990, "day": 28}'),
    (NEW.id, 'Savings', 'Weekly savings goal', 200.00, 5, '#06B6D4', 'trending-up', '{"type": "weekly", "amount": 200, "target": 800}'),
    (NEW.id, 'Next Month', 'Next month preparation', 700.00, 6, '#6366F1', 'calendar', '{"type": "monthly", "amount": 700, "priorityWeeks": [1,2]}'),
    (NEW.id, 'Buffer', 'Catch-all for extras', 0.00, 7, '#6B7280', 'shield', '{"type": "remaining"}');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default pots when user signs up
CREATE OR REPLACE TRIGGER create_default_pots
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_default_pots_for_user();

-- Create indexes for performance
CREATE INDEX idx_pots_user_id ON pots(user_id);
CREATE INDEX idx_pots_priority ON pots(priority);
CREATE INDEX idx_allocation_rules_user_id ON allocation_rules(user_id);
CREATE INDEX idx_allocation_rules_pot_id ON allocation_rules(pot_id);
CREATE INDEX idx_allocation_transactions_user_id ON allocation_transactions(user_id);
CREATE INDEX idx_allocation_transactions_pot_id ON allocation_transactions(pot_id);
CREATE INDEX idx_allocation_transactions_date ON allocation_transactions(allocation_date);

-- Enable Row Level Security
ALTER TABLE pots ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own pots" ON pots
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own allocation rules" ON allocation_rules
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own allocation transactions" ON allocation_transactions
    FOR ALL USING (auth.uid() = user_id);

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

-- Update trigger for allocation rules
CREATE OR REPLACE FUNCTION update_allocation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_allocation_rules_updated_at
    BEFORE UPDATE ON allocation_rules
    FOR EACH ROW EXECUTE FUNCTION update_allocation_rules_updated_at();

-- Function to calculate pot allocation needs
CREATE OR REPLACE FUNCTION calculate_pot_allocation_needs(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    pot_id UUID,
    pot_name TEXT,
    current_balance DECIMAL(12,2),
    target_amount DECIMAL(12,2),
    needed_amount DECIMAL(12,2),
    priority INTEGER,
    rule_type TEXT
) AS $$
DECLARE
    v_month_start DATE := DATE_TRUNC('month', p_date)::DATE;
    v_month_end DATE := (DATE_TRUNC('month', p_date) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    v_week_start DATE := DATE_TRUNC('week', p_date)::DATE;
    v_days_remaining INTEGER := EXTRACT(DAY FROM v_month_end - p_date) + 1;
    v_mondays_remaining INTEGER;
BEGIN
    -- Calculate remaining Mondays in the month
    WITH mondays AS (
        SELECT generate_series(
            GREATEST(p_date, v_month_start),
            v_month_end,
            '1 day'::INTERVAL
        )::DATE as day
    )
    SELECT COUNT(*) INTO v_mondays_remaining
    FROM mondays
    WHERE EXTRACT(DOW FROM day) = 1; -- Monday = 1
    
    RETURN QUERY
    SELECT 
        p.id as pot_id,
        p.name as pot_name,
        p.current_balance,
        p.target_amount,
        CASE 
            WHEN p.name = 'Petrol' THEN GREATEST(0, v_days_remaining * 20.00 - p.current_balance)
            WHEN p.name = 'Food' THEN GREATEST(0, v_mondays_remaining * 50.00 - p.current_balance)
            WHEN p.name = 'Car Rent' THEN 
                CASE 
                    WHEN EXTRACT(WEEK FROM p_date)::INTEGER % 2 = 0 THEN GREATEST(0, 240.00 - p.current_balance)
                    ELSE GREATEST(0, 120.00 - p.current_balance)
                END
            WHEN p.name = 'Bills' THEN 
                CASE 
                    WHEN p_date <= (v_month_start + INTERVAL '27 days')::DATE THEN GREATEST(0, 990.00 - p.current_balance)
                    ELSE 0
                END
            WHEN p.name = 'Savings' THEN GREATEST(0, LEAST(200.00, 800.00 - p.current_balance))
            WHEN p.name = 'Next Month' THEN 
                CASE 
                    WHEN EXTRACT(WEEK FROM p_date)::INTEGER <= 2 THEN GREATEST(0, 700.00 - p.current_balance)
                    ELSE 0
                END
            ELSE 0 -- Buffer gets whatever remains
        END as needed_amount,
        p.priority,
        CASE 
            WHEN p.name = 'Petrol' THEN 'daily'
            WHEN p.name = 'Food' THEN 'weekly'
            WHEN p.name = 'Car Rent' THEN 'biweekly'
            WHEN p.name = 'Bills' THEN 'monthly'
            WHEN p.name = 'Savings' THEN 'weekly'
            WHEN p.name = 'Next Month' THEN 'monthly'
            ELSE 'remaining'
        END as rule_type
    FROM pots p
    WHERE p.user_id = p_user_id
    AND p.auto_transfer_enabled = true
    ORDER BY p.priority;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to allocate income to pots
CREATE OR REPLACE FUNCTION allocate_income_to_pots(
    p_user_id UUID,
    p_amount DECIMAL(12,2),
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    pot_id UUID,
    pot_name TEXT,
    allocated_amount DECIMAL(12,2),
    remaining_balance DECIMAL(12,2)
) AS $$
DECLARE
    v_remaining DECIMAL(12,2) := p_amount;
    v_pot_record RECORD;
    v_allocate_amount DECIMAL(12,2);
BEGIN
    -- Get pot allocation needs in priority order
    FOR v_pot_record IN 
        SELECT * FROM calculate_pot_allocation_needs(p_user_id, p_date)
        ORDER BY priority
    LOOP
        IF v_remaining <= 0 THEN
            EXIT;
        END IF;
        
        -- Calculate amount to allocate
        v_allocate_amount := LEAST(v_pot_record.needed_amount, v_remaining);
        
        IF v_allocate_amount > 0 THEN
            -- Update pot balance
            UPDATE pots 
            SET current_balance = current_balance + v_allocate_amount,
                updated_at = NOW()
            WHERE id = v_pot_record.pot_id;
            
            -- Record allocation transaction
            INSERT INTO allocation_transactions (user_id, pot_id, amount, allocation_date, status)
            VALUES (p_user_id, v_pot_record.pot_id, v_allocate_amount, p_date, 'completed');
            
            -- Return allocation result
            pot_id := v_pot_record.pot_id;
            pot_name := v_pot_record.pot_name;
            allocated_amount := v_allocate_amount;
            remaining_balance := v_remaining - v_allocate_amount;
            v_remaining := remaining_balance;
            
            RETURN NEXT;
        END IF;
    END LOOP;
    
    -- If there's remaining amount, allocate to buffer pot
    IF v_remaining > 0 THEN
        SELECT id, name INTO v_pot_record FROM pots 
        WHERE user_id = p_user_id AND name = 'Buffer' LIMIT 1;
        
        IF FOUND THEN
            UPDATE pots 
            SET current_balance = current_balance + v_remaining,
                updated_at = NOW()
            WHERE id = v_pot_record.id;
            
            INSERT INTO allocation_transactions (user_id, pot_id, amount, allocation_date, status)
            VALUES (p_user_id, v_pot_record.id, v_remaining, p_date, 'completed');
            
            pot_id := v_pot_record.id;
            pot_name := v_pot_record.name;
            allocated_amount := v_remaining;
            remaining_balance := 0;
            
            RETURN NEXT;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
