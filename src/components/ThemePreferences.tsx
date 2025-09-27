import React, { useState, useEffect } from 'react';
import { Card } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Switch } from "@shared/components/ui/switch";
import { Slider } from "@shared/components/ui/slider";
import { Badge } from "@shared/components/ui/badge";
import { useToast } from "@shared/hooks/use-toast";
import { useFinancial } from "@core/contexts/SupabaseFinancialContext";
import { 
  Palette, 
  BarChart3, 
  Monitor,
  Zap,
  Eye,
  RefreshCw,
  Download,
  Upload,
  Paintbrush
} from "lucide-react";

interface ThemePreferences {
  // Application theme
  appTheme: 'light' | 'dark' | 'auto';
  colorScheme: 'professional' | 'vibrant' | 'pastel' | 'monochrome' | 'ocean' | 'sunset';
  
  // Chart preferences
  defaultChartType: 'bar' | 'pie' | 'line' | 'area' | 'donut';
  animationsEnabled: boolean;
  animationSpeed: number;
  gridLines: boolean;
  dataLabels: boolean;
  tooltipStyle: 'minimal' | 'detailed' | 'compact';
  chartHeight: number;
  showTrends: boolean;
  comparisonMode: 'none' | 'previous-period' | 'budget' | 'both';
}

interface ColorScheme {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    destructive: string;
    chart1: string;
    chart2: string;
    chart3: string;
    chart4: string;
    chart5: string;
  };
}

const ThemePreferences = () => {
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode } = useFinancial();
  const [preferences, setPreferences] = useState<ThemePreferences>({
    appTheme: 'auto',
    colorScheme: 'professional',
    defaultChartType: 'bar',
    animationsEnabled: true,
    animationSpeed: 500,
    gridLines: true,
    dataLabels: true,
    tooltipStyle: 'detailed',
    chartHeight: 400,
    showTrends: true,
    comparisonMode: 'previous-period'
  });

  const colorSchemes: ColorScheme[] = [
    {
      name: 'professional',
      description: 'Clean and professional',
      colors: {
        primary: '210 14% 24%',
        secondary: '0 0% 98%',
        accent: '0 0% 100%',
        success: '142 69% 58%',
        warning: '43 96% 56%',
        destructive: '0 72% 51%',
        chart1: '210 14% 24%',
        chart2: '197 71% 52%',
        chart3: '142 69% 58%',
        chart4: '43 96% 56%',
        chart5: '0 72% 51%'
      }
    },
    {
      name: 'vibrant',
      description: 'Bold and energetic',
      colors: {
        primary: '217 91% 60%',
        secondary: '0 0% 96%',
        accent: '262 83% 58%',
        success: '142 71% 45%',
        warning: '38 92% 50%',
        destructive: '0 84% 60%',
        chart1: '217 91% 60%',
        chart2: '0 84% 60%',
        chart3: '262 83% 58%',
        chart4: '38 92% 50%',
        chart5: '142 71% 45%'
      }
    },
    {
      name: 'pastel',
      description: 'Soft and calming',
      colors: {
        primary: '210 20% 65%',
        secondary: '0 0% 98%',
        accent: '300 20% 85%',
        success: '150 30% 70%',
        warning: '45 80% 75%',
        destructive: '0 50% 75%',
        chart1: '210 40% 70%',
        chart2: '150 40% 70%',
        chart3: '300 40% 70%',
        chart4: '45 60% 70%',
        chart5: '0 40% 70%'
      }
    },
    {
      name: 'monochrome',
      description: 'Elegant grayscale',
      colors: {
        primary: '0 0% 20%',
        secondary: '0 0% 96%',
        accent: '0 0% 100%',
        success: '0 0% 40%',
        warning: '0 0% 50%',
        destructive: '0 0% 30%',
        chart1: '0 0% 20%',
        chart2: '0 0% 35%',
        chart3: '0 0% 50%',
        chart4: '0 0% 65%',
        chart5: '0 0% 80%'
      }
    },
    {
      name: 'ocean',
      description: 'Cool blues and greens',
      colors: {
        primary: '200 70% 40%',
        secondary: '0 0% 96%',
        accent: '180 50% 80%',
        success: '160 60% 50%',
        warning: '190 60% 60%',
        destructive: '200 60% 45%',
        chart1: '200 70% 40%',
        chart2: '180 60% 50%',
        chart3: '160 60% 50%',
        chart4: '220 50% 60%',
        chart5: '140 50% 60%'
      }
    },
    {
      name: 'sunset',
      description: 'Warm oranges and purples',
      colors: {
        primary: '25 85% 53%',
        secondary: '0 0% 96%',
        accent: '280 60% 70%',
        success: '45 90% 60%',
        warning: '35 85% 60%',
        destructive: '15 85% 60%',
        chart1: '25 85% 53%',
        chart2: '35 85% 60%',
        chart3: '280 60% 70%',
        chart4: '45 90% 60%',
        chart5: '320 50% 65%'
      }
    }
  ];

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load theme preferences:', error);
      }
    }
  }, []);

  // Save preferences and apply theme changes
  useEffect(() => {
    localStorage.setItem('theme-preferences', JSON.stringify(preferences));
    applyThemeToDocument();
  }, [preferences]);

  const applyThemeToDocument = () => {
    const root = document.documentElement;
    const selectedScheme = colorSchemes.find(scheme => scheme.name === preferences.colorScheme);
    
    if (selectedScheme) {
      // Apply color scheme to CSS variables
      Object.entries(selectedScheme.colors).forEach(([key, value]) => {
        if (key.startsWith('chart')) {
          root.style.setProperty(`--${key}`, value);
        } else {
          root.style.setProperty(`--${key}`, value);
        }
      });
    }
    
    // Apply chart-specific settings
    root.style.setProperty('--chart-animation-duration', `${preferences.animationSpeed}ms`);
    root.style.setProperty('--chart-height', `${preferences.chartHeight}px`);
    root.style.setProperty('--chart-grid-opacity', preferences.gridLines ? '0.2' : '0');
    root.style.setProperty('--chart-labels-display', preferences.dataLabels ? 'block' : 'none');
    
    // Handle app theme
    if (preferences.appTheme === 'light' && isDarkMode) {
      toggleDarkMode();
    } else if (preferences.appTheme === 'dark' && !isDarkMode) {
      toggleDarkMode();
    }
  };

  const updatePreference = <K extends keyof ThemePreferences>(
    key: K, 
    value: ThemePreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    const defaultPrefs: ThemePreferences = {
      appTheme: 'auto',
      colorScheme: 'professional',
      defaultChartType: 'bar',
      animationsEnabled: true,
      animationSpeed: 500,
      gridLines: true,
      dataLabels: true,
      tooltipStyle: 'detailed',
      chartHeight: 400,
      showTrends: true,
      comparisonMode: 'previous-period'
    };
    
    setPreferences(defaultPrefs);
    toast({
      title: "Theme Reset",
      description: "All theme preferences have been reset to defaults"
    });
  };

  const exportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `moneylens-theme-preferences-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Theme Exported",
      description: "Your theme preferences have been saved to a file"
    });
  };

  const importPreferences = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setPreferences(imported);
        toast({
          title: "Theme Imported",
          description: "Your theme preferences have been imported successfully"
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "The theme file is invalid or corrupted",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const selectedScheme = colorSchemes.find(scheme => scheme.name === preferences.colorScheme);

  return (
    <div className="space-y-6">
      {/* Application Theme */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Monitor className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Application Theme</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm mb-2 block">Color Scheme</Label>
            <Select 
              value={preferences.colorScheme} 
              onValueChange={(value: any) => updatePreference('colorScheme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorSchemes.map(scheme => (
                  <SelectItem key={scheme.name} value={scheme.name}>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {Object.values(scheme.colors).slice(0, 3).map((color, i) => (
                          <div 
                            key={i}
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: `hsl(${color})` }}
                          />
                        ))}
                      </div>
                      <div>
                        <div className="font-medium capitalize">{scheme.name}</div>
                        <div className="text-xs text-muted-foreground">{scheme.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Theme Mode</Label>
            <Select 
              value={preferences.appTheme} 
              onValueChange={(value: any) => updatePreference('appTheme', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="auto">Auto (System)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedScheme && (
          <div className="mt-6">
            <Label className="text-sm mb-3 block">Color Preview</Label>
            <div className="grid grid-cols-5 gap-3">
              {Object.entries(selectedScheme.colors).slice(0, 5).map(([name, color]) => (
                <div key={name} className="text-center">
                  <div 
                    className="w-full h-12 rounded-lg border shadow-sm mb-2"
                    style={{ backgroundColor: `hsl(${color})` }}
                  />
                  <Label className="text-xs capitalize">{name}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Chart Preferences */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Chart Preferences</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm mb-2 block">Default Chart Type</Label>
            <Select 
              value={preferences.defaultChartType} 
              onValueChange={(value: any) => updatePreference('defaultChartType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
                <SelectItem value="donut">Donut Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Tooltip Style</Label>
            <Select 
              value={preferences.tooltipStyle} 
              onValueChange={(value: any) => updatePreference('tooltipStyle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Chart Height: {preferences.chartHeight}px</Label>
            <Slider
              value={[preferences.chartHeight]}
              onValueChange={(value) => updatePreference('chartHeight', value[0])}
              min={200}
              max={600}
              step={25}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-sm mb-2 block">Comparison Mode</Label>
            <Select 
              value={preferences.comparisonMode} 
              onValueChange={(value: any) => updatePreference('comparisonMode', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="previous-period">Previous Period</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Grid Lines</Label>
            <Switch
              checked={preferences.gridLines}
              onCheckedChange={(checked) => updatePreference('gridLines', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Data Labels</Label>
            <Switch
              checked={preferences.dataLabels}
              onCheckedChange={(checked) => updatePreference('dataLabels', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Show Trends</Label>
            <Switch
              checked={preferences.showTrends}
              onCheckedChange={(checked) => updatePreference('showTrends', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Animations</Label>
            <Switch
              checked={preferences.animationsEnabled}
              onCheckedChange={(checked) => updatePreference('animationsEnabled', checked)}
            />
          </div>
        </div>

        {preferences.animationsEnabled && (
          <div className="mt-4">
            <Label className="text-sm mb-2 block">
              Animation Speed: {preferences.animationSpeed}ms
            </Label>
            <Slider
              value={[preferences.animationSpeed]}
              onValueChange={(value) => updatePreference('animationSpeed', value[0])}
              min={100}
              max={1000}
              step={50}
              className="w-full"
            />
          </div>
        )}
      </Card>

      {/* Theme Management */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Paintbrush className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Theme Management</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="gap-2 h-auto p-4 justify-start"
            onClick={resetToDefaults}
          >
            <RefreshCw className="h-4 w-4" />
            <div className="text-left">
              <p className="font-medium">Reset Theme</p>
              <p className="text-sm text-muted-foreground">Restore default settings</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="gap-2 h-auto p-4 justify-start"
            onClick={exportPreferences}
          >
            <Download className="h-4 w-4" />
            <div className="text-left">
              <p className="font-medium">Export Theme</p>
              <p className="text-sm text-muted-foreground">Save current preferences</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="gap-2 h-auto p-4 justify-start"
            onClick={() => document.getElementById('theme-import')?.click()}
          >
            <Upload className="h-4 w-4" />
            <div className="text-left">
              <p className="font-medium">Import Theme</p>
              <p className="text-sm text-muted-foreground">Load saved preferences</p>
            </div>
          </Button>

          <input
            id="theme-import"
            type="file"
            accept=".json"
            className="hidden"
            onChange={importPreferences}
          />
        </div>
      </Card>
    </div>
  );
};

export default ThemePreferences;