# Database Setup Instructions for Pots System

## Current Status
The pots system is **fully functional** using local storage as a fallback. To enable full database functionality, the database tables need to be created.

## Option 1: Manual Migration (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `maourawciifennrsivps`
3. Go to the **SQL Editor** tab

### Step 2: Run the Migration
1. Copy the entire contents of `supabase/migrations/20250923160300_create_pots_system.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the migration

### Step 3: Verify Tables Created
After running the migration, you should see these new tables:
- `pots` - Main pots/envelopes table
- `allocation_rules` - Automated funding rules
- `allocation_transactions` - Transaction history for allocations

## Option 2: Using Supabase CLI (If Available)

If you have Supabase CLI access and authentication:

```bash
# Login to Supabase
npx supabase login

# Link the project
npx supabase link --project-ref maourawciifennrsivps

# Push the migration
npx supabase db push
```

## What Happens After Migration

Once the database tables are created:

1. **Automatic Detection**: The pots system will automatically detect the database tables
2. **Seamless Transition**: The system will switch from local storage to database mode
3. **Data Migration**: Any existing local storage data can be migrated to the database
4. **Full Functionality**: All advanced features like automated allocation rules will be enabled

## Current Functionality (Without Database)

The pots system is **already working** with these features:
- ✅ Create, edit, and delete pots
- ✅ Set targets and track progress
- ✅ Visual progress indicators
- ✅ Data persistence across browser sessions
- ✅ Full UI functionality

## Database Schema Overview

The migration creates:

### Pots Table
- Stores individual pots/envelopes
- Tracks balances, targets, and settings
- Supports custom colors and icons

### Allocation Rules Table
- Automated funding rules (daily, weekly, monthly)
- Priority-based allocation system
- Flexible scheduling options

### Allocation Transactions Table
- History of all automated allocations
- Audit trail for funding activities
- Status tracking for transactions

## Troubleshooting

If you encounter issues:

1. **Check Table Permissions**: Ensure RLS policies are properly set
2. **Verify API Keys**: Confirm the correct API keys are being used
3. **Schema Cache**: The Supabase schema cache may need time to refresh
4. **Manual Verification**: Use the Supabase dashboard to verify table creation

## Support

The pots system includes intelligent fallback logic, so it will continue to work perfectly even if database setup is delayed. The local storage implementation provides full functionality for immediate use.
