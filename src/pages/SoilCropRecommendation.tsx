import { useState } from 'react';
import { Sprout, Droplet, FlaskConical, Ruler, CheckCircle, AlertCircle } from 'lucide-react';

export default function SoilCropRecommendation() {
  const [showResults, setShowResults] = useState(false);
  const [formData, setFormData] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
    landSize: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const recommendedCrops = [
    { name: 'Wheat', suitability: 95, season: 'Rabi', npk: '120-60-40', profit: 'High' },
    { name: 'Rice', suitability: 88, season: 'Kharif', npk: '100-50-50', profit: 'High' },
    { name: 'Cotton', suitability: 75, season: 'Kharif', npk: '80-40-40', profit: 'Medium' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Soil & Crop Recommendation</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Enter Soil Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FlaskConical className="h-4 w-4 text-forest-600" />
                  Nitrogen (N) - kg/ha
                </label>
                <input
                  type="number"
                  name="nitrogen"
                  value={formData.nitrogen}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                  placeholder="e.g., 120"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FlaskConical className="h-4 w-4 text-forest-600" />
                  Phosphorus (P) - kg/ha
                </label>
                <input
                  type="number"
                  name="phosphorus"
                  value={formData.phosphorus}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                  placeholder="e.g., 60"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FlaskConical className="h-4 w-4 text-forest-600" />
                  Potassium (K) - kg/ha
                </label>
                <input
                  type="number"
                  name="potassium"
                  value={formData.potassium}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                  placeholder="e.g., 40"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Droplet className="h-4 w-4 text-forest-600" />
                  Soil pH Level
                </label>
                <input
                  type="number"
                  name="ph"
                  value={formData.ph}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="14"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                  placeholder="e.g., 6.5"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Ruler className="h-4 w-4 text-forest-600" />
                  Land Size (acres)
                </label>
                <input
                  type="number"
                  name="landSize"
                  value={formData.landSize}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
                  placeholder="e.g., 5"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-forest-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-forest-700 transition-all shadow-md hover:shadow-lg"
              >
                Get Smart Recommendation
              </button>
            </form>
          </div>

          {showResults && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Soil Health Indicator</h2>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">Good</p>
                      <p className="text-sm text-gray-600">Soil condition is healthy</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">78/100</p>
                    <p className="text-sm text-gray-600">Health Score</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended Crops</h2>
                <div className="space-y-4">
                  {recommendedCrops.map((crop, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-forest-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-leaf-100 p-2 rounded-lg">
                            <Sprout className="h-6 w-6 text-leaf-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{crop.name}</h3>
                            <p className="text-sm text-gray-600">{crop.season} Season</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-forest-600">{crop.suitability}%</p>
                          <p className="text-xs text-gray-600">Suitability</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                          NPK: {crop.npk}
                        </span>
                        <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
                          Profit: {crop.profit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Fertilizer Advice</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <FlaskConical className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Urea (Nitrogen)</p>
                      <p className="text-sm text-gray-700">Apply 260 kg/ha in 3 splits</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <FlaskConical className="h-5 w-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">DAP (Phosphorus)</p>
                      <p className="text-sm text-gray-700">Apply 130 kg/ha at sowing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                    <FlaskConical className="h-5 w-5 text-yellow-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">MOP (Potassium)</p>
                      <p className="text-sm text-gray-700">Apply 67 kg/ha before sowing</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Important:</span> Apply fertilizers based on
                    weather conditions. Avoid application before heavy rainfall.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!showResults && (
            <div className="bg-gradient-to-br from-forest-50 to-leaf-50 rounded-xl shadow-lg p-8 flex items-center justify-center">
              <div className="text-center">
                <Sprout className="h-16 w-16 text-forest-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Smart Recommendations Awaiting
                </h3>
                <p className="text-gray-600 max-w-md">
                  Fill in your soil details to get AI-powered crop and fertilizer recommendations
                  tailored to your farm.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
