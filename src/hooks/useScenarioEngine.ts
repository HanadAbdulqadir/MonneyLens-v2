import { useState, useEffect, useCallback } from 'react';
import { useFinancial } from '@/contexts/SupabaseFinancialContext';
import { 
  ScenarioEngine, 
  WhatIfScenario, 
  ScenarioInput, 
  FinancialData 
} from '@/utils/scenarioEngine';

export function useScenarioEngine() {
  const financialContext = useFinancial();
  const [scenarioEngine] = useState(() => new ScenarioEngine());
  const [scenarios, setScenarios] = useState<WhatIfScenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<WhatIfScenario | null>(null);

  // Convert financial context data to FinancialData format
  const getFinancialData = useCallback((): FinancialData => {
    return {
      transactions: financialContext.transactions,
      goals: financialContext.goals,
      debts: financialContext.debts,
      dailyData: financialContext.dailyData,
      monthlyStartingPoint: financialContext.monthlyStartingPoint,
      currency: financialContext.currency
    };
  }, [financialContext]);

  // Create a new scenario
  const createScenario = useCallback(async (
    name: string,
    description: string,
    modifiedScenario: ScenarioInput[]
  ): Promise<WhatIfScenario> => {
    setLoading(true);
    try {
      const financialData = getFinancialData();
      
      // Create base scenario from current financial state
      const baseScenario: ScenarioInput[] = [
        {
          id: 'current_state',
          name: 'Current Financial State',
          description: 'Baseline financial position',
          type: 'goal',
          startDate: new Date(),
          amount: 0,
          frequency: 'one-time'
        }
      ];

      const scenarioData = {
        name,
        description,
        baseScenario,
        modifiedScenario
      };

      const newScenario = scenarioEngine.createScenario(scenarioData);
      
      // Calculate scenario impact
      newScenario.results = scenarioEngine.calculateScenarioImpact(financialData, newScenario);
      
      setScenarios(prev => [newScenario, ...prev]);
      setCurrentScenario(newScenario);
      
      return newScenario;
    } finally {
      setLoading(false);
    }
  }, [scenarioEngine, getFinancialData]);

  // Update an existing scenario
  const updateScenario = useCallback(async (
    scenarioId: string,
    updates: Partial<Omit<WhatIfScenario, 'id' | 'createdAt'>>
  ): Promise<WhatIfScenario | null> => {
    setLoading(true);
    try {
      const financialData = getFinancialData();
      const scenarioIndex = scenarios.findIndex(s => s.id === scenarioId);
      
      if (scenarioIndex === -1) return null;

      const updatedScenario = {
        ...scenarios[scenarioIndex],
        ...updates,
        id: scenarioId // Ensure ID remains the same
      };

      // Recalculate impact
      updatedScenario.results = scenarioEngine.calculateScenarioImpact(financialData, updatedScenario);
      
      const newScenarios = [...scenarios];
      newScenarios[scenarioIndex] = updatedScenario;
      setScenarios(newScenarios);

      if (currentScenario?.id === scenarioId) {
        setCurrentScenario(updatedScenario);
      }

      return updatedScenario;
    } finally {
      setLoading(false);
    }
  }, [scenarioEngine, scenarios, currentScenario, getFinancialData]);

  // Delete a scenario
  const deleteScenario = useCallback((scenarioId: string): void => {
    setScenarios(prev => prev.filter(s => s.id !== scenarioId));
    
    if (currentScenario?.id === scenarioId) {
      setCurrentScenario(null);
    }
  }, [currentScenario]);

  // Set current scenario
  const setScenario = useCallback((scenario: WhatIfScenario | null): void => {
    setCurrentScenario(scenario);
  }, []);

  // Compare multiple scenarios
  const compareScenarios = useCallback((scenarioIds: string[]) => {
    const financialData = getFinancialData();
    const selectedScenarios = scenarios.filter(s => scenarioIds.includes(s.id));
    
    return scenarioEngine.compareScenarios(financialData, selectedScenarios);
  }, [scenarioEngine, scenarios, getFinancialData]);

  // Generate timeline projection
  const generateTimelineProjection = useCallback((scenario: WhatIfScenario, years: number = 5) => {
    return scenarioEngine.generateTimelineProjection(scenario, years);
  }, [scenarioEngine]);

  // Create sample scenarios for demonstration
  const createSampleScenarios = useCallback(async () => {
    const financialData = getFinancialData();
    
    const sampleScenarios: Omit<WhatIfScenario, 'id' | 'createdAt' | 'results'>[] = [
      {
        name: 'Salary Increase Scenario',
        description: 'Test the impact of a 10% salary increase',
        baseScenario: [],
        modifiedScenario: [
          {
            id: 'salary_increase',
            name: '10% Salary Increase',
            description: 'Hypothetical salary increase',
            type: 'income',
            startDate: new Date(),
            amount: 500, // Assuming $500 monthly increase
            frequency: 'monthly',
            category: 'Salary'
          }
        ]
      },
      {
        name: 'Debt Payoff Strategy',
        description: 'Accelerated debt payoff with extra payments',
        baseScenario: [],
        modifiedScenario: [
          {
            id: 'extra_debt_payment',
            name: 'Extra Debt Payment',
            description: 'Additional $200 monthly debt payment',
            type: 'debt',
            startDate: new Date(),
            amount: -200, // Negative for debt reduction
            frequency: 'monthly',
            category: 'Debt Reduction'
          }
        ]
      },
      {
        name: 'Investment Growth',
        description: 'Regular monthly investment contributions',
        baseScenario: [],
        modifiedScenario: [
          {
            id: 'monthly_investment',
            name: 'Monthly Investment',
            description: '$300 monthly investment contribution',
            type: 'investment',
            startDate: new Date(),
            amount: 300,
            frequency: 'monthly',
            category: 'Investments'
          }
        ]
      }
    ];

    const createdScenarios = await Promise.all(
      sampleScenarios.map(async scenarioData => {
        const scenario = scenarioEngine.createScenario(scenarioData);
        scenario.results = scenarioEngine.calculateScenarioImpact(financialData, scenario);
        return scenario;
      })
    );

    setScenarios(createdScenarios);
    return createdScenarios;
  }, [scenarioEngine, getFinancialData]);

  // Load scenarios on component mount
  useEffect(() => {
    // For now, create sample scenarios. In production, this would load from database
    createSampleScenarios();
  }, [createSampleScenarios]);

  return {
    // State
    scenarios,
    currentScenario,
    loading,
    
    // Actions
    createScenario,
    updateScenario,
    deleteScenario,
    setScenario,
    compareScenarios,
    generateTimelineProjection,
    createSampleScenarios,
    
    // Data
    financialData: getFinancialData(),
    scenarioEngine
  };
}

export type { WhatIfScenario, ScenarioInput };
