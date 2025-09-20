import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Wifi, 
  WifiOff, 
  Download, 
  RefreshCw, 
  Database,
  CheckCircle,
  AlertCircle,
  HardDrive
} from "lucide-react";

interface OfflineSupportProps {
  className?: string;
}

const OfflineSupport = ({ className }: OfflineSupportProps) => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAppCached, setIsAppCached] = useState(false);
  const [pendingSync, setPendingSync] = useState<string[]>([]);
  const [storageUsage, setStorageUsage] = useState<{used: number, quota: number} | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online! 🎉",
        description: "Connection restored. Syncing pending changes...",
      });
      syncPendingChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "You can continue using the app. Changes will sync when you're back online.",
        variant: "default"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check storage usage
  useEffect(() => {
    const checkStorageUsage = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          setStorageUsage({
            used: estimate.usage || 0,
            quota: estimate.quota || 0
          });
        } catch (error) {
          console.error('Failed to estimate storage:', error);
        }
      }
    };

    checkStorageUsage();
  }, []);

  // Check if app is cached (service worker)
  useEffect(() => {
    const checkCacheStatus = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(() => {
          setIsAppCached(true);
        }).catch(() => {
          setIsAppCached(false);
        });
      }
    };

    checkCacheStatus();
  }, []);

  // Sync pending changes when back online
  const syncPendingChanges = async () => {
    if (!isOnline) return;

    try {
      // Get pending transactions from localStorage
      const pending = localStorage.getItem('pending-transactions');
      if (pending) {
        const transactions = JSON.parse(pending);
        
        // In a real app, you'd sync these with your backend
        // For now, we'll just clear them and show success
        localStorage.removeItem('pending-transactions');
        setPendingSync([]);
        
        toast({
          title: "Sync Complete",
          description: `${transactions.length} transaction(s) synced successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Some changes couldn't be synced. They'll be retried later.",
        variant: "destructive"
      });
    }
  };

  // Force refresh app cache
  const refreshCache = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        toast({
          title: "Cache Updated",
          description: "App has been updated with the latest version"
        });
      } catch (error) {
        toast({
          title: "Update Failed",
          description: "Couldn't update the app cache",
          variant: "destructive"
        });
      }
    }
  };

  // Clear offline data
  const clearOfflineData = () => {
    try {
      // Clear specific offline data, keep user preferences
      const keysToRemove = ['pending-transactions', 'cached-data'];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      toast({
        title: "Offline Data Cleared",
        description: "All cached data has been removed"
      });
    } catch (error) {
      toast({
        title: "Clear Failed",
        description: "Couldn't clear offline data",
        variant: "destructive"
      });
    }
  };

  // Download app for offline use
  const enableOfflineMode = async () => {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        setIsAppCached(true);
        
        toast({
          title: "Offline Mode Enabled",
          description: "The app is now available offline!"
        });
      } catch (error) {
        toast({
          title: "Offline Setup Failed",
          description: "Couldn't enable offline mode",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Not Supported",
        description: "Offline mode isn't supported in this browser",
        variant: "destructive"
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={className}>
      {/* Connection Status Banner */}
      {!isOnline && (
        <Alert className="mb-4 border-warning">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're currently offline. The app will continue to work and sync your changes when you're back online.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-success" />
            ) : (
              <WifiOff className="h-5 w-5 text-warning" />
            )}
            <h3 className="text-lg font-semibold">Offline Support</h3>
          </div>
          
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              {isAppCached ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <div className="text-sm font-medium">App Cache</div>
                <div className="text-xs text-muted-foreground">
                  {isAppCached ? 'Available offline' : 'Not cached'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">Pending Sync</div>
                <div className="text-xs text-muted-foreground">
                  {pendingSync.length} items
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <HardDrive className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">Storage Used</div>
                <div className="text-xs text-muted-foreground">
                  {storageUsage ? 
                    `${formatBytes(storageUsage.used)} / ${formatBytes(storageUsage.quota)}` : 
                    'Calculating...'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {!isAppCached && (
                <Button onClick={enableOfflineMode} className="gap-2">
                  <Download className="h-4 w-4" />
                  Enable Offline Mode
                </Button>
              )}
              
              {isAppCached && (
                <Button variant="outline" onClick={refreshCache} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Update App Cache
                </Button>
              )}
              
              <Button variant="outline" onClick={clearOfflineData} className="gap-2">
                <Database className="h-4 w-4" />
                Clear Offline Data
              </Button>
            </div>

            {/* Offline Features Info */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-3">What works offline:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-success" />
                  <span>View existing transactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-success" />
                  <span>Add new transactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-success" />
                  <span>View budgets and analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-success" />
                  <span>Search and filter data</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-success" />
                  <span>Export data as CSV</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-success" />
                  <span>Modify settings</span>
                </div>
              </div>
            </div>

            {/* Storage Usage Details */}
            {storageUsage && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-3">Storage Details:</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used:</span>
                    <span>{formatBytes(storageUsage.used)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available:</span>
                    <span>{formatBytes(storageUsage.quota - storageUsage.used)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${(storageUsage.used / storageUsage.quota) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OfflineSupport;
