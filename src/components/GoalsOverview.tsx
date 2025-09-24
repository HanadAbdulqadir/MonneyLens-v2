import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { Target, ArrowRight, Calendar, CheckCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GoalsOverview = () => {
  const { goals } = useFinancial();
  const navigate = useNavigate();

  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);
  const totalTargetAmount = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrentAmount = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const urgentGoals = activeGoals.filter(g => {
    const daysRemaining = getDaysRemaining(g.deadline);
    const progress = (g.currentAmount / g.targetAmount) * 100;
    return daysRemaining <= 30 && progress < 75;
  });

  if (goals.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="font-semibold mb-1">No Goals Set</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Set financial goals to track your progress
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/goals')}
        >
          Create First Goal
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Financial Goals</h3>
            <p className="text-sm text-muted-foreground">
              {activeGoals.length} active • {completedGoals.length} completed
            </p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/goals')}
          className="text-primary hover:bg-primary/10"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Overall Progress */}
      {activeGoals.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold text-primary">{overallProgress.toFixed(1)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2 [&>div]:bg-primary" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Saved: £{totalCurrentAmount.toFixed(0)}</span>
            <span>Target: £{totalTargetAmount.toFixed(0)}</span>
          </div>
        </div>
      )}

      {/* Urgent Goals Alert */}
      {urgentGoals.length > 0 && (
        <div className="mb-4 p-3 bg-warning/5 border border-warning/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-warning" />
            <span className="font-semibold text-sm text-warning">
              {urgentGoals.length} goal{urgentGoals.length > 1 ? 's' : ''} need attention
            </span>
          </div>
          {urgentGoals.slice(0, 2).map(goal => {
            const daysRemaining = getDaysRemaining(goal.deadline);
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <div key={goal.id} className="flex justify-between items-center text-sm">
                <span>{goal.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{progress.toFixed(0)}%</span>
                  <Badge variant="secondary" className="text-xs bg-warning/20 text-warning">
                    {daysRemaining <= 0 ? 'Overdue' : `${daysRemaining}d left`}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top 3 Goals */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-muted-foreground">Recent Goals</h4>
        {activeGoals
          .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))
          .slice(0, 3)
          .map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isNearCompletion = progress >= 80;
            
            return (
              <div key={goal.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{goal.name}</p>
                      {isNearCompletion && <TrendingUp className="h-3 w-3 text-success" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{goal.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-primary">£{goal.currentAmount.toFixed(0)}</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className={`text-xs ${daysRemaining <= 30 ? 'text-warning' : 'text-muted-foreground'}`}>
                        {daysRemaining <= 0 ? 'Overdue' : `${daysRemaining}d`}
                      </span>
                    </div>
                  </div>
                </div>
                <Progress 
                  value={progress} 
                  className={`h-1.5 ${
                    progress >= 100 ? '[&>div]:bg-success' :
                    progress >= 75 ? '[&>div]:bg-primary' : '[&>div]:bg-primary'
                  }`}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{progress.toFixed(0)}% complete</span>
                  <span>Goal: £{goal.targetAmount.toFixed(0)}</span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Completed Goals Preview */}
      {completedGoals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-success flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Recently Completed
            </span>
            <Badge variant="outline" className="text-xs border-success text-success">
              {completedGoals.length} goal{completedGoals.length > 1 ? 's' : ''}
            </Badge>
          </div>
          {completedGoals.slice(0, 2).map(goal => (
            <div key={goal.id} className="text-sm text-muted-foreground">
              • {goal.name} - £{goal.targetAmount.toFixed(0)} ✓
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-primary">£{totalCurrentAmount.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Total Saved</p>
        </div>
        <div>
          <p className="text-lg font-bold">£{(totalTargetAmount - totalCurrentAmount).toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Left to Save</p>
        </div>
      </div>
    </Card>
  );
};

export default GoalsOverview;