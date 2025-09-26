export interface ScenarioInput {
  id: string;
  name: string;
  description: string;
  type: 'income' | 'expense' | 'debt' | 'investment' | 'goal';
  startDate: Date;
  endDate?: Date;
  amount: number;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'yearly';
  category?: string;
  impactOn?: string[]; // Which goals/debts this affects
}

export interface ScenarioResult {
  scenarioId: string;
  netWorthImpact: number;
  goalTimelineChanges: Record<string, number>; // goalId -> months changed
  debtFreeDateChange?: number; // months changed
  riskScore: number; // 1-10 scale
  probability: number; // 0-100%
  keyMetrics: {
    monthlyCashFlow: number;
    savingsRate: number;
    debtToIncome: number;
    emergencyFundMonths: number;
  };
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  date: Date;
  type: 'income' | 'expense' | 'debt_payment' | 'goal_achieved' | 'milestone';
  amount: number;
  description: string;
  category?: string;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  description: string;
  baseScenario: ScenarioInput[];
  modifiedScenario: ScenarioInput[];
  createdAt: Date;
  results?: ScenarioResult;
}

export interface FinancialData {
  transactions: any[];
  goals: any[];
  debts: any[];
  dailyData: any[];
  monthlyStartingPoint: number;
  currency: string;
}

export class ScenarioEngine {
  constructor() {}

  createScenario(scenario: Omit<WhatIfScenario, 'id' | 'createdAt'>): WhatIfScenario {
    const newScenario: WhatIfScenario = {
      id: `scenario_${Date.now()}`,
      ...scenario,
      createdAt: new Date()
    };

    return newScenario;
  }

  calculateScenarioImpact(financialData: FinancialData, scenario: WhatIfScenario): ScenarioResult {
    // Calculate baseline metrics from current financial data
    const baselineMetrics = this.calculateBaselineMetrics(financialData);
    
    // Apply scenario changes
    const modifiedData = this.applyScenarioChanges(financialData, scenario.modifiedScenario);
    
    // Calculate modified metrics
    const modifiedMetrics = this.calculateModifiedMetrics(modifiedData);
    
    // Calculate impacts
    const netWorthImpact = modifiedMetrics.netWorth - baselineMetrics.netWorth;
    const goalTimelineChanges = this.calculateGoalTimelineChanges(baselineMetrics, modifiedMetrics);
    const debtFreeDateChange = this.calculateDebtFreeDateChange(baselineMetrics, modifiedMetrics);
    
    // Generate timeline events
    const timeline = this.generateTimelineEvents(scenario, modifiedData);
    
    // Calculate risk and probability
    const riskScore = this.calculateRiskScore(scenario);
    const probability = this.calculateProbability(scenario);

    return {
      scenarioId: scenario.id,
      netWorthImpact,
      goalTimelineChanges,
      debtFreeDateChange,
      riskScore,
      probability,
      keyMetrics: {
        monthlyCashFlow: modifiedMetrics.monthlyCashFlow,
        savingsRate: modifiedMetrics.savingsRate,
        debtToIncome: modifiedMetrics.debtToIncome,
        emergencyFundMonths: modifiedMetrics.emergencyFundMonths
      },
      timeline
    };
  }

  private calculateBaselineMetrics(data: FinancialData) {
    // Calculate current financial metrics
    const totalIncome = data.transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = data.transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalDebt = data.debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    const totalAssets = data.monthlyStartingPoint + totalIncome - totalExpenses;
    
    const monthlyIncome = totalIncome / 12; // Approximate monthly income
    const monthlyExpenses = totalExpenses / 12; // Approximate monthly expenses
    
    return {
      netWorth: totalAssets - totalDebt,
      monthlyCashFlow: monthlyIncome - monthlyExpenses,
      savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0,
      debtToIncome: monthlyIncome > 0 ? (totalDebt / monthlyIncome) * 100 : 0,
      emergencyFundMonths: monthlyExpenses > 0 ? (totalAssets / monthlyExpenses) : 0
    };
  }

  private applyScenarioChanges(data: FinancialData, scenarioChanges: ScenarioInput[]): FinancialData {
    const modifiedData = { ...data, transactions: [...data.transactions] };
    
    // For now, we'll simulate the changes by adjusting the metrics
    // In a real implementation, this would create actual transaction projections
    return modifiedData;
  }

  private calculateModifiedMetrics(data: FinancialData) {
    return this.calculateBaselineMetrics(data);
  }

  private calculateGoalTimelineChanges(baseline: any, modified: any): Record<string, number> {
    // Simplified calculation - in real implementation, this would calculate actual timeline changes
    return {
      'emergency_fund': modified.emergencyFundMonths > baseline.emergencyFundMonths ? -1 : 1,
      'debt_free': modified.debtToIncome < baseline.debtToIncome ? -6 : 6
    };
  }

  private calculateDebtFreeDateChange(baseline: any, modified: any): number {
    // Simplified calculation
    return modified.debtToIncome < baseline.debtToIncome ? -12 : 12;
  }

  private generateTimelineEvents(scenario: WhatIfScenario, data: FinancialData): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    
    // Add scenario start event
    events.push({
      date: new Date(),
      type: 'milestone',
      amount: 0,
      description: `Scenario "${scenario.name}" started`
    });
    
    // Add key events from the scenario
    scenario.modifiedScenario.forEach(change => {
      events.push({
        date: change.startDate,
        type: change.type as any,
        amount: change.amount,
        description: `${change.type}: ${change.name}`,
        category: change.category
      });
    });
    
    // Sort events by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private calculateRiskScore(scenario: WhatIfScenario): number {
    // Simplified risk calculation based on scenario complexity and impact
    let risk = 5; // Base risk
    
    scenario.modifiedScenario.forEach(change => {
      if (change.type === 'debt') risk += 2;
      if (change.type === 'expense') risk += 1;
      if (change.amount > 1000) risk += 1;
    });
    
    return Math.min(10, Math.max(1, risk));
  }

  private calculateProbability(scenario: WhatIfScenario): number {
    // Simplified probability calculation
    let probability = 70; // Base probability
    
    scenario.modifiedScenario.forEach(change => {
      if (change.type === 'income') probability -= 10;
      if (change.type === 'investment') probability -= 20;
    });
    
    return Math.min(100, Math.max(0, probability));
  }

  // Comparison methods for multiple scenarios
  compareScenarios(financialData: FinancialData, scenarios: WhatIfScenario[]): {
    scenarios: WhatIfScenario[];
    bestScenario: WhatIfScenario | null;
    worstScenario: WhatIfScenario | null;
    recommendations: string[];
  } {
    // Calculate results for all scenarios
    const scenariosWithResults = scenarios.map(scenario => {
      if (!scenario.results) {
        scenario.results = this.calculateScenarioImpact(financialData, scenario);
      }
      return scenario;
    });

    // Find best and worst scenarios based on net worth impact
    const sortedScenarios = scenariosWithResults.sort((a, b) => 
      (b.results?.netWorthImpact || 0) - (a.results?.netWorthImpact || 0)
    );

    const bestScenario = sortedScenarios[0] || null;
    const worstScenario = sortedScenarios[sortedScenarios.length - 1] || null;

    // Generate recommendations
    const recommendations = this.generateRecommendations(sortedScenarios);

    return {
      scenarios: sortedScenarios,
      bestScenario,
      worstScenario,
      recommendations
    };
  }

  private generateRecommendations(scenarios: WhatIfScenario[]): string[] {
    const recommendations: string[] = [];
    
    if (scenarios.length > 0) {
      const best = scenarios[0];
      if (best.results && best.results.netWorthImpact > 0) {
        recommendations.push(`Consider implementing "${best.name}" as it shows positive net worth impact.`);
      }
      
      if (scenarios.some(s => s.results && s.results.riskScore > 7)) {
        recommendations.push("Some scenarios show high risk. Consider more conservative approaches.");
      }
    }
    
    return recommendations;
  }

  // Timeline projection methods
  generateTimelineProjection(scenario: WhatIfScenario, years: number = 5): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const currentDate = new Date();
    
    // Add current financial snapshot
    events.push({
      date: currentDate,
      type: 'milestone',
      amount: 0,
      description: 'Current financial position'
    });
    
    // Generate monthly projections
    for (let i = 1; i <= years * 12; i++) {
      const projectionDate = new Date(currentDate);
      projectionDate.setMonth(projectionDate.getMonth() + i);
      
      // Add monthly events based on scenario
      scenario.modifiedScenario.forEach(change => {
        if (change.frequency === 'monthly') {
          events.push({
            date: projectionDate,
            type: change.type as any,
            amount: change.amount,
            description: `Monthly ${change.type}: ${change.name}`,
            category: change.category
          });
        }
      });
      
      // Add quarterly milestones
      if (i % 3 === 0) {
        events.push({
          date: projectionDate,
          type: 'milestone',
          amount: 0,
          description: `Quarter ${Math.ceil(i / 3)} review`
        });
      }
      
      // Add annual milestones
      if (i % 12 === 0) {
        events.push({
          date: projectionDate,
          type: 'milestone',
          amount: 0,
          description: `Year ${i / 12} financial review`
        });
      }
    }
    
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
