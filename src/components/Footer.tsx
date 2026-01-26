import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Leaf className="h-5 w-5 mr-2" />
              About the Project
            </h3>
            <p className="text-forest-100 text-sm">
              Smart Crop Advisory System leverages AI to empower farmers with intelligent
              recommendations for sustainable and profitable agriculture.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Hackathon Team</h3>
            <p className="text-forest-100 text-sm">
              Built with passion by innovators committed to transforming agriculture through
              technology and AI-driven insights.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Mission</h3>
            <p className="text-forest-100 text-sm font-medium">
              AI for Sustainable Agriculture
            </p>
            <p className="text-forest-200 text-sm mt-2">
              Empowering farmers with smart, data-driven decisions for a greener future.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-forest-700 text-center">
          <p className="text-forest-200 text-sm">
            © 2024 Smart Crop Advisory System. Built for Hackathon 2024.
          </p>
        </div>
      </div>
    </footer>
  );
}
