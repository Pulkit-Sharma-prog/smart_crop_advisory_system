import { Sprout, User, Globe } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  language: string;
  onLanguageToggle: () => void;
}

export default function Navbar({ currentPage, onNavigate, language, onLanguageToggle }: NavbarProps) {
  const navItems = ['Home', 'Dashboard', 'Advisory', 'Market Prices'];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('Home')}>
            <div className="bg-forest-600 p-2 rounded-lg">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-forest-800">Smart Crop Advisory</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => onNavigate(item)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item
                    ? 'text-forest-600 border-b-2 border-forest-600'
                    : 'text-gray-600 hover:text-forest-600'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onLanguageToggle}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Globe className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{language}</span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <User className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
