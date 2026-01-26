import { Sprout, Droplets, Sparkles, Wheat, Calendar, CheckCircle } from 'lucide-react';

export default function FarmingSchedule() {
  const schedule = [
    {
      phase: 'Sowing Window',
      icon: Sprout,
      date: 'Nov 15 - Nov 30, 2024',
      status: 'upcoming',
      color: 'leaf',
      tasks: [
        { task: 'Prepare seedbed', reason: 'Soil moisture is optimal after recent rain' },
        { task: 'Apply basal fertilizer', reason: 'DAP and MOP before sowing' },
        { task: 'Sow wheat seeds', reason: 'Temperature range 15-20°C is ideal' },
      ],
    },
    {
      phase: 'First Irrigation',
      icon: Droplets,
      date: 'Dec 20-25, 2024',
      status: 'pending',
      color: 'sky',
      tasks: [
        { task: 'Crown root irrigation', reason: '21 days after sowing' },
        { task: 'Apply first split of Urea', reason: 'Apply 1/3 of total nitrogen dose' },
        { task: 'Light irrigation', reason: 'Based on soil moisture sensors' },
      ],
    },
    {
      phase: 'Spray Advisory',
      icon: Sparkles,
      date: 'Jan 10-15, 2025',
      status: 'pending',
      color: 'earth',
      tasks: [
        { task: 'Weed control spray', reason: 'Apply post-emergence herbicide' },
        { task: 'Pest monitoring', reason: 'Check for aphids and termites' },
        { task: 'Second nitrogen split', reason: 'Apply 1/3 of Urea dose' },
      ],
    },
    {
      phase: 'Harvest Period',
      icon: Wheat,
      date: 'Apr 1-15, 2025',
      status: 'pending',
      color: 'forest',
      tasks: [
        { task: 'Monitor grain moisture', reason: 'Harvest when moisture is 18-20%' },
        { task: 'Arrange harvesting equipment', reason: 'Book combine harvester in advance' },
        { task: 'Post-harvest processing', reason: 'Threshing and cleaning immediately' },
      ],
    },
  ];

  const getColorClasses = (color: string, status: string) => {
    const colors = {
      leaf: {
        bg: 'bg-leaf-100',
        border: 'border-leaf-500',
        text: 'text-leaf-700',
        icon: 'text-leaf-600',
        dot: 'bg-leaf-500',
      },
      sky: {
        bg: 'bg-sky-100',
        border: 'border-sky-500',
        text: 'text-sky-700',
        icon: 'text-sky-600',
        dot: 'bg-sky-500',
      },
      earth: {
        bg: 'bg-earth-100',
        border: 'border-earth-500',
        text: 'text-earth-700',
        icon: 'text-earth-600',
        dot: 'bg-earth-500',
      },
      forest: {
        bg: 'bg-forest-100',
        border: 'border-forest-500',
        text: 'text-forest-700',
        icon: 'text-forest-600',
        dot: 'bg-forest-500',
      },
    };

    return colors[color as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Smart Farming Schedule</h1>
          <p className="text-gray-600">
            AI-powered timeline for optimal crop management based on weather and soil conditions
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-6 w-6 text-forest-600" />
            <h2 className="text-xl font-bold text-gray-900">Crop: Wheat (Rabi Season 2024-25)</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Growing Period</p>
              <p className="font-bold text-gray-900">120-130 days</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Land Size</p>
              <p className="font-bold text-gray-900">5 acres</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Expected Yield</p>
              <p className="font-bold text-gray-900">45-50 quintals/acre</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

          <div className="space-y-8">
            {schedule.map((item, index) => {
              const colors = getColorClasses(item.color, item.status);
              const Icon = item.icon;

              return (
                <div key={index} className="relative">
                  <div className="flex items-start gap-6">
                    <div className="relative z-10 flex-shrink-0">
                      <div
                        className={`${colors.bg} ${colors.border} border-4 w-16 h-16 rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <Icon className={`h-8 w-8 ${colors.icon}`} />
                      </div>
                    </div>

                    <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className={`${colors.bg} px-6 py-4 border-b border-gray-200`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`text-xl font-bold ${colors.text}`}>{item.phase}</h3>
                            <p className="text-sm text-gray-700 mt-1 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {item.date}
                            </p>
                          </div>
                          {item.status === 'completed' ? (
                            <div className="bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Completed
                            </div>
                          ) : (
                            <div className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                              Upcoming
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        {item.tasks.map((taskItem, taskIndex) => (
                          <div
                            key={taskIndex}
                            className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className={`${colors.dot} w-2 h-2 rounded-full mt-2 flex-shrink-0`}></div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 mb-1">{taskItem.task}</p>
                              <p className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-gray-400">→</span>
                                {taskItem.reason}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Smart Scheduling Notes
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                All dates are dynamically adjusted based on real-time weather forecasts
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Irrigation schedules consider soil moisture sensors and upcoming rainfall
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Spray activities are planned to avoid windy or rainy periods</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                You will receive SMS/app notifications 2 days before each scheduled activity
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
