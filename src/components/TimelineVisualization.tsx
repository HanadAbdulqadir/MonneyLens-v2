import React, { useState, useRef, useEffect } from 'react';
import { TimelineEvent, WhatIfScenario } from "../shared/utils/scenarioEngine";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../shared/components/ui/card";
import { Button } from "../shared/components/ui/button";
import { Badge } from "../shared/components/ui/badge";
import { Slider } from "../shared/components/ui/slider";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  CreditCard,
  PiggyBank
} from 'lucide-react';
import { cn } from "../shared/lib/utils";

interface TimelineVisualizationProps {
  scenario: WhatIfScenario;
  className?: string;
}

export function TimelineVisualization({ scenario, className }: TimelineVisualizationProps) {
  const [currentDateIndex, setCurrentDateIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Sort events by date and filter to unique dates for the timeline
  const sortedEvents = scenario.results?.timeline?.sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  ) || [];

  const uniqueDates = Array.from(new Set(sortedEvents.map(event => 
    event.date.toISOString().split('T')[0]
  ))).map(dateStr => new Date(dateStr));

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || uniqueDates.length === 0) return;

    const interval = setInterval(() => {
      setCurrentDateIndex(prev => {
        if (prev >= uniqueDates.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, uniqueDates.length]);

  // Get events for current date
  const currentDate = uniqueDates[currentDateIndex];
  const currentEvents = sortedEvents.filter(event => 
    event.date.toISOString().split('T')[0] === currentDate?.toISOString().split('T')[0]
  );

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'income': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'expense': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'debt_payment': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'goal_achieved': return <Target className="h-4 w-4 text-purple-600" />;
      default: return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'income': return 'border-l-green-500 bg-green-50';
      case 'expense': return 'border-l-red-500 bg-red-50';
      case 'debt_payment': return 'border-l-blue-500 bg-blue-50';
      case 'goal_achieved': return 'border-l-purple-500 bg-purple-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleTimelineClick = (index: number) => {
    setCurrentDateIndex(index);
    setSelectedEvent(null);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(3, prev + 0.25));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(0.5, prev - 0.25));
  };

  if (!scenario.results?.timeline || scenario.results.timeline.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Timeline Visualization</CardTitle>
          <CardDescription>No timeline data available for this scenario.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Timeline Visualization</CardTitle>
            <CardDescription>
              Explore the financial impact of "{scenario.name}" over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {formatDate(currentDate)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timeline Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDateIndex(0)}
              disabled={currentDateIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDateIndex(uniqueDates.length - 1)}
              disabled={currentDateIndex === uniqueDates.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-muted-foreground min-w-[40px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatDate(uniqueDates[0])}</span>
            <span>{formatDate(uniqueDates[uniqueDates.length - 1])}</span>
          </div>
          
          <Slider
            value={[currentDateIndex]}
            min={0}
            max={uniqueDates.length - 1}
            step={1}
            onValueChange={([value]) => setCurrentDateIndex(value)}
            className="w-full"
          />
        </div>

        {/* Timeline Visualization */}
        <div 
          ref={timelineRef}
          className="relative h-32 bg-muted/20 rounded-lg overflow-hidden"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
        >
          {/* Timeline line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/30 transform -translate-y-1/2" />
          
          {/* Date markers */}
          {uniqueDates.map((date, index) => {
            const position = (index / (uniqueDates.length - 1)) * 100;
            const isActive = index === currentDateIndex;
            
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "absolute top-1/2 w-3 h-3 rounded-full border-2 cursor-pointer transform -translate-y-1/2 -translate-x-1/2",
                  isActive 
                    ? "bg-primary border-primary shadow-lg" 
                    : "bg-background border-primary/50 hover:bg-primary/20"
                )}
                style={{ left: `${position}%` }}
                onClick={() => handleTimelineClick(index)}
                title={formatDate(date)}
              />
            );
          })}
        </div>

        {/* Current Date Events */}
        {currentEvents.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">
              Events on {formatDate(currentDate)}
            </h4>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentEvents.map((event, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-sm",
                    getEventColor(event.type),
                    selectedEvent === event && "ring-2 ring-primary/50"
                  )}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.type)}
                      <div>
                        <p className="font-medium text-sm">{event.description}</p>
                        {event.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {event.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {event.amount !== 0 && (
                      <span className={cn(
                        "font-medium text-sm",
                        event.type === 'income' || event.type === 'goal_achieved' 
                          ? "text-green-600" 
                          : "text-red-600"
                      )}>
                        {event.type === 'income' || event.type === 'goal_achieved' ? '+' : '-'}
                        {formatCurrency(Math.abs(event.amount))}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Event Details */}
        {selectedEvent && (
          <Card className="bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {getEventIcon(selectedEvent.type)}
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="secondary" className="capitalize">
                    {selectedEvent.type.replace('_', ' ')}
                  </Badge>
                </div>
                {selectedEvent.category && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span>{selectedEvent.category}</span>
                  </div>
                )}
                {selectedEvent.amount !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className={cn(
                      "font-medium",
                      selectedEvent.type === 'income' || selectedEvent.type === 'goal_achieved' 
                        ? "text-green-600" 
                        : "text-red-600"
                    )}>
                      {selectedEvent.type === 'income' || selectedEvent.type === 'goal_achieved' ? '+' : '-'}
                      {formatCurrency(Math.abs(selectedEvent.amount))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="text-right">{selectedEvent.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scenario Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground">Net Worth Impact:</span>
            <p className={cn(
              "font-medium",
              scenario.results.netWorthImpact >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {scenario.results.netWorthImpact >= 0 ? '+' : ''}
              {formatCurrency(scenario.results.netWorthImpact)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Risk Score:</span>
            <p className={cn(
              "font-medium",
              scenario.results.riskScore <= 3 ? "text-green-600" :
              scenario.results.riskScore <= 6 ? "text-yellow-600" : "text-red-600"
            )}>
              {scenario.results.riskScore}/10
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Probability:</span>
            <p className="font-medium">{scenario.results.probability}%</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Timeline Events:</span>
            <p className="font-medium">{sortedEvents.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
