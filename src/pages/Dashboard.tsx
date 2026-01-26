import { Cloud, Sprout, Bug, Calendar, TrendingUp, LayoutDashboard, CloudRain, Droplets, Wind, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="w-64 bg-white shadow-lg">
          <div className="h-full px-3 py-6 space-y-2">
            <button
              onClick={() => onNavigate('Dashboard')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-forest-700 bg-forest-50 rounded-lg font-medium"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard Overview</span>
            </button>
            <button
              onClick={() => onNavigate('Weather Advisory')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              <Cloud className="h-5 w-5" />
              <span>Weather Advisory</span>
            </button>
            <button
              onClick={() => onNavigate('Advisory')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              <Sprout className="h-5 w-5" />
              <span>Soil & Crop</span>
            </button>
            <button
              onClick={() => onNavigate('Disease Detection')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              <Bug className="h-5 w-5" />
              <span>Disease Detection</span>
            </button>
            <button
              onClick={() => onNavigate('Farming Schedule')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              <Calendar className="h-5 w-5" />
              <span>Farming Schedule</span>
            </button>
            <button
              onClick={() => onNavigate('Market Prices')}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Market Prices</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sky-100 text-sm font-medium mb-1">Current Weather</p>
                  <h3 className="text-4xl font-bold mb-2">28°C</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-4 w-4" />
                      <span>Rain: 20%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      <span>Humidity: 65%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4" />
                      <span>Wind: 12 km/h</span>
                    </div>
                  </div>
                </div>
                <Cloud className="h-12 w-12 text-sky-200" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Advisory</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-forest-100 p-2 rounded-lg">
                    <Sprout className="h-5 w-5 text-forest-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Ideal for Sowing</p>
                    <p className="text-sm text-gray-600">Soil moisture is optimal</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-sky-100 p-2 rounded-lg">
                    <Droplets className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Irrigation Needed</p>
                    <p className="text-sm text-gray-600">Water your crops today</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Crop</h3>
              <div className="flex items-center gap-4">
                <div className="bg-leaf-100 p-4 rounded-xl">
                  <Sprout className="h-10 w-10 text-leaf-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">Wheat</p>
                  <p className="text-sm text-gray-600">Best for your soil type</p>
                  <div className="mt-2">
                    <span className="inline-block bg-forest-100 text-forest-700 text-xs font-medium px-3 py-1 rounded-full">
                      NPK: 120-60-40
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-2">Weather Alert</h3>
                  <p className="text-red-800 mb-3">
                    Heavy rainfall expected in the next 48 hours. Avoid fertilizer application
                    and postpone spraying activities.
                  </p>
                  <button
                    onClick={() => onNavigate('Weather Advisory')}
                    className="text-red-700 font-medium hover:text-red-900 text-sm underline"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Price Snapshot</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Wheat</p>
                    <p className="text-sm text-gray-600">Local Mandi</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₹2,150/kg</p>
                    <p className="text-sm text-green-600 flex items-center justify-end gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +5.2%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Rice</p>
                    <p className="text-sm text-gray-600">Regional Market</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₹1,980/kg</p>
                    <p className="text-sm text-green-600 flex items-center justify-end gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +2.8%
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigate('Market Prices')}
                className="mt-4 w-full py-2 text-forest-600 font-medium hover:bg-forest-50 rounded-lg transition-colors"
              >
                View All Prices →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
