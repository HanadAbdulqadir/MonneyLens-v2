import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { getCurrentBalance, getTodaysData } from "@/data/financialData";

const BalanceCard = () => {
  const balance = getCurrentBalance();
  const todaysData = getTodaysData();
  const isPositiveChange = todaysData.netChange >= 0;

  return (
    <Card className="relative overflow-hidden bg-gradient-primary shadow-elevated border-0">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      <div className="relative p-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium">Current Balance</p>
            <h2 className="text-3xl font-bold">£{balance.toFixed(2)}</h2>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 ${isPositiveChange ? 'text-green-200' : 'text-red-200'}`}>
              {isPositiveChange ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                £{Math.abs(todaysData.netChange).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-primary-foreground/60 mt-1">Today's change</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary-foreground/20">
          <div className="text-center">
            <p className="text-xs text-primary-foreground/80">Earnings</p>
            <p className="font-semibold text-green-200">+£{todaysData.earnings}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-primary-foreground/80">Expenses</p>
            <p className="font-semibold text-red-200">
              -£{(todaysData.petrol + todaysData.food + todaysData.other).toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-primary-foreground/80">Net</p>
            <p className={`font-semibold ${isPositiveChange ? 'text-green-200' : 'text-red-200'}`}>
              {isPositiveChange ? '+' : ''}£{todaysData.netChange.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BalanceCard;