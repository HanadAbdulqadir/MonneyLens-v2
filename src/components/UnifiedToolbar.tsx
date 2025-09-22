import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AccessibilityEnhancer from "@/components/AccessibilityEnhancer";
import UserOnboarding from "@/components/UserOnboarding";
import { 
  Command, 
  Accessibility, 
  Play, 
  Settings, 
  HelpCircle,
  Minimize2,
  Maximize2,
  Keyboard,
  Zap
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UnifiedToolbarProps {}

const UnifiedToolbar: React.FC<UnifiedToolbarProps> = () => {
  const [isMinimized, setIsMinimized] = useState(true); // Start minimized by default
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const tools = [
    {
      id: 'command-palette',
      icon: Command,
      label: 'Command Palette',
      shortcut: 'Ctrl+K',
      action: () => {
        // Trigger the same keyboard event that CommandPalette listens for
        const event = new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true
        });
        window.dispatchEvent(event);
      },
      category: 'primary'
    },
    {
      id: 'accessibility',
      icon: Accessibility,
      label: 'Accessibility',
      shortcut: 'Alt+A',
      action: () => setShowAccessibility(true),
      category: 'primary'
    },
    {
      id: 'tour',
      icon: Play,
      label: 'Take Tour',
      action: () => setShowTour(true),
      category: 'primary'
    },
    {
      id: 'shortcuts',
      icon: Keyboard,
      label: 'Shortcuts',
      shortcut: '?',
      action: () => {
        // Show shortcuts help via command palette
        const event = new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true
        });
        window.dispatchEvent(event);
      },
      category: 'secondary'
    }
  ];

  const primaryTools = tools.filter(t => t.category === 'primary');
  const secondaryTools = tools.filter(t => t.category === 'secondary');

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-40">
        {/* Accessibility and Tour Components - Now properly controlled */}
        {showAccessibility && (
          <div className="absolute bottom-full right-0 mb-2">
            <AccessibilityEnhancer 
              open={showAccessibility} 
              onOpenChange={setShowAccessibility} 
            />
          </div>
        )}
        
        {showTour && (
          <div className="absolute bottom-full right-0 mb-2">
            <UserOnboarding 
              open={showTour} 
              onOpenChange={setShowTour} 
            />
          </div>
        )}
        
        <Card className={`bg-background/95 backdrop-blur-sm border shadow-lg transition-all duration-300 cursor-pointer ${
          isMinimized ? 'w-16 h-16 rounded-full shadow-xl hover:shadow-2xl hover:scale-105' : 'w-56'
        }`}
        onClick={isMinimized ? () => setIsMinimized(false) : undefined}>
          {/* Toolbar Header */}
          <div className={`flex items-center justify-between p-2 border-b bg-muted/30 ${
            isMinimized ? 'border-b-0 bg-transparent p-0 justify-center h-16 rounded-full hover:bg-primary/10' : ''
          }`}>
            <div className="flex items-center gap-2">
              {!isMinimized ? (
                <>
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">Quick Tools</span>
                </>
              ) : (
                <div className="relative flex items-center justify-center w-full h-full">
                  <Zap className="h-6 w-6 text-primary transition-all duration-300 hover:scale-110" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse opacity-60" />
                </div>
              )}
            </div>
            {!isMinimized && (
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 hover:bg-muted"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-2.5 w-2.5" />
              </Button>
            )}
          </div>

          {/* Toolbar Content */}
          {!isMinimized && (
            <div className="p-3 space-y-3 animate-fade-in">
              {/* Primary Tools */}
              <div className="space-y-1">
                {primaryTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Tooltip key={tool.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-3 h-9 px-3 hover:bg-primary/10 hover:text-primary transition-colors text-left"
                          onClick={(e) => {
                            e.stopPropagation();
                            tool.action();
                          }}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm font-medium flex-1">{tool.label}</span>
                          {tool.shortcut && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5 ml-auto">
                            {tool.shortcut}
                          </Badge>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        <p>{tool.label}</p>
                        {tool.shortcut && <p className="text-muted-foreground">{tool.shortcut}</p>}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>

              <Separator />

              {/* Secondary Tools */}
              {secondaryTools.length > 0 && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 gap-2">
                    {secondaryTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Tooltip key={tool.id}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 justify-start gap-3 hover:bg-muted transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                tool.action();
                              }}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">{tool.label}</span>
                              {tool.shortcut && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5 ml-auto">
                                  {tool.shortcut}
                                </Badge>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            <p>{tool.label}</p>
                            {tool.shortcut && <p className="text-muted-foreground">{tool.shortcut}</p>}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Status indicator */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                  <span className="text-xs text-muted-foreground font-medium">System Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* Minimized Click Area - Remove this since card itself is clickable now */}
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default UnifiedToolbar;
