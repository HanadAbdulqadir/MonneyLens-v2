import React from 'react';
import { Card } from "@shared/components/ui/card";
import { Skeleton } from "@shared/components/ui/skeleton";

export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </Card>
      ))}
    </div>

    {/* Chart Skeleton */}
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-80 w-full" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

export const TransactionListSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-4 w-20 ml-auto" />
          <Skeleton className="h-3 w-12 ml-auto" />
        </div>
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-24" />
    </div>
    <Skeleton className="h-80 w-full" />
  </Card>
);

export const CategoryCardSkeleton = () => (
  <Card className="p-4">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-2 w-full mb-2" />
    <div className="flex justify-between">
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-3 w-16" />
    </div>
  </Card>
);

export const BudgetOverviewSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>

    <Card className="p-6">
      <Skeleton className="h-6 w-32 mb-6" />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-3 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner = ({ size = 'md', text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]}`} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

export const PageLoader = ({ text = "Loading..." }: { text?: string }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

// Error States
interface ErrorStateProps {
  title?: string;
  description?: string;
  retry?: () => void;
}

export const ErrorState = ({ 
  title = "Something went wrong", 
  description = "We couldn't load this data. Please try again.",
  retry 
}: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
      <span className="text-destructive text-2xl">⚠</span>
    </div>
    <div className="space-y-2">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
    {retry && (
      <button 
        onClick={retry}
        className="text-primary hover:underline text-sm"
      >
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({ 
  title = "No data found", 
  description = "There's nothing here yet. Start by adding some data.",
  action 
}: ErrorStateProps & { action?: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
      <span className="text-muted-foreground text-2xl">📊</span>
    </div>
    <div className="space-y-2">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
    </div>
    {action && <div className="mt-4">{action}</div>}
  </div>
);