import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { normalizeCategoryValue } from "../utils/images";
import turkeyImg from "../assets/turkey.png";
import chickenImg from "../assets/chicken.png";

const STORAGE_KEY = "admin_categories_v1";

const COLOR_POOL = [
  "#f97316",
  "#f59e0b",
  "#2563eb",
  "#22c55e",
  "#0ea5e9",
  "#8b5cf6",
  "#ef4444",
];

const DEFAULT_CATEGORIES = [
  {
    id: "poulet",
    value: "Poulet",
    labels: { fr: "Poulet", en: "Chicken", ar: "دجاج" },
    accent: "#f97316",
    icon: "P",
    iconUrl: chickenImg,
    translationKey: "cat_chicken",
    visible: true,
  },
  {
    id: "dinde",
    value: "Dinde",
    labels: { fr: "Dinde", en: "Turkey", ar: "ديك رومي" },
    accent: "#f59e0b",
    icon: "D",
    iconUrl: turkeyImg,
    translationKey: "cat_turkey",
    visible: true,
  },
];

// Ensure categories are always Poulet and Dinde
function ensureDefaultCategories(cats) {
  const normalized = cats || [];
  const hasPoulet = normalized.some(c => normalizeCategoryValue(c.value) === "Poulet");
  const hasDinde = normalized.some(c => normalizeCategoryValue(c.value) === "Dinde");
  
  const result = [...normalized];
  
  if (!hasPoulet) {
    result.unshift(DEFAULT_CATEGORIES[0]);
  }
  if (!hasDinde) {
    const pouletIdx = result.findIndex(c => normalizeCategoryValue(c.value) === "Poulet");
    result.splice(pouletIdx + 1, 0, DEFAULT_CATEGORIES[1]);
  }
  
  // Ensure order: Poulet first, Dinde second
  const poulet = result.find(c => normalizeCategoryValue(c.value) === "Poulet");
  const dinde = result.find(c => normalizeCategoryValue(c.value) === "Dinde");
  const others = result.filter(c => 
    normalizeCategoryValue(c.value) !== "Poulet" && 
    normalizeCategoryValue(c.value) !== "Dinde"
  );
  
  // Restore default iconUrls for Poulet and Dinde if missing (imported modules can't be serialized)
  if (poulet && !poulet.iconUrl) {
    poulet.iconUrl = chickenImg;
  }
  if (dinde && !dinde.iconUrl) {
    dinde.iconUrl = turkeyImg;
  }
  
  return [poulet, dinde, ...others].filter(Boolean);
}

const CategoryContext = createContext(null);

function ensureCategoryShape(cat, idx = 0) {
  if (!cat) return null;
  const safeValue = String(cat.value || "").trim() || "Categorie";
  const pickColor = COLOR_POOL[idx % COLOR_POOL.length] || "#4c8df7";
  // Handle iconUrl - can be string (URL or base64), imported module, or empty
  const iconUrl = cat.iconUrl || 
    (typeof cat.icon === "string" && cat.icon.startsWith("data:image") ? cat.icon : "") ||
    "";
  return {
    id: cat.id || `cat-${idx}-${Date.now()}`,
    value: safeValue,
    labels: {
      fr: cat.labels?.fr || safeValue,
      en: cat.labels?.en || cat.labels?.fr || safeValue,
      ar: cat.labels?.ar || cat.labels?.fr || safeValue,
    },
    accent: cat.accent || pickColor,
    icon: cat.icon || safeValue.slice(0, 2).toUpperCase(),
    iconUrl,
    translationKey: cat.translationKey,
    visible: cat.visible !== false,
  };
}

function loadInitialCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const loaded = parsed
          .map((c, idx) => ensureCategoryShape(c, idx))
          .filter(Boolean);
        // Ensure Poulet and Dinde always exist and are in correct order
        return ensureDefaultCategories(loaded);
      }
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_CATEGORIES;
}

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState(loadInitialCategories);
  const isUpdatingFromStorage = useRef(false);

  // Save categories to localStorage (but not if update came from storage event)
  useEffect(() => {
    if (isUpdatingFromStorage.current) {
      isUpdatingFromStorage.current = false;
      return; // Don't save if this update came from storage
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
      // Trigger custom event for same-tab sync (but NOT storage event to avoid loop)
      window.dispatchEvent(new CustomEvent('categories-updated', { detail: categories }));
    } catch {
      // ignore storage errors
    }
  }, [categories]);
  
  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            const loaded = parsed
              .map((c, idx) => ensureCategoryShape(c, idx))
              .filter(Boolean);
            const ensured = ensureDefaultCategories(loaded);
            isUpdatingFromStorage.current = true; // Mark that this update is from storage
            setCategories(ensured);
          }
        } catch {
          // ignore parse errors
        }
      }
    };
    
    const handleCustomUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        const ensured = ensureDefaultCategories(e.detail);
        // Only update if it's different (prevent loop)
        setCategories(prev => {
          const prevStr = JSON.stringify(prev);
          const newStr = JSON.stringify(ensured);
          if (prevStr !== newStr) {
            isUpdatingFromStorage.current = true;
            return ensured;
          }
          return prev;
        });
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('categories-updated', handleCustomUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('categories-updated', handleCustomUpdate);
    };
  }, []);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.visible !== false),
    [categories]
  );

  const accentFor = useCallback(
    (value) => {
      const normalized = normalizeCategoryValue(value);
      return (
        categories.find(
          (c) =>
            normalizeCategoryValue(c.value) ===
            normalizeCategoryValue(normalized)
        )?.accent || "#4285f4"
      );
    },
    [categories]
  );

  const labelFor = useCallback(
    (value, language, translator) => {
      // Normalize objects {fr,en,ar} to a string
      if (value && typeof value === "object") {
        value =
          value[language] ||
          value.fr ||
          value.en ||
          value.ar ||
          Object.values(value)[0] ||
          "";
      }
      const normalized = normalizeCategoryValue(value);
      const match = categories.find(
        (c) =>
          normalizeCategoryValue(c.value) ===
          normalizeCategoryValue(normalized)
      );
      if (!match) return value || "";
      const translated =
        (match.translationKey && translator?.(match.translationKey)) || "";
      return (
        translated ||
        match.labels?.[language] ||
        match.labels?.fr ||
        match.value
      );
    },
    [categories]
  );

  const addCategory = useCallback((input) => {
    const value = normalizeCategoryValue(input?.value || "");
    if (!value) return;
    setCategories((prev) => {
      const exists = prev.some(
        (c) =>
          normalizeCategoryValue(c.value) === normalizeCategoryValue(value)
      );
      if (exists) return prev;
      const nextAccent =
        input?.accent ||
        COLOR_POOL[(prev.length + 1) % COLOR_POOL.length] ||
        "#4c8df7";
      const next = ensureCategoryShape(
        {
          ...input,
          value,
          accent: nextAccent,
          visible: input?.visible !== false,
        },
        prev.length
      );
      return [...prev, next];
    });
  }, []);

  const updateCategory = useCallback((id, patch) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? ensureCategoryShape({ ...c, ...patch }) : c))
    );
  }, []);

  const toggleVisibility = useCallback((id) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, visible: !c.visible } : c
      )
    );
  }, []);

  const removeCategory = useCallback((id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      categories,
      visibleCategories,
      accentFor,
      labelFor,
      addCategory,
      updateCategory,
      toggleVisibility,
      removeCategory,
    }),
    [
      accentFor,
      addCategory,
      categories,
      labelFor,
      removeCategory,
      toggleVisibility,
      updateCategory,
      visibleCategories,
    ]
  );

  return (
    <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return ctx;
}
