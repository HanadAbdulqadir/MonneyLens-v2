import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  DollarSign, 
  Calendar,
  Percent,
  BarChart3,
  Download,
  Share2,
  PiggyBank,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavingsGoalCalculation {
  targetAmount: number;
  currentSavings: number;
  monthlyContribution: number;
  timeToGoal: number;
  totalContributions: number;
  interestEarned: number;
  monthlyChart: Array<{
    month: number;
    savings: number;
    interest: number;
    total: number;
  }>;
  milestones: Array<{
    month: number;
    amount: number;
    milestone: string;
    percentage: number;
  }>;
}

interface SavingsGoalCalculatorProps {
  className?: string;
}

export function SavingsGoalCalculator({ className }: SavingsGoalCalculatorProps) {
  const [goalName, setGoalName] = useState<string>("New Car");
  const [targetAmount, setTargetAmount] = useState<number>(25000);
  const [currentSavings, setCurrentSavings] = useState<number>(5000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [annualReturn, setAnnualReturn] = useState<number>(5);
  const [inflationRate, setInflationRate] = useState<number>(2.5);
  const [timeframe, setTimeframe] = useState<number>(36);

  const calculateSavingsGoal = (): SavingsGoalCalculation => {
    const monthlyRate = annualReturn / 100 / 12;
    let totalSavings = currentSavings;
    const monthlyChart = [];
    const milestones = [];
    
    for (let month = 1; month <= timeframe; month++) {
      // Apply monthly interest
      const monthlyInterest = totalSavings * monthlyRate;
      totalSavings += monthlyInterest;
      
      // Add monthly contribution
      totalSavings += monthlyContribution;
      
      monthlyChart.push({
        month,
        savings: currentSavings + (monthlyContribution * month),
        interest: monthlyInterest,
        total: totalSavings
      });
      
      // Calculate milestones
      const percentage = (totalSavings / targetAmount) * 100;
      if (percentage >= 25 && !milestones.find(m => m.milestone === "25%")) {
        milestones.push({
          month,
          amount: totalSavings,
          milestone: "25%",
          percentage: 25
        });
      }
      if (percentage >= 50 && !milestones.find(m => m.milestone === "50%")) {
        milestones.push({
          month,
          amount: totalSavings,
          milestone: "50%",
          percentage: 50
        });
      }
      if (percentage >= 75 && !milestones.find(m => m.milestone === "75%")) {
        milestones.push({
          month,
          amount: totalSavings,
          milestone: "75%",
          percentage: 75
        });
      }
      if (percentage >= 100 && !milestones.find(m => m.milestone === "100%")) {
        milestones.push({
          month,
          amount: totalSavings,
          milestone: "100%",
          percentage: 100
        });
        break; // Goal achieved
      }
    }
    
    // Calculate final values
    const finalSavings = monthlyChart[monthlyChart.length - 1]?.total || currentSavings;
    const totalContributions = currentSavings + (monthlyContribution * timeframe);
    const interestEarned = finalSavings - totalContributions;
    
    // Calculate actual time to goal
    let actualTimeToGoal = timeframe;
    for (let month = 1; month <= timeframe; month++) {
      const projected = calculateProjectedSavings(month);
      if (projected >= targetAmount) {
        actualTimeToGoal = month;
        break;
      }
    }
    
    return {
      targetAmount,
      currentSavings,
      monthlyContribution,
      timeToGoal: actualTimeToGoal,
      totalContributions,
      interestEarned,
      monthlyChart,
      milestones
    };
  };

  const calculateProjectedSavings = (months: number): number => {
    const monthlyRate = annualReturn / 100 / 12;
    let totalSavings = currentSavings;
    
    for (let month = 1; month <= months; month++) {
      const monthlyInterest = totalSavings * monthlyRate;
      totalSavings += monthlyInterest + monthlyContribution;
    }
    
    return totalSavings;
  };

  const calculation = calculateSavingsGoal();
  const goalProgress = (calculation.totalContributions / targetAmount) * 100;
  const isGoalAchievable = calculation.timeToGoal <= timeframe;
  const monthsToGoal = calculation.timeToGoal;
  const yearsToGoal = Math.ceil(monthsToGoal / 12);
  const goalAchieved = calculation.milestones.some(m => m.milestone === "100%");

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

  const formatTime = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
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
          <h2 className="text-2xl font-bold">Savings Goal Calculator</h2>
          <p className="text-muted-foreground">
            Plan and track progress toward your financial goals
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
              <Target className="h-5 w-5" />
              Goal Details
            </CardTitle>
            <CardDescription>
              Configure your savings goal and strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g., New Car, Vacation, Down Payment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="targetAmount"
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
              <Slider
                value={[targetAmount]}
                onValueChange={([value]) => setTargetAmount(value)}
                max={100000}
                step={1000}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSavings">Current Savings</Label>
              <Input
                id="currentSavings"
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
              />
              <Slider
                value={[currentSavings]}
                onValueChange={([value]) => setCurrentSavings(value)}
                max={targetAmount}
                step={100}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
              <Input
                id="monthlyContribution"
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              />
              <Slider
                value={[monthlyContribution]}
                onValueChange={([value]) => setMonthlyContribution(value)}
                max={5000}
                step={50}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe (Months)</Label>
              <Input
                id="timeframe"
                type="number"
                value={timeframe}
                onChange={(e) => setTimeframe(Number(e.target.value))}
              />
              <Slider
                value={[timeframe]}
                onValueChange={([value]) => setTimeframe(value)}
                max={120}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annualReturn">Annual Return (%)</Label>
                <Input
                  id="annualReturn"
                  type="number"
                  step="0.1"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(Number(e.target.value))}
                />
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
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Goal Progress
            </CardTitle>
            <CardDescription>
              Track your progress and see when you'll reach your goal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="strategies">Strategies</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(calculation.targetAmount)}
                      </div>
                      <p className="text-xs text-muted-foreground">Target Amount</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(calculation.currentSavings)}
                      </div>
                      <p className="text-xs text-muted-foreground">Current Savings</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatTime(calculation.timeToGoal)}
                      </div>
                      <p className="text-xs text-muted-foreground">Time to Goal</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(calculation.monthlyContribution)}
                      </div>
                      <p className="text-xs text-muted-foreground">Monthly Save</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress Bar */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Goal Progress: {goalName}</span>
                      <Badge variant={goalAchieved ? "default" : "secondary"}>
                        {goalAchieved ? "Achieved!" : `${Math.min(100, Math.round(goalProgress))}%`}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={Math.min(100, goalProgress)} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>{formatCurrency(calculation.currentSavings)} saved</span>
                      <span>{formatCurrency(calculation.targetAmount)} goal</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Financial Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Contributions:</span>
                          <span>{formatCurrency(calculation.totalContributions)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Interest Earned:</span>
                          <span className="text-green-600">{formatCurrency(calculation.interestEarned)}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Final Amount:</span>
                          <span>{formatCurrency(calculation.monthlyChart[calculation.monthlyChart.length - 1]?.total || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Monthly Contribution:</span>
                          <span>{formatCurrency(monthlyContribution)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Goal Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Progress:</span>
                          <span>{Math.round((currentSavings / targetAmount) * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time to Goal:</span>
                          <span>{formatTime(monthsToGoal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Goal Achievable:</span>
                          <Badge variant={getStatusBadge(isGoalAchievable)}>
                            {isGoalAchievable ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>Projected Date:</span>
                          <span>{new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {!isGoalAchievable && (
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardHeader>
                      <CardTitle className="text-yellow-800 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Goal Adjustment Needed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-yellow-800 space-y-2">
                        <p className="font-medium">Your current plan won't reach the goal within the timeframe.</p>
                        <ul className="text-sm space-y-1">
                          <li>• Increase monthly contributions by {formatCurrency((targetAmount - currentSavings) / timeframe - monthlyContribution)}</li>
                          <li>• Extend timeframe by {Math.ceil((targetAmount - currentSavings) / monthlyContribution) - timeframe} months</li>
                          <li>• Reduce target amount by {formatCurrency(targetAmount - calculateProjectedSavings(timeframe))}</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {goalAchieved && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-green-800 text-sm flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Goal Achieved!
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-green-800 space-y-2">
                        <p className="font-medium">Congratulations! You'll reach your goal in {formatTime(monthsToGoal)}.</p>
                        <ul className="text-sm space-y-1">
                          <li>• Final amount: {formatCurrency(calculation.monthlyChart[calculation.monthlyChart.length - 1]?.total || 0)}</li>
                          <li>• Interest earned: {formatCurrency(calculation.interestEarned)}</li>
                          <li>• You'll reach goal {formatTime(timeframe - monthsToGoal)} early!</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800 text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Goal Acceleration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-blue-800">
                      <div className="text-center">
                        <div className="text-lg font-bold">{formatTime(monthsToGoal)}</div>
                        <div className="text-xs">Current Timeline</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{formatPercentage(annualReturn)}</div>
                        <div className="text-xs">Return Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {formatCurrency(monthlyContribution * monthsToGoal)}
                        </div>
                        <div className="text-xs">Total Contributions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline">
                <div className="space-y-4">
                  <div className="max-h-96 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background">
                        <tr className="border-b">
                          <th className="text-left p-2">Month</th>
                          <th className="text-right p-2">Contributions</th>
                          <th className="text-right p-2">Interest</th>
                          <th className="text-right p-2">Total</th>
                          <th className="text-right p-2">Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculation.monthlyChart.slice(0, 24).map((entry) => (
                          <tr key={entry.month} className="border-b">
                            <td className="p-2">{entry.month}</td>
                            <td className="text-right p-2">{formatCurrency(entry.savings)}</td>
                            <td className="text-right p-2 text-green-600">{formatCurrency(entry.interest)}</td>
                            <td className="text-right p-2 font-medium">{formatCurrency(entry.total)}</td>
                            <td className="text-right p-2">
                              <Badge variant="secondary">
                                {Math.min(100, Math.round((entry.total / targetAmount) * 100))}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {calculation.monthlyChart.length > 24 && (
                      <div className="text-center p-4 text-muted-foreground text-sm">
                        Showing first 24 months of {calculation.monthlyChart.length} total months
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Strategies Tab */}
              <TabsContent value="strategies">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Compare different savings strategies to reach your goal faster
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Contribution Strategies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span>Current Plan:</span>
                            <span>{formatTime(monthsToGoal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>+25% Monthly:</span>
                            <span>{formatTime(calculateTimeWithContribution(monthlyContribution * 1.25))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>+50% Monthly:</span>
                            <span>{formatTime(calculateTimeWithContribution(monthlyContribution * 1.5))}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Time Saved (50%):</span>
                            <span className={getStatusColor(monthsToGoal - calculateTimeWithContribution(monthlyContribution * 1.5) > 0)}>
                              {formatTime(monthsToGoal - calculateTimeWithContribution(monthlyContribution * 1.5))}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Return Rate Impact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span>3% Return:</span>
                            <span>{formatTime(calculateTimeWithReturn(3))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>5% Return:</span>
                            <span>{formatTime(monthsToGoal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>7% Return:</span>
                            <span>{formatTime(calculateTimeWithReturn(7))}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Time Saved (7%):</span>
                            <span className={getStatusColor(monthsToGoal - calculateTimeWithReturn(7) > 0)}>
                              {formatTime(monthsToGoal - calculateTimeWithReturn(7))}
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
                      // This would open the What-If Mode with savings scenarios
                      console.log('Open What-If Mode for savings comparison');
                    }}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Create Detailed Savings Scenarios in What-If Mode
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Helper functions for strategy calculations
  function calculateTimeWithContribution(newContribution: number): number {
    let months = 0;
    let totalSavings = currentSavings;
    const monthlyRate = annualReturn / 100 / 12;
    
    while (totalSavings < targetAmount && months < 120) {
      const monthlyInterest = totalSavings * monthlyRate;
      totalSavings += monthlyInterest + newContribution;
      months++;
    }
    
    return months;
  }

  function calculateTimeWithReturn(newReturn: number): number {
    let months = 0;
    let totalSavings = currentSavings;
    const monthlyRate = newReturn / 100 / 12;
    
    while (totalSavings < targetAmount && months < 120) {
      const monthlyInterest = totalSavings * monthlyRate;
      totalSavings += monthlyInterest + monthlyContribution;
      months++;
    }
    
    return months;
  }
}
