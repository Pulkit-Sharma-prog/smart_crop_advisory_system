import { useState } from 'react';
import { Upload, Camera, Image as ImageIcon, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

export default function DiseaseDetection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setTimeout(() => setShowResults(true), 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setTimeout(() => setShowResults(true), 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pest & Disease Detection</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Upload Crop Image</h2>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-forest-500 transition-colors cursor-pointer bg-gray-50"
              >
                {!selectedImage ? (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Drop your image here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: JPG, PNG, WEBP (Max 10MB)
                    </p>
                  </label>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={selectedImage}
                      alt="Uploaded crop"
                      className="max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setShowResults(false);
                      }}
                      className="text-sm text-forest-600 hover:text-forest-700 font-medium"
                    >
                      Upload Different Image
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button className="w-full bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-sky-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                    <Camera className="h-5 w-5" />
                    Take Photo with Camera
                  </button>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <ImageIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Tips for Best Results</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Take clear, well-lit photos</li>
                    <li>• Focus on affected areas</li>
                    <li>• Include leaves, stems, or fruits</li>
                    <li>• Avoid blurry or distant shots</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {!showResults ? (
              <div className="bg-gradient-to-br from-leaf-50 to-forest-50 rounded-xl shadow-lg p-8 flex items-center justify-center h-full">
                <div className="text-center">
                  <Shield className="h-16 w-16 text-forest-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    AI-Powered Detection Ready
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Upload a crop image to instantly identify diseases, pests, and get treatment
                    recommendations.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Detection Results</h2>
                    <div className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
                      Analyzed
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-bold text-red-900 mb-1">Late Blight</h3>
                          <p className="text-sm text-red-800 mb-2">
                            A fungal disease affecting leaves and stems
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-red-200 rounded-full h-2">
                              <div
                                className="bg-red-600 h-2 rounded-full"
                                style={{ width: '92%' }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-red-900">92%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Alternative Matches</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Early Blight</span>
                          <span className="font-medium text-gray-900">6%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Septoria Leaf Spot</span>
                          <span className="font-medium text-gray-900">2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Treatment Advice</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Immediate Action</p>
                        <p className="text-sm text-gray-700">
                          Remove and destroy infected leaves immediately to prevent spread
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Fungicide Application</p>
                        <p className="text-sm text-gray-700">
                          Apply copper-based fungicide or Mancozeb at 2.5g/L every 7-10 days
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-yellow-100 rounded-full p-2 flex-shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 mb-1">Water Management</p>
                        <p className="text-sm text-gray-700">
                          Avoid overhead irrigation. Water at base of plants in morning hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Preventive Measures</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-forest-600 font-bold">•</span>
                      <span>Maintain proper plant spacing for air circulation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-forest-600 font-bold">•</span>
                      <span>Use disease-resistant varieties in next season</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-forest-600 font-bold">•</span>
                      <span>Practice crop rotation with non-host plants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-forest-600 font-bold">•</span>
                      <span>Apply preventive fungicide sprays during humid weather</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-forest-600 font-bold">•</span>
                      <span>Monitor crops regularly for early detection</span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
