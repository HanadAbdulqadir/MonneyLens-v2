import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, CheckCircle, DollarSign, Briefcase, Building2, TrendingUp, Home, Gift,
  Zap, Wrench, Shield, ShoppingCart, UtensilsCrossed, Coffee, Truck, Fuel,
  Train, Car, Settings, Navigation, Heart, Pill, Smile, Eye, Film, Play,
  Gamepad2, Book, Music, Palette, Shirt, Smartphone, Sofa, Sparkles,
  GraduationCap, BookOpen, Monitor, Plane, Bed, CreditCard, Receipt,
  PiggyBank, Scissors, Dumbbell, Calendar
} from "lucide-react";

// Comprehensive default categories
const defaultCategories = {
  income: [
    { name: 'Salary', icon: 'DollarSign', color: '#10B981' },
    { name: 'Freelance', icon: 'Briefcase', color: '#059669' },
    { name: 'Business', icon: 'Building2', color: '#0891B2' },
    { name: 'Investment', icon: 'TrendingUp', color: '#7C3AED' },
    { name: 'Rental Income', icon: 'Home', color: '#DC2626' },
    { name: 'Bonus', icon: 'Gift', color: '#F59E0B' },
  ],
  housing: [
    { name: 'Rent', icon: 'Home', color: '#DC2626' },
    { name: 'Utilities', icon: 'Zap', color: '#F59E0B' },
    { name: 'Home Maintenance', icon: 'Wrench', color: '#8B5CF6' },
    { name: 'Home Insurance', icon: 'Shield', color: '#3B82F6' },
  ],
  food: [
    { name: 'Groceries', icon: 'ShoppingCart', color: '#10B981' },
    { name: 'Restaurants', icon: 'UtensilsCrossed', color: '#EF4444' },
    { name: 'Coffee', icon: 'Coffee', color: '#92400E' },
    { name: 'Takeout', icon: 'Truck', color: '#F97316' },
  ],
  transportation: [
    { name: 'Gas', icon: 'Fuel', color: '#F59E0B' },
    { name: 'Public Transport', icon: 'Train', color: '#3B82F6' },
    { name: 'Car Payment', icon: 'Car', color: '#7C2D12' },
    { name: 'Car Maintenance', icon: 'Settings', color: '#6B7280' },
  ],
  health: [
    { name: 'Medical', icon: 'Heart', color: '#EF4444' },
    { name: 'Pharmacy', icon: 'Pill', color: '#10B981' },
    { name: 'Dental', icon: 'Smile', color: '#3B82F6' },
  ],
  entertainment: [
    { name: 'Movies', icon: 'Film', color: '#7C3AED' },
    { name: 'Streaming', icon: 'Play', color: '#EF4444' },
    { name: 'Games', icon: 'Gamepad2', color: '#10B981' },
    { name: 'Books', icon: 'Book', color: '#0891B2' },
  ],
  shopping: [
    { name: 'Clothing', icon: 'Shirt', color: '#7C2D12' },
    { name: 'Electronics', icon: 'Smartphone', color: '#6B7280' },
    { name: 'Personal Care', icon: 'Sparkles', color: '#EC4899' },
  ],
  other: [
    { name: 'Education', icon: 'GraduationCap', color: '#3B82F6' },
    { name: 'Travel', icon: 'Plane', color: '#059669' },
    { name: 'Gym', icon: 'Dumbbell', color: '#EF4444' },
    { name: 'Subscriptions', icon: 'Calendar', color: '#8B5CF6' },
    { name: 'Gifts', icon: 'Gift', color: '#F59E0B' },
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
  const [customCategoryColor, setCustomCategoryColor] = useState('#3B82F6');
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
      setCustomCategoryColor('#3B82F6');
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
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
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
                    className="p-1 rounded"
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
                              className="p-1 rounded"
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
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            customCategoryColor === color ? 'border-foreground' : 'border-muted'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setCustomCategoryColor(color)}
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