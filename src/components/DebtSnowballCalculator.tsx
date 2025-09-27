import { useState } from 'react';
import { Card } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Badge } from "@shared/components/ui/badge";
import { Progress } from "@shared/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Switch } from "@shared/components/ui/switch";
import { useFinancial } from "@core/contexts/SupabaseFinancialContext";
import { useToast } from "@shared/hooks/use-toast";
import { 
  Calculator, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Target,
  Zap,
  Snowflake,
  PiggyBank,
  CheckCircle,
  Play,
  RotateCcw
} from "lucide-react";
import { cn } from "@shared/lib/utils";

interface DebtSnowballPlan {
  debts: Array<{
    id: string;
    name: string;
    currentBalance: number;
    interestRate: number;
    minimumPayment: number;
    payoffOrder: number;
    monthsToPayoff: number;
    totalInterest: number;
    monthlyPayment: number;
    extraPayment: number;
  }>;
  totalMonths: number;
  totalInterest: number;
  totalPayments: number;
  monthlyBudget: number;
  strategy: 'snowball' | 'avalanche';
  savings: number;
}

export default function DebtSnowballCalculator() {
  const { debts } = useFinancial();
  const { toast } = useToast();
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('snowball');
  const [includeInterest, setIncludeInterest] = useState(true);
  const [plan, setPlan] = useState<DebtSnowballPlan | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(0);

  const activeDebts = debts.filter(d => d.remainingAmount > 0);

  const calculateSnowballPlan = () => {
    if (monthlyBudget <= 0 || activeDebts.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a monthly budget and ensure you have active debts.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    
    setTimeout(() => {
      try {
        const sortedDebts = [...activeDebts]
          .map(debt => ({
            ...debt,
            currentBalance: debt.remainingAmount,
            interestRate: debt.interestRate || 0
          }))
          .sort((a, b) => {
            if (strategy === 'snowball') {
              return a.currentBalance - b.currentBalance;
            } else {
              return (b.interestRate || 0) - (a.interestRate || 0);
            }
          });

        let remainingBudget = monthlyBudget;
        const planDebts = [];
        let totalMonths = 0;
        let totalInterest = 0;

        for (let i = 0; i < sortedDebts.length; i++) {
          const debt = sortedDebts[i];
          const minPayment = debt.minimumPayment || 0;
          let monthlyPayment = minPayment;
          let extraPayment = 0;

          if (remainingBudget > minPayment) {
            extraPayment = remainingBudget - minPayment;
            monthlyPayment = remainingBudget;
            remainingBudget = 0;
          } else {
            monthlyPayment = remainingBudget;
            remainingBudget = 0;
          }

          let balance = debt.currentBalance;
          let months = 0;
          let interestPaid = 0;

          while (balance > 0 && months < 600) {
            const monthlyInterest = includeInterest ? (balance * (debt.interestRate / 100)) / 12 : 0;
            const principalPayment = Math.min(balance, monthlyPayment - monthlyInterest);
            
            balance -= principalPayment;
            interestPaid += monthlyInterest;
            months++;

            if (balance <= 0) break;
          }

          planDebts.push({
            id: debt.id,
            name: debt.name,
            currentBalance: debt.currentBalance,
            interestRate: debt.interestRate,
            minimumPayment: debt.minimumPayment,
            payoffOrder: i + 1,
            monthsToPayoff: months,
            totalInterest: interestPaid,
            monthlyPayment,
            extraPayment
          });

          totalMonths = Math.max(totalMonths, months);
          totalInterest += interestPaid;
        }

        const totalPayments = monthlyBudget * totalMonths;
        const savings = activeDebts.reduce((sum, debt) => {
          const minMonths = Math.ceil(debt.remainingAmount / (debt.minimumPayment || 1));
          const minInterest = includeInterest ? 
            (debt.remainingAmount * (debt.interestRate / 100) * minMonths / 12) : 0;
          return sum + minInterest;
        }, 0) - totalInterest;

        setPlan({
          debts: planDebts,
          totalMonths,
          totalInterest,
          totalPayments,
          monthlyBudget,
          strategy,
          savings: Math.max(0, savings)
        });

        setCurrentMonth(0);
        
        toast({
          title: "Plan Calculated!",
          description: `Your debt-free journey will take ${totalMonths} months.`,
        });

      } catch (error) {
        console.error('Error calculating debt snowball:', error);
        toast({
          title: "Calculation Error",
          description: "There was an error calculating your debt snowball plan.",
          variant: "destructive"
        });
      } finally {
        setIsCalculating(false);
      }
    }, 500);
  };

  const simulateMonth = () => {
    if (!plan || currentMonth >= plan.totalMonths) return;
    setCurrentMonth(prev => Math.min(prev + simulationSpeed, plan.totalMonths));
  };

  const resetSimulation = () => {
    setCurrentMonth(0);
  };

  const getDebtStatusAtMonth = (debt: any, month: number) => {
    const cumulativeMonths = plan?.debts
      .slice(0, debt.payoffOrder - 1)
      .reduce((sum, d) => sum + d.monthsToPayoff, 0) || 0;

    if (month < cumulativeMonths) {
      return { paid: 0, remaining: debt.currentBalance, status: 'pending' as const };
    }

    const monthsIntoThisDebt = month - cumulativeMonths;
    if (monthsIntoThisDebt >= debt.monthsToPayoff) {
      return { paid: debt.currentBalance, remaining: 0, status: 'paid' as const };
    }

    const monthlyInterest = includeInterest ? (debt.currentBalance * (debt.interestRate / 100)) / 12 : 0;
    const principalPayment = debt.monthlyPayment - monthlyInterest;
    const paid = Math.min(debt.currentBalance, principalPayment * monthsIntoThisDebt);
    const remaining = Math.max(0, debt.currentBalance - paid);

    return { 
      paid, 
      remaining, 
      status: monthsIntoThisDebt > 0 ? 'paying' as const : 'pending' as const 
    };
  };

  const getTotalPaidAtMonth = (month: number) => {
    if (!plan) return 0;
    return plan.debts.reduce((sum, debt) => {
      const status = getDebtStatusAtMonth(debt, month);
      return sum + status.paid;
    }, 0);
  };

  const getStrategyDescription = () => {
    if (strategy === 'snowball') {
      return "Pay off smallest debts first for quick wins and motivation.";
    } else {
      return "Pay off highest interest debts first to save money on interest.";
    }
  };

  const getStrategyIcon = () => {
    return strategy === 'snowball' ? <Snowflake className="h-4 w-4" /> : <Zap className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Debt Snowball Calculator</h2>
            <p className="text-muted-foreground">
              Optimize your debt repayment strategy and become debt-free faster
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="monthly-budget">Monthly Debt Budget (£)</Label>
            <Input
              id="monthly-budget"
              type="number"
              value={monthlyBudget || ''}
              onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
              placeholder="500"
              min="0"
              step="10"
            />
          </div>

          <div className="space-y-2">
            <Label>Repayment Strategy</Label>
            <Select value={strategy} onValueChange={(value: 'snowball' | 'avalanche') => setStrategy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="snowball">
                  <div className="flex items-center gap-2">
                    <Snowflake className="h-4 w-4" />
                    Snowball Method
                  </div>
                </SelectItem>
                <SelectItem value="avalanche">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Avalanche Method
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Simulation Speed</Label>
            <Select value={simulationSpeed.toString()} onValueChange={(value) => setSimulationSpeed(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1x Speed</SelectItem>
                <SelectItem value="3">3x Speed</SelectItem>
                <SelectItem value="6">6x Speed</SelectItem>
                <SelectItem value="12">12x Speed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={calculateSnowballPlan}
              disabled={isCalculating || activeDebts.length === 0}
              className="w-full gap-2"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Calculate Plan
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            {getStrategyIcon()}
            <span className="font-medium">{strategy === 'snowball' ? 'Snowball Method' : 'Avalanche Method'}</span>
          </div>
          <p className="text-sm text-muted-foreground">{getStrategyDescription()}</p>
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Switch
            checked={includeInterest}
            onCheckedChange={setIncludeInterest}
          />
          <Label htmlFor="include-interest">Include interest calculations</Label>
        </div>
      </Card>

      {plan && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Timeline</span>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {plan.totalMonths} months
                </p>
                <p className="text-sm text-muted-foreground">
                  {Math.floor(plan.totalMonths / 12)} years {plan.totalMonths % 12} months
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-destructive" />
                  <span className="font-semibold">Total Interest</span>
                </div>
                <p className="text-2xl font-bold text-destructive">
                  £{plan.totalInterest.toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {includeInterest ? 'With interest' : 'Interest excluded'}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-success" />
                  <span className="font-semibold">Total Payments</span>
                </div>
                <p className="text-2xl font-bold text-success">
                  £{plan.totalPayments.toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  £{plan.monthlyBudget.toFixed(0)}/month
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PiggyBank className="h-5 w-5 text-warning" />
                  <span className="font-semibold">Savings</span>
                </div>
                <p className="text-2xl font-bold text-warning">
                  £{plan.savings.toFixed(0)}
                </p>
                <p className="text-sm text-muted-foreground">
                  vs minimum payments
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={simulateMonth}
                  disabled={currentMonth >= plan.totalMonths}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Simulate {simulationSpeed} Month{simulationSpeed > 1 ? 's' : ''}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSimulation}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>

              <div className="text-center">
                <Badge variant="secondary" className="text-sm">
                  Month {currentMonth} of {plan.totalMonths}
                </Badge>
                <Progress 
                  value={(currentMonth / plan.totalMonths) * 100} 
                  className="w-32 mt-1"
                />
              </div>

              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-lg font-bold">
                  £{getTotalPaidAtMonth(currentMonth).toFixed(0)}
                </p>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Payoff Timeline
            </h3>
            
            {plan.debts.map((debt) => {
              const status = getDebtStatusAtMonth(debt, currentMonth);
              const progress = (status.paid / debt.currentBalance) * 100;
              
              return (
                <Card key={debt.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        #{debt.payoffOrder}
                      </Badge>
                      <div>
                        <h4 className="font-semibold">{debt.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{debt.interestRate}% APR</span>
                          <span>•</span>
                          <span>Min: £{debt.minimumPayment}/mo</span>
                          {debt.extraPayment > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-success">+£{debt.extraPayment}/mo</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={cn(
                        "text-sm font-medium",
                        status.status === 'paid' ? 'text-success' :
                        status.status === 'paying' ? 'text-warning' : 'text-muted-foreground'
                      )}>
                        {status.status === 'paid' ? 'Paid Off' :
                         status.status === 'paying' ? 'Paying Off' : 'Pending'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        £{status.paid.toFixed(0)} / £{debt.currentBalance.toFixed(0)}
                      </div>
                    </div>
                  </div>

                  <Progress value={progress} className="h-2 mb-2" />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Paid: £{status.paid.toFixed(0)}</span>
                    <span>Remaining: £{status.remaining.toFixed(0)}</span>
                  </div>
                  
                  {status.status === 'paying' && (
                    <div className="mt-2 text-xs text-center text-warning">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      Paying off - {debt.monthsToPayoff - (currentMonth - (plan.debts.slice(0, debt.payoffOrder - 1).reduce((sum, d) => sum + d.monthsToPayoff, 0)))} months remaining
                    </div>
                  )}
                  
                  {status.status === 'paid' && (
                    <div className="mt-2 text-xs text-center text-success">
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                      Debt Free! 🎉
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeDebts.length === 0 && (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Debts</h3>
          <p className="text-muted-foreground mb-4">
            Add some debts to start using the debt snowball calculator!
          </p>
        </Card>
      )}
    </div>
  );
}
