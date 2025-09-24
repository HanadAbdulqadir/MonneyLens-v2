import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import UniversalCSVImporter from "./UniversalCSVImporter";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  ArrowRight,
  X,
  FileSpreadsheet,
  Database,
  Globe,
  Loader2,
  Shield
} from "lucide-react";

interface ImportedTransaction {
  date: string;
  category: string;
  amount: number;
  week: string;
  isValid: boolean;
  errors: string[];
  originalRow: number;
}

interface ImportPreview {
  transactions: ImportedTransaction[];
  validCount: number;
  invalidCount: number;
  totalAmount: number;
}

const DataImporter = () => {
  const { addTransaction } = useFinancial();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [columnMapping, setColumnMapping] = useState({
    date: 'date',
    category: 'category',
    amount: 'amount',
    description: ''
  });

  // Sample CSV template
  const downloadTemplate = () => {
    const templateData = [
      'Date,Category,Amount,Description',
      '2024-01-15,Food,-25.50,Lunch at cafe',
      '2024-01-16,Petrol,-45.00,Fuel for car',
      '2024-01-17,Earnings,2500.00,Monthly salary',
      '2024-01-18,Other,-15.00,Coffee',
      '2024-01-19,Food,-32.75,Grocery shopping'
    ].join('\n');

    const blob = new Blob([templateData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transaction-template.csv';
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "Use this CSV template to format your transaction data"
    });
  };

  // Parse CSV content
  const parseCSV = (content: string): string[][] => {
    const lines = content.trim().split('\n');
    return lines.map(line => {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      values.push(current.trim());
      return values;
    });
  };

  // Validate and process transaction data
  const validateTransaction = (row: string[], rowIndex: number, headers: string[]): ImportedTransaction => {
    const errors: string[] = [];
    
    // Map columns based on user selection
    const dateIndex = headers.findIndex(h => h.toLowerCase() === columnMapping.date.toLowerCase());
    const categoryIndex = headers.findIndex(h => h.toLowerCase() === columnMapping.category.toLowerCase());
    const amountIndex = headers.findIndex(h => h.toLowerCase() === columnMapping.amount.toLowerCase());
    
    // Extract values
    const dateValue = row[dateIndex]?.trim() || '';
    const categoryValue = row[categoryIndex]?.trim() || '';
    const amountValue = row[amountIndex]?.trim() || '';
    
    // Validate date
    let parsedDate = '';
    if (dateValue) {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        errors.push('Invalid date format');
      } else {
        parsedDate = date.toISOString().split('T')[0];
      }
    } else {
      errors.push('Date is required');
    }
    
    // Validate category
    const validCategories = ['Earnings', 'Food', 'Petrol', 'Other'];
    let finalCategory = categoryValue;
    if (!categoryValue) {
      errors.push('Category is required');
    } else if (!validCategories.includes(categoryValue)) {
      // Try to map common variations
      const categoryMap: { [key: string]: string } = {
        'income': 'Earnings',
        'salary': 'Earnings',
        'wage': 'Earnings',
        'food': 'Food',
        'groceries': 'Food',
        'dining': 'Food',
        'restaurant': 'Food',
        'gas': 'Petrol',
        'fuel': 'Petrol',
        'petrol': 'Petrol',
        'gasoline': 'Petrol',
        'other': 'Other',
        'misc': 'Other',
        'miscellaneous': 'Other'
      };
      
      const mappedCategory = categoryMap[categoryValue.toLowerCase()];
      if (mappedCategory) {
        finalCategory = mappedCategory;
      } else {
        errors.push(`Invalid category: ${categoryValue}. Valid categories: ${validCategories.join(', ')}`);
      }
    }
    
    // Validate amount
    let parsedAmount = 0;
    if (!amountValue) {
      errors.push('Amount is required');
    } else {
      // Remove currency symbols and parse
      const cleanAmount = amountValue.replace(/[£$€,]/g, '');
      parsedAmount = parseFloat(cleanAmount);
      if (isNaN(parsedAmount)) {
        errors.push('Invalid amount format');
      }
    }
    
    // Generate week
    const date = new Date(parsedDate);
    const week = `Week ${Math.ceil(date.getDate() / 7)}`;
    
    return {
      date: parsedDate,
      category: finalCategory,
      amount: parsedAmount,
      week,
      isValid: errors.length === 0,
      errors,
      originalRow: rowIndex + 1
    };
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const rows = parseCSV(content);
        
        if (rows.length < 2) {
          throw new Error('CSV file must contain at least a header row and one data row');
        }
        
        const headers = rows[0];
        const dataRows = rows.slice(1);
        
        // Process transactions
        const transactions = dataRows.map((row, index) => 
          validateTransaction(row, index, headers)
        );
        
        const validTransactions = transactions.filter(t => t.isValid);
        const invalidTransactions = transactions.filter(t => !t.isValid);
        const totalAmount = validTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        setImportPreview({
          transactions,
          validCount: validTransactions.length,
          invalidCount: invalidTransactions.length,
          totalAmount
        });
        
        toast({
          title: "File Processed",
          description: `Found ${validTransactions.length} valid transactions, ${invalidTransactions.length} with errors`
        });
        
      } catch (error) {
        toast({
          title: "Import Error",
          description: error instanceof Error ? error.message : "Failed to process CSV file",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.readAsText(file);
  };

  // Import valid transactions
  const importTransactions = () => {
    if (!importPreview) return;
    
    const validTransactions = importPreview.transactions.filter(t => t.isValid);
    let imported = 0;
    
    validTransactions.forEach(transaction => {
      addTransaction({
        date: transaction.date,
        category: transaction.category,
        amount: transaction.amount,
        week: transaction.week
      });
      imported++;
    });
    
    toast({
      title: "Import Successful!",
      description: `Successfully imported ${imported} transactions`
    });
    
    // Reset state
    setImportPreview(null);
    setIsOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Import Data
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Transaction Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!importPreview && (
            <Tabs defaultValue="universal" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="universal" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Universal Import
                </TabsTrigger>
                <TabsTrigger value="transactions" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Transactions Only
                </TabsTrigger>
              </TabsList>
              
              {/* Universal Import Tab */}
              <TabsContent value="universal" className="space-y-4">
                <UniversalCSVImporter onImportComplete={() => setIsOpen(false)} />
              </TabsContent>
              
              {/* Transactions Only Tab */}
              <TabsContent value="transactions" className="space-y-4">
                {/* Upload Section */}
                <div className="space-y-4">
                  <div className="text-center p-8 border-2 border-dashed border-border rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5">
                    <FileText className="h-16 w-16 mx-auto text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Import Your Financial Data</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                      Get started quickly by importing your existing transaction data. 
                      We support CSV files from most banks and financial apps.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
                      <Button 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={isProcessing}
                        size="lg"
                        className="gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Choose CSV File
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={downloadTemplate} size="lg" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download Template
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-xs max-w-md mx-auto">
                      <div className="text-center p-2 bg-background rounded border">
                        <FileText className="h-6 w-6 mx-auto mb-1 text-primary" />
                        <span>CSV Format</span>
                      </div>
                      <div className="text-center p-2 bg-background rounded border">
                        <CheckCircle className="h-6 w-6 mx-auto mb-1 text-success" />
                        <span>Auto-Detect</span>
                      </div>
                      <div className="text-center p-2 bg-background rounded border">
                        <Shield className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                        <span>Secure</span>
                      </div>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {isProcessing && (
                    <div className="space-y-2">
                      <Progress value={50} className="w-full" />
                      <p className="text-sm text-center text-muted-foreground">
                        Processing your file...
                      </p>
                    </div>
                  )}
                </div>

                {/* Format Requirements */}
                <Card className="p-4">
                  <h4 className="font-medium mb-3">CSV Format Requirements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span><strong>Required columns:</strong> Date, Category, Amount</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span><strong>Date format:</strong> YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span><strong>Categories:</strong> Earnings, Food, Petrol, Other</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span><strong>Amount:</strong> Positive for income, negative for expenses</span>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {/* Preview Section */}
          {importPreview && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-success">{importPreview.validCount}</div>
                  <div className="text-sm text-muted-foreground">Valid</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-destructive">{importPreview.invalidCount}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold">£{importPreview.totalAmount.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </Card>
              </div>

              {/* Error Summary */}
              {importPreview.invalidCount > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {importPreview.invalidCount} transaction{importPreview.invalidCount !== 1 ? 's have' : ' has'} errors and will not be imported. 
                    Review the details below to fix these issues.
                  </AlertDescription>
                </Alert>
              )}

              {/* Transaction Preview */}
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <div className="p-2 border-b bg-muted/50 font-medium text-sm">
                  Transaction Preview ({importPreview.transactions.length} total)
                </div>
                <div className="space-y-2 p-2">
                  {importPreview.transactions.slice(0, 10).map((transaction, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded text-sm ${
                      transaction.isValid ? 'bg-success/10' : 'bg-destructive/10'
                    }`}>
                      <div className="flex items-center gap-3">
                        {transaction.isValid ? 
                          <CheckCircle className="h-4 w-4 text-success" /> : 
                          <X className="h-4 w-4 text-destructive" />
                        }
                        <div>
                          <div className="font-medium">
                            {transaction.date} - {transaction.category}
                          </div>
                          {transaction.errors.length > 0 && (
                            <div className="text-xs text-destructive">
                              Row {transaction.originalRow}: {transaction.errors.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={transaction.isValid ? 'default' : 'destructive'}>
                        £{Math.abs(transaction.amount).toFixed(2)}
                      </Badge>
                    </div>
                  ))}
                  
                  {importPreview.transactions.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      ... and {importPreview.transactions.length - 10} more
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setImportPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={importTransactions}
                  disabled={importPreview.validCount === 0}
                  className="gap-2"
                >
                  Import {importPreview.validCount} Transaction{importPreview.validCount !== 1 ? 's' : ''}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataImporter;
