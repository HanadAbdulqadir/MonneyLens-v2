import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { useFinancial } from "@core/contexts/SupabaseFinancialContext";

const currencies = [
  { symbol: '£', name: 'British Pound', code: 'GBP' },
  { symbol: '$', name: 'US Dollar', code: 'USD' },
  { symbol: '€', name: 'Euro', code: 'EUR' },
  { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
  { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
  { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
  { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
];

const CurrencySelector = () => {
  const { currency, setCurrency } = useFinancial();

  return (
    <Select value={currency} onValueChange={setCurrency}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.symbol}>
            <div className="flex items-center gap-2">
              <span className="font-mono">{curr.symbol}</span>
              <span>{curr.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CurrencySelector;