import { Button } from "@shared/components/ui/button";
import { Sparkles, Plus, Upload, Play } from "lucide-react";

interface WelcomeSectionProps {
  isNewUser: boolean;
}

const WelcomeSection = ({ isNewUser }: WelcomeSectionProps) => {
  if (!isNewUser) return null;

  return (
    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Ready to take control of your finances?</h2>
          <p className="text-muted-foreground mb-4">
            Start by adding your first transaction or import your existing data to see your financial picture.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Transaction
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </Button>
            <Button variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              Take Tour
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;