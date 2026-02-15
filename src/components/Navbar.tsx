import { useEffect, useRef, useState } from "react";
import { Globe, LogIn, LogOut, Menu, Sprout, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { useAuth } from "../auth/useAuth";
import { primaryNavItems, routes } from "../types/routes";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = primaryNavItems.filter((item) => !item.protected || isAuthenticated);
  const authLabel = isAuthenticated ? t("auth.logoutButton") : t("auth.loginButton");
  const avatarInitial = currentUser?.name?.trim().charAt(0).toUpperCase() || "U";

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
      navigate(routes.home);
      return;
    }

    navigate(routes.login);
  };

  useEffect(() => {
    if (!profileOpen) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (profileMenuRef.current && target && !profileMenuRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, [profileOpen]);

  return (
    <nav className="glass-nav sticky top-0 z-50" aria-label={t("nav.primaryNav")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <NavLink to={routes.home} className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-forest-600 to-forest-800 p-2 rounded-xl shadow-md">
              <Sprout className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-forest-900">{t("app.title")}</span>
          </NavLink>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-forest-800 border-b-2 border-forest-700"
                      : "text-forest-700/90 hover:text-forest-800"
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
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-forest-50 transition-colors border border-transparent hover:border-forest-100"
            >
              <Globe className="h-4 w-4 text-forest-700" />
              <span className="text-sm font-semibold text-forest-800 uppercase">{language}</span>
            </button>

            {isAuthenticated ? (
              <div ref={profileMenuRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setProfileOpen((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-full border border-forest-200 bg-white px-2 py-1.5 hover:bg-forest-50 transition"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  aria-label={t("nav.profile")}
                >
                  <span className="h-8 w-8 rounded-full bg-gradient-to-br from-forest-500 to-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                    {avatarInitial}
                  </span>
                  <span className="text-sm font-semibold text-forest-800 max-w-28 truncate">{currentUser?.name}</span>
                </button>
                <div
                  className={`absolute right-0 mt-2 w-44 rounded-xl border border-forest-100 bg-white shadow-lg p-1 origin-top-right transition-all duration-200 ease-out ${
                    profileOpen
                      ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                      : "opacity-0 -translate-y-1 scale-95 pointer-events-none"
                  }`}
                  role="menu"
                >
                  <button
                    type="button"
                    className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-50"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate(routes.farmTools);
                    }}
                  >
                    {t("nav.profile")}
                  </button>
                  <button
                    type="button"
                    className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      handleAuthAction();
                    }}
                  >
                    {t("auth.logoutButton")}
                  </button>
                </div>
              </div>
            ) : null}

            <button
              aria-label={authLabel}
              onClick={handleAuthAction}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-forest-200 bg-white hover:bg-forest-50 transition text-forest-800 font-semibold text-sm shadow-sm"
            >
              {isAuthenticated ? <LogOut className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              <span>{authLabel}</span>
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
        <div id="mobile-menu" className="md:hidden border-t border-forest-100 bg-white/95 backdrop-blur shadow-[0_18px_24px_-22px_rgba(13,50,34,0.55)] fade-up">
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
              {authLabel}
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

