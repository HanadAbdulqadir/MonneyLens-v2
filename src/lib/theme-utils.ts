// Theme utility functions for consistent color usage across the app
export const themeColors = {
  // Semantic colors
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted))',
  
  // Chart colors
  chart1: 'hsl(var(--chart-1))',
  chart2: 'hsl(var(--chart-2))',
  chart3: 'hsl(var(--chart-3))',
  chart4: 'hsl(var(--chart-4))',
  chart5: 'hsl(var(--chart-5))',
} as const;

// Get category color based on type or fallback to chart colors
export const getCategoryColor = (categoryName: string, fallbackIndex: number = 0): string => {
  const lowerName = categoryName.toLowerCase();
  
  // Map common category names to semantic colors
  const categoryColorMap: Record<string, string> = {
    // Income categories
    'salary': themeColors.success,
    'freelance': themeColors.success,
    'bonus': themeColors.warning,
    'investment': themeColors.accent,
    
    // Expense categories  
    'food': themeColors.chart1,
    'groceries': themeColors.success,
    'restaurants': themeColors.destructive,
    'rent': themeColors.destructive,
    'utilities': themeColors.warning,
    'transportation': themeColors.primary,
    'gas': themeColors.warning,
    'petrol': themeColors.primary,
    'healthcare': themeColors.destructive,
    'entertainment': themeColors.accent,
    'shopping': themeColors.chart4,
    'subscriptions': themeColors.accent,
    'education': themeColors.primary,
    'travel': themeColors.success,
    'insurance': themeColors.primary,
  };
  
  // Return mapped color or fallback to chart colors
  if (categoryColorMap[lowerName]) {
    return categoryColorMap[lowerName];
  }
  
  // Cycle through chart colors as fallback
  const chartColors = [
    themeColors.chart1,
    themeColors.chart2,
    themeColors.chart3,
    themeColors.chart4,
    themeColors.chart5,
  ];
  
  return chartColors[fallbackIndex % chartColors.length];
};

// Get color with opacity for backgrounds
export const getCategoryColorWithOpacity = (categoryName: string, opacity: number = 0.1): string => {
  const baseColor = getCategoryColor(categoryName);
  // Extract HSL values and add opacity
  return baseColor.replace('hsl(', `hsl(`).replace(')', ` / ${opacity})`);
};

// Status colors for budget tracking
export const getBudgetStatusColor = (status: 'safe' | 'warning' | 'danger'): string => {
  switch (status) {
    case 'safe':
      return themeColors.success;
    case 'warning':
      return themeColors.warning;
    case 'danger':
      return themeColors.destructive;
    default:
      return themeColors.muted;
  }
};

// Get CSS class for category styling
export const getCategoryClasses = (categoryName: string): string => {
  const lowerName = categoryName.toLowerCase();
  
  if (['salary', 'freelance', 'groceries', 'travel'].includes(lowerName)) {
    return 'category-success';
  }
  if (['rent', 'restaurants', 'healthcare'].includes(lowerName)) {
    return 'category-destructive';
  }
  if (['utilities', 'gas', 'bonus'].includes(lowerName)) {
    return 'category-warning';
  }
  if (['investment', 'entertainment', 'subscriptions'].includes(lowerName)) {
    return 'category-accent';
  }
  
  return 'category-primary';
};

// Export for use in components
export default {
  themeColors,
  getCategoryColor,
  getCategoryColorWithOpacity,
  getBudgetStatusColor,
  getCategoryClasses,
};