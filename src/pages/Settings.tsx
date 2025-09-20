import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useFinancial } from "@/contexts/FinancialContext";
import { useState } from "react";
import { Settings as SettingsIcon, Download, Upload, Trash2, RefreshCw, User, Bell, Shield, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

const Settings = () => {
  const { monthlyStartingPoint, setMonthlyStartingPoint, dailyData, transactions } = useFinancial();
  const { toast } = useToast();
  const [startingPoint, setStartingPoint] = useState(monthlyStartingPoint.toString());
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleUpdateStartingPoint = () => {
    const amount = parseFloat(startingPoint);
    if (isNaN(amount)) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setMonthlyStartingPoint(amount);
    toast({
      title: "Success",
      description: "Starting point updated successfully"
    });
  };

  const exportData = () => {
    const data = {
      monthlyStartingPoint,
      dailyData,
      transactions,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pots-financial-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Data exported successfully"
    });
  };

  const clearAllData = () => {
    localStorage.removeItem('potsFinancialData');
    localStorage.removeItem('potsStartingPoint');
    
    toast({
      title: "Data Cleared",
      description: "All financial data has been cleared. Please refresh the page."
    });
  };

  const resetToDefaults = () => {
    setStartingPoint("755");
    setNotifications(true);
    setAutoBackup(false);
    setDarkMode(false);
    
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults"
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences</p>
        </div>
      </div>

      {/* Account Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Account Settings</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="starting-balance">Monthly Starting Balance (£)</Label>
            <div className="flex gap-3 mt-2">
              <Input
                id="starting-balance"
                type="number"
                step="0.01"
                value={startingPoint}
                onChange={(e) => setStartingPoint(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleUpdateStartingPoint}>
                Update
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This will recalculate all your balances based on the new starting point.
            </p>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Total Transactions</Label>
              <p className="text-2xl font-bold text-primary">{transactions.length}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Days Tracked</Label>
              <p className="text-2xl font-bold text-primary">{dailyData.length}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Preferences</h2>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications for daily summaries</p>
            </div>
            <Switch 
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto Backup</Label>
              <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
            </div>
            <Switch 
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
            </div>
            <Switch 
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Data Management</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Button 
            variant="outline" 
            className="gap-2 h-auto p-4 justify-start"
            onClick={exportData}
          >
            <Download className="h-4 w-4" />
            <div className="text-left">
              <p className="font-medium">Export Data</p>
              <p className="text-sm text-muted-foreground">Download all your financial data</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="gap-2 h-auto p-4 justify-start"
            onClick={() => toast({ title: "Coming Soon", description: "Data import feature will be available soon" })}
          >
            <Upload className="h-4 w-4" />
            <div className="text-left">
              <p className="font-medium">Import Data</p>
              <p className="text-sm text-muted-foreground">Upload financial data from file</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="gap-2 h-auto p-4 justify-start"
            onClick={resetToDefaults}
          >
            <RefreshCw className="h-4 w-4" />
            <div className="text-left">
              <p className="font-medium">Reset Settings</p>
              <p className="text-sm text-muted-foreground">Restore all settings to default</p>
            </div>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2 h-auto p-4 justify-start border-destructive/50 text-destructive hover:bg-destructive/5"
              >
                <Trash2 className="h-4 w-4" />
                <div className="text-left">
                  <p className="font-medium">Clear All Data</p>
                  <p className="text-sm opacity-80">Permanently delete all financial data</p>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear All Data</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete all your financial data including transactions, balances, and settings.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive" onClick={clearAllData}>
                  Delete Everything
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Appearance</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Theme</Label>
            <p className="text-sm text-muted-foreground mb-3">Choose your preferred color theme</p>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full mx-auto mb-2" />
                  <p className="text-xs">Emerald</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mb-2" />
                  <p className="text-xs">Ocean</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-2" />
                  <p className="text-xs">Sunset</p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;