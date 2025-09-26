import { Calculator, TrendingUp, BarChart3, Play, Home, PiggyBank, Users, Target, Brain } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScenarioManager } from "@/components/ScenarioManager";
import { AIInsightsDashboard } from "@/components/AIInsightsDashboard";
import { LoanCalculator } from "@/components/LoanCalculator";
import { InvestmentCalculator } from "@/components/InvestmentCalculator";
import { RetirementCalculator } from "@/components/RetirementCalculator";
import { SavingsGoalCalculator } from "@/components/SavingsGoalCalculator";
import { useState } from "react";

export default function Tools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'what-if',
      title: "What-If Scenarios",
      description: "Test different financial scenarios and see their impact",
      icon: TrendingUp,
      status: "Available",
      color: "text-green-600"
    },
    {
      id: 'ai-insights',
      title: "AI Financial Insights",
      description: "Get intelligent analysis and recommendations for your scenarios",
      icon: Brain,
      status: "Available",
      color: "text-purple-600"
    },
    {
      id: 'loan-calculator',
      title: "Loan Calculator",
      description: "Calculate mortgage payments, interest costs, and payoff strategies",
      icon: Home,
      status: "Available",
      color: "text-blue-600"
    },
    {
      id: 'investment-calculator',
      title: "Investment Calculator",
      description: "Project investment growth with compound interest and contributions",
      icon: PiggyBank,
      status: "Available",
      color: "text-purple-600"
    },
    {
      id: 'retirement-calculator',
      title: "Retirement Calculator",
      description: "Plan your retirement savings and withdrawal strategies",
      icon: Users,
      status: "Available",
      color: "text-orange-600"
    },
    {
      id: 'savings-calculator',
      title: "Savings Goal Calculator",
      description: "Calculate how much to save for specific financial goals",
      icon: Target,
      status: "Available",
      color: "text-red-600"
    }
  ];

  if (activeTool === 'what-if') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={() => setActiveTool(null)}
              className="mb-4"
            >
              ← Back to Tools
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">What-If Mode</h1>
            <p className="text-muted-foreground">
              Test financial scenarios and explore different futures
            </p>
          </div>
        </div>
        <ScenarioManager />
      </div>
    );
  }

  if (activeTool === 'loan-calculator') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={() => setActiveTool(null)}
              className="mb-4"
            >
              ← Back to Tools
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Loan Calculator</h1>
            <p className="text-muted-foreground">
              Calculate mortgage payments, interest costs, and payoff strategies
            </p>
          </div>
        </div>
        <LoanCalculator />
      </div>
    );
  }

  if (activeTool === 'investment-calculator') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={() => setActiveTool(null)}
              className="mb-4"
            >
              ← Back to Tools
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Investment Calculator</h1>
            <p className="text-muted-foreground">
              Project investment growth with compound interest and contributions
            </p>
          </div>
        </div>
        <InvestmentCalculator />
      </div>
    );
  }

  if (activeTool === 'retirement-calculator') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={() => setActiveTool(null)}
              className="mb-4"
            >
              ← Back to Tools
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Retirement Calculator</h1>
            <p className="text-muted-foreground">
              Plan your retirement savings, withdrawals, and income strategy
            </p>
          </div>
        </div>
        <RetirementCalculator />
      </div>
    );
  }

  if (activeTool === 'savings-calculator') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={() => setActiveTool(null)}
              className="mb-4"
            >
              ← Back to Tools
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Savings Goal Calculator</h1>
            <p className="text-muted-foreground">
              Plan and track progress toward your financial goals
            </p>
          </div>
        </div>
        <SavingsGoalCalculator />
      </div>
    );
  }

  if (activeTool === 'ai-insights') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              onClick={() => setActiveTool(null)}
              className="mb-4"
            >
              ← Back to Tools
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">AI Financial Insights</h1>
            <p className="text-muted-foreground">
              Intelligent analysis and recommendations for your financial scenarios
            </p>
          </div>
        </div>
        <AIInsightsDashboard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tools Hub</h1>
          <p className="text-muted-foreground">
            Advanced financial calculators and scenario testing tools
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className={`h-8 w-8 ${tool.color}`} />
                  <Badge variant={tool.status === "Available" ? "default" : "secondary"}>
                    {tool.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant={tool.status === "Available" ? "default" : "outline"}
                  className="w-full"
                  disabled={tool.status !== "Available"}
                  onClick={() => tool.status === "Available" && setActiveTool(tool.id)}
                >
                  {tool.status === "Available" ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Launch Tool
                    </>
                  ) : (
                    "Coming Soon"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What-If Mode Features</CardTitle>
          <CardDescription>
            Test different financial scenarios to see how they impact your goals and budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Income Scenarios
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Test salary increases</li>
                  <li>• Simulate bonus scenarios</li>
                  <li>• Explore side income</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  Expense Scenarios
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Analyze major purchases</li>
                  <li>• Test lifestyle changes</li>
                  <li>• Evaluate cost reductions</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  Debt Scenarios
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Compare payoff strategies</li>
                  <li>• Test extra payments</li>
                  <li>• Analyze interest savings</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  Investment Scenarios
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Project growth</li>
                  <li>• Test contribution levels</li>
                  <li>• Compare strategies</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Play className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">What-If Mode is Live!</h4>
                  <p className="text-green-700 text-sm">
                    Start testing financial scenarios with real-time impact analysis and timeline projections.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
