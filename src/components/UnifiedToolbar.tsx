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
  X,
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
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

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
      category: 'accessibility'
    },
    {
      id: 'tour',
      icon: Play,
      label: 'Take Tour',
      action: onTourOpen,
      category: 'help'
    },
    {
      id: 'shortcuts',
      icon: Keyboard,
      label: 'Shortcuts',
      shortcut: '?',
      action: () => {
        // Will show shortcuts help
        onCommandPaletteOpen();
      },
      category: 'help'
    }
  ];

  const primaryTools = tools.filter(t => t.category === 'primary');
  const secondaryTools = tools.filter(t => t.category !== 'primary');

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 left-4 z-50">
        <Card className={`bg-background/95 backdrop-blur-sm border shadow-lg transition-all duration-300 ${
          isMinimized ? 'w-12 h-12' : 'w-auto h-auto'
        }`}>
          {/* Toolbar Header */}
          <div className="flex items-center justify-between p-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              {!isMinimized && (
                <>
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium">Quick Tools</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 hover:bg-muted"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-2.5 w-2.5" />
                ) : (
                  <Minimize2 className="h-2.5 w-2.5" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 hover:bg-destructive/20 text-destructive"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-2.5 w-2.5" />
              </Button>
            </div>
          </div>

          {/* Toolbar Content */}
          {!isMinimized && (
            <div className="p-2 space-y-2 animate-fade-in">
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
                          className="w-full justify-start gap-2 h-8 px-2 hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={tool.action}
                        >
                          <Icon className="h-3 w-3" />
                          <span className="text-xs font-medium">{tool.label}</span>
                          {tool.shortcut && (
                            <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0">
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
              <div className="grid grid-cols-2 gap-1">
                {secondaryTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Tooltip key={tool.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 p-1 hover:bg-muted transition-colors"
                          onClick={tool.action}
                        >
                          <Icon className="h-3 w-3" />
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

              {/* Status indicator */}
              <div className="pt-1 border-t">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                  <span className="text-[10px] text-muted-foreground">Ready</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default UnifiedToolbar;