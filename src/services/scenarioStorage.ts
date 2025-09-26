import { SavedScenario, ScenarioLibrary, ScenarioExport, ScenarioImportResult } from '@/types/scenario';

class ScenarioStorageService {
  private readonly STORAGE_KEY = 'moneylens-scenarios';
  private readonly EXPORT_VERSION = '1.0.0';

  // Get all saved scenarios
  async getScenarios(): Promise<SavedScenario[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const library: ScenarioLibrary = JSON.parse(stored);
      return library.scenarios.map(scenario => ({
        ...scenario,
        createdAt: new Date(scenario.createdAt),
        updatedAt: new Date(scenario.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading scenarios:', error);
      return [];
    }
  }

  // Save a new scenario
  async saveScenario(scenario: Omit<SavedScenario, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedScenario> {
    try {
      const scenarios = await this.getScenarios();
      const newScenario: SavedScenario = {
        ...scenario,
        id: this.generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      scenarios.push(newScenario);
      await this.saveScenarios(scenarios);
      return newScenario;
    } catch (error) {
      console.error('Error saving scenario:', error);
      throw error;
    }
  }

  // Update an existing scenario
  async updateScenario(id: string, updates: Partial<SavedScenario>): Promise<SavedScenario | null> {
    try {
      const scenarios = await this.getScenarios();
      const index = scenarios.findIndex(s => s.id === id);
      
      if (index === -1) return null;

      scenarios[index] = {
        ...scenarios[index],
        ...updates,
        updatedAt: new Date()
      };

      await this.saveScenarios(scenarios);
      return scenarios[index];
    } catch (error) {
      console.error('Error updating scenario:', error);
      throw error;
    }
  }

  // Delete a scenario
  async deleteScenario(id: string): Promise<boolean> {
    try {
      const scenarios = await this.getScenarios();
      const filtered = scenarios.filter(s => s.id !== id);
      
      if (filtered.length === scenarios.length) return false;
      
      await this.saveScenarios(filtered);
      return true;
    } catch (error) {
      console.error('Error deleting scenario:', error);
      throw error;
    }
  }

  // Get scenarios by type
  async getScenariosByType(type: SavedScenario['type']): Promise<SavedScenario[]> {
    const scenarios = await this.getScenarios();
    return scenarios.filter(s => s.type === type);
  }

  // Get favorite scenarios
  async getFavoriteScenarios(): Promise<SavedScenario[]> {
    const scenarios = await this.getScenarios();
    return scenarios.filter(s => s.isFavorite);
  }

  // Toggle favorite status
  async toggleFavorite(id: string): Promise<SavedScenario | null> {
    const scenario = await this.getScenario(id);
    if (!scenario) return null;

    return this.updateScenario(id, { isFavorite: !scenario.isFavorite });
  }

  // Get a single scenario by ID
  async getScenario(id: string): Promise<SavedScenario | null> {
    const scenarios = await this.getScenarios();
    return scenarios.find(s => s.id === id) || null;
  }

  // Export scenarios to JSON
  async exportScenarios(): Promise<string> {
    const scenarios = await this.getScenarios();
    const exportData: ScenarioExport = {
      version: this.EXPORT_VERSION,
      exportDate: new Date(),
      scenarios,
      metadata: {
        appVersion: '2.4.0',
        exportType: 'full'
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import scenarios from JSON
  async importScenarios(jsonData: string): Promise<ScenarioImportResult> {
    const result: ScenarioImportResult = {
      success: false,
      importedCount: 0,
      errors: [],
      warnings: []
    };

    try {
      const importData: ScenarioExport = JSON.parse(jsonData);
      
      // Validate export version
      if (importData.version !== this.EXPORT_VERSION) {
        result.warnings.push(`Export version ${importData.version} may not be fully compatible with current version ${this.EXPORT_VERSION}`);
      }

      const existingScenarios = await this.getScenarios();
      const newScenarios: SavedScenario[] = [];

      for (const importedScenario of importData.scenarios) {
        // Check for duplicates
        const duplicate = existingScenarios.find(s => 
          s.name === importedScenario.name && s.type === importedScenario.type
        );

        if (duplicate) {
          result.warnings.push(`Skipping duplicate scenario: ${importedScenario.name}`);
          continue;
        }

        // Create new scenario with updated timestamps
        const newScenario: SavedScenario = {
          ...importedScenario,
          id: this.generateId(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        newScenarios.push(newScenario);
      }

      if (newScenarios.length > 0) {
        await this.saveScenarios([...existingScenarios, ...newScenarios]);
        result.importedCount = newScenarios.length;
        result.success = true;
      } else {
        result.warnings.push('No new scenarios to import');
        result.success = true;
      }

    } catch (error) {
      result.errors.push(`Invalid import file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  // Clear all scenarios
  async clearAllScenarios(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing scenarios:', error);
      throw error;
    }
  }

  // Get scenario statistics
  async getStatistics() {
    const scenarios = await this.getScenarios();
    return {
      total: scenarios.length,
      byType: {
        loan: scenarios.filter(s => s.type === 'loan').length,
        investment: scenarios.filter(s => s.type === 'investment').length,
        retirement: scenarios.filter(s => s.type === 'retirement').length,
        savings: scenarios.filter(s => s.type === 'savings').length,
        'what-if': scenarios.filter(s => s.type === 'what-if').length
      },
      favorites: scenarios.filter(s => s.isFavorite).length,
      lastUpdated: scenarios.length > 0 
        ? new Date(Math.max(...scenarios.map(s => s.updatedAt.getTime())))
        : null
    };
  }

  // Private helper methods
  private async saveScenarios(scenarios: SavedScenario[]): Promise<void> {
    const library: ScenarioLibrary = {
      scenarios,
      categories: [...new Set(scenarios.map(s => s.type))],
      tags: [...new Set(scenarios.flatMap(s => s.tags || []))]
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(library));
  }

  private generateId(): string {
    return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
export const scenarioStorage = new ScenarioStorageService();
