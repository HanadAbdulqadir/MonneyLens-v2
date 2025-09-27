import React, { useState } from 'react';
import { useScenarioEngine, WhatIfScenario, ScenarioInput } from "@shared/hooks/useScenarioEngine";
import { TimelineVisualization } from "@components/TimelineVisualization";
import { ScenarioComparison } from "@components/ScenarioComparison";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  CreditCard,
  PiggyBank,
  Search,
  Filter
} from 'lucide-react';
import { cn } from "@shared/lib/utils";

interface ScenarioManagerProps {
  className?: string;
}

export function ScenarioManager({ className }: ScenarioManagerProps) {
  const {
    scenarios,
    currentScenario,
    loading,
    createScenario,
    updateScenario,
    deleteScenario,
    setScenario,
    compareScenarios,
    financialData
  } = useScenarioEngine();

  const [activeTab, setActiveTab] = useState('scenarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingScenario, setEditingScenario] = useState<WhatIfScenario | null>(null);

  // Filter scenarios based on search and filter
  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         scenario.modifiedScenario.some(s => s.type === filterType);
    
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return 'text-green-600 bg-green-50';
    if (riskScore <= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScenarioIcon = (scenario: WhatIfScenario) => {
    const types = scenario.modifiedScenario.map(s => s.type);
    if (types.includes('income')) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (types.includes('investment')) return <PiggyBank className="h-4 w-4 text-blue-600" />;
    if (types.includes('debt')) return <CreditCard className="h-4 w-4 text-orange-600" />;
    if (types.includes('goal')) return <Target className="h-4 w-4 text-purple-600" />;
    return <BarChart3 className="h-4 w-4 text-gray-600" />;
  };

  const handleCreateScenario = async () => {
    // Simple creation for demo - in real app, this would open a wizard
    const newScenario = await createScenario(
      'New Financial Scenario',
      'Test different financial strategies and their impact',
      [
        {
          id: 'sample_change',
          name: 'Sample Change',
          description: 'Example financial change',
          type: 'income',
          startDate: new Date(),
          amount: 100,
          frequency: 'monthly',
          category: 'Salary'
        }
      ]
    );
    
    setScenario(newScenario);
    setActiveTab('timeline');
    setIsCreating(false);
  };

  const handleDeleteScenario = (scenarioId: string) => {
    if (confirm('Are you sure you want to delete this scenario?')) {
      deleteScenario(scenarioId);
    }
  };

  const handleCompareScenarios = (scenarioIds: string[]) => {
    const results = compareScenarios(scenarioIds);
    console.log('Comparison results:', results);
    // In a real app, this would update state to show comparison results
  };

  if (loading && scenarios.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading scenarios...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">What-If Mode</h2>
          <p className="text-muted-foreground">
            Test financial scenarios and explore different futures
          </p>
        </div>
        <Button onClick={handleCreateScenario} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          New Scenario
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scenarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="debt">Debt</option>
          <option value="investment">Investment</option>
          <option value="goal">Goal</option>
        </select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenarios">My Scenarios</TabsTrigger>
          <TabsTrigger value="timeline" disabled={!currentScenario}>
            Timeline View
          </TabsTrigger>
          <TabsTrigger value="compare" disabled={scenarios.length < 2}>
            Compare Scenarios
          </TabsTrigger>
        </TabsList>

        {/* Scenarios List */}
        <TabsContent value="scenarios" className="space-y-4">
          {filteredScenarios.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No scenarios found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first scenario to start testing financial strategies'
                  }
                </p>
                <Button onClick={handleCreateScenario}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Scenario
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredScenarios.map(scenario => (
                <Card 
                  key={scenario.id} 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    currentScenario?.id === scenario.id && "ring-2 ring-primary"
                  )}
                  onClick={() => {
                    setScenario(scenario);
                    setActiveTab('timeline');
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getScenarioIcon(scenario)}
                        <CardTitle className="text-sm">{scenario.name}</CardTitle>
                      </div>
                      <Badge 
                        variant={scenario.results?.netWorthImpact >= 0 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {scenario.results?.netWorthImpact >= 0 ? '+' : ''}
                        {formatCurrency(scenario.results?.netWorthImpact || 0)}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs line-clamp-2">
                      {scenario.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Risk:</span>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", getRiskColor(scenario.results?.riskScore || 0))}
                        >
                          {scenario.results?.riskScore}/10
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Probability:</span>
                        <span>{scenario.results?.probability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(scenario.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setScenario(scenario);
                          setActiveTab('timeline');
                        }}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingScenario(scenario);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScenario(scenario.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline">
          {currentScenario ? (
            <TimelineVisualization scenario={currentScenario} />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No scenario selected</h3>
                <p className="text-muted-foreground text-sm">
                  Select a scenario from the list to view its timeline
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comparison View */}
        <TabsContent value="compare">
          <ScenarioComparison 
            scenarios={scenarios} 
            financialData={financialData}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex-col h-auto p-4">
              <TrendingUp className="h-6 w-6 mb-2 text-green-600" />
              <span className="text-xs">Salary Increase</span>
            </Button>
            <Button variant="outline" className="flex-col h-auto p-4">
              <CreditCard className="h-6 w-6 mb-2 text-orange-600" />
              <span className="text-xs">Debt Payoff</span>
            </Button>
            <Button variant="outline" className="flex-col h-auto p-4">
              <PiggyBank className="h-6 w-6 mb-2 text-blue-600" />
              <span className="text-xs">Investment</span>
            </Button>
            <Button variant="outline" className="flex-col h-auto p-4">
              <Target className="h-6 w-6 mb-2 text-purple-600" />
              <span className="text-xs">Goal Planning</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {scenarios.filter(s => s.results?.netWorthImpact > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Positive Scenarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {scenarios.filter(s => (s.results?.riskScore || 0) > 6).length}
            </div>
            <p className="text-xs text-muted-foreground">High Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {scenarios.length}
            </div>
            <p className="text-xs text-muted-foreground">Total Scenarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {Math.max(...scenarios.map(s => s.results?.netWorthImpact || 0)) > 0 ? '+' : ''}
              {formatCurrency(Math.max(...scenarios.map(s => s.results?.netWorthImpact || 0)))}
            </div>
            <p className="text-xs text-muted-foreground">Best Impact</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
