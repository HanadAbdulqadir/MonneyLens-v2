import { useState, useEffect, ReactNode } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3, 
  Maximize2, 
  Minimize2,
  Smartphone,
  Tablet,
  Monitor,
  Square,
  Columns2,
  Columns3,
  Grid2X2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
  enableGridToggle?: boolean;
  enableDevicePreview?: boolean;
}

type GridSize = 1 | 2 | 3 | 4;
type DeviceType = 'mobile' | 'tablet' | 'desktop';

const ResponsiveLayout = ({ 
  children, 
  className,
  enableGridToggle = false,
  enableDevicePreview = false
}: ResponsiveLayoutProps) => {
  const [gridSize, setGridSize] = useState<GridSize>(2);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [devicePreview, setDevicePreview] = useState<DeviceType>('desktop');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setGridSize(1);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getGridClasses = () => {
    const baseClasses = "grid gap-4 lg:gap-6";
    
    switch (gridSize) {
      case 1:
        return `${baseClasses} grid-cols-1`;
      case 2:
        return `${baseClasses} grid-cols-1 lg:grid-cols-2`;
      case 3:
        return `${baseClasses} grid-cols-1 md:grid-cols-2 xl:grid-cols-3`;
      case 4:
        return `${baseClasses} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4`;
      default:
        return `${baseClasses} grid-cols-1 lg:grid-cols-2`;
    }
  };

  const getDeviceClasses = () => {
    switch (devicePreview) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-4xl mx-auto';
      default:
        return 'w-full';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Layout Controls */}
      {(enableGridToggle || enableDevicePreview) && !isMobile && (
        <Card className="p-3 bg-muted/20 border-dashed">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {enableGridToggle && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Layout:</span>
                  <div className="flex bg-background rounded-lg p-1 border">
                    {[
                      { size: 1 as GridSize, icon: Square, label: 'Single Column' },
                      { size: 2 as GridSize, icon: Columns2, label: 'Two Columns' },
                      { size: 3 as GridSize, icon: Columns3, label: 'Three Columns' },
                      { size: 4 as GridSize, icon: Grid2X2, label: 'Four Columns' }
                    ].map(({ size, icon: Icon, label }) => (
                      <Button
                        key={size}
                        variant={gridSize === size ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setGridSize(size)}
                        className="h-8 px-2 min-w-[2.5rem]"
                        disabled={isMobile && size > 1}
                        title={label}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="ml-1 hidden lg:inline text-xs">{size}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {enableDevicePreview && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Preview:</span>
                  <div className="flex bg-background rounded-lg p-1 border">
                    {[
                      { type: 'mobile' as DeviceType, icon: Smartphone, label: 'Mobile' },
                      { type: 'tablet' as DeviceType, icon: Tablet, label: 'Tablet' },
                      { type: 'desktop' as DeviceType, icon: Monitor, label: 'Desktop' },
                    ].map(({ type, icon: Icon, label }) => (
                      <Button
                        key={type}
                        variant={devicePreview === type ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setDevicePreview(type)}
                        className="h-8 px-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {gridSize === 1 ? 'Single' : gridSize === 2 ? 'Two' : gridSize === 3 ? 'Three' : 'Four'} column{gridSize > 1 ? 's' : ''} • {devicePreview}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-8 w-8 p-0"
              >
                {isCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      {!isCollapsed && (
        <div className={cn(getDeviceClasses(), "transition-all duration-300")}>
          <div 
            className={getGridClasses()}
            style={{
              // Prevent squashing with proper min-width constraints
              display: 'grid',
              gridTemplateColumns: gridSize === 1 
                ? '1fr' 
                : `repeat(auto-fit, minmax(min(320px, 100%), 1fr))`,
              gap: 'clamp(1rem, 4vw, 1.5rem)'
            }}
          >
            {children}
          </div>
        </div>
      )}

      {/* Mobile Optimization Indicator */}
      {isMobile && (
        <Card className="p-3 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <Smartphone className="h-4 w-4 text-primary" />
            <span className="text-primary font-medium">Mobile optimized view</span>
            <Badge variant="secondary" className="text-xs ml-auto">
              Single column layout
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
};

// Specialized responsive containers
export const ResponsiveGrid = ({ 
  children, 
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className,
  minWidth = "300px"
}: {
  children: ReactNode;
  columns?: { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: number;
  className?: string;
  minWidth?: string;
}) => {
  const gridClasses = [
    'grid',
    `gap-${gap}`,
    // Use CSS Grid auto-fit for better responsiveness
    columns.sm === 1 ? 'grid-cols-1' : '',
    columns.md && columns.md > 1 ? `md:grid-cols-[repeat(auto-fit,minmax(${minWidth},1fr))]` : '',
    // Fallback classes for better browser support
    `grid-cols-${columns.sm || 1}`,
    columns.md && `md:grid-cols-${Math.min(columns.md, 2)}`,
    columns.lg && `lg:grid-cols-${Math.min(columns.lg, 3)}`,
    columns.xl && `xl:grid-cols-${Math.min(columns.xl, 4)}`
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cn(gridClasses, className)}
      style={{
        // CSS Grid with proper min-width constraints
        display: 'grid',
        gridTemplateColumns: columns.sm === 1 
          ? '1fr' 
          : `repeat(auto-fit, minmax(min(${minWidth}, 100%), 1fr))`,
        gap: `${gap * 0.25}rem`
      }}
    >
      {children}
    </div>
  );
};

export const ResponsiveCard = ({ 
  children, 
  className,
  mobileFullWidth = false,
  ...props 
}: {
  children: ReactNode;
  className?: string;
  mobileFullWidth?: boolean;
} & React.ComponentProps<typeof Card>) => {
  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-card-hover",
        mobileFullWidth && "mx-0 sm:mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
};

export default ResponsiveLayout;