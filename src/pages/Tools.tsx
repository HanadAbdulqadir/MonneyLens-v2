import { Calculator, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Tools() {
  const tools = [
    {
      title: "Financial Calculators",
      description: "Advanced calculators for loans, savings, investments, and more",
      icon: Calculator,
      status: "Available",
      path: "/calculators",
      color: "text-blue-600"
    },
    {
      title: "What-If Scenarios",
      description: "Test different financial scenarios and see their impact",
      icon: TrendingUp,
      status: "Coming Soon",
      path: "/scenarios",
      color: "text-green-600"
    },
    {
      title: "Financial Projections",
      description: "Project your financial future based on current trends",
      icon: BarChart3,
      status: "Coming Soon",
      path: "/projections",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tools Hub</h1>
          <p className="text-muted-foreground">
            Advanced financial calculators and scenario testing tools
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.title} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className={`h-8 w-8 ${tool.color}`} />
                  <Badge variant={tool.status === "Available" ? "default" : "secondary"}>
                    {tool.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant={tool.status === "Available" ? "default" : "outline"}
                  className="w-full"
                  disabled={tool.status !== "Available"}
                >
                  {tool.status === "Available" ? "Open Tool" : "Coming Soon"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What-If Mode</CardTitle>
          <CardDescription>
            Test different financial scenarios to see how they impact your goals and budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-semibold">Income Scenarios</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Test salary increases or decreases</li>
                  <li>• Simulate bonus scenarios</li>
                  <li>• Explore side income opportunities</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Expense Scenarios</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Analyze major purchase impacts</li>
                  <li>• Test lifestyle changes</li>
                  <li>• Evaluate debt payoff strategies</li>
                </ul>
              </div>
            </div>
            <Button variant="outline" className="w-full" disabled>
              What-If Mode Coming in v2.1
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
