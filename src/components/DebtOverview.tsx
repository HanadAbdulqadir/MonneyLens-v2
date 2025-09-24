import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFinancial } from "@/contexts/SupabaseFinancialContext";
import { CreditCard, AlertTriangle, ArrowRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DebtOverview = () => {
  const { debts } = useFinancial();
  const navigate = useNavigate();

  const activeDebts = debts.filter(d => d?.remainingAmount > 0);
  const totalDebt = activeDebts.reduce((sum, d) => sum + (d?.remainingAmount || 0), 0);
  const totalOriginalDebt = activeDebts.reduce((sum, d) => sum + (d?.totalAmount || 0), 0);
  const totalProgress = totalOriginalDebt > 0 ? ((totalOriginalDebt - totalDebt) / totalOriginalDebt) * 100 : 0;

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const urgentDebts = activeDebts.filter(d => getDaysUntilDue(d.dueDate) <= 7);

  if (activeDebts.length === 0) {
    return (
      <Card className="p-6 text-center bg-gradient-to-br from-success/5 to-background border-success/20">
        <CreditCard className="h-8 w-8 text-success mx-auto mb-2" />
        <h3 className="font-semibold text-success mb-1">Debt Free! 🎉</h3>
        <p className="text-sm text-muted-foreground mb-3">
          You have no active debts
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/debts')}
          className="border-success text-success hover:bg-success/10"
        >
          View Debt History
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <CreditCard className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Active Debts</h3>
            <p className="text-sm text-muted-foreground">{activeDebts.length} debt{activeDebts.length > 1 ? 's' : ''} to pay off</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/debts')}
          className="text-primary hover:bg-primary/10"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Total Debt Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Total Debt Progress</span>
          <span className="text-sm font-bold">{totalProgress.toFixed(1)}%</span>
        </div>
        <Progress value={totalProgress} className="h-2 [&>div]:bg-success" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Paid: £{(totalOriginalDebt - totalDebt).toFixed(0)}</span>
          <span>Remaining: £{totalDebt.toFixed(0)}</span>
        </div>
      </div>

      {/* Urgent Debts Alert */}
      {urgentDebts.length > 0 && (
        <div className="mb-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="font-semibold text-sm text-destructive">
              {urgentDebts.length} payment{urgentDebts.length > 1 ? 's' : ''} due soon
            </span>
          </div>
          {urgentDebts.slice(0, 2).map(debt => {
            const daysUntilDue = getDaysUntilDue(debt.dueDate);
            return (
              <div key={debt.id} className="flex justify-between items-center text-sm">
                <span>{debt.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">£{debt.minimumPayment.toFixed(0)}</span>
                  <Badge variant="destructive" className="text-xs">
                    {daysUntilDue <= 0 ? 'Overdue' : `${daysUntilDue}d`}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top 3 Debts */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-muted-foreground">Largest Debts</h4>
        {activeDebts
          .sort((a, b) => b.remainingAmount - a.remainingAmount)
          .slice(0, 3)
          .map(debt => {
            const progress = ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100;
            const daysUntilDue = getDaysUntilDue(debt.dueDate);
            
            return (
              <div key={debt.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{debt.name}</p>
                    <p className="text-xs text-muted-foreground">Debt</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-destructive">£{debt.remainingAmount.toFixed(0)}</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className={`text-xs ${daysUntilDue <= 7 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {daysUntilDue <= 0 ? 'Overdue' : `${daysUntilDue}d`}
                      </span>
                    </div>
                  </div>
                </div>
                <Progress value={progress} className="h-1.5 [&>div]:bg-success" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{progress.toFixed(0)}% paid off</span>
                  <span>Min: £{debt.minimumPayment.toFixed(0)}</span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-destructive">£{totalDebt.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Total Remaining</p>
        </div>
        <div>
          <p className="text-lg font-bold">£{activeDebts.reduce((sum, d) => sum + d.minimumPayment, 0).toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">Monthly Payments</p>
        </div>
      </div>
    </Card>
  );
};

export default DebtOverview;
