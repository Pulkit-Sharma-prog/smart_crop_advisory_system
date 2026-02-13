import { useState } from "react";
import { Globe, LogIn, LogOut, Menu, Sprout, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../auth/AuthContext";
import { primaryNavItems, routes } from "../types/routes";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = primaryNavItems.filter((item) => !item.protected || isAuthenticated);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
      navigate(routes.home);
      return;
    }

    navigate(routes.login);
  };

  return (
    <nav className="glass-nav sticky top-0 z-50" aria-label="Primary navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <NavLink to={routes.home} className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-forest-600 to-forest-800 p-2 rounded-xl shadow-md">
              <Sprout className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-forest-900">{t("app.title")}</span>
          </NavLink>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-forest-800 border-b-2 border-forest-700"
                      : "text-forest-700/80 hover:text-forest-800"
                  }`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              aria-label={t("nav.language")}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-forest-50 transition-colors"
            >
              <Globe className="h-4 w-4 text-forest-700" />
              <span className="text-sm font-semibold text-forest-800 uppercase">{language}</span>
            </button>

            <button
              aria-label={isAuthenticated ? t("auth.logoutButton") : t("auth.loginButton")}
              onClick={handleAuthAction}
              className="p-2 rounded-full hover:bg-forest-50"
            >
              {isAuthenticated ? (
                <LogOut className="h-5 w-5 text-forest-700" />
              ) : (
                <LogIn className="h-5 w-5 text-forest-700" />
              )}
            </button>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-forest-50"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={t("nav.menu")}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div id="mobile-menu" className="md:hidden border-t border-forest-100 bg-white/95 backdrop-blur">
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive ? "bg-forest-50 text-forest-700" : "text-forest-800 hover:bg-gray-100"
                  }`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                handleAuthAction();
              }}
              className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold text-forest-800 hover:bg-gray-100"
            >
              {isAuthenticated ? t("auth.logoutButton") : t("auth.loginButton")}
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
