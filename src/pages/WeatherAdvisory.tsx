import { Cloud, CloudRain, Sun, Wind, Droplets, AlertTriangle, Droplet } from 'lucide-react';

export default function WeatherAdvisory() {
  const forecast = [
    { day: 'Today', temp: '28°C', condition: 'Partly Cloudy', rain: '20%', icon: Cloud },
    { day: 'Tomorrow', temp: '26°C', condition: 'Rainy', rain: '80%', icon: CloudRain },
    { day: 'Wed', temp: '25°C', condition: 'Heavy Rain', rain: '95%', icon: CloudRain },
    { day: 'Thu', temp: '27°C', condition: 'Cloudy', rain: '40%', icon: Cloud },
    { day: 'Fri', temp: '29°C', condition: 'Sunny', rain: '10%', icon: Sun },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Weather Advisory</h1>

        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">Heavy Rainfall Warning</h3>
              <p className="text-red-800 mb-2">
                Heavy rainfall expected on Wednesday and Thursday. Take necessary precautions.
              </p>
              <ul className="list-disc list-inside text-red-800 space-y-1 text-sm">
                <li>Avoid fertilizer application until Friday</li>
                <li>Postpone all spraying activities</li>
                <li>Ensure proper drainage in fields</li>
                <li>Secure loose equipment and materials</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Temperature</h3>
              <Sun className="h-8 w-8" />
            </div>
            <p className="text-4xl font-bold mb-2">28°C</p>
            <p className="text-sky-100">Feels like 30°C</p>
            <div className="mt-4 pt-4 border-t border-sky-400">
              <div className="flex justify-between text-sm">
                <span>High: 32°C</span>
                <span>Low: 24°C</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Humidity</h3>
              <Droplets className="h-8 w-8" />
            </div>
            <p className="text-4xl font-bold mb-2">65%</p>
            <p className="text-blue-100">Moderate humidity</p>
            <div className="mt-4 pt-4 border-t border-blue-400">
              <p className="text-sm">Good conditions for most crops</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Wind Speed</h3>
              <Wind className="h-8 w-8" />
            </div>
            <p className="text-4xl font-bold mb-2">12 km/h</p>
            <p className="text-teal-100">Light breeze</p>
            <div className="mt-4 pt-4 border-t border-teal-400">
              <p className="text-sm">Safe for spraying operations</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">5-Day Forecast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {forecast.map((day, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900 mb-3">{day.day}</p>
                <day.icon className="h-10 w-10 mx-auto mb-3 text-sky-600" />
                <p className="text-2xl font-bold text-gray-900 mb-2">{day.temp}</p>
                <p className="text-sm text-gray-600 mb-2">{day.condition}</p>
                <div className="flex items-center justify-center gap-1 text-sm text-blue-600">
                  <CloudRain className="h-4 w-4" />
                  <span>{day.rain}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Droplet className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Irrigation Suggestion</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900 mb-2">Today: Irrigation Recommended</p>
                <p className="text-sm text-green-800">
                  Good day for irrigation. No rain expected, optimal temperature and humidity.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="font-semibold text-yellow-900 mb-2">Tomorrow: Hold Off</p>
                <p className="text-sm text-yellow-800">
                  Rain expected tomorrow. Skip irrigation to avoid waterlogging.
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold text-red-900 mb-2">Wed-Thu: No Irrigation</p>
                <p className="text-sm text-red-800">
                  Heavy rainfall expected. Ensure proper drainage instead.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-leaf-100 p-3 rounded-lg">
                <Cloud className="h-6 w-6 text-leaf-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Farming Activity Guide</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-2 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sowing</p>
                  <p className="text-sm text-gray-600">Good conditions for sowing today</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-red-100 rounded-full p-2 mt-1">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Fertilizer Application</p>
                  <p className="text-sm text-gray-600">Avoid until Friday due to rain forecast</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-red-100 rounded-full p-2 mt-1">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Pesticide Spraying</p>
                  <p className="text-sm text-gray-600">Not recommended until rain clears</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-2 mt-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Harvesting</p>
                  <p className="text-sm text-gray-600">Can proceed today if crops are ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
