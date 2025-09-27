import React from 'react';
import { render, screen } from '@testing-library/react';
import BalanceCard from '../BalanceCard';

// Mock the useFinancial hook
jest.mock('@core/contexts/SupabaseFinancialContext', () => ({
  useFinancial: () => ({
    getCurrentBalance: () => 12500,
    getTodaysData: () => ({
      earnings: 15000,
      expenses: 2500,
      netChange: 12500
    }),
    monthlyStartingPoint: 10000
  }),
}));

describe('BalanceCard', () => {
  it('renders balance information correctly', () => {
    render(<BalanceCard />);
    
    expect(screen.getByText('Current Balance')).toBeInTheDocument();
    expect(screen.getByText('Today\'s change')).toBeInTheDocument();
  });

  it('displays earnings and expenses information', () => {
    render(<BalanceCard />);
    
    expect(screen.getByText('Earnings')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Starting')).toBeInTheDocument();
    expect(screen.getByText('Net')).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = render(<BalanceCard />);
    
    const cardElement = container.querySelector('.bg-gradient-primary');
    expect(cardElement).toBeInTheDocument();
  });
});
