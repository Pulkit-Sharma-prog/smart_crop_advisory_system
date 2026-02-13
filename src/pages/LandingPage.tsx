import { Cloud, Sprout, Bug, Calendar, TrendingUp, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  t: Record<string, string>;
}

/* ---------- Animation presets ---------- */
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const stagger = {
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const features = [
    {
      icon: Cloud,
      title: 'Weather-Based Alerts',
      description: 'Real-time weather monitoring with smart irrigation and farming activity recommendations',
      color: 'bg-sky-100 text-sky-600',
    },
    {
      icon: Sprout,
      title: 'Soil & Crop Recommendation',
      description: 'AI-powered crop suggestions based on soil nutrients and environmental conditions',
      color: 'bg-forest-100 text-forest-600',
    },
    {
      icon: Bug,
      title: 'Disease Detection',
      description: 'Upload crop images for instant pest and disease identification with treatment advice',
      color: 'bg-earth-100 text-earth-600',
    },
    {
      icon: Calendar,
      title: 'Smart Farming Schedule',
      description: 'Get personalized schedules for sowing, irrigation, spraying, and harvesting',
      color: 'bg-leaf-100 text-leaf-700',
    },
    {
      icon: TrendingUp,
      title: 'Market Price Insights',
      description: 'Track real-time crop prices and market trends to maximize your profits',
      color: 'bg-sky-100 text-sky-600',
    },
  ];

  const steps = [
    { number: '01', title: 'Enter Details', description: 'Provide soil and location information' },
    { number: '02', title: 'Upload Image', description: 'Optional: Upload crop images for analysis' },
    { number: '03', title: 'AI Analysis', description: 'Our AI processes your data instantly' },
    { number: '04', title: 'Get Advice', description: 'Receive personalized farming recommendations' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-50 to-white">
      <section className="relative overflow-hidden bg-gradient-to-r from-forest-700 to-forest-900 text-white py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNiA2LTIuNjg2IDYtNi0yLjY4Ni02LTYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              AI-Powered Farming Decisions
            </h1>
            <p className="text-xl md:text-2xl text-forest-100 mb-8 max-w-3xl mx-auto">
              Smart recommendations for crops, soil, weather, and market prices
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('Advisory')}
                className="px-8 py-4 bg-white text-forest-700 font-semibold rounded-lg hover:bg-forest-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Start Advisory
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => onNavigate('Disease Detection')}
                className="px-8 py-4 bg-forest-600 text-white font-semibold rounded-lg hover:bg-forest-500 transition-all shadow-lg hover:shadow-xl"
              >
                Upload Crop Image
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-forest-900 mb-4">
              Powerful Features for Modern Farmers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to make informed farming decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-8 border border-gray-100 hover:border-forest-200 group"
              >
                <div className={`${feature.color} w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-forest-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-forest-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl shadow-md p-8 text-center hover:shadow-lg transition-shadow">
                  <div className="text-5xl font-bold text-forest-200 mb-4">{step.number}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-forest-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('Dashboard')}
              className="px-8 py-4 bg-forest-600 text-white font-semibold rounded-lg hover:bg-forest-700 transition-all shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
