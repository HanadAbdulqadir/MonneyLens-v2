import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/FinancialContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Wallet, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  BookOpen,
  Play,
  X
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  completed?: boolean;
}

const UserOnboarding = () => {
  const { transactions, addTransaction } = useFinancial();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Check if user is new (no transactions) and listen for tour events
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboarding-completed');
    const isNewUser = transactions.length === 0;
    
    if (!hasSeenOnboarding && isNewUser) {
      setTimeout(() => setIsOpen(true), 1000); // Delay to let page load
    }

    // Listen for tour start events from QuickActionsToolbar
    const handleOpenTour = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-tour', handleOpenTour);
    
    return () => {
      window.removeEventListener('open-tour', handleOpenTour);
    };
  }, [transactions]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to MoneyLens! 👋',
      description: 'Your personal finance tracker that makes money management simple and insightful.',
      component: (
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center">
            <Wallet className="h-10 w-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Let's get you started!</h3>
            <p className="text-sm text-muted-foreground">
              This quick tour will help you understand the key features and get the most out of MoneyLens.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span>Track Spending</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Target className="h-6 w-6 text-primary" />
              <span>Set Budgets</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50">
              <Sparkles className="h-6 w-6 text-primary" />
              <span>Get Insights</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'add-transaction',
      title: 'Add Your First Transaction',
      description: 'Start by recording a recent purchase or income to see how tracking works.',
      component: (
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium mb-2">🎯 Try this:</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Add a recent coffee purchase, grocery shopping, or salary to see your first transaction.
            </p>
            <Button 
              size="sm" 
              onClick={() => {
                // This would trigger the quick add modal
                toast({
                  title: "Great!",
                  description: "Use the Quick Actions toolbar or go to Transactions page to add entries.",
                });
                markStepCompleted('add-transaction');
              }}
              className="w-full"
            >
              I'll add a transaction
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            <p><strong>Tip:</strong> Use Ctrl+K anywhere in the app for quick transaction entry!</p>
          </div>
        </div>
      )
    },
    {
      id: 'navigation',
      title: 'Navigate Like a Pro',
      description: 'Discover the main sections and how to move around efficiently.',
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 border rounded-lg">
              <div className="font-medium mb-1">📊 Dashboard</div>
              <div className="text-muted-foreground">Your overview & insights</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium mb-1">💳 Transactions</div>
              <div className="text-muted-foreground">Add & manage entries</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium mb-1">🎯 Budget</div>
              <div className="text-muted-foreground">Set spending limits</div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="font-medium mb-1">📈 Analytics</div>
              <div className="text-muted-foreground">Deep insights & trends</div>
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 The sidebar collapses on smaller screens. Use the hamburger menu to navigate.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Key Features to Explore',
      description: 'Here are the powerful features that will transform how you manage money.',
      component: (
        <div className="space-y-3">
          <div className="space-y-3">
            <div className="flex gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">Smart Budgeting</div>
                <div className="text-xs text-muted-foreground">Set budgets and get warnings before overspending</div>
              </div>
            </div>
            
            <div className="flex gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">Predictive Analytics</div>
                <div className="text-xs text-muted-foreground">AI-powered insights predict your spending patterns</div>
              </div>
            </div>
            
            <div className="flex gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-medium text-sm">Quick Actions</div>
                <div className="text-xs text-muted-foreground">Keyboard shortcuts and floating toolbar for speed</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: "You're All Set! 🎉",
      description: 'Start tracking your finances and watch your financial health improve.',
      component: (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Ready to take control!</h3>
            <p className="text-sm text-muted-foreground">
              Remember, consistent tracking leads to better financial decisions. Start small and build the habit.
            </p>
          </div>
          <div className="p-3 bg-primary/5 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Pro tip:</strong> Check your dashboard weekly to spot spending patterns and stay on track with your goals.
            </p>
          </div>
        </div>
      )
    }
  ];

  const markStepCompleted = (stepId: string) => {
    setCompletedSteps(prev => [...prev, stepId]);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      markStepCompleted(steps[currentStep].id);
      setCurrentStep(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setIsOpen(false);
    toast({
      title: "Welcome aboard! 🎉",
      description: "You're all set up and ready to manage your finances like a pro!",
    });
  };

  const skipOnboarding = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setIsOpen(false);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <>
      {/* Onboarding Dialog - Tour is now only accessible through QuickActionsToolbar */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div data-onboarding-dialog style={{ display: 'none' }} />
        <DialogContent className="sm:max-w-[500px] p-0">
          {/* Header */}
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">
                  Step {currentStep + 1} of {steps.length}
                </Badge>
                <DialogTitle className="text-lg font-semibold">
                  {currentStepData.title}
                </DialogTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={skipOnboarding}>
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
            {currentStepData.component}
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
              <Button variant="outline" onClick={skipOnboarding}>
                Skip Tour
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button onClick={completeOnboarding} className="gap-2">
                  Get Started
                  <Sparkles className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={nextStep} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserOnboarding;
