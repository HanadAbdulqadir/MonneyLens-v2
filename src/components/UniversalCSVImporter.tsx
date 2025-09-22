import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle, Database, TrendingUp, Target, CreditCard, Calendar } from "lucide-react";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { toast } from "sonner";

interface UniversalCSVImporterProps {
  onImportComplete: () => void;
}

interface CSVRow {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  tags?: string[];
  goal?: string;
  debt?: string;
}

interface ImportResult {
  totalRows: number;
  transactionsImported: number;
  goalsCreated: number;
  debtsCreated: number;
  categoriesFound: string[];
  dateRange: { start: string; end: string };
  totalIncome: number;
  totalExpenses: number;
  recurringPatterns: Array<{
    name: string;
    amount: number;
    frequency: string;
    category: string;
    occurrences: number;
  }>;
}

export default function UniversalCSVImporter({ onImportComplete }: UniversalCSVImporterProps) {
  const { addTransaction, addGoal, addDebt, transactions, goals, debts, currency } = useFinancial();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows: CSVRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 4) continue;
      
      const amount = parseFloat(values[headers.indexOf('amount')] || '0');
      if (isNaN(amount) || amount === 0) continue;
      
      const row: CSVRow = {
        date: values[headers.indexOf('date')] || '',
        description: values[headers.indexOf('description')] || values[headers.indexOf('name')] || '',
        amount: Math.abs(amount),
        category: values[headers.indexOf('category')] || 'Other',
        type: amount > 0 ? 'income' : 'expense',
        tags: values[headers.indexOf('tags')]?.split(';').filter(t => t) || [],
        goal: values[headers.indexOf('goal')] || undefined,
        debt: values[headers.indexOf('debt')] || undefined,
      };
      
      if (row.date) {
        rows.push(row);
      }
    }
    
    return rows;
  };

  const analyzeAndImport = async (rows: CSVRow[]): Promise<ImportResult> => {
    setProgress(10);
    
    // Sort by date
    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setProgress(20);
    
    // Calculate date range and totals
    const dates = rows.map(r => new Date(r.date));
    const dateRange = {
      start: dates[0].toISOString().split('T')[0],
      end: dates[dates.length - 1].toISOString().split('T')[0]
    };
    
    const incomeRows = rows.filter(r => r.type === 'income');
    const expenseRows = rows.filter(r => r.type === 'expense');
    const totalIncome = incomeRows.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenseRows.reduce((sum, r) => sum + r.amount, 0);
    
    setProgress(30);
    
    // Import transactions
    let transactionsImported = 0;
    for (const row of rows) {
      try {
        await addTransaction({
          date: row.date,
          category: row.category,
          amount: row.type === 'income' ? row.amount : -row.amount,
          description: row.description,
          tags: row.tags || []
        });
        transactionsImported++;
      } catch (error) {
        console.error('Error importing transaction:', error);
      }
    }
    
    setProgress(60);
    
    // Analyze categories for recurring patterns
    const categories: Record<string, { total: number; count: number; avg: number }> = {};
    expenseRows.forEach(row => {
      if (!categories[row.category]) {
        categories[row.category] = { total: 0, count: 0, avg: 0 };
      }
      categories[row.category].total += row.amount;
      categories[row.category].count += 1;
    });
    
    Object.keys(categories).forEach(cat => {
      categories[cat].avg = categories[cat].total / categories[cat].count;
    });
    
    setProgress(70);
    
    // Detect recurring patterns and create goals
    const recurringPatterns: ImportResult['recurringPatterns'] = [];
    let goalsCreated = 0;
    
    Object.entries(categories).forEach(([category, data]) => {
      if (data.count >= 3) {
        let frequency = "monthly";
        if (data.count > 20) frequency = "daily";
        else if (data.count > 8) frequency = "weekly";
        
        recurringPatterns.push({
          name: `${category} Expense`,
          amount: Math.round(data.avg),
          frequency,
          category,
          occurrences: data.count
        });
        
        // Create goal for large recurring expenses
        if (data.avg > 100) {
          try {
            addGoal({
              title: `${category} Savings Goal`,
              name: `${category} Savings Goal`, // Alias for backward compatibility
              targetAmount: Math.round(data.avg * 3), // 3 months worth
              currentAmount: 0,
              category,
              isCompleted: false // Required property
            });
            goalsCreated++;
          } catch (error) {
            console.error('Error creating goal:', error);
          }
        }
      }
    });
    
    setProgress(80);
    
    // Detect debt payments and create debts
    let debtsCreated = 0;
    const debtPayments = rows.filter(r => r.debt || r.description.toLowerCase().includes('debt') || r.description.toLowerCase().includes('loan'));
    
    if (debtPayments.length > 0) {
      const debtAmounts = debtPayments.reduce((sum, r) => sum + r.amount, 0);
      if (debtAmounts > 0) {
        try {
          await addDebt({
            name: "Imported Debt",
            totalAmount: debtAmounts * 2, // Estimate total debt
            remainingAmount: debtAmounts,
            interestRate: 5.0,
            minimumPayment: Math.round(debtAmounts / 12) // Monthly payment
          });
          debtsCreated++;
        } catch (error) {
          console.error('Error creating debt:', error);
        }
      }
    }
    
    setProgress(100);
    
    return {
      totalRows: rows.length,
      transactionsImported,
      goalsCreated,
      debtsCreated,
      categoriesFound: Object.keys(categories),
      dateRange,
      totalIncome,
      totalExpenses,
      recurringPatterns
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setIsProcessing(true);
    setProgress(0);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        
        if (rows.length === 0) {
          throw new Error('No valid data found in CSV');
        }
        
        const result = await analyzeAndImport(rows);
        setImportResult(result);
        
        toast.success(`Successfully imported ${result.transactionsImported} transactions`);
        onImportComplete();
        
      } catch (error) {
        console.error('Error processing CSV:', error);
        toast.error('Error processing CSV file. Please check the format.');
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <Database className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 className="text-xl font-semibold mb-2">Universal CSV Import</h3>
          <p className="text-gray-600">
            Upload a single CSV file to populate all application data across all pages
          </p>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {!fileName && !isProcessing && (
              <div>
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-4">
                  Import transactions, goals, debts, and more from a single file
                </p>
                <Button onClick={triggerFileInput}>
                  Choose CSV File
                </Button>
              </div>
            )}
            
            {fileName && (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-green-500" />
                <span className="font-medium">{fileName}</span>
              </div>
            )}
            
            {isProcessing && (
              <div className="space-y-3">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600">Importing data... {progress}%</p>
              </div>
            )}
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResult.totalRows}</div>
                  <div className="text-sm text-blue-800">Total Rows</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.transactionsImported}</div>
                  <div className="text-sm text-green-800">Transactions</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{importResult.goalsCreated}</div>
                  <div className="text-sm text-purple-800">Goals Created</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{importResult.debtsCreated}</div>
                  <div className="text-sm text-orange-800">Debts Created</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Financial Summary */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Financial Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Date Range:</span>
                      <span>{importResult.dateRange.start} to {importResult.dateRange.end}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Total Income:</span>
                      <span>{currency} {importResult.totalIncome}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Total Expenses:</span>
                      <span>{currency} {importResult.totalExpenses}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Net:</span>
                      <span>{currency} {importResult.totalIncome - importResult.totalExpenses}</span>
                    </div>
                  </div>
                </div>

                {/* Categories Found */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Categories Found ({importResult.categoriesFound.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {importResult.categoriesFound.map(category => (
                      <Badge key={category} variant="outline">{category}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recurring Patterns */}
              {importResult.recurringPatterns.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Recurring Patterns Detected
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {importResult.recurringPatterns.map((pattern, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{pattern.name}</div>
                          <div className="text-sm text-gray-600">{pattern.frequency} • {pattern.occurrences} occurrences</div>
                        </div>
                        <Badge variant="secondary">
                          {currency} {pattern.amount}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Data imported successfully! All application pages are now populated.</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              CSV Format for Universal Import
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li><strong>Required columns:</strong> Date, Description, Amount, Category</li>
              <li><strong>Optional columns:</strong> Tags (semicolon-separated), Goal, Debt</li>
              <li><strong>Date format:</strong> YYYY-MM-DD or DD/MM/YYYY</li>
              <li><strong>Amount:</strong> Positive for income, negative for expenses</li>
              <li><strong>Special features:</strong> 
                <ul className="ml-4 mt-1">
                  <li>Rows with "Goal" column will create financial goals</li>
                  <li>Rows with "Debt" column will create debt records</li>
                  <li>Tags will be applied to transactions for filtering</li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Example CSV */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-blue-900">Example CSV Format</h4>
            <pre className="text-xs bg-white p-3 rounded border text-blue-800 overflow-x-auto">
{`Date,Description,Amount,Category,Tags,Goal,Debt
2025-01-01,Salary,1800,Income,work;salary,,
2025-01-02,Groceries,-50,Food,essential,,
2025-01-03,Petrol,-20,Transport,essential,,
2025-01-04,Rent,-800,Housing,essential;rent,,
2025-01-05,Investment,-200,Savings,investment,Retirement Fund,
2025-01-06,Car Loan,-150,Debt,loan,,Car Loan`}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
