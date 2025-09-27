import { useState } from "react";
import { Card } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Badge } from "@shared/components/ui/badge";
import { Calendar, Settings, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@shared/components/ui/dialog";
import { useToast } from "@shared/hooks/use-toast";

interface AdvancedSchedule {
  type: 'simple' | 'advanced';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every X days/weeks/months/years
  dayOfWeek?: number; // 0-6 for Sunday-Saturday
  dayOfMonth?: number; // 1-31
  weekOfMonth?: 'first' | 'second' | 'third' | 'fourth' | 'last';
  monthOfYear?: number; // 1-12
  endDate?: string;
  maxOccurrences?: number;
}

interface AdvancedRecurringSchedulerProps {
  onScheduleCreate: (schedule: AdvancedSchedule) => void;
  currentSchedule?: AdvancedSchedule;
}

const AdvancedRecurringScheduler = ({ onScheduleCreate, currentSchedule }: AdvancedRecurringSchedulerProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [schedule, setSchedule] = useState<AdvancedSchedule>(currentSchedule || {
    type: 'simple',
    frequency: 'monthly',
    interval: 1
  });

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekPositions = ['first', 'second', 'third', 'fourth', 'last'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const generateScheduleDescription = (sched: AdvancedSchedule) => {
    if (sched.type === 'simple') {
      return `Every ${sched.interval > 1 ? sched.interval + ' ' : ''}${sched.frequency.slice(0, -2)}${sched.interval > 1 ? 's' : ''}`;
    }

    let description = '';
    
    switch (sched.frequency) {
      case 'weekly':
        if (sched.interval === 1) {
          description = `Every ${weekDays[sched.dayOfWeek || 0]}`;
        } else {
          description = `Every ${sched.interval} weeks on ${weekDays[sched.dayOfWeek || 0]}`;
        }
        break;
        
      case 'monthly':
        if (sched.dayOfMonth) {
          const suffix = sched.dayOfMonth === 1 ? 'st' : sched.dayOfMonth === 2 ? 'nd' : sched.dayOfMonth === 3 ? 'rd' : 'th';
          description = `Every ${sched.interval > 1 ? sched.interval + ' months' : 'month'} on the ${sched.dayOfMonth}${suffix}`;
        } else if (sched.weekOfMonth && sched.dayOfWeek !== undefined) {
          description = `Every ${sched.interval > 1 ? sched.interval + ' months' : 'month'} on the ${sched.weekOfMonth} ${weekDays[sched.dayOfWeek]}`;
        }
        break;
        
      case 'yearly':
        if (sched.monthOfYear && sched.dayOfMonth) {
          description = `Every ${sched.interval > 1 ? sched.interval + ' years' : 'year'} on ${months[sched.monthOfYear - 1]} ${sched.dayOfMonth}`;
        }
        break;
        
      default:
        description = 'Custom schedule';
    }

    if (sched.endDate) {
      description += ` until ${new Date(sched.endDate).toLocaleDateString()}`;
    } else if (sched.maxOccurrences) {
      description += ` for ${sched.maxOccurrences} occurrences`;
    }

    return description;
  };

  const handleSave = () => {
    // Validate schedule
    if (schedule.type === 'advanced') {
      if (schedule.frequency === 'weekly' && schedule.dayOfWeek === undefined) {
        toast({
          title: "Validation Error",
          description: "Please select a day of the week",
          variant: "destructive"
        });
        return;
      }
      
      if (schedule.frequency === 'monthly' && !schedule.dayOfMonth && (!schedule.weekOfMonth || schedule.dayOfWeek === undefined)) {
        toast({
          title: "Validation Error", 
          description: "Please specify either a day of month or week position",
          variant: "destructive"
        });
        return;
      }
      
      if (schedule.frequency === 'yearly' && (!schedule.monthOfYear || !schedule.dayOfMonth)) {
        toast({
          title: "Validation Error",
          description: "Please specify both month and day for yearly recurrence",
          variant: "destructive"
        });
        return;
      }
    }

    onScheduleCreate(schedule);
    setIsOpen(false);
    toast({
      title: "Schedule Created",
      description: generateScheduleDescription(schedule)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Advanced Schedule
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Advanced Recurring Schedule
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Schedule Type */}
          <div className="space-y-3">
            <Label>Schedule Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={schedule.type === 'simple' ? 'default' : 'outline'}
                onClick={() => setSchedule(prev => ({ ...prev, type: 'simple' }))}
                className="flex-1"
              >
                Simple
              </Button>
              <Button
                type="button" 
                variant={schedule.type === 'advanced' ? 'default' : 'outline'}
                onClick={() => setSchedule(prev => ({ ...prev, type: 'advanced' }))}
                className="flex-1"
              >
                Advanced
              </Button>
            </div>
          </div>

          {/* Base Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Frequency</Label>
              <Select value={schedule.frequency} onValueChange={(value: any) => setSchedule(prev => ({ ...prev, frequency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Interval</Label>
              <Input
                type="number"
                min="1"
                value={schedule.interval}
                onChange={(e) => setSchedule(prev => ({ ...prev, interval: parseInt(e.target.value) || 1 }))}
                placeholder="1"
              />
            </div>
          </div>

          {/* Advanced Options */}
          {schedule.type === 'advanced' && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Advanced Options</h4>
              
              {schedule.frequency === 'weekly' && (
                <div>
                  <Label>Day of Week</Label>
                  <Select value={schedule.dayOfWeek?.toString()} onValueChange={(value) => setSchedule(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day, index) => (
                        <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {schedule.frequency === 'monthly' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSchedule(prev => ({ ...prev, dayOfMonth: 1, weekOfMonth: undefined }))}
                      className="flex-1"
                    >
                      By Day of Month
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSchedule(prev => ({ ...prev, dayOfMonth: undefined, weekOfMonth: 'first' }))}
                      className="flex-1"
                    >
                      By Week Position
                    </Button>
                  </div>
                  
                  {schedule.dayOfMonth !== undefined && (
                    <div>
                      <Label>Day of Month</Label>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        value={schedule.dayOfMonth}
                        onChange={(e) => setSchedule(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                      />
                    </div>
                  )}
                  
                  {schedule.weekOfMonth && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Week Position</Label>
                        <Select value={schedule.weekOfMonth} onValueChange={(value: any) => setSchedule(prev => ({ ...prev, weekOfMonth: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {weekPositions.map((pos) => (
                              <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Day of Week</Label>
                        <Select value={schedule.dayOfWeek?.toString()} onValueChange={(value) => setSchedule(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {weekDays.map((day, index) => (
                              <SelectItem key={index} value={index.toString()}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {schedule.frequency === 'yearly' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Month</Label>
                    <Select value={schedule.monthOfYear?.toString()} onValueChange={(value) => setSchedule(prev => ({ ...prev, monthOfYear: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={index} value={(index + 1).toString()}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Day</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={schedule.dayOfMonth || ''}
                      onChange={(e) => setSchedule(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                      placeholder="Day"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* End Conditions */}
          <div className="space-y-3">
            <Label>End Condition (Optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">End Date</Label>
                <Input
                  type="date"
                  value={schedule.endDate || ''}
                  onChange={(e) => setSchedule(prev => ({ ...prev, endDate: e.target.value, maxOccurrences: undefined }))}
                />
              </div>
              
              <div>
                <Label className="text-sm">Max Occurrences</Label>
                <Input
                  type="number"
                  min="1"
                  value={schedule.maxOccurrences || ''}
                  onChange={(e) => setSchedule(prev => ({ ...prev, maxOccurrences: parseInt(e.target.value), endDate: undefined }))}
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <Card className="p-4 bg-primary/5">
            <h4 className="font-medium mb-2">Schedule Preview</h4>
            <Badge variant="secondary" className="text-sm">
              {generateScheduleDescription(schedule)}
            </Badge>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Create Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedRecurringScheduler;