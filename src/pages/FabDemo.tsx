import { useState } from "react";

export default function FabDemo() {
  const [selectedLayout, setSelectedLayout] = useState<"vertical" | "quarter-circle" | "half-circle" | "full-circle">("quarter-circle");
  const [selectedPosition, setSelectedPosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "top-left">("bottom-right");
  const [customActions, setCustomActions] = useState([
    {
      icon: "📊",
      label: "Analytics",
      onClick: () => alert("Opening Analytics"),
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      icon: "💰",
      label: "Budget",
      onClick: () => alert("Opening Budget"),
      color: "bg-emerald-500 hover:bg-emerald-600"
    },
    {
      icon: "🎯",
      label: "Goals",
      onClick: () => alert("Opening Goals"),
      color: "bg-amber-500 hover:bg-amber-600"
    },
    {
      icon: "📅",
      label: "Calendar",
      onClick: () => alert("Opening Calendar"),
      color: "bg-rose-500 hover:bg-rose-600"
    },
    {
      icon: "⚡",
      label: "Quick Actions",
      onClick: () => alert("Opening Quick Actions"),
      color: "bg-violet-500 hover:bg-violet-600"
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Floating Action Button Demo</h1>
        <p className="text-gray-600 mb-8">Test different layouts and positions for the FAB menu</p>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Layout Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout Style
              </label>
              <div className="space-y-2">
                {(["vertical", "quarter-circle", "half-circle", "full-circle"] as const).map((layout) => (
                  <label key={layout} className="flex items-center">
                    <input
                      type="radio"
                      name="layout"
                      value={layout}
                      checked={selectedLayout === layout}
                      onChange={(e) => setSelectedLayout(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="capitalize">{layout.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Position Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <div className="space-y-2">
                {(["bottom-right", "bottom-left", "top-right", "top-left"] as const).map((position) => (
                  <label key={position} className="flex items-center">
                    <input
                      type="radio"
                      name="position"
                      value={position}
                      checked={selectedPosition === position}
                      onChange={(e) => setSelectedPosition(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="capitalize">{position.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Current Configuration Display */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Current Configuration:</h3>
            <div className="text-sm text-gray-600">
              <p>Layout: <span className="font-medium capitalize">{selectedLayout.replace('-', ' ')}</span></p>
              <p>Position: <span className="font-medium capitalize">{selectedPosition.replace('-', ' ')}</span></p>
              <p>Actions: <span className="font-medium">{customActions.length} buttons</span></p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <h3 className="font-medium text-yellow-800 mb-2">How to Use:</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Click the main FAB button (bottom-right by default) to open the menu</li>
            <li>• Child buttons will appear based on your selected layout</li>
            <li>• Hover over buttons to see tooltips</li>
            <li>• Click any child button to trigger its action and close the menu</li>
            <li>• Use the controls above to change layout and position</li>
          </ul>
        </div>

        {/* Demo Area */}
        <div className="bg-white rounded-lg shadow-lg p-8 min-h-[400px] relative border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-4">This is your demo area</p>
            <p className="text-sm">The FAB will appear in the selected position</p>
            <p className="text-sm mt-2">Try different layouts and positions to see how they behave!</p>
          </div>

          {/* FAB Component Removed - Main FAB in App.tsx handles all actions */}
        </div>

        {/* Features Showcase */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-2">🎨 Customizable</h3>
            <p className="text-gray-600 text-sm">Easily customize colors, icons, labels, and actions for each button.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-2">📱 Responsive</h3>
            <p className="text-gray-600 text-sm">Works perfectly on all screen sizes with smooth animations.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-lg mb-2">⚡ Flexible Layouts</h3>
            <p className="text-gray-600 text-sm">Choose from vertical stack, quarter-circle, half-circle, or full-circle layouts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
