import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  X,
  Info,
  Target,
  TrendingUp,
  BarChart3,
  Calendar,
  Wallet,
  CreditCard,
  PiggyBank,
  Settings,
  Zap
} from "lucide-react";

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface PageTourProps {
  pageName: string;
  steps: TourStep[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const PageTour: React.FC<PageTourProps> = ({ pageName, steps, open, onOpenChange }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Use controlled state if provided, otherwise use internal state
  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  // Get page icon based on page name
  const getPageIcon = () => {
    const icons = {
      'Dashboard': <BarChart3 className="h-6 w-6" />,
      'Transactions': <CreditCard className="h-6 w-6" />,
      'Budget': <Target className="h-6 w-6" />,
      'Analytics': <TrendingUp className="h-6 w-6" />,
      'Calendar': <Calendar className="h-6 w-6" />,
      'Categories': <Wallet className="h-6 w-6" />,
      'Goals': <PiggyBank className="h-6 w-6" />,
      'Debts': <CreditCard className="h-6 w-6" />,
      'Recurring': <Calendar className="h-6 w-6" />,
      'Settings': <Settings className="h-6 w-6" />,
      'Financial Hub': <Zap className="h-6 w-6" />
    };
    return icons[pageName as keyof typeof icons] || <Info className="h-6 w-6" />;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem(`${pageName.toLowerCase()}-tour-completed`, 'true');
    setDialogOpen(false);
    setCurrentStep(0);
    toast({
      title: "Tour Complete! 🎉",
      description: `You've learned how to use the ${pageName} page.`,
    });
  };

  const skipTour = () => {
    localStorage.setItem(`${pageName.toLowerCase()}-tour-completed`, 'true');
    setDialogOpen(false);
    setCurrentStep(0);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[500px] p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                {getPageIcon()}
              </div>
              <div>
                <Badge variant="outline" className="text-xs">
                  {pageName} Tour
                </Badge>
                <DialogTitle className="text-lg font-semibold mt-1">
                  {currentStepData.title}
                </DialogTitle>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={skipTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Progress value={progress} className="mt-3" />
          
          <p className="text-sm text-muted-foreground mt-2">
            {currentStepData.description}
          </p>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6">
          <Card className="p-4 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-primary" />
                <span className="font-medium">What you'll learn:</span>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground ml-6">
                {steps.map((step, index) => (
                  <li 
                    key={step.id}
                    className={`${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {index + 1}. {step.title}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 pt-0 border-t">
          <Button
            variant="ghost"
            onClick={previousStep}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={skipTour}>
              Skip Tour
            </Button>
            
            <Button onClick={nextStep} className="gap-2">
              {currentStep === steps.length - 1 ? (
                <>
                  Complete Tour
                  <Sparkles className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PageTour;
