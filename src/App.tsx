import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import WeatherAdvisory from './pages/WeatherAdvisory';
import SoilCropRecommendation from './pages/SoilCropRecommendation';
import DiseaseDetection from './pages/DiseaseDetection';
import FarmingSchedule from './pages/FarmingSchedule';
import MarketPrices from './pages/MarketPrices';

function App() {
  const [currentPage, setCurrentPage] = useState('Home');
  const [language, setLanguage] = useState('English');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'English' ? 'हिंदी' : 'English');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Home':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'Dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'Weather Advisory':
        return <WeatherAdvisory />;
      case 'Advisory':
        return <SoilCropRecommendation />;
      case 'Disease Detection':
        return <DiseaseDetection />;
      case 'Farming Schedule':
        return <FarmingSchedule />;
      case 'Market Prices':
        return <MarketPrices />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        language={language}
        onLanguageToggle={handleLanguageToggle}
      />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;
