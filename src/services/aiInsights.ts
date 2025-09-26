import { SavedScenario } from '@/types/scenario';

export interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'opportunity' | 'optimization';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: 'savings' | 'investment' | 'debt' | 'retirement' | 'risk';
  action?: string;
  impact?: string;
  confidence: number;
  relatedScenarios?: string[];
}

export interface FinancialHealthScore {
  overall: number;
  categories: {
    savings: number;
    investment: number;
    debt: number;
    retirement: number;
    risk: number;
  };
  recommendations: string[];
  riskLevel: 'low' | 'moderate' | 'high';
}

class AIIinsightsService {
  // Analyze scenarios and generate insights
  async analyzeScenarios(scenarios: SavedScenario[]): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];
    
    // Group scenarios by type for analysis
    const scenariosByType = this.groupScenariosByType(scenarios);
    
    // Generate insights for each scenario type
    insights.push(...this.analyzeSavingsScenarios(scenariosByType.savings));
    insights.push(...this.analyzeInvestmentScenarios(scenariosByType.investment));
    insights.push(...this.analyzeLoanScenarios(scenariosByType.loan));
    insights.push(...this.analyzeRetirementScenarios(scenariosByType.retirement));
    insights.push(...this.analyzeWhatIfScenarios(scenariosByType['what-if']));
    
    // Generate cross-scenario insights
    insights.push(...this.generateCrossScenarioInsights(scenarios));
    
    // Sort by severity and confidence
    return insights.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[b.severity] !== severityOrder[a.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.confidence - a.confidence;
    });
  }

  // Calculate financial health score
  async calculateFinancialHealth(scenarios: SavedScenario[]): Promise<FinancialHealthScore> {
    const scores = {
      savings: this.calculateSavingsHealth(scenarios),
      investment: this.calculateInvestmentHealth(scenarios),
      debt: this.calculateDebtHealth(scenarios),
      retirement: this.calculateRetirementHealth(scenarios),
      risk: this.calculateRiskHealth(scenarios)
    };

    const overall = Math.round(
      (scores.savings + scores.investment + scores.debt + scores.retirement + scores.risk) / 5
    );

    const recommendations = this.generateHealthRecommendations(scores, scenarios);
    const riskLevel = this.determineRiskLevel(scores.risk);

    return {
      overall,
      categories: scores,
      recommendations,
      riskLevel
    };
  }

  // Generate personalized recommendations
  async generateRecommendations(scenarios: SavedScenario[]): Promise<string[]> {
    const insights = await this.analyzeScenarios(scenarios);
    const healthScore = await this.calculateFinancialHealth(scenarios);
    
    const recommendations: string[] = [];
    
    // Add high-severity insights as recommendations
    insights
      .filter(insight => insight.severity === 'high')
      .forEach(insight => {
        recommendations.push(`${insight.title}: ${insight.description}`);
      });

    // Add health-based recommendations
    if (healthScore.overall < 60) {
      recommendations.push("Consider focusing on improving your overall financial health by addressing key areas identified in your scenarios.");
    }

    // Add opportunity-based recommendations
    insights
      .filter(insight => insight.type === 'opportunity')
      .forEach(insight => {
        recommendations.push(`Opportunity: ${insight.description}`);
      });

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  // Private analysis methods
  private groupScenariosByType(scenarios: SavedScenario[]) {
    return scenarios.reduce((acc, scenario) => {
      if (!acc[scenario.type]) {
        acc[scenario.type] = [];
      }
      acc[scenario.type].push(scenario);
      return acc;
    }, {} as Record<string, SavedScenario[]>);
  }

  private analyzeSavingsScenarios(scenarios: SavedScenario[]): AIInsight[] {
    const insights: AIInsight[] = [];
    
    scenarios.forEach(scenario => {
      const data = scenario.data;
      
      // Analyze savings rate
      if (data.monthlyContribution && data.targetAmount) {
        const monthsToGoal = data.timeframe;
        const requiredMonthly = (data.targetAmount - data.currentSavings) / monthsToGoal;
        
        if (data.monthlyContribution < requiredMonthly) {
          insights.push({
            id: `savings-${scenario.id}-1`,
            type: 'warning',
            title: 'Insufficient Savings Rate',
            description: `Your current savings rate may not reach your goal of $${data.targetAmount} within ${monthsToGoal} months. Consider increasing monthly contributions.`,
            severity: 'medium',
            category: 'savings',
            action: `Increase monthly savings by $${(requiredMonthly - data.monthlyContribution).toFixed(0)}`,
            impact: 'Goal achievement timeline',
            confidence: 0.85,
            relatedScenarios: [scenario.id]
          });
        }
      }

      // Analyze emergency fund adequacy
      if (data.targetAmount && data.currentSavings) {
        const progress = (data.currentSavings / data.targetAmount) * 100;
        if (progress < 25 && scenario.name.toLowerCase().includes('emergency')) {
          insights.push({
            id: `savings-${scenario.id}-2`,
            type: 'warning',
            title: 'Low Emergency Fund Progress',
            description: 'Your emergency fund is less than 25% funded. Consider prioritizing this goal for financial security.',
            severity: 'high',
            category: 'savings',
            action: 'Increase emergency fund contributions',
            impact: 'Financial security and risk mitigation',
            confidence: 0.9,
            relatedScenarios: [scenario.id]
          });
        }
      }
    });

    return insights;
  }

  private analyzeInvestmentScenarios(scenarios: SavedScenario[]): AIInsight[] {
    const insights: AIInsight[] = [];
    
    scenarios.forEach(scenario => {
      const data = scenario.data;
      
      // Analyze investment diversification
      if (data.annualReturn && data.investmentPeriod) {
        if (data.annualReturn > 12) {
          insights.push({
            id: `investment-${scenario.id}-1`,
            type: 'warning',
            title: 'High Return Expectations',
            description: `Your expected annual return of ${data.annualReturn}% may be optimistic. Consider more conservative projections.`,
            severity: 'medium',
            category: 'risk',
            action: 'Review return assumptions',
            impact: 'Realistic planning',
            confidence: 0.75,
            relatedScenarios: [scenario.id]
          });
        }

        if (data.annualReturn < 4 && data.investmentPeriod > 10) {
          insights.push({
            id: `investment-${scenario.id}-2`,
            type: 'opportunity',
            title: 'Conservative Investment Strategy',
            description: 'Consider exploring higher-return investment options for long-term growth.',
            severity: 'low',
            category: 'investment',
            action: 'Research diversified investment portfolios',
            impact: 'Potential growth improvement',
            confidence: 0.7,
            relatedScenarios: [scenario.id]
          });
        }
      }
    });

    return insights;
  }

  private analyzeLoanScenarios(scenarios: SavedScenario[]): AIInsight[] {
    const insights: AIInsight[] = [];
    
    scenarios.forEach(scenario => {
      const data = scenario.data;
      
      // Analyze debt-to-income ratio opportunities
      if (data.extraPayments && data.extraPayments > 0) {
        insights.push({
          id: `loan-${scenario.id}-1`,
          type: 'optimization',
          title: 'Debt Acceleration Strategy',
          description: 'Your extra payment strategy can significantly reduce interest costs and payoff time.',
          severity: 'medium',
          category: 'debt',
          action: 'Continue accelerated payoff strategy',
          impact: 'Interest savings and faster debt freedom',
          confidence: 0.85,
          relatedScenarios: [scenario.id]
        });
      }

      // Analyze high-interest debt
      if (data.interestRate && data.interestRate > 8) {
        insights.push({
          id: `loan-${scenario.id}-2`,
          type: 'warning',
          title: 'High-Interest Debt',
          description: `Consider prioritizing payoff of this ${data.interestRate}% interest debt.`,
          severity: 'high',
          category: 'debt',
          action: 'Explore refinancing options',
          impact: 'Interest cost reduction',
          confidence: 0.9,
          relatedScenarios: [scenario.id]
        });
      }
    });

    return insights;
  }

  private analyzeRetirementScenarios(scenarios: SavedScenario[]): AIInsight[] {
    const insights: AIInsight[] = [];
    
    scenarios.forEach(scenario => {
      const data = scenario.data;
      
      // Analyze retirement savings adequacy
      if (data.currentSavings && data.desiredIncome) {
        const safeWithdrawal = data.currentSavings * 0.04; // 4% rule
        if (safeWithdrawal < data.desiredIncome * 0.7) {
          insights.push({
            id: `retirement-${scenario.id}-1`,
            type: 'warning',
            title: 'Retirement Income Gap',
            description: 'Your current savings may not support your desired retirement lifestyle.',
            severity: 'high',
            category: 'retirement',
            action: 'Increase retirement contributions or adjust expectations',
            impact: 'Retirement security',
            confidence: 0.8,
            relatedScenarios: [scenario.id]
          });
        }
      }

      // Analyze retirement timeline
      if (data.currentAge && data.retirementAge) {
        const yearsToRetirement = data.retirementAge - data.currentAge;
        if (yearsToRetirement < 10 && data.currentSavings < 500000) {
          insights.push({
            id: `retirement-${scenario.id}-2`,
            type: 'warning',
            title: 'Approaching Retirement with Limited Savings',
            description: 'Consider aggressive savings strategy or delayed retirement.',
            severity: 'high',
            category: 'retirement',
            action: 'Maximize retirement contributions',
            impact: 'Retirement readiness',
            confidence: 0.85,
            relatedScenarios: [scenario.id]
          });
        }
      }
    });

    return insights;
  }

  private analyzeWhatIfScenarios(scenarios: SavedScenario[]): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Analyze scenario comparisons and identify optimal strategies
    scenarios.forEach(scenario => {
      insights.push({
        id: `whatif-${scenario.id}-1`,
        type: 'optimization',
        title: 'Scenario Testing Active',
        description: 'You are actively testing financial scenarios - great practice for informed decision making.',
        severity: 'low',
        category: 'risk',
        confidence: 0.9,
        relatedScenarios: [scenario.id]
      });
    });

    return insights;
  }

  private generateCrossScenarioInsights(scenarios: SavedScenario[]): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Analyze overall financial picture across all scenarios
    const totalDebt = scenarios
      .filter(s => s.type === 'loan')
      .reduce((sum, s) => sum + (s.data.loanAmount || 0), 0);
    
    const totalSavings = scenarios
      .filter(s => s.type === 'savings')
      .reduce((sum, s) => sum + (s.data.currentSavings || 0), 0);
    
    const totalInvestments = scenarios
      .filter(s => s.type === 'investment')
      .reduce((sum, s) => sum + (s.data.initialInvestment || 0), 0);

    // Debt-to-asset ratio insight
    if (totalDebt > 0 && totalSavings + totalInvestments > 0) {
      const ratio = totalDebt / (totalSavings + totalInvestments);
      if (ratio > 0.5) {
        insights.push({
          id: 'cross-1',
          type: 'warning',
          title: 'High Debt-to-Asset Ratio',
          description: 'Your total debt exceeds 50% of your liquid assets. Consider debt reduction strategies.',
          severity: 'high',
          category: 'debt',
          confidence: 0.8
        });
      }
    }

    // Savings rate insight
    const monthlySavings = scenarios
      .filter(s => s.type === 'savings')
      .reduce((sum, s) => sum + (s.data.monthlyContribution || 0), 0);
    
    if (monthlySavings > 0) {
      insights.push({
        id: 'cross-2',
        type: 'optimization',
        title: 'Active Savings Strategy',
        description: `You are saving $${monthlySavings} monthly across your goals - excellent financial habit.`,
        severity: 'low',
        category: 'savings',
        confidence: 0.9
      });
    }

    return insights;
  }

  private calculateSavingsHealth(scenarios: SavedScenario[]): number {
    const savingsScenarios = scenarios.filter(s => s.type === 'savings');
    if (savingsScenarios.length === 0) return 50;

    let score = 0;
    savingsScenarios.forEach(scenario => {
      const data = scenario.data;
      if (data.currentSavings && data.targetAmount) {
        const progress = (data.currentSavings / data.targetAmount) * 100;
        score += Math.min(progress, 100);
      }
    });

    return Math.round(score / savingsScenarios.length);
  }

  private calculateInvestmentHealth(scenarios: SavedScenario[]): number {
    const investmentScenarios = scenarios.filter(s => s.type === 'investment');
    if (investmentScenarios.length === 0) return 50;

    let score = 0;
    investmentScenarios.forEach(scenario => {
      const data = scenario.data;
      // Score based on investment period and return assumptions
      if (data.investmentPeriod && data.annualReturn) {
        const periodScore = Math.min(data.investmentPeriod / 10 * 20, 40); // Up to 40 points for long-term investing
        const returnScore = Math.min((data.annualReturn - 2) * 5, 30); // Up to 30 points for reasonable returns
        const contributionScore = data.monthlyContribution > 0 ? 30 : 0; // 30 points for regular contributions
        score += periodScore + returnScore + contributionScore;
      }
    });

    return Math.round(score / investmentScenarios.length);
  }

  private calculateDebtHealth(scenarios: SavedScenario[]): number {
    const loanScenarios = scenarios.filter(s => s.type === 'loan');
    if (loanScenarios.length === 0) return 75; // No debt is good debt health

    let totalScore = 0;
    loanScenarios.forEach(scenario => {
      const data = scenario.data;
      let scenarioScore = 100;

      // Penalize high interest rates
      if (data.interestRate > 10) scenarioScore -= 30;
      else if (data.interestRate > 6) scenarioScore -= 15;

      // Reward extra payments
      if (data.extraPayments && data.extraPayments > 0) scenarioScore += 10;

      totalScore += Math.max(0, scenarioScore);
    });

    return Math.round(totalScore / loanScenarios.length);
  }

  private calculateRetirementHealth(scenarios: SavedScenario[]): number {
    const retirementScenarios = scenarios.filter(s => s.type === 'retirement');
    if (retirementScenarios.length === 0) return 40;

    let score = 0;
    retirementScenarios.forEach(scenario => {
      const data = scenario.data;
      if (data.currentSavings && data.desiredIncome) {
        const multiple = data.currentSavings / (data.desiredIncome * 25); // 25x desired income
        score += Math.min(multiple * 100, 100);
      }
    });

    return Math.round(score / retirementScenarios.length);
  }

  private calculateRiskHealth(scenarios: SavedScenario[]): number {
    // Calculate risk health based on diversification and conservative assumptions
    let score = 70; // Base score

    const hasSavings = scenarios.filter(s => s.type === 'savings').length > 0;
    const hasInvestments = scenarios.filter(s => s.type === 'investment').length > 0;
    const hasRetirement = scenarios.filter(s => s.type === 'retirement').length > 0;

    // Reward diversification
    if (hasSavings && hasInvestments && hasRetirement) score += 15;
    else if ((hasSavings && hasInvestments) || (hasSavings && hasRetirement)) score += 10;
    else if (hasSavings || hasInvestments || hasRetirement) score += 5;

    // Penalize overly optimistic assumptions
    scenarios.forEach(scenario => {
      const data = scenario.data;
      if (data.annualReturn && data.annualReturn > 15) score -= 10;
      if (data.interestRate && data.interestRate > 12) score -= 5;
    });

    return Math.max(0, Math.min(100, score));
  }

  private generateHealthRecommendations(
    scores: { savings: number; investment: number; debt: number; retirement: number; risk: number },
    scenarios: SavedScenario[]
  ): string[] {
    const recommendations: string[] = [];

    if (scores.savings < 60) {
      recommendations.push("Focus on building your emergency fund and short-term savings goals.");
    }

    if (scores.investment < 60) {
      recommendations.push("Consider developing a long-term investment strategy with regular contributions.");
    }

    if (scores.debt < 60) {
      recommendations.push("Prioritize paying down high-interest debt to improve your financial health.");
    }

    if (scores.retirement < 60) {
      recommendations.push("Increase retirement contributions or consider working longer to improve retirement readiness.");
    }

    if (scores.risk < 60) {
      recommendations.push("Review your financial assumptions and consider more conservative planning approaches.");
    }

    // Add scenario-specific recommendations
    if (scenarios.length === 0) {
      recommendations.push("Start creating financial scenarios to get personalized insights and recommendations.");
    }

    return recommendations;
  }

  private determineRiskLevel(riskScore: number): 'low' | 'moderate' | 'high' {
    if (riskScore >= 80) return 'low';
    if (riskScore >= 60) return 'moderate';
    return 'high';
  }
}

// Create singleton instance
export const aiInsightsService = new AIIinsightsService();
