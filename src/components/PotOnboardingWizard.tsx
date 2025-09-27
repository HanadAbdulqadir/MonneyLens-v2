import { useState } from 'react';
import { usePots } from "@core/contexts/PotsContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import { Badge } from "@shared/components/ui/badge";
import { Progress } from "@shared/components/ui/progress";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  PiggyBank, 
  Home, 
  Car, 
  Plane, 
  Heart, 
  GraduationCap,
  Utensils,
  ShoppingCart,
  Zap
} from 'lucide-react';
import { cn } from "@shared/lib/utils";
import { toast } from 'sonner';

interface PotOnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface PotTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  suggestedAmount?: number;
  priority: number;
}

const potTemplates: PotTemplate[] = [
  {
    id: 'emergency',
    name: 'Emergency Fund',
    description: 'For unexpected expenses and financial security',
    icon: <Zap className="h-6 w-6" />,
    color: 'bg-yellow-500',
    suggestedAmount: 1000,
    priority: 1
  },
  {
    id: 'rent',
    name: 'Rent/Mortgage',
    description: 'Monthly housing payments',
    icon: <Home className="h-6 w-6" />,
    color: 'bg-blue-500',
    priority: 2
  },
  {
    id: 'bills',
    name: 'Utilities & Bills',
    description: 'Electricity, water, internet, phone bills',
    icon: <Zap className="h-6 w-6" />,
    color: 'bg-purple-500',
    priority: 3
  },
  {
    id: 'groceries',
    name: 'Groceries',
    description: 'Weekly food shopping',
    icon: <Utensils className="h-6 w-6" />,
    color: 'bg-green-500',
    priority: 4
  },
  {
    id: 'transport',
    name: 'Transport',
    description: 'Fuel, public transport, car maintenance',
    icon: <Car className="h-6 w-6" />,
    color: 'bg-orange-500',
    priority: 5
  },
  {
    id: 'savings',
    name: 'Savings',
    description: 'Long-term savings and investments',
    icon: <PiggyBank className="h-6 w-6" />,
    color: 'bg-emerald-500',
    priority: 6
  },
  {
    id: 'vacation',
    name: 'Vacation',
    description: 'Travel and holiday expenses',
    icon: <Plane className="h-6 w-6" />,
    color: 'bg-cyan-500',
    priority: 7
  },
  {
    id: 'health',
    name: 'Healthcare',
    description: 'Medical expenses and insurance',
    icon: <Heart className="h-6 w-6" />,
    color: 'bg-red-500',
    priority: 8
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Courses, books, learning materials',
    icon: <GraduationCap className="h-6 w-6" />,
    color: 'bg-indigo-500',
    priority: 9
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Dining out, movies, hobbies',
    icon: <ShoppingCart className="h-6 w-6" />,
    color: 'bg-pink-500',
    priority: 10
  }
];

export default function PotOnboardingWizard({ isOpen, onComplete }: PotOnboardingWizardProps) {
  const { createPot } = usePots();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPots, setSelectedPots] = useState<string[]>([]);
  const [potDetails, setPotDetails] = useState<Record<string, { targetAmount?: number; description?: string }>>({});
  const [isCreating, setIsCreating] = useState(false);

  const totalSteps = 3;

  const handlePotToggle = (potId: string) => {
    setSelectedPots(prev => 
      prev.includes(potId) 
        ? prev.filter(id => id !== potId)
        : [...prev, potId]
    );
  };

  const handlePotDetailChange = (potId: string, field: string, value: string | number) => {
    setPotDetails(prev => ({
      ...prev,
      [potId]: {
        ...prev[potId],
        [field]: value
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreatePots = async () => {
    if (selectedPots.length === 0) {
      toast.error('Please select at least one pot to create');
      return;
    }

    setIsCreating(true);

    try {
      for (const potId of selectedPots) {
        const template = potTemplates.find(p => p.id === potId);
        if (!template) continue;

        const details = potDetails[potId] || {};
        await createPot({
          name: template.name,
          description: details.description || template.description,
          target_amount: details.targetAmount || template.suggestedAmount || 500,
          current_balance: 0,
          priority: template.priority,
          allocation_rule: { type: 'manual' },
          auto_transfer_enabled: false,
          color: template.color.replace('bg-', ''),
          icon: template.name.toLowerCase()
        });
      }

      toast.success(`Successfully created ${selectedPots.length} pots!`);
      onComplete();
    } catch (error) {
      console.error('Error creating pots:', error);
      toast.error('Failed to create pots');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl">Set Up Your Financial Pots</CardTitle>
          <CardDescription>
            Create pots to organize your money and achieve your financial goals
          </CardDescription>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Step 1: Select Pots */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Choose Your Pots</h3>
              <p className="text-sm text-muted-foreground">
                Select the pots you'd like to create. You can always add more later.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {potTemplates.map(template => (
                  <div
                    key={template.id}
                    className={cn(
                      "border-2 rounded-lg p-4 cursor-pointer transition-all duration-200",
                      selectedPots.includes(template.id)
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    )}
                    onClick={() => handlePotToggle(template.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-full text-white", template.color)}>
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                      <CheckCircle 
                        className={cn(
                          "h-5 w-5",
                          selectedPots.includes(template.id)
                            ? "text-primary"
                            : "text-muted"
                        )} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Configure Pots */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Configure Your Pots</h3>
              <p className="text-sm text-muted-foreground">
                Set target amounts and descriptions for your selected pots.
              </p>
              
              <div className="space-y-4">
                {selectedPots.map(potId => {
                  const template = potTemplates.find(p => p.id === potId);
                  if (!template) return null;

                  const details = potDetails[potId] || {};

                  return (
                    <div key={potId} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full text-white", template.color)}>
                          {template.icon}
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {template.description}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${potId}-amount`}>Target Amount (£)</Label>
                          <Input
                            id={`${potId}-amount`}
                            type="number"
                            placeholder={template.suggestedAmount?.toString() || "500"}
                            value={details.targetAmount || ''}
                            onChange={(e) => handlePotDetailChange(potId, 'targetAmount', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${potId}-description`}>Description (Optional)</Label>
                          <Textarea
                            id={`${potId}-description`}
                            placeholder={template.description}
                            value={details.description || ''}
                            onChange={(e) => handlePotDetailChange(potId, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Review and Create */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Your Pots</h3>
              <p className="text-sm text-muted-foreground">
                Review your pot selections before creating them.
              </p>
              
              <div className="space-y-4">
                {selectedPots.map(potId => {
                  const template = potTemplates.find(p => p.id === potId);
                  if (!template) return null;

                  const details = potDetails[potId] || {};

                  return (
                    <div key={potId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-full text-white", template.color)}>
                            {template.icon}
                          </div>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {details.description || template.description}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          £{(details.targetAmount || template.suggestedAmount || 500).toLocaleString()}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Quick Tips</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• You can always edit pot details later in the settings</li>
                  <li>• Set up allocation rules to automatically fund your pots</li>
                  <li>• Track your progress towards each pot's target amount</li>
                  <li>• Transfer money between pots as needed</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>

        {/* Navigation Buttons */}
        <div className="border-t p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={currentStep === 1 && selectedPots.length === 0}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleCreatePots}
                disabled={isCreating || selectedPots.length === 0}
              >
                {isCreating ? 'Creating Pots...' : `Create ${selectedPots.length} Pots`}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
