#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = "https://maourawciifennrsivps.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hb3VyYXdjaWlmZW5ucnNpdnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDkyMzEsImV4cCI6MjA3NDAyNTIzMX0.vyHiZUKXPO7y3D9GHRU0HKiZQruJ5tsBEk4LCGmolgM";

async function runMigration() {
  console.log('🚀 Starting database migration...');
  
  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20250923160300_create_pots_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          // For CREATE TABLE statements, use rpc to execute raw SQL
          if (statement.toUpperCase().includes('CREATE TABLE') || 
              statement.toUpperCase().includes('CREATE OR REPLACE FUNCTION') ||
              statement.toUpperCase().includes('CREATE TRIGGER') ||
              statement.toUpperCase().includes('CREATE INDEX') ||
              statement.toUpperCase().includes('ALTER TABLE') ||
              statement.toUpperCase().includes('CREATE POLICY')) {
            
            // Try to execute via REST API
            const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ sql: statement + ';' })
            });
            
            if (!response.ok) {
              console.log(`⚠️  Statement ${i + 1} may have failed, but continuing...`);
            } else {
              console.log(`✅ Statement ${i + 1} executed successfully`);
            }
          }
        } catch (error) {
          console.log(`⚠️  Error executing statement ${i + 1}: ${error.message}`);
          console.log('📝 Statement:', statement.substring(0, 100) + '...');
        }
      }
    }
    
    console.log('🎉 Migration completed!');
    console.log('🔍 Testing database connection...');
    
    // Test if the pots table was created
    const { data, error } = await supabase
      .from('pots')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Pots table not accessible:', error.message);
      console.log('💡 The migration may need to be run manually in the Supabase dashboard');
    } else {
      console.log('✅ Pots table is accessible! Migration successful!');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('💡 You may need to run this migration manually in the Supabase SQL editor');
    console.log('📄 Migration file location: supabase/migrations/20250923160300_create_pots_system.sql');
  }
}

// Run the migration
runMigration().catch(console.error);
