# MoneyLens Pots/Envelopes System

A comprehensive financial management system that implements the pots/envelopes budgeting methodology, allowing users to organize their money into dedicated categories with automated allocation rules.

## 🏦 System Overview

The pots system enables users to:
- Create multiple financial pots for different spending categories
- Set target amounts and track progress
- Automate fund allocation with customizable rules
- Monitor cashflow with an interactive calendar
- Receive intelligent notifications and suggestions

## 🗄️ Database Schema

### Core Tables

#### `pots` - Main pots storage
```sql
id (uuid, primary key)
user_id (uuid, foreign key)
name (text)
description (text, nullable)
target_amount (numeric)
current_balance (numeric)
priority (integer)
allocation_rule (jsonb, nullable)
auto_transfer_enabled (boolean)
color (text)
icon (text)
created_at (timestamptz)
updated_at (timestamptz)
```

#### `allocation_rules` - Automated funding rules
```sql
id (uuid, primary key)
user_id (uuid, foreign key)
pot_id (uuid, foreign key)
rule_type (text) -- 'daily', 'weekly', 'monthly', 'custom'
amount (numeric)
schedule (jsonb) -- Custom scheduling configuration
priority (integer)
enabled (boolean)
created_at (timestamptz)
updated_at (timestamptz)
```

#### `allocation_transactions` - Allocation history
```sql
id (uuid, primary key)
user_id (uuid, foreign key)
pot_id (uuid, foreign key)
rule_id (uuid, foreign key, nullable)
amount (numeric)
allocation_date (date)
status (text) -- 'pending', 'completed', 'failed'
created_at (timestamptz)
```

### Database Functions

#### `allocate_income_to_pots(p_user_id, p_amount, p_date)`
Automatically distributes income to pots based on allocation rules.

#### `calculate_pot_allocation_needs(p_user_id, p_date)`
Calculates which pots need funding and how much.

## 🎯 Key Features

### 1. Pot Management
- **Create/Edit/Delete Pots**: Full CRUD operations for financial pots
- **Visual Organization**: Color-coded pots with icons
- **Priority System**: Set allocation priority for automated funding
- **Target Tracking**: Monitor progress towards savings goals

### 2. Allocation Rules Engine
- **Flexible Scheduling**: Daily, weekly, monthly, or custom intervals
- **Priority-based Allocation**: Higher priority pots get funded first
- **Rule Management**: Enable/disable rules as needed
- **Transaction History**: Track all allocation activities

### 3. Cashflow Calendar
- **Visual Overview**: Color-coded daily net cashflow
- **Transaction Details**: Click any date to see transactions
- **Pot Allocation Tracking**: Monitor automated funding activities
- **Interactive Interface**: Hover and click for detailed information

### 4. Onboarding Wizard
- **Template-based Setup**: Pre-configured pot templates (Emergency Fund, Rent, etc.)
- **Guided Configuration**: Step-by-step setup process
- **Customizable Targets**: Set individual target amounts
- **Quick Start**: Get started with best-practice pot configurations

### 5. Quick Transaction Entry
- **Fast Data Entry**: Popover-based transaction form
- **Pot Assignment**: Optionally assign transactions to specific pots
- **Category Management**: Standardized category system
- **Tag Support**: Flexible tagging for better organization

### 6. Intelligent Notifications
- **Low Balance Alerts**: Warn when pots fall below 20% of target
- **Target Achieved**: Celebrate when pots reach their goals
- **Allocation Reminders**: Notify when automated funding is due
- **Spending Insights**: Suggest transfers based on spending patterns

## 🚀 Implementation Details

### Frontend Components

#### `PotsContext` (`src/contexts/PotsContext.tsx`)
- Central state management for pots system
- Handles all pot-related operations
- Integrates with Supabase backend

#### `CashflowCalendar` (`src/components/CashflowCalendar.tsx`)
- Interactive calendar visualization
- Real-time cashflow calculations
- Integration with transactions and allocations

#### `PotOnboardingWizard` (`src/components/PotOnboardingWizard.tsx`)
- Multi-step onboarding process
- Template-based pot creation
- Progress tracking and validation

#### `QuickAddTransaction` (`src/components/QuickAddTransaction.tsx`)
- Efficient transaction entry
- Pot assignment capabilities
- Form validation and error handling

#### `PotNotificationSystem` (`src/components/PotNotificationSystem.tsx`)
- Real-time alert system
- Actionable notifications
- Smart suggestion engine

### Backend Integration

#### Database Migrations
Located in `supabase/migrations/20250923160300_create_pots_system.sql`:
- Complete table definitions
- Indexes for performance
- RLS (Row Level Security) policies
- Database functions for business logic

#### API Integration
- RESTful endpoints via Supabase
- Real-time subscriptions for live updates
- Optimized queries with proper indexing

## 💡 Usage Examples

### Creating a New Pot
```typescript
const { createPot } = usePots();

await createPot({
  name: "Emergency Fund",
  description: "3-6 months of living expenses",
  target_amount: 15000,
  current_balance: 0,
  priority: 1,
  color: "yellow-500",
  icon: "shield"
});
```

### Setting Up Allocation Rules
```typescript
const { createAllocationRule } = usePots();

await createAllocationRule({
  pot_id: pot.id,
  rule_type: "monthly",
  amount: 500,
  priority: 1,
  enabled: true
});
```

### Quick Income Allocation
```typescript
const { allocateIncome } = usePots();

// Allocate £2000 income to pots
await allocateIncome(2000);
```

## 🔧 Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Pot Templates
The system includes 10 pre-configured pot templates:
1. **Emergency Fund** - Financial security buffer
2. **Rent/Mortgage** - Housing payments
3. **Utilities & Bills** - Monthly expenses
4. **Groceries** - Food shopping
5. **Transport** - Commuting and vehicle costs
6. **Savings** - Long-term investments
7. **Vacation** - Travel and holidays
8. **Healthcare** - Medical expenses
9. **Education** - Learning and development
10. **Entertainment** - Leisure activities

## 📊 Analytics & Insights

### Financial Health Metrics
- **Pot Coverage**: Percentage of pots adequately funded
- **Allocation Efficiency**: How well income is being distributed
- **Spending Patterns**: Category-wise expenditure analysis
- **Goal Progress**: Track towards financial targets

### Smart Suggestions
- **Transfer Recommendations**: Based on spending patterns
- **Rule Optimization**: Suggest better allocation strategies
- **Target Adjustments**: Recommend realistic goal setting

## 🔒 Security Features

- **Row Level Security**: Users can only access their own data
- **Input Validation**: All user inputs are validated
- **Error Handling**: Comprehensive error management
- **Audit Logging**: Track all financial operations

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- Supabase account
- Modern web browser

### Installation
```bash
npm install
npm run dev
```

### Database Setup
1. Run the migration: `supabase migration up`
2. Enable RLS policies
3. Configure database functions

## 📈 Performance Considerations

### Optimizations Implemented
- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Large datasets handled efficiently
- **Caching**: Intelligent caching of frequently accessed data
- **Lazy Loading**: Components load on demand

### Scalability Features
- **Modular Architecture**: Easy to extend and modify
- **API Rate Limiting**: Protected against abuse
- **Database Connection Pooling**: Efficient resource usage
- **Background Processing**: Heavy operations run asynchronously

## 🤝 Contributing

### Development Guidelines
- Follow TypeScript best practices
- Maintain comprehensive test coverage
- Document all new features
- Follow existing code style

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for user workflows
- Performance testing for critical paths

## 📚 Additional Resources

### Documentation
- [API Reference](./API_REFERENCE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

### Support
- [Issue Tracker](https://github.com/your-repo/issues)
- [Discussion Forum](https://github.com/your-repo/discussions)
- [Community Chat](https://discord.gg/your-channel)

---

**Built with ❤️ for better financial management**
