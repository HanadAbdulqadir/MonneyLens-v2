import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinancial } from "@/contexts/FinancialContext";

const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useFinancial();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleDarkMode}
      className="gap-2"
    >
      {isDarkMode ? (
        <>
          <Sun className="h-4 w-4" />
          Light
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          Dark
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;