import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Accessibility, 
  ZoomIn, 
  ZoomOut, 
  Contrast, 
  Eye, 
  EyeOff,
  Volume2,
  VolumeX,
  Keyboard,
  MousePointer,
  Type,
  Palette
} from "lucide-react";

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  soundEffects: boolean;
  focusIndicators: boolean;
  keyboardNavigation: boolean;
  screenReaderMode: boolean;
  colorBlindSupport: string;
}

const AccessibilityEnhancer = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 100,
    highContrast: false,
    reducedMotion: false,
    soundEffects: true,
    focusIndicators: true,
    keyboardNavigation: true,
    screenReaderMode: false,
    colorBlindSupport: 'none'
  });

  const [isOpen, setIsOpen] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Font size adjustment
    root.style.setProperty('--font-scale', `${settings.fontSize / 100}`);
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Enhanced focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
    
    // Color blind support
    if (settings.colorBlindSupport !== 'none') {
      root.classList.add(`colorblind-${settings.colorBlindSupport}`);
    } else {
      root.className = root.className.replace(/colorblind-\w+/g, '');
    }

    // Screen reader mode
    if (settings.screenReaderMode) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }
    
    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!settings.keyboardNavigation) return;
      
      // Alt + A = Accessibility panel
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Alt + + = Increase font size
      if (e.altKey && e.key === '+') {
        e.preventDefault();
        setSettings(prev => ({ 
          ...prev, 
          fontSize: Math.min(150, prev.fontSize + 10) 
        }));
      }
      
      // Alt + - = Decrease font size
      if (e.altKey && e.key === '-') {
        e.preventDefault();
        setSettings(prev => ({ 
          ...prev, 
          fontSize: Math.max(75, prev.fontSize - 10) 
        }));
      }
      
      // Alt + C = Toggle contrast
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
      }
    };

    if (settings.keyboardNavigation) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [settings.keyboardNavigation]);

  const resetSettings = () => {
    setSettings({
      fontSize: 100,
      highContrast: false,
      reducedMotion: false,
      soundEffects: true,
      focusIndicators: true,
      keyboardNavigation: true,
      screenReaderMode: false,
      colorBlindSupport: 'none'
    });
  };

  return (
    <>
      {/* Floating Accessibility Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="fixed bottom-4 left-64 z-50 shadow-lg rounded-full w-10 h-10 p-0 bg-background/95 backdrop-blur-sm border"
            aria-label="Open accessibility settings"
            title="Accessibility Settings (Alt+A)"
          >
            <Accessibility className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Accessibility Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Visual Settings */}
            <Card className="p-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visual Settings
              </h3>
              
              <div className="space-y-4">
                {/* Font Size */}
                <div className="space-y-2">
                  <Label className="text-sm">Font Size: {settings.fontSize}%</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSettings(prev => ({ 
                        ...prev, 
                        fontSize: Math.max(75, prev.fontSize - 10) 
                      }))}
                      aria-label="Decrease font size"
                    >
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                    
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={(value) => setSettings(prev => ({ 
                        ...prev, 
                        fontSize: value[0] 
                      }))}
                      min={75}
                      max={150}
                      step={5}
                      className="flex-1"
                      aria-label="Font size slider"
                    />
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSettings(prev => ({ 
                        ...prev, 
                        fontSize: Math.min(150, prev.fontSize + 10) 
                      }))}
                      aria-label="Increase font size"
                    >
                      <ZoomIn className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* High Contrast */}
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    High Contrast Mode
                  </Label>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, highContrast: checked }))
                    }
                    aria-label="Toggle high contrast mode"
                  />
                </div>

                {/* Color Blind Support */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color Blind Support
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'none', label: 'None' },
                      { value: 'deuteranopia', label: 'Deuteranopia' },
                      { value: 'protanopia', label: 'Protanopia' },
                      { value: 'tritanopia', label: 'Tritanopia' }
                    ].map(option => (
                      <Button
                        key={option.value}
                        variant={settings.colorBlindSupport === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSettings(prev => ({ 
                          ...prev, 
                          colorBlindSupport: option.value 
                        }))}
                        className="text-xs"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Reduced Motion */}
                <div className="flex items-center justify-between">
                  <Label>Reduce Motion & Animations</Label>
                  <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, reducedMotion: checked }))
                    }
                    aria-label="Toggle reduced motion"
                  />
                </div>
              </div>
            </Card>

            {/* Navigation Settings */}
            <Card className="p-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Navigation Settings
              </h3>
              
              <div className="space-y-4">
                {/* Keyboard Navigation */}
                <div className="flex items-center justify-between">
                  <Label>Enhanced Keyboard Navigation</Label>
                  <Switch
                    checked={settings.keyboardNavigation}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, keyboardNavigation: checked }))
                    }
                    aria-label="Toggle keyboard navigation"
                  />
                </div>

                {/* Focus Indicators */}
                <div className="flex items-center justify-between">
                  <Label>Enhanced Focus Indicators</Label>
                  <Switch
                    checked={settings.focusIndicators}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, focusIndicators: checked }))
                    }
                    aria-label="Toggle focus indicators"
                  />
                </div>

                {/* Screen Reader Mode */}
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Screen Reader Optimization
                  </Label>
                  <Switch
                    checked={settings.screenReaderMode}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, screenReaderMode: checked }))
                    }
                    aria-label="Toggle screen reader mode"
                  />
                </div>
              </div>
            </Card>

            {/* Audio Settings */}
            <Card className="p-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio Settings
              </h3>
              
              <div className="flex items-center justify-between">
                <Label>UI Sound Effects</Label>
                <Switch
                  checked={settings.soundEffects}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, soundEffects: checked }))
                  }
                  aria-label="Toggle sound effects"
                />
              </div>
            </Card>

            {/* Keyboard Shortcuts Info */}
            {settings.keyboardNavigation && (
              <Card className="p-4 bg-muted/50">
                <h3 className="font-medium mb-3">Keyboard Shortcuts</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <div><kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Alt + A</kbd> - Open accessibility panel</div>
                  <div><kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Alt + +</kbd> - Increase font size</div>
                  <div><kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Alt + -</kbd> - Decrease font size</div>
                  <div><kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Alt + C</kbd> - Toggle high contrast</div>
                  <div><kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Tab</kbd> - Navigate between elements</div>
                  <div><kbd className="px-1.5 py-0.5 bg-background border rounded text-xs">Enter/Space</kbd> - Activate buttons</div>
                </div>
              </Card>
            )}

            {/* Reset Button */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={resetSettings}>
                Reset to Defaults
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccessibilityEnhancer;