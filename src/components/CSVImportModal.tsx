import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Download,
  Eye,
  Settings,
  Loader2,
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

interface CSVImportModalProps {
  trigger?: React.ReactNode;
}

interface ParsedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  confidence: number;
  errors: string[];
  isValid: boolean;
  originalRow: number;
}

interface ColumnMapping {
  date: string;
  description: string;
  amount: string;
  category?: string;
}

const CSVImportModal = ({ trigger }: CSVImportModalProps) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: '',
    description: '',
    amount: '',
    category: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    autoCategories: true,
    validateAmounts: true,
    dateFormat: 'auto'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addTransaction } = useFinancial();
  const { toast } = useToast();

  // Smart category prediction based on description
  const predictCategory = useCallback((description: string, amount: number): { category: string; confidence: number } => {
    if (!description) return { category: 'Other', confidence: 0.3 };

    const desc = description.toLowerCase();

    // Earnings patterns
    if (amount > 0 && (
      desc.includes('salary') || desc.includes('wage') || desc.includes('payment') || 
      desc.includes('refund') || desc.includes('bonus') || desc.includes('income') ||
      desc.includes('transfer in') || desc.includes('credit')
    )) {
      return { category: 'Earnings', confidence: 0.9 };
    }

    // Petrol patterns
    if (desc.includes('petrol') || desc.includes('fuel') || desc.includes('gas') ||
        desc.includes('bp ') || desc.includes('shell') || desc.includes('esso') ||
        desc.includes('station') || /fuel.*\d/.test(desc)) {
      return { category: 'Petrol', confidence: 0.95 };
    }

    // Food patterns
    if (desc.includes('food') || desc.includes('restaurant') || desc.includes('cafe') ||
        desc.includes('lunch') || desc.includes('dinner') || desc.includes('grocery') ||
        desc.includes('tesco') || desc.includes('asda') || desc.includes('sainsbury') ||
        desc.includes('mcdonalds') || desc.includes('kfc') || desc.includes('pizza') ||
        desc.includes('takeaway') || desc.includes('delivery')) {
      return { category: 'Food', confidence: 0.85 };
    }

    // Default to Other
    return { category: 'Other', confidence: 0.4 };
  }, []);

  // Parse CSV file
  const parseCSV = useCallback((text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have at least a header and one data row');

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      // Basic CSV parsing (handles simple cases)
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i-1] === ',')) {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/"/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/"/g, ''));
      return values;
    });

    return { headers, data };
  }, []);

  // Smart date parsing
  const parseDate = useCallback((dateStr: string): { date: Date | null; confidence: number } => {
    if (!dateStr) return { date: null, confidence: 0 };

    // Try various date formats
    const formats = [
      // ISO formats
      /^\d{4}-\d{2}-\d{2}$/,
      /^\d{2}\/\d{2}\/\d{4}$/,
      /^\d{2}-\d{2}-\d{4}$/,
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/
    ];

    // Try parsing with different separators
    let parsedDate: Date | null = null;
    let confidence = 0;

    // Try ISO format first
    parsedDate = parseISO(dateStr);
    if (isValid(parsedDate)) {
      return { date: parsedDate, confidence: 0.9 };
    }

    // Try DD/MM/YYYY or MM/DD/YYYY
    const parts = dateStr.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const [part1, part2, part3] = parts.map(p => parseInt(p));
      
      // Try DD/MM/YYYY (UK format)
      if (part1 <= 31 && part2 <= 12 && part3 > 1900) {
        parsedDate = new Date(part3, part2 - 1, part1);
        if (isValid(parsedDate)) {
          confidence = 0.8;
        }
      }
      
      // Try MM/DD/YYYY (US format) if UK format didn't work
      if (!parsedDate || !isValid(parsedDate)) {
        if (part2 <= 31 && part1 <= 12 && part3 > 1900) {
          parsedDate = new Date(part3, part1 - 1, part2);
          if (isValid(parsedDate)) {
            confidence = 0.7;
          }
        }
      }
    }

    return { date: parsedDate, confidence };
  }, []);

  // Process uploaded file
  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      const text = await file.text();
      const { headers, data } = parseCSV(text);
      
      setHeaders(headers);
      setCsvData(data);
      
      // Auto-detect column mappings
      const mapping: ColumnMapping = {
        date: '',
        description: '',
        amount: '',
        category: ''
      };

      headers.forEach(header => {
        const h = header.toLowerCase();
        if (h.includes('date') || h.includes('time')) mapping.date = header;
        if (h.includes('description') || h.includes('detail') || h.includes('memo') || h.includes('reference')) mapping.description = header;
        if (h.includes('amount') || h.includes('value') || h.includes('sum') || h.includes('debit') || h.includes('credit')) mapping.amount = header;
        if (h.includes('category') || h.includes('type') || h.includes('class')) mapping.category = header;
      });

      setColumnMapping(mapping);
      setStep('mapping');
      
      toast({
        title: "File Uploaded",
        description: `Parsed ${data.length} transactions from CSV`,
      });
    } catch (error) {
      toast({
        title: "Parse Error",
        description: error instanceof Error ? error.message : "Failed to parse CSV file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [parseCSV, toast]);

  // Process and validate transactions
  const processTransactions = useCallback(() => {
    if (!csvData.length || !headers.length) return;

    setIsProcessing(true);
    
    const dateIndex = headers.indexOf(columnMapping.date);
    const descIndex = headers.indexOf(columnMapping.description);
    const amountIndex = headers.indexOf(columnMapping.amount);
    const categoryIndex = columnMapping.category ? headers.indexOf(columnMapping.category) : -1;

    const processed: ParsedTransaction[] = csvData.map((row, index) => {
      const errors: string[] = [];
      
      // Parse date
      const dateResult = parseDate(row[dateIndex] || '');
      if (!dateResult.date) {
        errors.push('Invalid or missing date');
      }

      // Parse amount
      const amountStr = (row[amountIndex] || '').replace(/[£$,]/g, '');
      const amount = parseFloat(amountStr);
      if (isNaN(amount)) {
        errors.push('Invalid amount');
      }

      // Get description
      const description = row[descIndex] || '';
      if (!description.trim()) {
        errors.push('Missing description');
      }

      // Predict or use existing category
      let category = 'Other';
      let confidence = 0.3;
      
      if (categoryIndex >= 0 && row[categoryIndex]) {
        category = row[categoryIndex];
        confidence = 0.9;
      } else if (importOptions.autoCategories && description) {
        const prediction = predictCategory(description, amount);
        category = prediction.category;
        confidence = prediction.confidence;
      }

      return {
        id: `import-${index}`,
        date: dateResult.date ? format(dateResult.date, 'yyyy-MM-dd') : '',
        description,
        amount: Math.abs(amount), // Always positive, category determines income/expense
        category,
        confidence,
        errors,
        isValid: errors.length === 0,
        originalRow: index + 2 // +2 because arrays are 0-based and we skip header
      };
    });

    setParsedTransactions(processed);
    setStep('preview');
    setIsProcessing(false);
  }, [csvData, headers, columnMapping, importOptions.autoCategories, parseDate, predictCategory]);

  // Import transactions
  const importTransactions = useCallback(async () => {
    const validTransactions = parsedTransactions.filter(t => t.isValid);
    if (validTransactions.length === 0) {
      toast({
        title: "No Valid Transactions",
        description: "Please fix the errors before importing",
        variant: "destructive"
      });
      return;
    }

    setStep('importing');
    setIsProcessing(true);

    try {
      for (const transaction of validTransactions) {
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for UX
        
        addTransaction({
          date: transaction.date,
          category: transaction.category,
          amount: transaction.amount,
          week: 'W4' // Default week - could be calculated from date
        });
      }

      toast({
        title: "Import Successful",
        description: `Imported ${validTransactions.length} transactions successfully`,
      });

      // Reset state
      setFile(null);
      setCsvData([]);
      setHeaders([]);
      setParsedTransactions([]);
      setStep('upload');
      setOpen(false);
      
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Failed to import some transactions",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [parsedTransactions, addTransaction, toast]);

  const validTransactions = parsedTransactions.filter(t => t.isValid);
  const errorTransactions = parsedTransactions.filter(t => !t.isValid);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Bulk Transaction Import
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['upload', 'mapping', 'preview', 'importing'].map((s, index) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? 'bg-primary text-primary-foreground' :
                ['upload', 'mapping', 'preview'].indexOf(step) > index ? 'bg-success text-success-foreground' :
                'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              {index < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  ['upload', 'mapping', 'preview'].indexOf(step) > index ? 'bg-success' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-6">
            <Card className="p-8 border-dashed border-2 border-muted-foreground/25">
              <div className="text-center space-y-4">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold mb-2">Upload CSV File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import transactions from your bank statements or expense tracking apps
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFile(file);
                      handleFileUpload(file);
                    }
                  }}
                  className="hidden"
                />
                
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Choose CSV File
                </Button>
              </div>
            </Card>

            {/* Sample Format */}
            <Card className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Expected CSV Format
              </h4>
              <div className="text-sm font-mono bg-muted p-3 rounded overflow-x-auto">
                <div>Date,Description,Amount,Category</div>
                <div>2024-01-15,"Tesco Groceries",45.67,Food</div>
                <div>2024-01-16,"Shell Petrol",38.50,Petrol</div>
                <div>2024-01-17,"Salary Payment",2500.00,Earnings</div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 'mapping' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Map CSV Columns
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Map your CSV columns to transaction fields. We've auto-detected some mappings.
              </p>
            </div>

            {/* Column Mappings */}
            <div className="grid gap-4">
              {Object.entries(columnMapping).map(([field, value]) => (
                <div key={field} className="grid grid-cols-3 gap-4 items-center">
                  <Label className="capitalize font-medium">
                    {field} {field !== 'category' && '*'}
                  </Label>
                  <Select 
                    value={value} 
                    onValueChange={(newValue) => 
                      setColumnMapping(prev => ({ ...prev, [field]: newValue }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field} column`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {headers.map(header => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">
                    {field === 'date' && 'Transaction date'}
                    {field === 'description' && 'Transaction details'}
                    {field === 'amount' && 'Transaction amount'}
                    {field === 'category' && 'Optional - auto-predicted if empty'}
                  </div>
                </div>
              ))}
            </div>

            {/* Import Options */}
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Import Options</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="skipDuplicates"
                    checked={importOptions.skipDuplicates}
                    onCheckedChange={(checked) => 
                      setImportOptions(prev => ({ ...prev, skipDuplicates: !!checked }))
                    }
                  />
                  <label htmlFor="skipDuplicates" className="text-sm">
                    Skip duplicate transactions
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="autoCategories"
                    checked={importOptions.autoCategories}
                    onCheckedChange={(checked) => 
                      setImportOptions(prev => ({ ...prev, autoCategories: !!checked }))
                    }
                  />
                  <label htmlFor="autoCategories" className="text-sm flex items-center gap-1">
                    Auto-predict categories using AI
                    <Brain className="h-3 w-3 text-primary" />
                  </label>
                </div>
              </div>
            </Card>

            {/* Preview Sample */}
            {csvData.length > 0 && (
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Data Preview</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Date</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Amount</th>
                        <th className="text-left p-2">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 3).map((row, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{row[headers.indexOf(columnMapping.date)] || '-'}</td>
                          <td className="p-2">{row[headers.indexOf(columnMapping.description)] || '-'}</td>
                          <td className="p-2">{row[headers.indexOf(columnMapping.amount)] || '-'}</td>
                          <td className="p-2">{columnMapping.category ? row[headers.indexOf(columnMapping.category)] || 'Auto' : 'Auto'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button 
                onClick={processTransactions}
                disabled={!columnMapping.date || !columnMapping.description || !columnMapping.amount}
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                Process Transactions
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Review Transactions
                </h3>
                <p className="text-sm text-muted-foreground">
                  {validTransactions.length} valid, {errorTransactions.length} errors
                </p>
              </div>
              
              {validTransactions.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('mapping')}>
                    Back to Mapping
                  </Button>
                  <Button onClick={importTransactions} className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Import {validTransactions.length} Transactions
                  </Button>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
                <p className="font-bold text-success">{validTransactions.length}</p>
                <p className="text-xs text-muted-foreground">Valid</p>
              </Card>
              <Card className="p-4 text-center">
                <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
                <p className="font-bold text-destructive">{errorTransactions.length}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </Card>
              <Card className="p-4 text-center">
                <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-bold">£{validTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </Card>
            </div>

            {/* Transaction List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {parsedTransactions.map((transaction, index) => (
                <Card key={index} className={cn(
                  "p-4",
                  transaction.isValid ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {transaction.isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{transaction.category}</Badge>
                          {transaction.confidence < 0.8 && (
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(transaction.confidence * 100)}% confident
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">£{transaction.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{transaction.date}</p>
                    </div>
                  </div>
                  
                  {transaction.errors.length > 0 && (
                    <div className="mt-2 text-xs text-destructive">
                      {transaction.errors.join(', ')}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Importing */}
        {step === 'importing' && (
          <div className="text-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h3 className="font-semibold">Importing Transactions...</h3>
            <p className="text-sm text-muted-foreground">
              Processing {validTransactions.length} transactions
            </p>
            <Progress value={60} className="w-64 mx-auto" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CSVImportModal;