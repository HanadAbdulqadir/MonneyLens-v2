import React, { useState } from 'react';
import { WhatIfScenario, ScenarioEngine, FinancialData } from '@/utils/scenarioEngine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScenarioComparisonProps {
  scenarios: WhatIfScenario[];
  financialData: FinancialData;
  className?: string;
}

export function ScenarioComparison({ scenarios, financialData, className }: ScenarioComparisonProps) {
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(scenarios.map(s => s.id));
  const [comparisonResults, setComparisonResults] = useState<any>(null);
  const scenarioEngine = new ScenarioEngine();

  const handleCompare = () => {
    const selected = scenarios.filter(s => selectedScenarios.includes(s.id));
    const results = scenarioEngine.compareScenarios(financialData, selected);
    setComparisonResults(results);
  };

  const toggleScenario = (scenarioId: string) => {
    setSelectedScenarios(prev => 
      prev.includes(scenarioId) 
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return 'text-green-600';
    if (riskScore <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImpactIcon = (impact: number) => {
    if (impact > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (impact < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <BarChart3 className="h-4 w-4 text-gray-600" />;
  };

  if (scenarios.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Scenario Comparison</CardTitle>
          <CardDescription>No scenarios available for comparison.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Scenario Comparison</CardTitle>
        <CardDescription>
          Compare multiple What-If scenarios to find the best financial strategy
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Scenario Selection */}
        <div className="space-y-4">
          <h4 className="font-medium">Select Scenarios to Compare</h4>
          <div className="grid gap-3">
            {scenarios.map(scenario => (
              <div key={scenario.id} className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedScenarios.includes(scenario.id)}
                  onCheckedChange={() => toggleScenario(scenario.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{scenario.name}</span>
                    {scenario.results && (
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={scenario.results.netWorthImpact >= 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {getImpactIcon(scenario.results.netWorthImpact)}
                          {formatCurrency(scenario.results.netWorthImpact)}
                        </Badge>
                        <Badge variant="outline" className={getRiskColor(scenario.results.riskScore)}>
                          Risk: {scenario.results.riskScore}/10
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={handleCompare}
            disabled={selectedScenarios.length < 2}
            className="w-full"
          >
            Compare Selected Scenarios ({selectedScenarios.length})
          </Button>
        </div>

        {/* Comparison Results */}
        {comparisonResults && (
          <div className="space-y-6">
            {/* Best/Worst Scenario Highlights */}
            <div className="grid md:grid-cols-2 gap-4">
              {comparisonResults.bestScenario && (
                <Card className="bg-green-50 border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                      <Star className="h-4 w-4" />
                      Best Scenario
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="font-medium">{comparisonResults.bestScenario.name}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>Net Worth Impact:</span>
                        <span className="font-medium text-green-600">
                          +{formatCurrency(comparisonResults.bestScenario.results?.netWorthImpact || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Risk Score:</span>
                        <span className={getRiskColor(comparisonResults.bestScenario.results?.riskScore || 0)}>
                          {comparisonResults.bestScenario.results?.riskScore}/10
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {comparisonResults.worstScenario && (
                <Card className="bg-red-50 border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      Highest Risk Scenario
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="font-medium">{comparisonResults.worstScenario.name}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span>Net Worth Impact:</span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(comparisonResults.worstScenario.results?.netWorthImpact || 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Risk Score:</span>
                        <span className={getRiskColor(comparisonResults.worstScenario.results?.riskScore || 0)}>
                          {comparisonResults.worstScenario.results?.riskScore}/10
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Detailed Comparison Table */}
            <div className="space-y-4">
              <h4 className="font-medium">Detailed Comparison</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Scenario</th>
                      <th className="text-right p-2">Net Worth Impact</th>
                      <th className="text-right p-2">Monthly Cash Flow</th>
                      <th className="text-right p-2">Savings Rate</th>
                      <th className="text-right p-2">Debt-to-Income</th>
                      <th className="text-right p-2">Risk Score</th>
                      <th className="text-right p-2">Probability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonResults.scenarios.map((scenario: WhatIfScenario, index: number) => (
                      <tr key={scenario.id} className={cn(
                        "border-b",
                        scenario.id === comparisonResults.bestScenario?.id && "bg-green-50",
                        scenario.id === comparisonResults.worstScenario?.id && "bg-red-50"
                      )}>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            {scenario.id === comparisonResults.bestScenario?.id && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {scenario.id === comparisonResults.worstScenario?.id && (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">{scenario.name}</span>
                          </div>
                        </td>
                        <td className={cn(
                          "p-2 text-right font-medium",
                          scenario.results?.netWorthImpact >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {scenario.results?.netWorthImpact >= 0 ? '+' : ''}
                          {formatCurrency(scenario.results?.netWorthImpact || 0)}
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrency(scenario.results?.keyMetrics.monthlyCashFlow || 0)}
                        </td>
                        <td className="p-2 text-right">
                          {scenario.results?.keyMetrics.savingsRate?.toFixed(1)}%
                        </td>
                        <td className="p-2 text-right">
                          {scenario.results?.keyMetrics.debtToIncome?.toFixed(1)}%
                        </td>
                        <td className={cn("p-2 text-right font-medium", getRiskColor(scenario.results?.riskScore || 0))}>
                          {scenario.results?.riskScore}/10
                        </td>
                        <td className={cn("p-2 text-right font-medium", getProbabilityColor(scenario.results?.probability || 0))}>
                          {scenario.results?.probability}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            {comparisonResults.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {comparisonResults.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Key Metrics Comparison Chart */}
            <div className="space-y-4">
              <h4 className="font-medium">Key Metrics Comparison</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {comparisonResults.scenarios.map((scenario: WhatIfScenario) => (
                  <Card key={scenario.id} className="text-center">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{scenario.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            +{formatCurrency(scenario.results?.netWorthImpact || 0)}
                          </p>
                          <p className="text-xs text-muted-foreground">Net Worth Impact</p>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Risk:</span>
                          <span className={getRiskColor(scenario.results?.riskScore || 0)}>
                            {scenario.results?.riskScore}/10
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Probability:</span>
                          <span className={getProbabilityColor(scenario.results?.probability || 0)}>
                            {scenario.results?.probability}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                Save Comparison Report
              </Button>
              <Button className="flex-1">
                Implement Best Scenario
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!comparisonResults && selectedScenarios.length >= 2 && (
          <Card className="text-center py-8">
            <CardContent>
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-2">Ready to Compare</h4>
              <p className="text-sm text-muted-foreground">
                Click the "Compare Selected Scenarios" button to see detailed analysis and recommendations.
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
