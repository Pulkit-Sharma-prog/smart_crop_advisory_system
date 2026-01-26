import { TrendingUp, TrendingDown, MapPin, Star, Info } from 'lucide-react';

export default function MarketPrices() {
  const marketData = [
    { crop: 'Wheat', market: 'Local Mandi', price: 2150, change: 5.2, trend: 'up' },
    { crop: 'Rice', market: 'Regional Market', price: 1980, change: 2.8, trend: 'up' },
    { crop: 'Cotton', market: 'City Market', price: 5600, change: -1.5, trend: 'down' },
    { crop: 'Sugarcane', market: 'Local Mandi', price: 280, change: 3.1, trend: 'up' },
    { crop: 'Maize', market: 'Regional Market', price: 1850, change: 4.2, trend: 'up' },
    { crop: 'Soybean', market: 'City Market', price: 4200, change: -0.8, trend: 'down' },
    { crop: 'Potato', market: 'Local Mandi', price: 18, change: 12.5, trend: 'up' },
    { crop: 'Tomato', market: 'Regional Market', price: 32, change: 18.7, trend: 'up' },
    { crop: 'Onion', market: 'City Market', price: 25, change: -5.2, trend: 'down' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Market Prices</h1>

        <div className="bg-gradient-to-r from-forest-600 to-forest-700 rounded-xl shadow-lg p-6 text-white mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <Star className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Best Crop to Sell Today</h2>
              <p className="text-forest-100 mb-3">
                High demand and rising prices in nearby markets
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-4">
                  <p className="text-forest-100 text-sm mb-1">Crop</p>
                  <p className="text-2xl font-bold">Tomato</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-4">
                  <p className="text-forest-100 text-sm mb-1">Current Price</p>
                  <p className="text-2xl font-bold">₹32/kg</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg px-6 py-4">
                  <p className="text-forest-100 text-sm mb-1">Price Increase</p>
                  <p className="text-2xl font-bold text-leaf-200 flex items-center gap-1">
                    <TrendingUp className="h-5 w-5" />
                    +18.7%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Top Gainer</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">Tomato</p>
            <p className="text-green-600 font-semibold text-lg">+18.7%</p>
            <p className="text-sm text-gray-600 mt-2">Regional Market</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Stable Price</h3>
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">Rice</p>
            <p className="text-blue-600 font-semibold text-lg">+2.8%</p>
            <p className="text-sm text-gray-600 mt-2">Regional Market</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Top Loser</h3>
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">Onion</p>
            <p className="text-red-600 font-semibold text-lg">-5.2%</p>
            <p className="text-sm text-gray-600 mt-2">City Market</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Current Market Rates</h2>
            <p className="text-sm text-gray-600 mt-1">Updated: Today at 10:00 AM</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Crop Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Market
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {marketData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-forest-100 w-10 h-10 rounded-lg flex items-center justify-center">
                          <span className="text-lg">{item.crop[0]}</span>
                        </div>
                        <span className="font-medium text-gray-900">{item.crop}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{item.market}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{item.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600">/kg</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                          item.trend === 'up'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {item.trend === 'up' ? '+' : ''}
                        {item.change}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Market Insights
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Vegetable prices are showing strong upward trends due to seasonal demand
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Grain prices remain stable with minor fluctuations in regional markets
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Consider selling tomatoes and potatoes now to maximize profits
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Price data is updated twice daily from government mandis and private markets
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
