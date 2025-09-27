import React, { useState, useEffect } from 'react';
import { SavedScenario } from "@shared/types/scenario";
import { aiInsightsService, AIInsight, FinancialHealthScore } from "@core/services/aiInsights";
import { scenarioStorage } from "@core/services/scenarioStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Progress } from "@shared/components/ui/progress";
import { 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Zap, 
  Shield, 
  Star,
  Brain,
  Target,
  PiggyBank,
  Home,
  Users,
  Calendar,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { cn } from "@shared/lib/utils";
import { toast } from "@shared/hooks/use-toast";

interface AIInsightsDashboardProps {
  className?: string;
}

export function AIInsightsDashboard({ className }: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [healthScore, setHealthScore] = useState<FinancialHealthScore | null>(null);
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'recommendations'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const savedScenarios = await scenarioStorage.getScenarios();
      setScenarios(savedScenarios);

      if (savedScenarios.length > 0) {
        const aiInsights = await aiInsightsService.analyzeScenarios(savedScenarios);
        const health = await aiInsightsService.calculateFinancialHealth(savedScenarios);
        
        setInsights(aiInsights);
        setHealthScore(health);
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
      toast({
        title: "Error",
        description: "Failed to load AI insights",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'opportunity': return <Lightbulb className="h-5 w-5" />;
      case 'optimization': return <Zap className="h-5 w-5" />;
      case 'recommendation': return <Star className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'warning': return 'text-red-600';
      case 'opportunity': return 'text-green-600';
      case 'optimization': return 'text-blue-600';
      case 'recommendation': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: AIInsight['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings': return <PiggyBank className="h-4 w-4" />;
      case 'investment': return <TrendingUp className="h-4 w-4" />;
      case 'debt': return <Home className="h-4 w-4" />;
      case 'retirement': return <Users className="h-4 w-4" />;
      case 'risk': return <Shield className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (scenarios.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Scenarios to Analyze</h3>
        <p className="text-muted-foreground mb-4">
          Create some financial scenarios to get AI-powered insights and recommendations.
        </p>
        <Button onClick={() => window.location.href = '/tools'}>
          <Target className="h-4 w-4 mr-2" />
          Go to Tools Hub
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Financial Insights
          </h2>
          <p className="text-muted-foreground">
            Intelligent analysis of your financial scenarios
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Insights
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b">
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'overview'
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'insights'
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab('insights')}
        >
          Insights ({insights.length})
        </button>
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'recommendations'
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && healthScore && (
        <div className="space-y-6">
          {/* Financial Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Financial Health Score
              </CardTitle>
              <CardDescription>
                Overall assessment of your financial situation based on your scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{healthScore.overall}/100</div>
                  <Badge className={getRiskLevelColor(healthScore.riskLevel)}>
                    {healthScore.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
                <Progress value={healthScore.overall} className="h-3" />
                
                {/* Category Scores */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(healthScore.categories).map(([category, score]) => (
                    <div key={category} className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {getCategoryIcon(category)}
                        <span className="text-sm font-medium capitalize">{category}</span>
                      </div>
                      <div className="text-lg font-bold">{score}</div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{insights.filter(i => i.type === 'opportunity').length}</div>
                <div className="text-sm text-muted-foreground">Opportunities</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{insights.filter(i => i.type === 'warning').length}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{insights.filter(i => i.type === 'optimization').length}</div>
                <div className="text-sm text-muted-foreground">Optimizations</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{scenarios.length}</div>
                <div className="text-sm text-muted-foreground">Scenarios Analyzed</div>
              </CardContent>
            </Card>
          </div>

          {/* Top Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Top Recommendations</CardTitle>
              <CardDescription>
                Based on your financial scenarios and AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthScore.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <ArrowUpRight className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{rec}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
                <p className="text-muted-foreground">
                  Create more scenarios to generate AI-powered insights.
                </p>
              </CardContent>
            </Card>
          ) : (
            insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-full", getInsightColor(insight.type))}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {insight.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(insight.severity)}>
                      {insight.severity.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {getCategoryIcon(insight.category)}
                        {insight.category}
                      </Badge>
                      <Badge variant="outline">
                        Confidence: {(insight.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {insight.action && (
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {insight.action}
                        </div>
                      )}
                      {insight.impact && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {insight.impact}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {healthScore?.recommendations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Recommendations Yet</h3>
                <p className="text-muted-foreground">
                  Create more diverse scenarios to get personalized recommendations.
                </p>
              </CardContent>
            </Card>
          ) : (
            healthScore?.recommendations.map((recommendation, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <ArrowUpRight className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">Recommendation #{index + 1}</h4>
                      <p className="text-muted-foreground">{recommendation}</p>
                    </div>
                    <Badge variant="outline" className="self-start">
                      Priority {index + 1}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
