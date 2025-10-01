import React from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

const OctoberPlan: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 October Dynamic Cash Flow Plan</h1>
          <p className="text-gray-600">Your complete October financial roadmap with day-by-day planning</p>
        </div>
        <Button onClick={() => window.print()}>Print Plan</Button>
      </div>

      {/* October Overview */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">October Financial Overview</h2>
          
          {/* Overview Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900">Starting Balance</h3>
              <p className="text-2xl font-bold text-blue-700">£300</p>
              <p className="text-xs text-blue-600">Tue 1 Oct</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900">Expected Income</h3>
              <p className="text-2xl font-bold text-green-700">£4,160</p>
              <p className="text-xs text-green-600">26 workdays × £160</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-900">Total Outgoings</h3>
              <p className="text-2xl font-bold text-red-700">£3,760</p>
              <p className="text-xs text-red-600">All expenses + pots</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900">Projected Buffer</h3>
              <p className="text-2xl font-bold text-purple-700">£400</p>
              <p className="text-xs text-purple-600">If plan followed</p>
            </div>
          </div>

          {/* October Outgoings Breakdown */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-3">🚗 Car Costs</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Car Rent (11th + 25th)</span>
                  <span className="font-semibold">£480</span>
                </div>
                <div className="flex justify-between">
                  <span>Petrol (£20/day × 28)</span>
                  <span className="font-semibold">£560</span>
                </div>
                <div className="flex justify-between">
                  <span>Cleaning (×2)</span>
                  <span className="font-semibold">£30</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-semibold">£1,070</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">🏠 Living Costs</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Food (£50/week × 4)</span>
                  <span className="font-semibold">£200</span>
                </div>
                <div className="flex justify-between">
                  <span>Bills (due 28th)</span>
                  <span className="font-semibold">£990</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-semibold">£1,190</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pot Allocation Strategy */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">💰 Pot Allocation Strategy</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">Amex Repayment</div>
                <div className="text-2xl font-bold text-green-600">£800</div>
                <div className="text-xs text-gray-600">£200/week × 4</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Next-Month Pot</div>
                <div className="text-2xl font-bold text-blue-600">£700</div>
                <div className="text-xs text-gray-600">Nov food + spending</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Car Rent Pot</div>
                <div className="text-2xl font-bold text-orange-600">£480</div>
                <div className="text-xs text-gray-600">11th + 25th</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Bills Pot</div>
                <div className="text-2xl font-bold text-red-600">£990</div>
                <div className="text-xs text-gray-600">Due 28th</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week 1 Detailed Plan */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">📅 October Week 1 (Tue 1 – Sun 6)</h3>
          
          {/* Week 1 Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-sm text-green-700">Week Income</div>
              <div className="text-lg font-bold text-green-800">£960</div>
              <div className="text-xs text-green-600">6 days × £160</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-sm text-red-700">Week Expenses</div>
              <div className="text-lg font-bold text-red-800">£150</div>
              <div className="text-xs text-red-600">Petrol + Food</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-sm text-blue-700">Pot Contributions</div>
              <div className="text-lg font-bold text-blue-800">£570</div>
              <div className="text-xs text-blue-600">Rent + Bills + Amex</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-sm text-purple-700">End Balance</div>
              <div className="text-lg font-bold text-purple-800">£660</div>
              <div className="text-xs text-purple-600">Cash remaining</div>
            </div>
          </div>

          {/* Day-by-Day Plan */}
          <div className="space-y-4">
            {/* Tuesday 1 Oct */}
            <div className="border-l-4 border-l-green-500 pl-4 py-3 bg-green-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-semibold">TUE</div>
                    <div className="text-2xl font-bold">1</div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Starting Balance: £300</h4>
                    <p className="text-sm text-gray-600">First day of October plan</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">£410</div>
                  <div className="text-xs text-gray-600">End Balance</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Petrol</span>
                    <span className="text-red-600">-£20</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Food (weekly)</span>
                    <span className="text-red-600">-£50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Earnings</span>
                    <span className="text-green-600">+£180</span>
                  </div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="text-xs font-medium text-gray-600 mb-1">Day Summary</div>
                  <div className="text-xs">✅ Food covered for week</div>
                  <div className="text-xs">✅ Petrol handled</div>
                  <div className="text-xs">📈 Balance building</div>
                </div>
              </div>
            </div>

            {/* Wednesday 2 Oct */}
            <div className="border-l-4 border-l-green-500 pl-4 py-3 bg-green-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-semibold">WED</div>
                    <div className="text-2xl font-bold">2</div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Starting Balance: £410</h4>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">£570</div>
                  <div className="text-xs text-gray-600">End Balance</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Petrol</span>
                    <span className="text-red-600">-£20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Earnings</span>
                    <span className="text-green-600">+£180</span>
                  </div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="text-xs font-medium text-gray-600 mb-1">Day Summary</div>
                  <div className="text-xs">✅ Consistent income day</div>
                  <div className="text-xs">📈 Balance growing steadily</div>
                </div>
              </div>
            </div>

            {/* Thursday 3 Oct */}
            <div className="border-l-4 border-l-green-500 pl-4 py-3 bg-green-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-semibold">THU</div>
                    <div className="text-2xl font-bold">3</div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Starting Balance: £570</h4>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">£730</div>
                  <div className="text-xs text-gray-600">End Balance</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Petrol</span>
                    <span className="text-red-600">-£20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Earnings</span>
                    <span className="text-green-600">+£180</span>
                  </div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="text-xs font-medium text-gray-600 mb-1">Day Summary</div>
                  <div className="text-xs">✅ Building towards pot allocations</div>
                  <div className="text-xs">📈 Ready for Friday contributions</div>
                </div>
              </div>
            </div>

            {/* Friday 4 Oct */}
            <div className="border-l-4 border-l-blue-500 pl-4 py-3 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-semibold">FRI</div>
                    <div className="text-2xl font-bold">4</div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Starting Balance: £730</h4>
                    <p className="text-sm text-gray-600">First pot allocation day</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">£770</div>
                  <div className="text-xs text-gray-600">End Balance</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Petrol</span>
                    <span className="text-red-600">-£20</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Earnings</span>
                    <span className="text-green-600">+£180</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Car Rent Pot</span>
                    <span className="text-blue-600">+£120</span>
                  </div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="text-xs font-medium text-gray-600 mb-1">Day Summary</div>
                  <div className="text-xs">✅ Car rent pot: £120 saved</div>
                  <div className="text-xs">🎯 Halfway to £240 due 11th</div>
                  <div className="text-xs">📈 Balance includes pot savings</div>
                </div>
              </div>
            </div>

            {/* Saturday 5 Oct */}
            <div className="border-l-4 border-l-blue-500 pl-4 py-3 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-semibold">SAT</div>
                    <div className="text-2xl font-bold">5</div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Starting Balance: £770</h4>
                    <p className="text-sm text-gray-600">Major pot allocation day</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-blue-600">£700</div>
                  <div className="text-xs text-gray-600">End Balance</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Petrol</span>
                    <span className="text-red-600">-£20</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Earnings</span>
                    <span className="text-green-600">+£180</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bills Pot</span>
                    <span className="text-blue-600">+£250</span>
                  </div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="text-xs font-medium text-gray-600 mb-1">Day Summary</div>
                  <div className="text-xs">✅ Bills pot: £250 saved</div>
                  <div className="text-xs">🎯 Building toward £990 due 28th</div>
                  <div className="text-xs">📈 Core pots established</div>
                </div>
              </div>
            </div>

            {/* Sunday 6 Oct */}
            <div className="border-l-4 border-l-purple-500 pl-4 py-3 bg-purple-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-semibold">SUN</div>
                    <div className="text-2xl font-bold">6</div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Starting Balance: £700</h4>
                    <p className="text-sm text-gray-600">Week 1 completion</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-purple-600">£660</div>
                  <div className="text-xs text-gray-600">End Balance</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Petrol</span>
                    <span className="text-red-600">-£20</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Earnings</span>
                    <span className="text-green-600">+£180</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amex Pot</span>
                    <span className="text-blue-600">+£200</span>
                  </div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="text-xs font-medium text-gray-600 mb-1">Day Summary</div>
                  <div className="text-xs">✅ Amex pot: £200 saved</div>
                  <div className="text-xs">🎯 First weekly contribution complete</div>
                  <div className="text-xs">📈 All core pots established</div>
                </div>
              </div>
            </div>
          </div>

          {/* Week 1 Summary */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-center mb-3">✅ End of Week 1 Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">Cash Left</div>
                <div className="text-lg font-bold text-green-600">£660</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Car Rent Pot</div>
                <div className="text-lg font-bold text-blue-600">£120</div>
                <div className="text-xs text-gray-600">Halfway to £240</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Bills Pot</div>
                <div className="text-lg font-bold text-orange-600">£250</div>
                <div className="text-xs text-gray-600">Building toward £990</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Amex Pot</div>
                <div className="text-lg font-bold text-purple-600">£200</div>
                <div className="text-xs text-gray-600">First weekly contribution</div>
              </div>
            </div>
            <div className="text-center mt-3 text-sm text-gray-600">
              ✅ By end of Week 1, you're on track and balanced: all core pots started, food done, petrol handled.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week 2 Preview */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-4">📅 October Week 2 Preview (Mon 7 – Sun 13)</h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-sm text-green-700">Week Income</div>
              <div className="text-lg font-bold text-green-800">£1,120</div>
              <div className="text-xs text-green-600">7 days × £160</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-sm text-red-700">Major Payments</div>
              <div className="text-lg font-bold text-red-800">£240</div>
              <div className="text-xs text-red-600">Car rent due 11th</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-sm text-blue-700">Pot Contributions</div>
              <div className="text-lg font-bold text-blue-800">£450</div>
              <div className="text-xs text-blue-600">Bills + Amex + Next-Month</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-sm text-purple-700">End Balance</div>
              <div className="text-lg font-bold text-purple-800">£1,090</div>
              <div className="text-xs text-purple-600">Projected</div>
            </div>
          </div>
          <div className="text-center">
            <Button variant="outline" onClick={() => alert('Week 2 detailed plan coming soon!')}>
              View Week 2 Detailed Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OctoberPlan;
