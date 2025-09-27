#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Define the import path mappings
const pathMappings = {
  '@/hooks/': '@shared/hooks/',
  '@/components/ui/': '@shared/components/ui/',
  '@/contexts/': '@core/contexts/',
  '@/integrations/supabase/': '@core/integrations/supabase/',
  '@/services/': '@core/services/',
  '@/utils/': '@shared/utils/',
  '@/types/': '@shared/types/',
  '@/lib/': '@shared/lib/',
  '@/components/': '@components/',
  '@/pages/': '@pages/',
  '@/layouts/': '@layouts/',
  '@/data/': '@data/',
};

// Function to recursively process files
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (file !== 'node_modules' && !file.startsWith('.') && file !== 'dist') {
        processDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(filePath);
    }
  }
}

// Function to process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace import paths
  for (const [oldPath, newPath] of Object.entries(pathMappings)) {
    const regex = new RegExp(`from\\s+["']${oldPath}`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `from "${newPath}`);
      modified = true;
      console.log(`Fixed import in ${filePath}: ${oldPath} -> ${newPath}`);
    }
  }
  
  // Fix relative imports that should be absolute
  const relativeImportRegex = /from\s+["']\.\.\/(components|hooks|utils|types|lib|contexts|services|integrations)/g;
  if (relativeImportRegex.test(content)) {
    content = content.replace(relativeImportRegex, (match, folder) => {
      const newImport = `from "@${folder}"`;
      console.log(`Fixed relative import in ${filePath}: ${match} -> ${newImport}`);
      return newImport;
    });
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated imports in ${filePath}`);
  }
}

// Start processing from the src directory
console.log('🔧 Fixing import paths...');
processDirectory('./src');
console.log('✅ Import path fixing completed!');
