export interface SavedScenario {
  id: string;
  name: string;
  description?: string;
  type: 'loan' | 'investment' | 'retirement' | 'savings' | 'what-if';
  createdAt: Date;
  updatedAt: Date;
  data: any; // Calculator-specific data
  tags?: string[];
  isFavorite?: boolean;
}

export interface ScenarioLibrary {
  scenarios: SavedScenario[];
  categories: string[];
  tags: string[];
}

export interface ScenarioExport {
  version: string;
  exportDate: Date;
  scenarios: SavedScenario[];
  metadata: {
    appVersion: string;
    exportType: 'full' | 'partial';
  };
}

export interface ScenarioImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  warnings: string[];
}

// Calculator-specific scenario data types
export interface LoanScenarioData {
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  extraPayments?: number;
  propertyTax?: number;
  insurance?: number;
  pmi?: number;
}

export interface InvestmentScenarioData {
  initialInvestment: number;
  monthlyContribution: number;
  annualReturn: number;
  investmentPeriod: number;
  inflationRate?: number;
  taxRate?: number;
}

export interface RetirementScenarioData {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  annualContribution: number;
  preRetirementReturn: number;
  postRetirementReturn: number;
  socialSecurity?: number;
  pension?: number;
  desiredIncome?: number;
}

export interface SavingsScenarioData {
  goalName: string;
  targetAmount: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturn: number;
  timeframe: number;
}

export interface WhatIfScenarioData {
  baseScenario: any;
  modifications: Array<{
    type: 'income' | 'expense' | 'debt' | 'investment';
    description: string;
    amount: number;
    frequency: 'monthly' | 'yearly' | 'one-time';
  }>;
  timeline: number;
}
