import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Percent,
  BarChart3,
  Target,
  Download,
  Share2,
  PiggyBank,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvestmentCalculation {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  growthChart: Array<{
    year: number;
    value: number;
    contributions: number;
    interest: number;
  }>;
  milestones: Array<{
    year: number;
    value: number;
    milestone: string;
  }>;
}

interface InvestmentCalculatorProps {
  className?: string;
}

export function InvestmentCalculator({ className }: InvestmentCalculatorProps) {
  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [annualReturn, setAnnualReturn] = useState<number>(7);
  const [investmentYears, setInvestmentYears] = useState<number>(30);
  const [inflationRate, setInflationRate] = useState<number>(2.5);
  const [taxRate, setTaxRate] = useState<number>(15);
  const [investmentType, setInvestmentType] = useState<'lump-sum' | 'dca'>('lump-sum');

  const calculateInvestment = (): InvestmentCalculation => {
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = investmentYears * 12;
    let futureValue = initialInvestment;
    const growthChart = [];
    const milestones = [];
    
    let totalContributions = initialInvestment;
    let yearValue = initialInvestment;
    
    for (let month = 1; month <= totalMonths; month++) {
      // Add monthly contribution at the beginning of each month
      if (month > 1 || investmentType === 'dca') {
        futureValue += monthlyContribution;
        totalContributions += monthlyContribution;
      }
      
      // Apply monthly growth
      futureValue *= (1 + monthlyRate);
      
      // Record yearly values
      if (month % 12 === 0) {
        const year = month / 12;
        const yearlyInterest = futureValue - totalContributions;
        
        growthChart.push({
          year,
          value: futureValue,
          contributions: totalContributions,
          interest: yearlyInterest
        });
        
        yearValue = futureValue;
        
        // Add milestones
        if (year === 5 || year === 10 || year === 20 || year === investmentYears) {
          milestones.push({
            year,
            value: futureValue,
            milestone: `${year}-Year Mark`
          });
        }
        
        // Add $100k, $250k, $500k, $1M milestones
        const valueMilestones = [100000, 250000, 500000, 1000000, 2000000];
        for (const milestone of valueMilestones) {
          if (futureValue >= milestone && !milestones.some(m => m.value >= milestone)) {
            milestones.push({
              year,
              value: futureValue,
              milestone: `$${(milestone / 1000).toFixed(0)}k+`
            });
          }
        }
      }
    }
    
    const totalInterest = futureValue - totalContributions;
    
    return {
      futureValue,
      totalContributions,
      totalInterest,
      growthChart,
      milestones: milestones.slice(0, 8) // Limit to 8 most relevant milestones
    };
  };

  const calculation = calculateInvestment();
  const futureValue = calculation.futureValue;
  const totalContributions = calculation.totalContributions;
  const totalInterest = calculation.totalInterest;

  // Adjust for inflation
  const inflationAdjustedValue = futureValue / Math.pow(1 + inflationRate / 100, investmentYears);
  const inflationAdjustedInterest = totalInterest / Math.pow(1 + inflationRate / 100, investmentYears);

  // Adjust for taxes
  const afterTaxValue = futureValue - (totalInterest * (taxRate / 100));
  const taxesPaid = totalInterest * (taxRate / 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    return value > 0 ? 'text-green-600' : 'text-red-600';
  };

  const calculateCompoundInterest = (principal: number, rate: number, years: number): number => {
    return principal * Math.pow(1 + rate / 100, years);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investment Calculator</h2>
          <p className="text-muted-foreground">
            Project investment growth with compound interest and contributions
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
              <TrendingUp className="h-5 w-5" />
              Investment Details
            </CardTitle>
            <CardDescription>
              Configure your investment strategy and parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="initialInvestment">Initial Investment</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="initialInvestment"
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <Slider
                value={[initialInvestment]}
                onValueChange={([value]) => setInitialInvestment(value)}
                max={100000}
                step={1000}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
              <div className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="monthlyContribution"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <Slider
                value={[monthlyContribution]}
                onValueChange={([value]) => setMonthlyContribution(value)}
                max={5000}
                step={100}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualReturn">Expected Annual Return (%)</Label>
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="annualReturn"
                  type="number"
                  step="0.1"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <Slider
                value={[annualReturn]}
                onValueChange={([value]) => setAnnualReturn(value)}
                max={20}
                step={0.5}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentYears">Investment Period (Years)</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="investmentYears"
                  type="number"
                  value={investmentYears}
                  onChange={(e) => setInvestmentYears(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <Slider
                value={[investmentYears]}
                onValueChange={([value]) => setInvestmentYears(value)}
                max={50}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inflationRate">Inflation Rate (%)</Label>
                <Input
                  id="inflationRate"
                  type="number"
                  step="0.1"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Investment Strategy</Label>
              <div className="flex gap-2">
                <Button
                  variant={investmentType === 'lump-sum' ? 'default' : 'outline'}
                  onClick={() => setInvestmentType('lump-sum')}
                  className="flex-1"
                >
                  Lump Sum
                </Button>
                <Button
                  variant={investmentType === 'dca' ? 'default' : 'outline'}
                  onClick={() => setInvestmentType('dca')}
                  className="flex-1"
                >
                  DCA
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
              Investment Projection
            </CardTitle>
            <CardDescription>
              Detailed breakdown of your investment growth and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="growth">Growth Chart</TabsTrigger>
                <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(futureValue)}
                      </div>
                      <p className="text-xs text-muted-foreground">Future Value</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(totalContributions)}
                      </div>
                      <p className="text-xs text-muted-foreground">Total Contributions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(totalInterest)}
                      </div>
                      <p className="text-xs text-muted-foreground">Investment Growth</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPercentage(totalInterest / totalContributions * 100)}
                      </div>
                      <p className="text-xs text-muted-foreground">Return on Investment</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Adjusted Values</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Inflation Adjusted:</span>
                          <span>{formatCurrency(inflationAdjustedValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">After Tax Value:</span>
                          <span>{formatCurrency(afterTaxValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Taxes Paid:</span>
                          <span>{formatCurrency(taxesPaid)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Real Growth:</span>
                          <span className={getGrowthColor(inflationAdjustedInterest)}>
                            {formatCurrency(inflationAdjustedInterest)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Investment Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm max-h-48 overflow-auto">
                        {calculation.milestones.map((milestone) => (
                          <div key={milestone.year} className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{milestone.milestone}</div>
                              <div className="text-muted-foreground text-xs">
                                Year {milestone.year}
                              </div>
                            </div>
                            <Badge variant="outline">
                              {formatCurrency(milestone.value)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800 text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Compound Interest Power
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-blue-800">
                      <div className="text-center">
                        <div className="text-lg font-bold">{investmentYears} years</div>
                        <div className="text-xs">Time Horizon</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{formatPercentage(annualReturn)}</div>
                        <div className="text-xs">Annual Return</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {formatCurrency(monthlyContribution * 12 * investmentYears)}
                        </div>
                        <div className="text-xs">Total Contributions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Growth Chart Tab */}
              <TabsContent value="growth">
                <div className="space-y-4">
                  <div className="max-h-96 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="text-left p-2">Year</th>
                          <th className="text-right p-2">Portfolio Value</th>
                          <th className="text-right p-2">Contributions</th>
                          <th className="text-right p-2">Growth</th>
                          <th className="text-right p-2">ROI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculation.growthChart.slice(0, 15).map((entry) => (
                          <tr key={entry.year} className="border-b">
                            <td className="p-2">{entry.year}</td>
                            <td className="text-right p-2">{formatCurrency(entry.value)}</td>
                            <td className="text-right p-2">{formatCurrency(entry.contributions)}</td>
                            <td className="text-right p-2">{formatCurrency(entry.interest)}</td>
                            <td className="text-right p-2">
                              {formatPercentage(entry.interest / entry.contributions * 100)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {calculation.growthChart.length > 15 && (
                      <div className="text-center p-4 text-muted-foreground text-sm">
                        Showing first 15 years of {calculation.growthChart.length} total years
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Scenarios Tab */}
              <TabsContent value="scenarios">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Compare different investment scenarios and strategies
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Conservative vs Aggressive</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span>5% Return:</span>
                            <span>{formatCurrency(calculateWithReturn(5).futureValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>7% Return:</span>
                            <span>{formatCurrency(futureValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>10% Return:</span>
                            <span>{formatCurrency(calculateWithReturn(10).futureValue)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Difference (5% vs 10%):</span>
                            <span className={getGrowthColor(calculateWithReturn(10).futureValue - calculateWithReturn(5).futureValue)}>
                              {formatCurrency(calculateWithReturn(10).futureValue - calculateWithReturn(5).futureValue)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Contribution Impact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span>$250/mo:</span>
                            <span>{formatCurrency(calculateWithContribution(250).futureValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>$500/mo:</span>
                            <span>{formatCurrency(futureValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>$1000/mo:</span>
                            <span>{formatCurrency(calculateWithContribution(1000).futureValue)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Difference:</span>
                            <span className={getGrowthColor(calculateWithContribution(1000).futureValue - calculateWithContribution(250).futureValue)}>
                              {formatCurrency(calculateWithContribution(1000).futureValue - calculateWithContribution(250).futureValue)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // This would open the What-If Mode with investment scenarios
                      console.log('Open What-If Mode for investment comparison');
                    }}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Create Detailed Investment Scenarios in What-If Mode
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Helper functions for scenario calculations
  function calculateWithReturn(returnRate: number) {
    const monthlyRate = returnRate / 100 / 12;
    const totalMonths = investmentYears * 12;
    let futureValue = initialInvestment;
    let totalContributions = initialInvestment;
    
    for (let month = 1; month <= totalMonths; month++) {
      if (month > 1 || investmentType === 'dca') {
        futureValue += monthlyContribution;
        totalContributions += monthlyContribution;
      }
      futureValue *= (1 + monthlyRate);
    }
    
    return { futureValue, totalContributions };
  }

  function calculateWithContribution(contribution: number) {
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = investmentYears * 12;
    let futureValue = initialInvestment;
    let totalContributions = initialInvestment;
    
    for (let month = 1; month <= totalMonths; month++) {
      if (month > 1 || investmentType === 'dca') {
        futureValue += contribution;
        totalContributions += contribution;
      }
      futureValue *= (1 + monthlyRate);
    }
    
    return { futureValue, totalContributions };
  }
}
