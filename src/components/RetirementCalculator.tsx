import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Slider } from "@shared/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { Badge } from "@shared/components/ui/badge";
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
  Zap,
  Users,
  Home
} from 'lucide-react';
import { cn } from "@shared/lib/utils";

interface RetirementCalculation {
  retirementSavings: number;
  annualWithdrawal: number;
  monthlyWithdrawal: number;
  yearsOfRetirement: number;
  safeWithdrawalRate: number;
  withdrawalChart: Array<{
    year: number;
    age: number;
    portfolioValue: number;
    withdrawal: number;
    remaining: number;
  }>;
  milestones: Array<{
    age: number;
    value: number;
    milestone: string;
  }>;
}

interface RetirementCalculatorProps {
  className?: string;
}

export function RetirementCalculator({ className }: RetirementCalculatorProps) {
  const [currentAge, setCurrentAge] = useState<number>(35);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(85);
  const [currentSavings, setCurrentSavings] = useState<number>(50000);
  const [annualContribution, setAnnualContribution] = useState<number>(10000);
  const [preRetirementReturn, setPreRetirementReturn] = useState<number>(7);
  const [postRetirementReturn, setPostRetirementReturn] = useState<number>(5);
  const [inflationRate, setInflationRate] = useState<number>(2.5);
  const [socialSecurity, setSocialSecurity] = useState<number>(20000);
  const [pension, setPension] = useState<number>(0);
  const [desiredIncome, setDesiredIncome] = useState<number>(60000);

  const calculateRetirement = (): RetirementCalculation => {
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retirementAge;
    
    // Calculate retirement savings at retirement
    let retirementSavings = currentSavings;
    const preMonthlyRate = preRetirementReturn / 100 / 12;
    const preTotalMonths = yearsToRetirement * 12;
    
    for (let month = 1; month <= preTotalMonths; month++) {
      retirementSavings *= (1 + preMonthlyRate);
      if (month % 12 === 0) {
        retirementSavings += annualContribution;
      }
    }
    
    // Calculate safe withdrawal (4% rule)
    const safeWithdrawalRate = 0.04;
    const annualWithdrawal = retirementSavings * safeWithdrawalRate;
    const monthlyWithdrawal = annualWithdrawal / 12;
    
    // Calculate retirement portfolio depletion
    const postMonthlyRate = postRetirementReturn / 100 / 12;
    const postTotalMonths = yearsInRetirement * 12;
    let portfolioValue = retirementSavings;
    const withdrawalChart = [];
    
    for (let year = 1; year <= yearsInRetirement; year++) {
      const annualWithdrawalAmount = annualWithdrawal;
      const monthlyWithdrawalAmount = annualWithdrawalAmount / 12;
      
      // Apply monthly growth and withdrawals
      for (let month = 1; month <= 12; month++) {
        portfolioValue *= (1 + postMonthlyRate);
        portfolioValue -= monthlyWithdrawalAmount;
      }
      
      const age = retirementAge + year;
      withdrawalChart.push({
        year,
        age,
        portfolioValue: Math.max(0, portfolioValue),
        withdrawal: annualWithdrawalAmount,
        remaining: Math.max(0, portfolioValue)
      });
      
      if (portfolioValue <= 0) break;
    }
    
    const actualYears = withdrawalChart.length;
    const milestones = [
      {
        age: retirementAge,
        value: retirementSavings,
        milestone: "Retirement Start"
      },
      {
        age: retirementAge + 10,
        value: withdrawalChart.find(d => d.year === 10)?.portfolioValue || 0,
        milestone: "10 Years In"
      },
      {
        age: lifeExpectancy,
        value: withdrawalChart.find(d => d.year === yearsInRetirement)?.portfolioValue || 0,
        milestone: "Life Expectancy"
      }
    ].filter(m => m.value > 0);
    
    return {
      retirementSavings,
      annualWithdrawal,
      monthlyWithdrawal,
      yearsOfRetirement: actualYears,
      safeWithdrawalRate: safeWithdrawalRate * 100,
      withdrawalChart,
      milestones
    };
  };

  const calculation = calculateRetirement();
  const yearsToRetirement = retirementAge - currentAge;
  const totalIncome = calculation.annualWithdrawal + socialSecurity + pension;
  const incomeGap = desiredIncome - totalIncome;
  const isOnTrack = incomeGap <= 0;

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

  const getStatusColor = (isPositive: boolean) => {
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBadge = (isPositive: boolean) => {
    return isPositive ? "default" : "destructive";
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Retirement Calculator</h2>
          <p className="text-muted-foreground">
            Plan your retirement savings, withdrawals, and income strategy
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
              <Users className="h-5 w-5" />
              Retirement Details
            </CardTitle>
            <CardDescription>
              Configure your retirement timeline and savings strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentAge">Current Age</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentAge"
                  type="number"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <Slider
                value={[currentAge]}
                onValueChange={([value]) => setCurrentAge(value)}
                max={80}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirementAge">Retirement Age</Label>
              <Input
                id="retirementAge"
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
              />
              <Slider
                value={[retirementAge]}
                onValueChange={([value]) => setRetirementAge(value)}
                max={80}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifeExpectancy">Life Expectancy</Label>
              <Input
                id="lifeExpectancy"
                type="number"
                value={lifeExpectancy}
                onChange={(e) => setLifeExpectancy(Number(e.target.value))}
              />
              <Slider
                value={[lifeExpectancy]}
                onValueChange={([value]) => setLifeExpectancy(value)}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSavings">Current Savings</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="currentSavings"
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualContribution">Annual Contribution</Label>
              <Input
                id="annualContribution"
                type="number"
                value={annualContribution}
                onChange={(e) => setAnnualContribution(Number(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preRetirementReturn">Pre-Retirement Return (%)</Label>
                <Input
                  id="preRetirementReturn"
                  type="number"
                  step="0.1"
                  value={preRetirementReturn}
                  onChange={(e) => setPreRetirementReturn(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postRetirementReturn">Post-Retirement Return (%)</Label>
                <Input
                  id="postRetirementReturn"
                  type="number"
                  step="0.1"
                  value={postRetirementReturn}
                  onChange={(e) => setPostRetirementReturn(Number(e.target.value))}
                />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="socialSecurity">Social Security (Yearly)</Label>
                <Input
                  id="socialSecurity"
                  type="number"
                  value={socialSecurity}
                  onChange={(e) => setSocialSecurity(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pension">Pension (Yearly)</Label>
                <Input
                  id="pension"
                  type="number"
                  value={pension}
                  onChange={(e) => setPension(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredIncome">Desired Retirement Income</Label>
              <Input
                id="desiredIncome"
                type="number"
                value={desiredIncome}
                onChange={(e) => setDesiredIncome(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Retirement Projection
            </CardTitle>
            <CardDescription>
              Detailed breakdown of your retirement plan and income strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="withdrawal">Withdrawal Plan</TabsTrigger>
                <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              </TabsList>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(calculation.retirementSavings)}
                      </div>
                      <p className="text-xs text-muted-foreground">Retirement Savings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(calculation.annualWithdrawal)}
                      </div>
                      <p className="text-xs text-muted-foreground">Annual Withdrawal</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {calculation.yearsOfRetirement} years
                      </div>
                      <p className="text-xs text-muted-foreground">Retirement Duration</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatPercentage(calculation.safeWithdrawalRate)}
                      </div>
                      <p className="text-xs text-muted-foreground">Withdrawal Rate</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Income Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Investment Income:</span>
                          <span>{formatCurrency(calculation.annualWithdrawal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Social Security:</span>
                          <span>{formatCurrency(socialSecurity)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pension:</span>
                          <span>{formatCurrency(pension)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Total Income:</span>
                          <span>{formatCurrency(totalIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Desired Income:</span>
                          <span>{formatCurrency(desiredIncome)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Income Gap:</span>
                          <Badge variant={getStatusBadge(isOnTrack)}>
                            {formatCurrency(incomeGap)}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Years to Retirement:</span>
                          <span>{yearsToRetirement} years</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Retirement Age:</span>
                          <span>{retirementAge}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Life Expectancy:</span>
                          <span>{lifeExpectancy}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Retirement Duration:</span>
                          <span>{calculation.yearsOfRetirement} years</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {!isOnTrack && (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="text-yellow-800 text-sm flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Action Required
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-yellow-800 space-y-2">
                        <p className="font-medium">You need to increase your savings to meet your retirement goals.</p>
                        <ul className="text-sm space-y-1">
                          <li>• Increase annual contributions by {formatCurrency(Math.abs(incomeGap) / yearsToRetirement)}</li>
                          <li>• Work {Math.ceil(Math.abs(incomeGap) / calculation.annualWithdrawal)} more years</li>
                          <li>• Reduce desired retirement income by {formatPercentage(Math.abs(incomeGap) / desiredIncome * 100)}</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800 text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Retirement Readiness
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-blue-800">
                      <div className="text-center">
                        <div className="text-lg font-bold">{yearsToRetirement} years</div>
                        <div className="text-xs">To Retirement</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{formatPercentage(preRetirementReturn)}</div>
                        <div className="text-xs">Growth Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {formatCurrency(annualContribution * yearsToRetirement)}
                        </div>
                        <div className="text-xs">Future Contributions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Withdrawal Plan Tab */}
              <TabsContent value="withdrawal">
                <div className="space-y-4">
                  <div className="max-h-96 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="text-left p-2">Year</th>
                          <th className="text-left p-2">Age</th>
                          <th className="text-right p-2">Portfolio Value</th>
                          <th className="text-right p-2">Withdrawal</th>
                          <th className="text-right p-2">Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculation.withdrawalChart.slice(0, 15).map((entry) => (
                          <tr key={entry.year} className="border-b">
                            <td className="p-2">{entry.year}</td>
                            <td className="p-2">{entry.age}</td>
                            <td className="text-right p-2">{formatCurrency(entry.portfolioValue)}</td>
                            <td className="text-right p-2">{formatCurrency(entry.withdrawal)}</td>
                            <td className="text-right p-2">{formatCurrency(entry.remaining)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {calculation.withdrawalChart.length > 15 && (
                      <div className="text-center p-4 text-muted-foreground text-sm">
                        Showing first 15 years of {calculation.withdrawalChart.length} total years
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Scenarios Tab */}
              <TabsContent value="scenarios">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Compare different retirement scenarios and strategies
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Early vs Late Retirement</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span>Retire at 60:</span>
                            <span>{formatCurrency(calculateWithAge(60).retirementSavings)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Retire at 65:</span>
                            <span>{formatCurrency(calculation.retirementSavings)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Retire at 70:</span>
                            <span>{formatCurrency(calculateWithAge(70).retirementSavings)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Difference (60 vs 70):</span>
                            <span className={getStatusColor(calculateWithAge(70).retirementSavings - calculateWithAge(60).retirementSavings > 0)}>
                              {formatCurrency(calculateWithAge(70).retirementSavings - calculateWithAge(60).retirementSavings)}
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
                            <span>$5k/year:</span>
                            <span>{formatCurrency(calculateWithContribution(5000).retirementSavings)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>$10k/year:</span>
                            <span>{formatCurrency(calculation.retirementSavings)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>$20k/year:</span>
                            <span>{formatCurrency(calculateWithContribution(20000).retirementSavings)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Difference:</span>
                            <span className={getStatusColor(calculateWithContribution(20000).retirementSavings - calculateWithContribution(5000).retirementSavings > 0)}>
                              {formatCurrency(calculateWithContribution(20000).retirementSavings - calculateWithContribution(5000).retirementSavings)}
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
                      // This would open the What-If Mode with retirement scenarios
                      console.log('Open What-If Mode for retirement comparison');
                    }}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Create Detailed Retirement Scenarios in What-If Mode
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
  function calculateWithAge(retirementAge: number) {
    const yearsToRetirement = retirementAge - currentAge;
    let retirementSavings = currentSavings;
    const preMonthlyRate = preRetirementReturn / 100 / 12;
    const preTotalMonths = yearsToRetirement * 12;
    
    for (let month = 1; month <= preTotalMonths; month++) {
      retirementSavings *= (1 + preMonthlyRate);
      if (month % 12 === 0) {
        retirementSavings += annualContribution;
      }
    }
    
    return { retirementSavings };
  }

  function calculateWithContribution(contribution: number) {
    const yearsToRetirement = retirementAge - currentAge;
    let retirementSavings = currentSavings;
    const preMonthlyRate = preRetirementReturn / 100 / 12;
    const preTotalMonths = yearsToRetirement * 12;
    
    for (let month = 1; month <= preTotalMonths; month++) {
      retirementSavings *= (1 + preMonthlyRate);
      if (month % 12 === 0) {
        retirementSavings += contribution;
      }
    }
    
    return { retirementSavings };
  }
}
