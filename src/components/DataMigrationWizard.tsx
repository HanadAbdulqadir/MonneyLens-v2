import React, { useState, useEffect } from 'react';
import { useAuth } from "../../core/contexts/AuthContext";
import { Button } from "../../shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/components/ui/card";
import { Alert, AlertDescription } from "../../shared/components/ui/alert";
import { Progress } from "../../shared/components/ui/progress";
import { Badge } from "../../shared/components/ui/badge";
import { Separator } from "../../shared/components/ui/separator";
import { 
  Database, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  FileText,
  PiggyBank,
  Target,
  CreditCard,
  RefreshCw,
  Tag,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import DataMigrationService, { MigrationResult, LocalStorageData } from "../../shared/utils/dataMigration";

interface DataMigrationWizardProps {
  onComplete?: () => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
}

const DataMigrationWizard: React.FC<DataMigrationWizardProps> = ({
  onComplete,
  onSkip,
  showSkipOption = true
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'detect' | 'preview' | 'migrate' | 'complete'>('detect');
  const [localData, setLocalData] = useState<LocalStorageData | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check for local data on component mount
    const hasData = DataMigrationService.hasLocalData();
    if (hasData) {
      const data = DataMigrationService.getLocalData();
      setLocalData(data);
      setStep('preview');
    } else {
      setStep('complete'); // No data to migrate
    }
  }, []);

  const getDataSummary = (data: LocalStorageData) => {
    const summary = [
      {
        key: 'transactions',
        label: 'Transactions',
        icon: CreditCard,
        count: data.transactions?.length || 0,
        color: 'bg-blue-100 text-blue-800'
      },
      {
        key: 'goals',
        label: 'Financial Goals',
        icon: Target,
        count: data.goals?.length || 0,
        color: 'bg-green-100 text-green-800'
      },
      {
        key: 'pots',
        label: 'Pots',
        icon: PiggyBank,
        count: data.pots?.length || 0,
        color: 'bg-purple-100 text-purple-800'
      },
      {
        key: 'categories',
        label: 'Categories',
        icon: Tag,
        count: data.categories?.length || 0,
        color: 'bg-orange-100 text-orange-800'
      },
      {
        key: 'recurringTransactions',
        label: 'Recurring Transactions',
        icon: RefreshCw,
        count: data.recurringTransactions?.length || 0,
        color: 'bg-indigo-100 text-indigo-800'
      }
    ];

    return summary.filter(item => item.count > 0);
  };

  const handleCreateBackup = () => {
    try {
      DataMigrationService.createBackup();
      toast.success('Backup created and downloaded successfully!');
    } catch (error) {
      toast.error('Failed to create backup');
    }
  };

  const handleStartMigration = async () => {
    if (!user?.id || !localData) return;

    setIsLoading(true);
    setStep('migrate');
    setProgress(0);

    try {
      const migrationService = new DataMigrationService(user.id);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await migrationService.migrateAllData();
      
      clearInterval(progressInterval);
      setProgress(100);
      setMigrationResult(result);
      
      setTimeout(() => {
        setStep('complete');
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      setIsLoading(false);
      toast.error('Migration failed. Please try again.');
      setStep('preview');
    }
  };

  const handleClearLocalData = () => {
    DataMigrationService.clearLocalData();
    toast.success('Local data cleared successfully');
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    if (onSkip) onSkip();
  };

  if (step === 'detect') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
          <CardTitle>Checking for existing data...</CardTitle>
          <CardDescription>
            We're scanning your device for any existing MoneyLens data
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (step === 'preview' && localData) {
    const dataSummary = getDataSummary(localData);
    const totalItems = dataSummary.reduce((sum, item) => sum + item.count, 0);

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Local Data Found!</CardTitle>
          <CardDescription>
            We found {totalItems} items in your local storage that can be migrated to your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This will move your local data to the cloud. 
              We recommend creating a backup first.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Data Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataSummary.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <Badge className={item.color}>
                      {item.count} items
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Migration Options</h3>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCreateBackup}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Create Backup First
              </Button>
              
              <Button
                onClick={handleStartMigration}
                className="flex-1"
                disabled={isLoading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Start Migration
              </Button>
            </div>

            {showSkipOption && (
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full"
              >
                Skip Migration (Keep Local Data)
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'migrate') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
          </div>
          <CardTitle>Migrating Your Data</CardTitle>
          <CardDescription>
            Please wait while we transfer your data to the cloud...
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Migration Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please don't close this window during the migration process.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (step === 'complete') {
    const hasLocalData = localData && getDataSummary(localData).length > 0;
    const wasSuccessful = migrationResult?.success;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className={`mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center ${
            wasSuccessful ? 'bg-green-100' : hasLocalData ? 'bg-yellow-100' : 'bg-blue-100'
          }`}>
            {wasSuccessful ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : hasLocalData ? (
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            ) : (
              <CheckCircle className="h-6 w-6 text-blue-600" />
            )}
          </div>
          
          <CardTitle>
            {wasSuccessful 
              ? 'Migration Complete!' 
              : hasLocalData 
                ? 'Migration Skipped' 
                : 'No Data to Migrate'
            }
          </CardTitle>
          
          <CardDescription>
            {wasSuccessful 
              ? 'Your data has been successfully transferred to the cloud'
              : hasLocalData 
                ? 'Your local data is still available on this device'
                : 'You can start using MoneyLens right away'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {migrationResult && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Migration Results</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Transactions:</span>
                    <Badge variant="outline">{migrationResult.migratedItems.transactions}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Goals:</span>
                    <Badge variant="outline">{migrationResult.migratedItems.goals}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Pots:</span>
                    <Badge variant="outline">{migrationResult.migratedItems.pots}</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Categories:</span>
                    <Badge variant="outline">{migrationResult.migratedItems.categories}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Recurring:</span>
                    <Badge variant="outline">{migrationResult.migratedItems.recurringTransactions}</Badge>
                  </div>
                </div>
              </div>

              {migrationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p><strong>Some errors occurred during migration:</strong></p>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        {migrationResult.errors.slice(0, 3).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {migrationResult.errors.length > 3 && (
                          <li>... and {migrationResult.errors.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            {wasSuccessful && (
              <Button
                onClick={handleClearLocalData}
                variant="outline"
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Local Data
              </Button>
            )}
            
            <Button
              onClick={onComplete}
              className="flex-1"
            >
              Continue to MoneyLens
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default DataMigrationWizard;
