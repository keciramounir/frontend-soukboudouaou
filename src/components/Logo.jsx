import React, { useEffect, useState } from "react";
import { useTheme } from "../context/themeContext";
import { getLogoSettings } from "../api/dataService";
import { normalizeImageUrl } from "../utils/images";
import logoLight from "../assets/logo-white.png";
import logoDark from "../assets/logo-dark.png";

export default function Logo({ className = "", alt = "Logo", forceDark = false, ...props }) {
  const { darkMode } = useTheme();
  const [logoConfig, setLogoConfig] = useState(null);

  useEffect(() => {
    let active = true;
    const loadLogo = async () => {
      try {
        const json = await getLogoSettings();
        const logo = json?.data?.logo || json?.logo || { logoLight: "", logoDark: "" };
        if (active) setLogoConfig(logo);
      } catch {
        if (active) setLogoConfig({ logoLight: "", logoDark: "" });
      }
    };
    
    loadLogo();
    
    // Listen for logo updates from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'site_logo_settings_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setLogoConfig(parsed);
        } catch {}
      }
    };
    
    const handleCustomUpdate = (e) => {
      if (e.detail) {
        setLogoConfig(e.detail);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logo-settings-updated', handleCustomUpdate);
    
    return () => {
      active = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logo-settings-updated', handleCustomUpdate);
    };
  }, []);

  // Use forceDark prop to always use dark logo, otherwise use theme
  const effectiveDarkMode = forceDark ? true : darkMode;

  // Use API logo if available, fallback to assets
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    const imgStr = String(logoPath).trim();
    // If it's already a blob URL, data URL, asset import, or full URL, use as-is
    if (imgStr.startsWith("blob:") || imgStr.startsWith("data:") || 
        imgStr.startsWith("http://") || imgStr.startsWith("https://") ||
        imgStr.includes("/assets/") || imgStr.startsWith("/src/")) {
      return imgStr;
    }
    // Otherwise normalize for backend URLs
    return normalizeImageUrl(imgStr);
  };
  
  const logoUrl = effectiveDarkMode
    ? (logoConfig?.logoDark ? getLogoUrl(logoConfig.logoDark) : logoDark)
    : (logoConfig?.logoLight ? getLogoUrl(logoConfig.logoLight) : logoLight);

  const fallbackLogo = effectiveDarkMode ? logoDark : logoLight;

  return (
    <img
      src={logoUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        // Fallback to asset logo if API logo fails
        if (e.currentTarget.src !== fallbackLogo) {
          e.currentTarget.src = fallbackLogo;
        }
      }}
      {...props}
    />
  );
}
