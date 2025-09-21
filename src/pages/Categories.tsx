import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategorySelector } from "@/components/CategorySelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Palette } from "lucide-react";

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast({ title: "Success", description: `${name} category deleted` });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ title: "Error", description: "Failed to delete category" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your spending categories and quickly add from our predefined list
          </p>
        </div>
        
        <div className="flex gap-2">
          <CategorySelector showCreateNew={true} />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-xs text-muted-foreground">
                Custom categories created
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
              <Plus className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quick Add Available</p>
              <p className="text-2xl font-bold">30+</p>
              <p className="text-xs text-muted-foreground">
                Predefined categories ready
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="text-secondary-foreground font-bold text-lg">✨</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ready to Use</p>
              <p className="text-2xl font-bold">Everywhere</p>
              <p className="text-xs text-muted-foreground">
                Available across the app
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Categories List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Your Categories</h3>
          <Badge variant="outline">
            {categories.length} categories
          </Badge>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-24 w-24 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h4 className="text-lg font-medium mb-2">No categories yet</h4>
            <p className="text-muted-foreground mb-4">
              Get started by adding categories from our quick-add collection or create your own
            </p>
            <CategorySelector showCreateNew={true} />
          </div>
        ) : (
          <div className="grid gap-3">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div 
                  className="w-4 h-4 rounded-full border-2 border-primary/20 shadow-sm"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex-1">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(category.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Custom
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCategory(category.id, category.name)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Guide */}
      <Card className="p-6 bg-muted/20">
        <h3 className="text-lg font-semibold mb-4">Quick Guide</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium mb-2">🚀 Quick Add Categories</h4>
            <p className="text-sm text-muted-foreground">
              Click the "+" button to browse 30+ predefined categories organized by type: 
              Income, Housing, Food, Transportation, Health, Entertainment, and more.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">📊 Use Everywhere</h4>
            <p className="text-sm text-muted-foreground">
              Your categories automatically appear in transaction forms, analytics, 
              budgets, and throughout the app for consistent categorization.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Categories;