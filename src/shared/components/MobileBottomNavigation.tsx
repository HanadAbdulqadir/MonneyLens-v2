import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useIsMobile } from "@shared/hooks/use-mobile";
import { Button } from "@shared/components/ui/button";
import { 
  LayoutDashboard, 
  TrendingUp, 
  CreditCard, 
  Target, 
  Wallet,
  MoreHorizontal
} from 'lucide-react';
import { cn } from "@shared/lib/utils";

const MobileBottomNavigation = () => {
  const isMobile = useIsMobile();
  const location = useLocation();

  if (!isMobile) return null;

  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/',
      active: location.pathname === '/'
    },
    { 
      icon: CreditCard, 
      label: 'Transactions', 
      href: '/transactions',
      active: location.pathname.startsWith('/transactions')
    },
    { 
      icon: TrendingUp, 
      label: 'Analytics', 
      href: '/analytics',
      active: location.pathname.startsWith('/analytics')
    },
    { 
      icon: Target, 
      label: 'Goals', 
      href: '/goals',
      active: location.pathname.startsWith('/goals')
    },
    { 
      icon: Wallet, 
      label: 'More', 
      href: '/financial-hub',
      active: false
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-14 w-14 rounded-lg transition-all duration-200",
                item.active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Link to={item.href} className="flex flex-col items-center">
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNavigation;
