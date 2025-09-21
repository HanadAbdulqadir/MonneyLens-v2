import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Palette, 
  BarChart3, 
  PieChart, 
  LineChart,
  Settings2,
  Eye,
  Zap,
  RefreshCw,
  Download,
  Upload,
  Paintbrush
} from "lucide-react";

interface VisualizationPreferences {
  defaultChartType: 'bar' | 'pie' | 'line' | 'area' | 'donut';
  colorScheme: 'default' | 'vibrant' | 'pastel' | 'monochrome' | 'custom';
  animationsEnabled: boolean;
  animationSpeed: number;
  gridLines: boolean;
  dataLabels: boolean;
  tooltipStyle: 'minimal' | 'detailed' | 'compact';
  currencySymbol: '£' | '$' | '€' | '¥';
  numberFormat: 'standard' | 'compact' | 'accounting';
  chartHeight: number;
  showTrends: boolean;
  comparisonMode: 'none' | 'previous-period' | 'budget' | 'both';
  darkModeCharts: boolean;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    destructive: string;
  };
}

interface ChartTheme {
  name: string;
  colors: string[];
  description: string;
}

const VisualizationPreferences = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState<VisualizationPreferences>({
    defaultChartType: 'bar',
    colorScheme: 'default',
    animationsEnabled: true,
    animationSpeed: 500,
    gridLines: true,
    dataLabels: true,
    tooltipStyle: 'detailed',
    currencySymbol: '£',
    numberFormat: 'standard',
    chartHeight: 400,
    showTrends: true,
    comparisonMode: 'previous-period',
    darkModeCharts: false,
    customColors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      destructive: '#ef4444'
    }
  });

  const chartThemes: ChartTheme[] = [
    {
      name: 'Default',
      colors: ['#3b82f6', '#ef4444', '#8b5cf6', '#10b981', '#f59e0b'],
      description: 'Clean and professional'
    },
    {
      name: 'Vibrant',
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'],
      description: 'Bold and energetic'
    },
    {
      name: 'Pastel',
      colors: ['#a8e6cf', '#ffd3a5', '#c7ceea', '#ffb3ba', '#b3e5d1'],
      description: 'Soft and calming'
    },
    {
      name: 'Monochrome',
      colors: ['#2d3748', '#4a5568', '#718096', '#a0aec0', '#cbd5e0'],
      description: 'Elegant grayscale'
    },
    {
      name: 'Ocean',
      colors: ['#006a75', '#00a0b0', '#50c9ce', '#7dd3c0', '#a8e6cf'],
      description: 'Cool blues and greens'
    },
    {
      name: 'Sunset',
      colors: ['#ff6b35', '#f7931e', '#ffcc02', '#c7d2fe', '#a78bfa'],
      description: 'Warm oranges and purples'
    }
  ];

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('visualization-preferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage and apply to CSS
  useEffect(() => {
    localStorage.setItem('visualization-preferences', JSON.stringify(preferences));
    applyPreferencesToDocument();
  }, [preferences]);

  // Apply preferences to document root for CSS variables
  const applyPreferencesToDocument = () => {
    const root = document.documentElement;
    
    // Use semantic chart colors from the theme by default
    // This ensures consistency with the overall design system
    const semanticChartColors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))', 
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))'
    ];
    
    // Apply chart colors - prefer semantic colors unless custom is specifically set
    if (preferences.colorScheme === 'custom') {
      Object.entries(preferences.customColors).forEach(([key, color]) => {
        root.style.setProperty(`--chart-${key}`, color);
      });
    } else {
      // Use semantic colors for consistency
      semanticChartColors.forEach((color, index) => {
        root.style.setProperty(`--chart-${index + 1}`, color);
      });
    }
    
    // Animation settings
    root.style.setProperty('--chart-animation-duration', `${preferences.animationSpeed}ms`);
    root.style.setProperty('--chart-height', `${preferences.chartHeight}px`);
    
    // Grid and data labels
    root.style.setProperty('--chart-grid-opacity', preferences.gridLines ? '0.2' : '0');
    root.style.setProperty('--chart-labels-display', preferences.dataLabels ? 'block' : 'none');
  };

  const updatePreference = <K extends keyof VisualizationPreferences>(
    key: K, 
    value: VisualizationPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    const defaultPrefs: VisualizationPreferences = {
      defaultChartType: 'bar',
      colorScheme: 'default',
      animationsEnabled: true,
      animationSpeed: 500,
      gridLines: true,
      dataLabels: true,
      tooltipStyle: 'detailed',
      currencySymbol: '£',
      numberFormat: 'standard',
      chartHeight: 400,
      showTrends: true,
      comparisonMode: 'previous-period',
      darkModeCharts: false,
      customColors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#8b5cf6',
        success: '#10b981',
        warning: '#f59e0b',
        destructive: '#ef4444'
      }
    };
    
    setPreferences(defaultPrefs);
    toast({
      title: "Preferences Reset",
      description: "All visualization preferences have been reset to defaults"
    });
  };

  const exportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `moneylens-viz-preferences-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Preferences Exported",
      description: "Your visualization preferences have been saved to a file"
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
          title: "Preferences Imported",
          description: "Your visualization preferences have been imported successfully"
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "The preferences file is invalid or corrupted",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const formatCurrency = (amount: number) => {
    const formatter = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: preferences.currencySymbol === '£' ? 'GBP' : 
                preferences.currencySymbol === '$' ? 'USD' :
                preferences.currencySymbol === '€' ? 'EUR' : 'JPY',
      notation: preferences.numberFormat === 'compact' ? 'compact' : 'standard',
      currencyDisplay: preferences.numberFormat === 'accounting' ? 'code' : 'symbol'
    });
    return formatter.format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          Chart Preferences
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Visualization Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chart Type & Appearance */}
          <Card className="p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Chart Appearance
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label className="text-sm mb-2 block">Color Scheme</Label>
                <Select 
                  value={preferences.colorScheme} 
                  onValueChange={(value: any) => updatePreference('colorScheme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chartThemes.map(theme => (
                      <SelectItem key={theme.name} value={theme.name.toLowerCase()}>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {theme.colors.slice(0, 3).map((color, i) => (
                              <div 
                                key={i}
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          {theme.name}
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Colors</SelectItem>
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
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
                <Label className="text-sm">Dark Mode</Label>
                <Switch
                  checked={preferences.darkModeCharts}
                  onCheckedChange={(checked) => updatePreference('darkModeCharts', checked)}
                />
              </div>
            </div>
          </Card>

          {/* Animation Settings */}
          <Card className="p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Animations
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Animations</Label>
                <Switch
                  checked={preferences.animationsEnabled}
                  onCheckedChange={(checked) => updatePreference('animationsEnabled', checked)}
                />
              </div>
              
              {preferences.animationsEnabled && (
                <div>
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
            </div>
          </Card>

          {/* Format Settings */}
          <Card className="p-4">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Display Format
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm mb-2 block">Currency Symbol</Label>
                <Select 
                  value={preferences.currencySymbol} 
                  onValueChange={(value: any) => updatePreference('currencySymbol', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="£">£ (GBP)</SelectItem>
                    <SelectItem value="$">$ (USD)</SelectItem>
                    <SelectItem value="€">€ (EUR)</SelectItem>
                    <SelectItem value="¥">¥ (JPY)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Number Format</Label>
                <Select 
                  value={preferences.numberFormat} 
                  onValueChange={(value: any) => updatePreference('numberFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="compact">Compact (1.2K)</SelectItem>
                    <SelectItem value="accounting">Accounting</SelectItem>
                  </SelectContent>
                </Select>
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

            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <Label className="text-sm font-medium">Preview:</Label>
              <div className="mt-2 space-y-1 text-sm">
                <div>Large amount: {formatCurrency(12345.67)}</div>
                <div>Small amount: {formatCurrency(23.45)}</div>
                <div>Zero: {formatCurrency(0)}</div>
              </div>
            </div>
          </Card>

          {/* Custom Colors (if selected) */}
          {preferences.colorScheme === 'custom' && (
            <Card className="p-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Paintbrush className="h-4 w-4" />
                Custom Colors
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(preferences.customColors).map(([key, color]) => (
                  <div key={key}>
                    <Label className="text-sm mb-2 block capitalize">{key}</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => updatePreference('customColors', {
                          ...preferences.customColors,
                          [key]: e.target.value
                        })}
                        className="w-12 h-8 rounded border"
                      />
                      <span className="text-xs text-muted-foreground">{color}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportPreferences} className="gap-2">
                <Download className="h-3 w-3" />
                Export
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importPreferences}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-3 w-3" />
                  Import
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetToDefaults} className="gap-2">
                <RefreshCw className="h-3 w-3" />
                Reset
              </Button>
              
              <Button onClick={() => setIsOpen(false)}>
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisualizationPreferences;
