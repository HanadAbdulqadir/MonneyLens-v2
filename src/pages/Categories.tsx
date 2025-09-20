import EnhancedCategoryManager from "@/components/EnhancedCategoryManager";

const Categories = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage and analyze your spending categories with advanced insights</p>
        </div>
      </div>

      <EnhancedCategoryManager />
    </div>
  );
};

export default Categories;