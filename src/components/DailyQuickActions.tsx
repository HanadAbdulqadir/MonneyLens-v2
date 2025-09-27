import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { Zap, Target, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface DailyQuickActionsProps {
  goals: any[];
  todayIncome: number;
  todayExpenses: number;
}

const DailyQuickActions = ({ goals, todayIncome, todayExpenses }: DailyQuickActionsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Quick Allocation</CardTitle>
          </div>
          <CardDescription>Allocate today's earnings smartly</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700 mb-3">
            Use AI-powered allocation to distribute your daily income across goals, expenses, and savings.
          </p>
          <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
            <Link to="/quick-allocation" className="flex items-center gap-2">
              Start Allocation <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Today's Goals</CardTitle>
          </div>
          <CardDescription>Track daily progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-3">
            {goals.slice(0, 2).map(goal => (
              <div key={goal.id} className="flex justify-between items-center text-sm">
                <span className="truncate">{goal.name}</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                </Badge>
              </div>
            ))}
          </div>
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link to="/goals" className="flex items-center gap-2">
              View All Goals <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Daily Analytics</CardTitle>
          </div>
          <CardDescription>Today's financial snapshot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm mb-3">
            <div className="flex justify-between">
              <span>Income:</span>
              <span className="text-green-600 font-medium">+£{todayIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Expenses:</span>
              <span className="text-red-600 font-medium">-£{todayExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Net:</span>
              <span className="font-medium">£{(todayIncome - todayExpenses).toFixed(2)}</span>
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link to="/analytics" className="flex items-center gap-2">
              View Analytics <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyQuickActions;