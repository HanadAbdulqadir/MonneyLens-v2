import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface UpcomingRecurringSectionProps {
  upcomingRecurring: any[];
}

const UpcomingRecurringSection = ({ upcomingRecurring }: UpcomingRecurringSectionProps) => {
  if (upcomingRecurring.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-orange-600" />
          <CardTitle>Upcoming Recurring Transactions</CardTitle>
        </div>
        <CardDescription>Automated payments scheduled for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingRecurring.map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <div className="font-medium">{transaction.name}</div>
                <div className="text-sm text-muted-foreground">{transaction.category}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-red-600">-£{Math.abs(transaction.amount).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Due soon</div>
              </div>
            </div>
          ))}
        </div>
        <Button asChild variant="outline" className="w-full mt-4">
          <Link to="/recurring" className="flex items-center gap-2">
            Manage Recurring Transactions <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpcomingRecurringSection;