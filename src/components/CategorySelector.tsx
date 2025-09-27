import React, { useState, useEffect } from 'react';
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@shared/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@shared/components/ui/tabs";
import { supabase } from "@core/integrations/supabase/client";
import { useToast } from "@shared/hooks/use-toast";
import { 
  Plus, CheckCircle, DollarSign, Briefcase, Building2, TrendingUp, Home, Gift,
  Zap, Wrench, Shield, ShoppingCart, UtensilsCrossed, Coffee, Truck, Fuel,
  Train, Car, Settings, Navigation, Heart, Pill, Smile, Eye, Film, Play,
  Gamepad2, Book, Music, Palette, Shirt, Smartphone, Sofa, Sparkles,
  GraduationCap, BookOpen, Monitor, Plane, Bed, CreditCard, Receipt,
  PiggyBank, Scissors, Dumbbell, Calendar
} from "lucide-react";

// Comprehensive default categories using semantic color tokens
const defaultCategories = {
  income: [
    { name: 'Salary', icon: 'DollarSign', color: 'hsl(var(--success))' },
    { name: 'Freelance', icon: 'Briefcase', color: 'hsl(var(--success))' },
    { name: 'Business', icon: 'Building2', color: 'hsl(var(--primary))' },
    { name: 'Investment', icon: 'TrendingUp', color: 'hsl(var(--accent))' },
    { name: 'Rental Income', icon: 'Home', color: 'hsl(var(--destructive))' },
    { name: 'Bonus', icon: 'Gift', color: 'hsl(var(--warning))' },
  ],
  housing: [
    { name: 'Rent', icon: 'Home', color: 'hsl(var(--destructive))' },
    { name: 'Utilities', icon: 'Zap', color: 'hsl(var(--warning))' },
    { name: 'Home Maintenance', icon: 'Wrench', color: 'hsl(var(--accent))' },
    { name: 'Home Insurance', icon: 'Shield', color: 'hsl(var(--primary))' },
  ],
  food: [
    { name: 'Groceries', icon: 'ShoppingCart', color: 'hsl(var(--success))' },
    { name: 'Restaurants', icon: 'UtensilsCrossed', color: 'hsl(var(--destructive))' },
    { name: 'Coffee', icon: 'Coffee', color: 'hsl(var(--chart-4))' },
    { name: 'Takeout', icon: 'Truck', color: 'hsl(var(--warning))' },
  ],
  transportation: [
    { name: 'Gas', icon: 'Fuel', color: 'hsl(var(--warning))' },
    { name: 'Public Transport', icon: 'Train', color: 'hsl(var(--primary))' },
    { name: 'Car Payment', icon: 'Car', color: 'hsl(var(--chart-4))' },
    { name: 'Car Maintenance', icon: 'Settings', color: 'hsl(var(--muted-foreground))' },
  ],
  health: [
    { name: 'Medical', icon: 'Heart', color: 'hsl(var(--destructive))' },
    { name: 'Pharmacy', icon: 'Pill', color: 'hsl(var(--success))' },
    { name: 'Dental', icon: 'Smile', color: 'hsl(var(--primary))' },
  ],
  entertainment: [
    { name: 'Movies', icon: 'Film', color: 'hsl(var(--accent))' },
    { name: 'Streaming', icon: 'Play', color: 'hsl(var(--destructive))' },
    { name: 'Games', icon: 'Gamepad2', color: 'hsl(var(--success))' },
    { name: 'Books', icon: 'Book', color: 'hsl(var(--primary))' },
  ],
  shopping: [
    { name: 'Clothing', icon: 'Shirt', color: 'hsl(var(--chart-4))' },
    { name: 'Electronics', icon: 'Smartphone', color: 'hsl(var(--muted-foreground))' },
    { name: 'Personal Care', icon: 'Sparkles', color: 'hsl(var(--accent))' },
  ],
  other: [
    { name: 'Education', icon: 'GraduationCap', color: 'hsl(var(--primary))' },
    { name: 'Travel', icon: 'Plane', color: 'hsl(var(--success))' },
    { name: 'Gym', icon: 'Dumbbell', color: 'hsl(var(--destructive))' },
    { name: 'Subscriptions', icon: 'Calendar', color: 'hsl(var(--accent))' },
    { name: 'Gifts', icon: 'Gift', color: 'hsl(var(--warning))' },
  ],
};

const iconMap: Record<string, any> = {
  DollarSign, Briefcase, Building2, TrendingUp, Home, Gift, Zap, Wrench, Shield,
  ShoppingCart, UtensilsCrossed, Coffee, Truck, Fuel, Train, Car, Settings,
  Heart, Pill, Smile, Film, Play, Gamepad2, Book, Shirt, Smartphone, Sparkles,
  GraduationCap, Plane, Dumbbell, Calendar, Plus
};

interface CategorySelectorProps {
  onCategorySelect?: (category: string) => void;
  value?: string;
  showCreateNew?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  onCategorySelect, 
  value, 
  showCreateNew = true 
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryColor, setCustomCategoryColor] = useState('hsl(var(--primary))');
  const [customCategoryIcon, setCustomCategoryIcon] = useState('Plus');
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const addQuickCategory = async (category: { name: string; icon: string; color: string }) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({
          name: category.name,
          color: category.color,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setCategories(prev => [...prev, data]);
      toast({ title: "Success", description: `${category.name} category added!` });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({ title: "Error", description: "Failed to add category" });
    }
  };

  const createCustomCategory = async () => {
    if (!customCategoryName.trim()) {
      toast({ title: "Error", description: "Please enter a category name" });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({
          name: customCategoryName.trim(),
          color: customCategoryColor,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setCategories(prev => [...prev, data]);
      
      // Reset form
      const categoryName = customCategoryName.trim();
      setCustomCategoryName('');
      setCustomCategoryColor('hsl(var(--primary))');
      setCustomCategoryIcon('Plus');
      
      // Close dialog and show success
      setShowQuickAdd(false);
      toast({ title: "Success", description: `${categoryName} category created!` });
      
      // Auto-select the new category if callback provided
      if (onCategorySelect) {
        onCategorySelect(categoryName);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast({ title: "Error", description: "Failed to create category" });
    }
  };

  const colorOptions = [
    { name: 'Primary', value: 'hsl(var(--primary))' },
    { name: 'Destructive', value: 'hsl(var(--destructive))' },
    { name: 'Success', value: 'hsl(var(--success))' },
    { name: 'Warning', value: 'hsl(var(--warning))' },
    { name: 'Accent', value: 'hsl(var(--accent))' },
    { name: 'Chart 1', value: 'hsl(var(--chart-1))' },
    { name: 'Chart 2', value: 'hsl(var(--chart-2))' },
    { name: 'Chart 3', value: 'hsl(var(--chart-3))' },
    { name: 'Chart 4', value: 'hsl(var(--chart-4))' },
    { name: 'Chart 5', value: 'hsl(var(--chart-5))' },
  ];

  const allCategories = [
    ...categories.map(cat => ({ ...cat, isCustom: true })),
    ...Object.values(defaultCategories)
      .flat()
      .filter(defaultCat => !categories.some(cat => cat.name === defaultCat.name))
      .map(cat => ({ ...cat, isCustom: false }))
  ];

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onCategorySelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
            {allCategories.map((category) => {
              const IconComponent = iconMap[category.icon] || Plus;
              return (
                <SelectItem key={category.name} value={category.name}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-1 rounded bg-primary/10 text-primary"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      <IconComponent className="h-3 w-3" />
                    </div>
                    <span>{category.name}</span>
                    {category.isCustom && (
                      <Badge variant="outline" className="text-xs ml-auto">
                        Custom
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>

      {showCreateNew && (
        <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Categories</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="quick-add" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quick-add">Quick Add</TabsTrigger>
                <TabsTrigger value="create-custom">Create Custom</TabsTrigger>
              </TabsList>
              
              <TabsContent value="quick-add" className="space-y-4">
                {Object.entries(defaultCategories).map(([groupName, categoryList]) => (
                  <div key={groupName}>
                    <h4 className="font-medium capitalize mb-2 text-sm text-muted-foreground">
                      {groupName}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {categoryList.map((category) => {
                        const IconComponent = iconMap[category.icon];
                        const isAdded = categories.some(cat => cat.name === category.name);
                        
                        return (
                          <Button
                            key={category.name}
                            variant={isAdded ? "secondary" : "outline"}
                            size="sm"
                            className="justify-start gap-2 h-auto p-2"
                            onClick={() => !isAdded && addQuickCategory(category)}
                            disabled={isAdded}
                          >
                            <div 
                              className="p-1 rounded bg-primary/10 text-primary"
                              style={{ backgroundColor: `${category.color}20`, color: category.color }}
                            >
                              <IconComponent className="h-3 w-3" />
                            </div>
                            <span className="text-xs">{category.name}</span>
                            {isAdded && <CheckCircle className="h-3 w-3 ml-auto" />}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="create-custom" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      placeholder="Enter category name"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label>Category Color</Label>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {colorOptions.map((colorOption) => (
                        <button
                          key={colorOption.name}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            customCategoryColor === colorOption.value ? 'border-foreground scale-110' : 'border-muted hover:border-border'
                          }`}
                          style={{ backgroundColor: colorOption.value }}
                          onClick={() => setCustomCategoryColor(colorOption.value)}
                          title={colorOption.name}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={createCustomCategory}
                    className="w-full"
                    disabled={!customCategoryName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Category
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CategorySelector;