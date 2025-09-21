import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useFinancial } from "@/contexts/FinancialContext";

const BalanceCard = () => {
  const { getCurrentBalance, getTodaysData, monthlyStartingPoint } = useFinancial();
  const balance = getCurrentBalance();
  const todaysData = getTodaysData();
  const isPositiveChange = todaysData.netChange >= 0;

  return (
    <Card className="relative overflow-hidden bg-gradient-primary shadow-glow border-0 animate-scale-in">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="relative p-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium">Current Balance</p>
            <h2 className="text-3xl font-bold">£{(balance || 0).toFixed(2)}</h2>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 ${isPositiveChange ? 'text-green-200' : 'text-red-200'}`}>
              {isPositiveChange ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                £{Math.abs(todaysData.netChange || 0).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-primary-foreground/60 mt-1">Today's change</p>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-3 pt-4 border-t border-primary-foreground/20">
          <div className="text-center">
            <p className="text-xs text-primary-foreground/80">Starting</p>
            <p className="font-semibold text-blue-200">£{(monthlyStartingPoint || 0).toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-primary-foreground/80">Earnings</p>
            <p className="font-semibold text-green-200">+£{todaysData.earnings}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-primary-foreground/80">Expenses</p>
            <p className="font-semibold text-red-200">
              -£{(todaysData.expenses || 0).toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-primary-foreground/80">Net</p>
            <p className={`font-semibold ${isPositiveChange ? 'text-green-200' : 'text-red-200'}`}>
              {isPositiveChange ? '+' : ''}£{(todaysData.netChange || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BalanceCard;
