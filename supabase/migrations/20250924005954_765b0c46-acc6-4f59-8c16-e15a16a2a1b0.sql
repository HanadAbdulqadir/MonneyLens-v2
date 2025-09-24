-- Create allocation_rules table
CREATE TABLE IF NOT EXISTS public.allocation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pot_id UUID NOT NULL REFERENCES public.pots(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('daily', 'weekly', 'monthly', 'custom')),
  amount DECIMAL(10,2) NOT NULL,
  schedule JSONB DEFAULT '{}',
  priority INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create allocation_transactions table
CREATE TABLE IF NOT EXISTS public.allocation_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pot_id UUID NOT NULL REFERENCES public.pots(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES public.allocation_rules(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.allocation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocation_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for allocation_rules
CREATE POLICY "Users can view their own allocation rules" 
ON public.allocation_rules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own allocation rules" 
ON public.allocation_rules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own allocation rules" 
ON public.allocation_rules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own allocation rules" 
ON public.allocation_rules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for allocation_transactions
CREATE POLICY "Users can view their own allocation transactions" 
ON public.allocation_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own allocation transactions" 
ON public.allocation_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own allocation transactions" 
ON public.allocation_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_allocation_rules_user_id ON public.allocation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_allocation_rules_pot_id ON public.allocation_rules(pot_id);
CREATE INDEX IF NOT EXISTS idx_allocation_transactions_user_id ON public.allocation_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_allocation_transactions_pot_id ON public.allocation_transactions(pot_id);

-- Create trigger for automatic timestamp updates on allocation_rules
CREATE TRIGGER update_allocation_rules_updated_at
BEFORE UPDATE ON public.allocation_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for income allocation
CREATE OR REPLACE FUNCTION public.allocate_income_to_pots(
  p_user_id UUID,
  p_amount DECIMAL,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB AS $$
DECLARE
  rule RECORD;
  allocated_amount DECIMAL := 0;
  result JSONB := '[]'::JSONB;
  transaction_id UUID;
BEGIN
  -- Get all enabled allocation rules for the user, ordered by priority
  FOR rule IN
    SELECT ar.*, p.name as pot_name
    FROM allocation_rules ar
    JOIN pots p ON ar.pot_id = p.id
    WHERE ar.user_id = p_user_id 
    AND ar.enabled = true
    AND p.user_id = p_user_id
    ORDER BY ar.priority ASC
  LOOP
    -- Check if we have enough remaining amount
    IF allocated_amount + rule.amount <= p_amount THEN
      -- Update pot balance
      UPDATE pots 
      SET current_balance = current_balance + rule.amount
      WHERE id = rule.pot_id;
      
      -- Create allocation transaction
      INSERT INTO allocation_transactions (user_id, pot_id, rule_id, amount, allocation_date, status)
      VALUES (p_user_id, rule.pot_id, rule.id, rule.amount, p_date, 'completed')
      RETURNING id INTO transaction_id;
      
      -- Track allocated amount
      allocated_amount := allocated_amount + rule.amount;
      
      -- Add to result
      result := result || jsonb_build_object(
        'pot_id', rule.pot_id,
        'pot_name', rule.pot_name,
        'amount', rule.amount,
        'transaction_id', transaction_id
      );
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;