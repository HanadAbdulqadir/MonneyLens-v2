import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

interface UnifiedToolbarProps {
  onCommandPaletteOpen: () => void;
  onAccessibilityOpen: () => void;
  onTourOpen: () => void;
}

const UnifiedToolbar: React.FC<UnifiedToolbarProps> = ({
  onCommandPaletteOpen,
  onAccessibilityOpen,
  onTourOpen
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const tools = [
    {
      id: 'command-palette',
      icon: Command,
      label: 'Command Palette',
      shortcut: 'Ctrl+K',
      action: onCommandPaletteOpen,
      category: 'primary'
    },
    {
      id: 'accessibility',
      icon: Accessibility,
      label: 'Accessibility',
      shortcut: 'Alt+A',
      action: onAccessibilityOpen,
      category: 'primary'
    },
    {
      id: 'tour',
      icon: Play,
      label: 'Take Tour',
      action: onTourOpen,
      category: 'primary'
    },
    {
      id: 'shortcuts',
      icon: Keyboard,
      label: 'Shortcuts',
      shortcut: '?',
      action: () => {
        // Show shortcuts help via command palette
        onCommandPaletteOpen();
      },
      category: 'secondary'
    }
  ];

  const primaryTools = tools.filter(t => t.category === 'primary');
  const secondaryTools = tools.filter(t => t.category === 'secondary');

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 left-4 z-40">
        <Card className={`bg-background/95 backdrop-blur-sm border shadow-lg transition-all duration-300 ${
          isMinimized ? 'w-12 h-12' : 'w-56'
        }`}>
          {/* Toolbar Header */}
          <div className="flex items-center justify-between p-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              {!isMinimized ? (
                <>
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">Quick Tools</span>
                </>
              ) : (
                <Zap className="h-3 w-3 text-primary mx-auto" />
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
                          onClick={tool.action}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm font-medium flex-1">{tool.label}</span>
                          {tool.shortcut && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 ml-auto">
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
                              onClick={tool.action}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">{tool.label}</span>
                              {tool.shortcut && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 ml-auto">
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

          {/* Minimized Click Area */}
          {isMinimized && (
            <div 
              className="absolute inset-0 cursor-pointer flex items-center justify-center"
              onClick={() => setIsMinimized(false)}
            >
              <Maximize2 className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default UnifiedToolbar;