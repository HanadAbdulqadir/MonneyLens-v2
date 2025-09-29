import { Card } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Separator } from "@shared/components/ui/separator";
import { useFinancial } from "@core/contexts/SupabaseFinancialContext";
import { useState } from "react";
import { Download, Upload, FileText, Database, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@shared/hooks/use-toast";

const ImportExport = () => {
  const { monthlyStartingPoint, dailyData, transactions, currency, clearAllData, setMonthlyStartingPoint, addTransaction, addDailyData } = useFinancial();
  const { toast } = useToast();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const exportData = () => {
    const data = {
      monthlyStartingPoint,
      dailyData,
      transactions,
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneylens-financial-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Data exported successfully"
    });
  };

  const exportCSV = () => {
    // Create CSV content for transactions
    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(transaction => [
        transaction.date,
        `"${transaction.description.replace(/"/g, '""')}"`,
        transaction.amount,
        transaction.type,
        transaction.category
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneylens-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Transactions exported as CSV"
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Please select a file to import",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    try {
      const text = await importFile.text();
      const data = JSON.parse(text);

      // Validate the imported data structure
      if (!data.monthlyStartingPoint || !Array.isArray(data.dailyData) || !Array.isArray(data.transactions)) {
        throw new Error("Invalid data format");
      }

      // Clear existing data
      await clearAllData();

      // Import new data
      setMonthlyStartingPoint(data.monthlyStartingPoint);
      
      // Import transactions
      for (const transaction of data.transactions) {
        await addTransaction(transaction);
      }

      // Import daily data
      for (const daily of data.dailyData) {
        await addDailyData(daily);
      }

      toast({
        title: "Success",
        description: "Data imported successfully"
      });
      
      setImportFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('import-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "The file format is invalid or corrupted",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const stats = {
    transactions: transactions.length,
    dailyData: dailyData.length,
    startingBalance: monthlyStartingPoint,
    totalEarnings: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto px-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Import & Export</h1>
        <p className="text-muted-foreground">
          Manage your financial data with backup and restore functionality
        </p>
      </div>

      {/* Data Statistics */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Data Overview</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Total Transactions</Label>
            <p className="text-2xl font-bold text-primary">{stats.transactions}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Days Tracked</Label>
            <p className="text-2xl font-bold text-primary">{stats.dailyData}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Total Earnings</Label>
            <p className="text-2xl font-bold text-green-600">£{stats.totalEarnings.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Total Expenses</Label>
            <p className="text-2xl font-bold text-red-600">£{stats.totalExpenses.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      {/* Export Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Download className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Export Data</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-800">Export Options</h4>
                <p className="text-blue-700 text-sm">
                  Choose between JSON for full backup or CSV for spreadsheet compatibility
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Button 
              variant="outline" 
              className="gap-3 h-auto p-4 justify-start"
              onClick={exportData}
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Export JSON Backup</p>
                <p className="text-sm text-muted-foreground">
                  Complete data backup with all settings
                </p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="gap-3 h-auto p-4 justify-start"
              onClick={exportCSV}
            >
              <Download className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Export CSV</p>
                <p className="text-sm text-muted-foreground">
                  Transaction data for spreadsheets
                </p>
              </div>
            </Button>
          </div>
        </div>
      </Card>

      <Separator />

      {/* Import Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Upload className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Import Data</h2>
        </div>
        
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <h4 className="font-semibold text-amber-800">Important Notice</h4>
                <p className="text-amber-700 text-sm">
                  Importing data will replace all existing financial data. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-file">Select Backup File</Label>
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Select a previously exported JSON backup file
              </p>
            </div>

            {importFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    File selected: {importFile.name}
                  </span>
                </div>
              </div>
            )}

            <Button 
              onClick={handleImport}
              disabled={!importFile || isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing Data...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Format Information */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Data Format Information</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">JSON Backup Format</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Complete application data</li>
                <li>• All transactions and daily records</li>
                <li>• Monthly starting balance</li>
                <li>• Export metadata and version</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">CSV Export Format</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Transaction data only</li>
                <li>• Date, description, amount, type, category</li>
                <li>• Compatible with Excel/Google Sheets</li>
                <li>• For analysis and reporting</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ImportExport;
