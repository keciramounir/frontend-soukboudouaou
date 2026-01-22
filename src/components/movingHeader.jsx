/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/themeContext";
import { useTranslation } from "../context/translationContext";
import {
  getMovingHeaderSettings,
  DEFAULT_MOVING_HEADER_FONT_CONFIG,
} from "../api/dataService";

/**
 * MovingHeader Component
 * - Fetches editable prices (admin-configurable)
 * - Compatible with theme / translations context
 * - Reacts to sidebar open
 * - Responsive + hover pause
 */

export default function MovingHeader({ sidebarOpen }) {
  const { darkMode } = useTheme();
  const { t, language } = useTranslation();

  const [items, setItems] = useState([]);
  const [prefixFr, setPrefixFr] = useState("");
  const [prefixAr, setPrefixAr] = useState("");
  const [textColor, setTextColor] = useState("");
  const [heightPx, setHeightPx] = useState(60);
  const [translateWilayaAr, setTranslateWilayaAr] = useState(true);
  const [fontConfig, setFontConfig] = useState(() => ({
    ...DEFAULT_MOVING_HEADER_FONT_CONFIG,
  }));
  const [backgroundColorOverride, setBackgroundColorOverride] = useState("");
  const [animationDuration, setAnimationDuration] = useState(22);

  const backgroundColor =
    backgroundColorOverride ||
    (darkMode ? "var(--category-accent-soft)" : "var(--category-accent)");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // Try new key first, then fallback to old key
        const cached = localStorage.getItem("site_moving_header_v1") || localStorage.getItem("moving_header");
        if (cached && active) {
          const parsed = JSON.parse(cached);
          // Handle both old format (direct object) and new format (wrapped in data)
          const data = parsed?.data || parsed;
          if (Array.isArray(data?.items)) setItems(data.items);
          if (data?.fontConfig) setFontConfig(data.fontConfig);
          if (data?.prefixFr !== undefined)
            setPrefixFr(String(data.prefixFr || ""));
          if (data?.prefixAr !== undefined)
            setPrefixAr(String(data.prefixAr || ""));
          if (data?.textColor !== undefined)
            setTextColor(String(data.textColor || ""));
          if (data?.backgroundColor !== undefined)
            setBackgroundColorOverride(String(data.backgroundColor || ""));
          if (data?.animationDuration !== undefined)
            setAnimationDuration(Number(data.animationDuration || 22));
          if (data?.heightPx !== undefined)
            setHeightPx(Number(data.heightPx || 60));
          if (data?.translateWilayaAr !== undefined)
            setTranslateWilayaAr(Boolean(data.translateWilayaAr));
        }
      } catch {
        // ignore cache errors
      }

      try {
        const json = await getMovingHeaderSettings();
        if (!active) return;
        const list = json.data?.items || [];
        const nextFontConfig =
          json.data?.fontConfig || DEFAULT_MOVING_HEADER_FONT_CONFIG;
        const nextPrefixFr = String(json.data?.prefixFr || "");
        const nextPrefixAr = String(json.data?.prefixAr || "");
        const nextTextColor = String(json.data?.textColor || "");
        const nextBgColor = String(json.data?.backgroundColor || "");
        const nextAnimDuration = Number(json.data?.animationDuration || 22);
        const nextHeightPx = Number(json.data?.heightPx || 60);
        const nextTranslateWilayaAr = Boolean(
          json.data?.translateWilayaAr ?? true
        );
        setItems(list);
        setFontConfig(nextFontConfig);
        setPrefixFr(nextPrefixFr);
        setPrefixAr(nextPrefixAr);
        setTextColor(nextTextColor);
        setBackgroundColorOverride(nextBgColor);
        setAnimationDuration(nextAnimDuration);
        setHeightPx(nextHeightPx);
        setTranslateWilayaAr(nextTranslateWilayaAr);
        // Cache for quick access (backward compatibility)
        try {
          localStorage.setItem(
            "moving_header",
            JSON.stringify({
              items: list,
              fontConfig: nextFontConfig,
              prefixFr: nextPrefixFr,
              prefixAr: nextPrefixAr,
              textColor: nextTextColor,
              backgroundColor: nextBgColor,
              animationDuration: nextAnimDuration,
              heightPx: nextHeightPx,
              translateWilayaAr: nextTranslateWilayaAr,
              ts: Date.now(),
            })
          );
        } catch {}
      } catch {
        // keep cached
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      // Listen for both keys (old "moving_header" and new "site_moving_header_v1")
      if (e.key !== "moving_header" && e.key !== "site_moving_header_v1") return;
      try {
        const parsed = JSON.parse(e.newValue || "");
        // Handle both old format (direct object) and new format (wrapped in data)
        const data = parsed?.data || parsed;
        if (Array.isArray(data?.items)) setItems(data.items);
        if (data?.fontConfig) setFontConfig(data.fontConfig);
        if (data?.prefixFr !== undefined)
          setPrefixFr(String(data.prefixFr || ""));
        if (data?.prefixAr !== undefined)
          setPrefixAr(String(data.prefixAr || ""));
        if (data?.textColor !== undefined)
          setTextColor(String(data.textColor || ""));
        if (data?.backgroundColor !== undefined)
          setBackgroundColorOverride(String(data.backgroundColor || ""));
        if (data?.animationDuration !== undefined)
          setAnimationDuration(Number(data.animationDuration || 22));
        if (data?.heightPx !== undefined)
          setHeightPx(Number(data.heightPx || 60));
        if (data?.translateWilayaAr !== undefined)
          setTranslateWilayaAr(Boolean(data.translateWilayaAr));
      } catch {
        // ignore
      }
    };
    const onCustom = (e) => {
      const detail = e?.detail || {};
      // Handle both direct detail and detail.data (wrapped format)
      const data = detail?.data || detail;
      if (Array.isArray(data?.items)) setItems(data.items);
      if (data?.fontConfig) setFontConfig(data.fontConfig);
      if (data?.prefixFr !== undefined)
        setPrefixFr(String(data.prefixFr || ""));
      if (data?.prefixAr !== undefined)
        setPrefixAr(String(data.prefixAr || ""));
      if (data?.textColor !== undefined)
        setTextColor(String(data.textColor || ""));
      if (data?.backgroundColor !== undefined)
        setBackgroundColorOverride(String(data.backgroundColor || ""));
      if (data?.animationDuration !== undefined)
        setAnimationDuration(Number(data.animationDuration || 22));
      if (data?.heightPx !== undefined)
        setHeightPx(Number(data.heightPx || 60));
      if (data?.translateWilayaAr !== undefined)
        setTranslateWilayaAr(Boolean(data.translateWilayaAr));
    };
      window.addEventListener("storage", onStorage);
      window.addEventListener("moving-header-updated", onCustom);
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("moving-header-updated", onCustom);
      };
    }, []);

  const productLabel = (product) => {
    const map = {
      fr: {
        Poulet: "POULET",
        Poussins: "POUSSINS",
        Dinde: "DINDE",
        Oeufs: "OEUFS",
      },
      en: {
        Poulet: "CHICKEN",
        Poussins: "CHICKS",
        Dinde: "TURKEY",
        Oeufs: "EGGS",
      },
      ar: {
        Poulet: "الدجاج",
        Poussins: "الكتاكيت",
        Dinde: "الديك الرومي",
        Oeufs: "البيض",
      },
      es: {
        Poulet: "POLLO",
        Poussins: "POLLITOS",
        Dinde: "PAVO",
        Oeufs: "HUEVOS",
      },
    };
    return (map[language] || map.fr)[product] || product;
  };

  const normalizeWilayaKey = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");

  const WILAYA_AR = {
    adrar: "أدرار",
    chlef: "الشلف",
    laghouat: "الأغواط",
    "oum el bouaghi": "أم البواقي",
    batna: "باتنة",
    bejaia: "بجاية",
    biskra: "بسكرة",
    bechar: "بشار",
    blida: "البليدة",
    bouira: "البويرة",
    tamanrasset: "تمنراست",
    tebessa: "تبسة",
    tlemcen: "تلمسان",
    tiaret: "تيارت",
    "tizi ouzou": "تيزي وزو",
    alger: "الجزائر",
    djelfa: "الجلفة",
    jijel: "جيجل",
    setif: "سطيف",
    saida: "سعيدة",
    skikda: "سكيكدة",
    "sidi bel abbes": "سيدي بلعباس",
    annaba: "عنابة",
    guelma: "قالمة",
    constantine: "قسنطينة",
    medea: "المدية",
    mostaganem: "مستغانم",
    "m'sila": "المسيلة",
    msila: "المسيلة",
    mascara: "معسكر",
    ouargla: "ورقلة",
    oran: "وهران",
    "el bayadh": "البيض",
    illizi: "إليزي",
    "bordj bou arreridj": "برج بوعريريج",
    boumerdes: "بومرداس",
    "el tarf": "الطارف",
    tindouf: "تندوف",
    tissemsilt: "تيسمسيلت",
    "el oued": "الوادي",
    khenchela: "خنشلة",
    "souk ahras": "سوق أهراس",
    tipaza: "تيبازة",
    mila: "ميلة",
    "ain defla": "عين الدفلى",
    naama: "النعامة",
    "ain temouchent": "عين تموشنت",
    ghardaia: "غرداية",
    relizane: "غليزان",
    timimoun: "تيميمون",
    "bordj badji mokhtar": "برج باجي مختار",
    "ouled djellal": "أولاد جلال",
    "beni abbes": "بني عباس",
    "in salah": "عين صالح",
    "in guezzam": "عين قزام",
    touggourt: "تقرت",
    djanet: "جانت",
    "el m'ghair": "المغير",
    "el meniaa": "المنيعة",
  };

  const wilayaLabel = (wilaya) => {
    if (language !== "ar") return String(wilaya || "");
    if (!translateWilayaAr) return String(wilaya || "");
    const key = normalizeWilayaKey(wilaya);
    return WILAYA_AR[key] || String(wilaya || "");
  };

  const unitLabel = (unit) => {
    const map = {
      fr: { kg: "kg", piece: "pièce", douzaine: "douzaine" },
      en: { kg: "kg", piece: "each", douzaine: "dozen" },
      ar: { kg: "كغ", piece: "قطعة", douzaine: "دزينة" },
      es: { kg: "kg", piece: "unidad", douzaine: "docena" },
    };
    return t("kg") || (language === "ar" ? "كغ" : "kg");
  };

  const filteredPrices = useMemo(() => {
    const currencyLabel = t("currency") || "DA";
    const filtered = (items || []).sort((a, b) =>
      String(a.product || "").localeCompare(String(b.product || ""))
    );

    const byProduct = new Map();
    filtered.forEach((x) => {
      const key = x.product || "Poulet";
      const arr = byProduct.get(key) || [];
      arr.push(x);
      byProduct.set(key, arr);
    });

    const segments = [];
    for (const [product, arr] of byProduct.entries()) {
      const text = arr
        .map(
          (x) =>
            `${wilayaLabel(x.wilaya)}: ${x.price}${currencyLabel}/${unitLabel(
              x.unit
            )}`
        )
        .join(" · ");
      segments.push(`${productLabel(product)}: ${text}`);
    }
    return segments.join(" | ");
  }, [items, language, t, translateWilayaAr]);

  const movingHeaderTextStyle = useMemo(
    () => ({
      fontFamily: fontConfig.fontFamily,
      fontSize: `${fontConfig.fontSize}px`,
      fontWeight: fontConfig.fontWeight,
      fontStyle: fontConfig.fontStyle,
      letterSpacing: `${fontConfig.letterSpacing}em`,
      wordSpacing: `${fontConfig.wordSpacing}em`,
    }),
    [fontConfig]
  );

  const prefixLabel =
    (language === "ar" ? prefixAr : prefixFr) || t("pricesScrolling") || "";
  const displayPrefix = prefixLabel ? `${prefixLabel}: ` : "";
  const finalTextColor = textColor || (darkMode ? "#ffffff" : "#0f172a");

  return (
    <div
      className={`w-full overflow-hidden shadow-lg relative transition-all duration-300 ${
        sidebarOpen ? "opacity-70 blur-[1px]" : "opacity-100"
      }`}
      style={{
        height: `${Number(heightPx) || 60}px`,
        zIndex: 20,
        backgroundColor,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.2), transparent, rgba(0,0,0,0.2))",
        }}
      ></div>

      <div className="whitespace-nowrap flex items-center justify-center h-full px-6">
        <p
          className="scrolling-text text-base font-semibold tracking-[0.35em] uppercase"
          style={{ ...movingHeaderTextStyle, color: finalTextColor }}
        >
          {displayPrefix}
          {filteredPrices || ""}
        </p>
      </div>

      <style>
        {`
          @keyframes scrollText {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }

          .scrolling-text {
            animation: scrollText ${animationDuration}s linear infinite;
            padding-left: 100%;
          }

          .scrolling-text:hover {
            animation-play-state: paused;
          }

          @media (max-width: 480px) {
            .scrolling-text {
              font-size: 11px;
            }
          }
        `}
      </style>
    </div>
  );
}
