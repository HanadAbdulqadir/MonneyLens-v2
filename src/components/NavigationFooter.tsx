import { Button } from "@shared/components/ui/button";
import { Building, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface NavigationFooterProps {
  isNewUser: boolean;
}

const NavigationFooter = ({ isNewUser }: NavigationFooterProps) => {
  if (isNewUser) return null;

  return (
    <div className="bg-muted/30 rounded-lg p-6">
      <h3 className="font-semibold text-lg mb-4">Continue Your Financial Journey</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
          <Link to="/financial-hub">
            <Building className="h-6 w-6 mb-2" />
            <span className="font-medium">Financial Hub</span>
            <span className="text-sm text-muted-foreground text-left">Complete financial planning for the next 12 months</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
          <Link to="/budget">
            <Target className="h-6 w-6 mb-2" />
            <span className="font-medium">Budget Planning</span>
            <span className="text-sm text-muted-foreground text-left">Set and track monthly budgets</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
          <Link to="/analytics">
            <TrendingUp className="h-6 w-6 mb-2" />
            <span className="font-medium">Advanced Analytics</span>
            <span className="text-sm text-muted-foreground text-left">Deep insights and trend analysis</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NavigationFooter;