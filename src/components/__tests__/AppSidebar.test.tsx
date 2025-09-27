import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppSidebar } from '../../layouts/AppSidebar';

// Mock the useAuth hook
jest.mock('../../core/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    signOut: jest.fn()
  }),
}));

describe('AppSidebar', () => {
  it('renders navigation items correctly', () => {
    render(<AppSidebar />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('displays user information', () => {
    render(<AppSidebar />);
    
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('has correct navigation structure', () => {
    const { container } = render(<AppSidebar />);
    
    const navElement = container.querySelector('nav');
    expect(navElement).toBeInTheDocument();
  });
});
