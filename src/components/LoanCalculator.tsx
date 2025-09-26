import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Percent,
  BarChart3,
  Download,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoanCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  interestSavings: number;
  payoffDate: Date;
  amortizationSchedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

interface LoanCalculatorProps {
  className?: string;
}

export function LoanCalculator({ className }: LoanCalculatorProps) {
  const [loanAmount, setLoanAmount] = useState<number>(250000);
  const [interestRate, setInterestRate] = useState<number>(4.5);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [downPayment, setDownPayment] = useState<number>(50000);
  const [propertyTax, setPropertyTax] = useState<number>(3000);
  const [homeInsurance, setHomeInsurance] = useState<number>(1200);
  const [pmi, setPmi] = useState<number>(100);
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [loanType, setLoanType] = useState<'fixed' | 'variable'>('fixed');

  const calculateLoan = (): LoanCalculation => {
    const principal = loanAmount - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    
    // Calculate monthly payment using standard formula
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - principal;
    
    // Calculate with extra payments
    let balance = principal;
    let totalPaid = 0;
    let months = 0;
    const schedule = [];
    
    while (balance > 0 && months < numberOfPayments * 2) {
      const interestPayment = balance * monthlyRate;
      let principalPayment = monthlyPayment - interestPayment;
      
      if (balance < monthlyPayment + extraPayment) {
        principalPayment = balance;
      } else {
        principalPayment += extraPayment;
      }
      
      const payment = principalPayment + interestPayment;
      balance -= principalPayment;
      totalPaid += payment;
      months++;
      
      schedule.push({
        month: months,
        payment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
      
      if (balance <= 0) break;
    }
    
    const interestSavings = (monthlyPayment * numberOfPayments) - totalPaid;
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);
    
    return {
      monthlyPayment: monthlyPayment + (propertyTax + homeInsurance + pmi) / 12,
      totalPayment: totalPaid + downPayment,
      totalInterest,
      interestSavings,
      payoffDate,
      amortizationSchedule: schedule
    };
  };

  const calculation = calculateLoan();
  const totalMonthlyPayment = calculation.monthlyPayment;
  const totalCost = calculation.totalPayment;
  const interestPaid = calculation.totalInterest;
  const monthsSaved = (loanTerm * 12) - calculation.amortizationSchedule.length;
  const yearsSaved = monthsSaved / 12;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getSavingsColor = (savings: number) => {
    return savings > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Loan Calculator</h2>
          <p className="text-muted-foreground">
            Calculate mortgage payments, interest costs, and payoff strategies
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Loan Details
            </CardTitle>
            <CardDescription>
              Enter your loan information to calculate payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="loanAmount"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <Slider
                value={[loanAmount]}
                onValueChange={([value]) => setLoanAmount(value)}
                max={1000000}
                step={1000}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="interestRate"
                  type="number"
                  step="0.01"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <Slider
                value={[interestRate]}
                onValueChange={([value]) => setInterestRate(value)}
                max={10}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loanTerm">Loan Term (Years)</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="loanTerm"
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <Slider
                value={[loanTerm]}
                onValueChange={([value]) => setLoanTerm(value)}
                max={40}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="downPayment">Down Payment</Label>
              <Input
                id="downPayment"
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extraPayment">Extra Monthly Payment</Label>
              <Input
                id="extraPayment"
                type="number"
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="propertyTax">Property Tax (Yearly)</Label>
                <Input
                  id="propertyTax"
                  type="number"
                  value={propertyTax}
                  onChange={(e) => setPropertyTax(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeInsurance">Home Insurance (Yearly)</Label>
                <Input
                  id="homeInsurance"
                  type="number"
                  value={homeInsurance}
                  onChange={(e) => setHomeInsurance(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pmi">PMI (Monthly)</Label>
              <Input
                id="pmi"
                type="number"
                value={pmi}
                onChange={(e) => setPmi(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Loan Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={loanType === 'fixed' ? 'default' : 'outline'}
                  onClick={() => setLoanType('fixed')}
                  className="flex-1"
                >
                  Fixed Rate
                </Button>
                <Button
                  variant={loanType === 'variable' ? 'default' : 'outline'}
                  onClick={() => setLoanType('variable')}
                  className="flex-1"
                >
                  Variable Rate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Calculation Results
            </CardTitle>
            <CardDescription>
              Detailed breakdown of your loan payments and costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="schedule">Amortization</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(totalMonthlyPayment)}
                      </div>
                      <p className="text-xs text-muted-foreground">Monthly Payment</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(totalCost)}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Cost</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(interestPaid)}
                      </div>
                      <p className="text-xs text-muted-foreground">Interest Paid</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className={cn("text-2xl font-bold", getSavingsColor(calculation.interestSavings))}>
                        {formatCurrency(calculation.interestSavings)}
                      </div>
                      <p className="text-xs text-muted-foreground">Interest Savings</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Payoff Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Original Payoff:</span>
                          <span>{loanTerm} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">With Extra Payments:</span>
                          <span>{(calculation.amortizationSchedule.length / 12).toFixed(1)} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time Saved:</span>
                          <Badge variant={yearsSaved > 0 ? "default" : "secondary"}>
                            {yearsSaved.toFixed(1)} years
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Payoff Date:</span>
                          <span>{formatDate(calculation.payoffDate)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Cost Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Principal:</span>
                          <span>{formatCurrency(loanAmount - downPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest:</span>
                          <span>{formatCurrency(interestPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Down Payment:</span>
                          <span>{formatCurrency(downPayment)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total Cost:</span>
                          <span>{formatCurrency(totalCost)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {extraPayment > 0 && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800 text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Extra Payment Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-green-800">
                        <div className="text-center">
                          <div className="text-lg font-bold">{yearsSaved.toFixed(1)} years</div>
                          <div className="text-xs">Time Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{formatCurrency(calculation.interestSavings)}</div>
                          <div className="text-xs">Interest Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{monthsSaved} months</div>
                          <div className="text-xs">Payments Saved</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Amortization Schedule Tab */}
              <TabsContent value="schedule">
                <div className="max-h-96 overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">
                        <th className="text-left p-2">Month</th>
                        <th className="text-right p-2">Payment</th>
                        <th className="text-right p-2">Principal</th>
                        <th className="text-right p-2">Interest</th>
                        <th className="text-right p-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculation.amortizationSchedule.slice(0, 12).map((entry) => (
                        <tr key={entry.month} className="border-b">
                          <td className="p-2">{entry.month}</td>
                          <td className="text-right p-2">{formatCurrency(entry.payment)}</td>
                          <td className="text-right p-2">{formatCurrency(entry.principal)}</td>
                          <td className="text-right p-2">{formatCurrency(entry.interest)}</td>
                          <td className="text-right p-2">{formatCurrency(entry.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {calculation.amortizationSchedule.length > 12 && (
                    <div className="text-center p-4 text-muted-foreground text-sm">
                      Showing first 12 months of {calculation.amortizationSchedule.length} total payments
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Comparison Tab */}
              <TabsContent value="comparison">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Compare different scenarios to optimize your loan strategy
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">15-Year vs 30-Year</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span>15-Year Term:</span>
                            <span>{formatCurrency(calculateLoanWithTerm(15).monthlyPayment)}/mo</span>
                          </div>
                          <div className="flex justify-between">
                            <span>30-Year Term:</span>
                            <span>{formatCurrency(totalMonthlyPayment)}/mo</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Monthly Difference:</span>
                            <span className={getSavingsColor(totalMonthlyPayment - calculateLoanWithTerm(15).monthlyPayment)}>
                              {formatCurrency(totalMonthlyPayment - calculateLoanWithTerm(15).monthlyPayment)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Extra Payment Impact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span>No Extra Payment:</span>
                            <span>{loanTerm} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span>With ${extraPayment}/mo:</span>
                            <span>{(calculation.amortizationSchedule.length / 12).toFixed(1)} years</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Time Saved:</span>
                            <Badge variant={yearsSaved > 0 ? "default" : "secondary"}>
                              {yearsSaved.toFixed(1)} years
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // This would open the What-If Mode with loan scenarios
                      console.log('Open What-If Mode for loan comparison');
                    }}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Create Detailed Comparison in What-If Mode
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Helper function to calculate loan with different term
  function calculateLoanWithTerm(term: number) {
    const principal = loanAmount - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = term * 12;
    
    const monthlyPayment = principal * 
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return {
      monthlyPayment: monthlyPayment + (propertyTax + homeInsurance + pmi) / 12
    };
  }
}
