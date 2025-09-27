import React, { useState, useRef } from "react";
import { Card, CardContent } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Label } from "@shared/components/ui/label";
import { Badge } from "@shared/components/ui/badge";
import { Progress } from "@shared/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle, Calendar, TrendingUp } from "lucide-react";
import { useFinancial } from "@core/contexts/SupabaseFinancialContext";

interface CSVConfigurationImporterProps {
  onConfigurationComplete: (config: any) => void;
}

interface CSVRow {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: "income" | "expense";
}

interface AnalysisResult {
  totalRows: number;
  dateRange: { start: string; end: string };
  totalIncome: number;
  totalExpenses: number;
  averageDailyIncome: number;
  recurringExpenses: Array<{
    name: string;
    amount: number;
    frequency: "daily" | "weekly" | "monthly";
    category: string;
    occurrences: number;
  }>;
  categories: Record<string, { total: number; count: number; avg: number }>;
  suggestedPots: Array<{
    name: string;
    goalAmount: number;
    type: "essential" | "savings" | "buffer" | "next-month";
    priority: "high" | "medium" | "low";
  }>;
}

export default function CSVConfigurationImporter({ onConfigurationComplete }: CSVConfigurationImporterProps) {
  const { currency } = useFinancial();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
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
      
      const row: CSVRow = {
        date: values[headers.indexOf('date')] || '',
        description: values[headers.indexOf('description')] || values[headers.indexOf('name')] || '',
        amount: Math.abs(parseFloat(values[headers.indexOf('amount')] || '0')),
        category: values[headers.indexOf('category')] || 'Other',
        type: parseFloat(values[headers.indexOf('amount')] || '0') > 0 ? 'income' : 'expense'
      };
      
      if (row.date && !isNaN(row.amount) && row.amount > 0) {
        rows.push(row);
      }
    }
    
    return rows;
  };

  const analyzeData = (rows: CSVRow[]): AnalysisResult => {
    setProgress(10);
    
    // Sort by date
    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setProgress(30);
    
    // Calculate date range
    const dates = rows.map(r => new Date(r.date));
    const dateRange = {
      start: dates[0].toISOString().split('T')[0],
      end: dates[dates.length - 1].toISOString().split('T')[0]
    };
    
    setProgress(50);
    
    // Calculate totals
    const incomeRows = rows.filter(r => r.type === 'income');
    const expenseRows = rows.filter(r => r.type === 'expense');
    
    const totalIncome = incomeRows.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenseRows.reduce((sum, r) => sum + r.amount, 0);
    
    // Calculate average daily income
    const incomeDays = new Set(incomeRows.map(r => r.date)).size;
    const averageDailyIncome = totalIncome / Math.max(incomeDays, 1);
    
    setProgress(70);
    
    // Analyze categories
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
    
    setProgress(80);
    
    // Detect recurring expenses
    const recurringExpenses: AnalysisResult['recurringExpenses'] = [];
    Object.entries(categories).forEach(([category, data]) => {
      if (data.count >= 3) { // At least 3 occurrences to be considered recurring
        let frequency: "daily" | "weekly" | "monthly" = "monthly";
        
        // Simple frequency detection based on occurrence pattern
        if (data.count > 20) frequency = "daily";
        else if (data.count > 8) frequency = "weekly";
        
        recurringExpenses.push({
          name: `${category} Expense`,
          amount: Math.round(data.avg),
          frequency,
          category,
          occurrences: data.count
        });
      }
    });
    
    setProgress(90);
    
    // Suggest pots based on patterns
    const suggestedPots: AnalysisResult['suggestedPots'] = [
      {
        name: "Emergency Fund",
        goalAmount: Math.round(averageDailyIncome * 30), // 1 month of income
        type: "savings",
        priority: "high"
      },
      {
        name: "Next Month Buffer",
        goalAmount: Math.round(averageDailyIncome * 15), // Half month buffer
        type: "next-month",
        priority: "high"
      },
      {
        name: "Flexible Buffer",
        goalAmount: Math.round(averageDailyIncome * 7), // 1 week buffer
        type: "buffer",
        priority: "medium"
      }
    ];
    
    // Add pots for large recurring expenses
    recurringExpenses
      .filter(exp => exp.amount > averageDailyIncome * 3) // Large expenses get their own pot
      .forEach(exp => {
        suggestedPots.push({
          name: `${exp.name} Pot`,
          goalAmount: exp.amount,
          type: "essential",
          priority: "high"
        });
      });
    
    setProgress(100);
    
    return {
      totalRows: rows.length,
      dateRange,
      totalIncome,
      totalExpenses,
      averageDailyIncome: Math.round(averageDailyIncome),
      recurringExpenses,
      categories,
      suggestedPots
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setIsProcessing(true);
    setProgress(0);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        
        if (rows.length === 0) {
          throw new Error('No valid data found in CSV');
        }
        
        const analysis = analyzeData(rows);
        setAnalysisResult(analysis);
        
        // Auto-generate configuration
        const config = {
          expenses: analysis.recurringExpenses.map((exp, index) => ({
            id: `csv_exp_${index}`,
            name: exp.name,
            amount: exp.amount,
            frequency: exp.frequency,
            category: exp.category,
            notes: `Based on ${exp.occurrences} occurrences in CSV`
          })),
          pots: analysis.suggestedPots.map((pot, index) => ({
            id: `csv_pot_${index}`,
            name: pot.name,
            goalAmount: pot.goalAmount,
            currentAmount: 0,
            frequency: "monthly" as const,
            type: pot.type,
            priority: pot.priority
          })),
          startingBalance: Math.round(analysis.averageDailyIncome * 7), // 1 week buffer
          incomeFrequency: "daily" as const,
          averageDailyIncome: analysis.averageDailyIncome,
          weeklyIncome: Math.round(analysis.averageDailyIncome * 7)
        };
        
        onConfigurationComplete(config);
        
      } catch (error) {
        console.error('Error processing CSV:', error);
        alert('Error processing CSV file. Please check the format.');
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
          <Upload className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 className="text-xl font-semibold mb-2">CSV Configuration Import</h3>
          <p className="text-gray-600">
            Upload a CSV file with your financial transactions to automatically configure the Financial Hub
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
                  Supported format: Date, Description, Amount, Category
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
                <p className="text-sm text-gray-600">Analyzing data... {progress}%</p>
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{analysisResult.totalRows}</div>
                  <div className="text-sm text-blue-800">Transactions</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{currency} {analysisResult.totalIncome}</div>
                  <div className="text-sm text-green-800">Total Income</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{currency} {analysisResult.totalExpenses}</div>
                  <div className="text-sm text-red-800">Total Expenses</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{currency} {analysisResult.averageDailyIncome}</div>
                  <div className="text-sm text-purple-800">Avg Daily</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recurring Expenses */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Recurring Expenses Found
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.recurringExpenses.map((exp, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{exp.name}</span>
                        <Badge variant="outline">
                          {currency} {exp.amount} ({exp.frequency})
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Pots */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Suggested Pots
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.suggestedPots.map((pot, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{pot.name}</span>
                        <Badge variant="secondary">
                          {currency} {pot.goalAmount}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Configuration generated successfully!</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              CSV Format Requirements
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Include columns: Date, Description, Amount, Category</li>
              <li>Date format: YYYY-MM-DD or DD/MM/YYYY</li>
              <li>Amount: Positive for income, negative for expenses</li>
              <li>Category: Any descriptive category name</li>
              <li>Minimum 30 days of data recommended for accurate analysis</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
