import EnhancedCalendarView from "@/components/EnhancedCalendarView";
import AddTransactionModal from "@/components/AddTransactionModal";

const Calendar = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enhanced Calendar</h1>
          <p className="text-muted-foreground">Interactive financial calendar with drag-and-drop</p>
        </div>
        <AddTransactionModal />
      </div>

      <EnhancedCalendarView />
    </div>
  );
};

export default Calendar;