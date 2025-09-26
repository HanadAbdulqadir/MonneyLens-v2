import React, { useState, useEffect } from 'react';
import { SavedScenario } from '@/types/scenario';
import { scenarioStorage } from '@/services/scenarioStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Star, 
  StarOff, 
  Trash2, 
  Download, 
  Upload, 
  Plus,
  FileText,
  Home,
  PiggyBank,
  Users,
  Target,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ScenarioLibraryProps {
  onLoadScenario?: (scenario: SavedScenario) => void;
  onNewScenario?: () => void;
  className?: string;
}

export function ScenarioLibrary({ onLoadScenario, onNewScenario, className }: ScenarioLibraryProps) {
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [filteredScenarios, setFilteredScenarios] = useState<SavedScenario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenarios();
  }, []);

  useEffect(() => {
    filterScenarios();
  }, [scenarios, searchTerm, filterType, showFavorites]);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const savedScenarios = await scenarioStorage.getScenarios();
      setScenarios(savedScenarios);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      toast({
        title: "Error",
        description: "Failed to load saved scenarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterScenarios = () => {
    let filtered = scenarios;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(scenario => 
        scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(scenario => scenario.type === filterType);
    }

    // Filter by favorites
    if (showFavorites) {
      filtered = filtered.filter(scenario => scenario.isFavorite);
    }

    setFilteredScenarios(filtered);
  };

  const handleToggleFavorite = async (scenario: SavedScenario) => {
    try {
      await scenarioStorage.toggleFavorite(scenario.id);
      await loadScenarios();
      toast({
        title: scenario.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `Scenario "${scenario.name}" ${scenario.isFavorite ? 'removed from' : 'added to'} favorites`
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteScenario = async (scenario: SavedScenario) => {
    if (!confirm(`Are you sure you want to delete "${scenario.name}"?`)) {
      return;
    }

    try {
      await scenarioStorage.deleteScenario(scenario.id);
      await loadScenarios();
      toast({
        title: "Scenario deleted",
        description: `"${scenario.name}" has been deleted`
      });
    } catch (error) {
      console.error('Error deleting scenario:', error);
      toast({
        title: "Error",
        description: "Failed to delete scenario",
        variant: "destructive"
      });
    }
  };

  const handleExportScenarios = async () => {
    try {
      const exportData = await scenarioStorage.exportScenarios();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moneylens-scenarios-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful",
        description: "Scenarios exported to JSON file"
      });
    } catch (error) {
      console.error('Error exporting scenarios:', error);
      toast({
        title: "Error",
        description: "Failed to export scenarios",
        variant: "destructive"
      });
    }
  };

  const handleImportScenarios = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await scenarioStorage.importScenarios(text);
      
      if (result.success) {
        await loadScenarios();
        toast({
          title: "Import successful",
          description: `Imported ${result.importedCount} scenario${result.importedCount !== 1 ? 's' : ''}`
        });
        
        if (result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            toast({
              title: "Import warning",
              description: warning,
              variant: "default"
            });
          });
        }
      } else {
        toast({
          title: "Import failed",
          description: result.errors.join(', '),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error importing scenarios:', error);
      toast({
        title: "Error",
        description: "Failed to import scenarios",
        variant: "destructive"
      });
    }

    // Reset file input
    event.target.value = '';
  };

  const getTypeIcon = (type: SavedScenario['type']) => {
    switch (type) {
      case 'loan': return <Home className="h-4 w-4" />;
      case 'investment': return <PiggyBank className="h-4 w-4" />;
      case 'retirement': return <Users className="h-4 w-4" />;
      case 'savings': return <Target className="h-4 w-4" />;
      case 'what-if': return <TrendingUp className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: SavedScenario['type']) => {
    switch (type) {
      case 'loan': return 'text-blue-600';
      case 'investment': return 'text-purple-600';
      case 'retirement': return 'text-orange-600';
      case 'savings': return 'text-red-600';
      case 'what-if': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Scenario Library</h2>
          <p className="text-muted-foreground">
            Manage your saved financial scenarios
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportScenarios}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Label htmlFor="import-scenarios" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <Input
                id="import-scenarios"
                type="file"
                accept=".json"
                onChange={handleImportScenarios}
                className="hidden"
              />
            </Label>
          </Button>
          {onNewScenario && (
            <Button size="sm" onClick={onNewScenario}>
              <Plus className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search scenarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showFavorites ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavorites(!showFavorites)}
              >
                {showFavorites ? (
                  <StarOff className="h-4 w-4 mr-2" />
                ) : (
                  <Star className="h-4 w-4 mr-2" />
                )}
                Favorites
              </Button>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">All Types</option>
                <option value="loan">Loan</option>
                <option value="investment">Investment</option>
                <option value="retirement">Retirement</option>
                <option value="savings">Savings</option>
                <option value="what-if">What-If</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{scenarios.length}</div>
            <div className="text-xs text-muted-foreground">Total Scenarios</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{scenarios.filter(s => s.isFavorite).length}</div>
            <div className="text-xs text-muted-foreground">Favorites</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{filteredScenarios.length}</div>
            <div className="text-xs text-muted-foreground">Filtered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {scenarios.length > 0 ? formatDate(new Date(Math.max(...scenarios.map(s => s.updatedAt.getTime())))) : 'Never'}
            </div>
            <div className="text-xs text-muted-foreground">Last Updated</div>
          </CardContent>
        </Card>
      </div>

      {/* Scenarios List */}
      <div className="space-y-4">
        {filteredScenarios.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No scenarios found</h3>
              <p className="text-muted-foreground">
                {scenarios.length === 0 
                  ? "You haven't saved any scenarios yet. Create your first scenario to get started."
                  : "No scenarios match your current filters. Try adjusting your search or filters."
                }
              </p>
              {onNewScenario && scenarios.length === 0 && (
                <Button onClick={onNewScenario} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Scenario
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredScenarios.map((scenario) => (
            <Card key={scenario.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-full", getTypeColor(scenario.type))}>
                      {getTypeIcon(scenario.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {scenario.name}
                        {scenario.isFavorite && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {scenario.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(scenario)}
                    >
                      {scenario.isFavorite ? (
                        <StarOff className="h-4 w-4" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteScenario(scenario)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className={getTypeColor(scenario.type)}>
                      {scenario.type.replace('-', ' ')}
                    </Badge>
                    {scenario.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(scenario.updatedAt)}
                    </div>
                    {onLoadScenario && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoadScenario(scenario)}
                      >
                        Load
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
