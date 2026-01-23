import React, { useState } from "react";
import { useTranslation } from "../../context/translationContext";
import { useAuth } from "../../context/AuthContext";
import {
  isMockListingsEnabled,
  isMockUsersEnabled,
  setMockListingsEnabled,
  setMockUsersEnabled,
  clearMockCaches,
} from "../../api/dataService";
import {
  generateMockDataset,
  generateUsers,
  generateListings,
} from "../../utils/mockDataGenerators";
import {
  downloadAppState,
  loadAppStateFromFile,
  getStateStats,
  clearAppState,
} from "../../utils/appState";
import { safeGetItem, safeSetItem } from "../../utils/localStorage";

export default function DemoSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";
  const [mockListings, setMockListings] = useState(isMockListingsEnabled());
  const [mockUsers, setMockUsers] = useState(isMockUsersEnabled());
  const [adminMode, setAdminMode] = useState(localStorage.getItem("mock_admin_mode") === "1");
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState(getStateStats());

  if (!isSuperAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">{t("accessDenied") || "Accès refusé"}</h1>
          <p className="text-[var(--color-text-muted)]">{t("adminSuperAdminOnly") || "Cette page est réservée aux super administrateurs"}</p>
        </div>
      </div>
    );
  }

  const handleToggleListings = () => {
    const next = !mockListings;
    setMockListings(next);
    setMockListingsEnabled(next);
    window.location.reload();
  };

  const handleToggleUsers = () => {
    const next = !mockUsers;
    setMockUsers(next);
    setMockUsersEnabled(next);
    window.location.reload();
  };

  return (
    <div>
      <h1 className="responsive-title mb-2">
        {t("mockModeTitle") || "Mode Demo"}
      </h1>
      <p className="opacity-70 mb-6">
        {t("mockModeHint") || "Gérez les données de démonstration."}
      </p>

      <div className="detail-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">
              {t("mockListings") || "Mock Annonces"}
            </div>
            <div className="text-sm opacity-70">
              {t("mockListingsHint") || "Utiliser des fausses annonces."}
            </div>
          </div>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mockListings
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            onClick={handleToggleListings}
          >
            {mockListings
              ? t("mockDisable") || "Désactiver"
              : t("mockEnable") || "Activer"}
          </button>
        </div>

        <div className="h-px bg-[var(--color-border)]" />

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">
              {t("mockUsers") || "Mock Utilisateurs"}
            </div>
            <div className="text-sm opacity-70">
              {t("mockUsersHint") ||
                "Utiliser des fausses données utilisateurs."}
            </div>
          </div>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mockUsers
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
            onClick={handleToggleUsers}
          >
            {mockUsers
              ? t("mockDisable") || "Désactiver"
              : t("mockEnable") || "Activer"}
          </button>
        </div>

        <div className="h-px bg-[var(--color-border)]" />

        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">
              {t("adminMode") || "Mode Admin"}
            </div>
            <div className="text-sm opacity-70">
              {t("adminModeHint") || "Activer le mode admin pour le compte par défaut (imad@soukboudouaou.com). Déconnexion requise."}
            </div>
          </div>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              adminMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            }`}
            onClick={() => {
              const next = !adminMode;
              setAdminMode(next);
              localStorage.setItem("mock_admin_mode", next ? "1" : "0");
              alert(t("adminModeChanged") || "Mode admin changé. Veuillez vous déconnecter et vous reconnecter.");
            }}
          >
            {adminMode
              ? t("adminModeActive") || "Actif"
              : t("adminModeInactive") || "Inactif"}
          </button>
        </div>

        <div className="h-px bg-[var(--color-border)]" />

        {/* State Statistics */}
        <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-4">
          <div className="font-semibold mb-3">{t("stateStats") || "Statistiques de l'état"}</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="opacity-70">{t("listings") || "Annonces"}</div>
              <div className="font-bold text-lg">{stats.listings}</div>
            </div>
            <div>
              <div className="opacity-70">{t("users") || "Utilisateurs"}</div>
              <div className="font-bold text-lg">{stats.users}</div>
            </div>
            <div>
              <div className="opacity-70">{t("inquiries") || "Demandes"}</div>
              <div className="font-bold text-lg">{stats.inquiries}</div>
            </div>
            <div>
              <div className="opacity-70">{t("orders") || "Commandes"}</div>
              <div className="font-bold text-lg">{stats.orders}</div>
            </div>
            <div>
              <div className="opacity-70">{t("categories") || "Catégories"}</div>
              <div className="font-bold text-lg">{stats.categories}</div>
            </div>
          </div>
        </div>

        <div className="h-px bg-[var(--color-border)]" />

        {/* Mock Data Generation */}
        <div>
          <div className="font-semibold mb-3">{t("generateMockData") || "Générer des données de démonstration"}</div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-secondary"
              disabled={generating}
              onClick={async () => {
                setGenerating(true);
                try {
                  const dataset = generateMockDataset({
                    userCount: 20,
                    listingCount: 50,
                    orderCount: 30,
                    inquiryCount: 40,
                  });
                  
                  // Save users
                  const existingUsers = safeGetItem("mock_users", []);
                  const existingAdminUsers = safeGetItem("mock_admin_users", { data: { users: [] } });
                  
                  safeSetItem("mock_users", [...existingUsers, ...dataset.users]);
                  safeSetItem("mock_admin_users", {
                    data: {
                      users: [...(existingAdminUsers.data?.users || []), ...dataset.users.filter(u => u.role !== 'user')],
                    },
                  });
                  
                  // Save listings
                  const existingListings = safeGetItem("mock_listings", { data: { listings: [] } });
                  safeSetItem("mock_listings", {
                    success: true,
                    data: {
                      listings: [...(existingListings.data?.listings || []), ...dataset.listings],
                    },
                  });
                  
                  // Save orders
                  safeSetItem("mock_orders", {
                    data: { orders: dataset.orders },
                  });
                  
                  // Save inquiries
                  const existingInquiries = safeGetItem("mock_inquiries", []);
                  safeSetItem("mock_inquiries", [...existingInquiries, ...dataset.inquiries]);
                  
                  setStats(getStateStats());
                  alert(t("mockDataGenerated") || "Données générées avec succès!");
                } catch (error) {
                  console.error("Failed to generate mock data:", error);
                  alert(t("mockDataGenerationFailed") || "Échec de la génération des données.");
                } finally {
                  setGenerating(false);
                }
              }}
            >
              {generating ? t("generating") || "Génération..." : t("generateAll") || "Tout générer"}
            </button>
            <button
              className="btn-secondary"
              disabled={generating}
              onClick={() => {
                const users = generateUsers(10);
                const existing = safeGetItem("mock_users", []);
                safeSetItem("mock_users", [...existing, ...users]);
                setStats(getStateStats());
                alert(t("usersGenerated") || "10 utilisateurs générés!");
              }}
            >
              {t("generateUsers") || "Générer 10 utilisateurs"}
            </button>
            <button
              className="btn-secondary"
              disabled={generating}
              onClick={() => {
                const userIds = safeGetItem("mock_users", []).map(u => u._id || u.id);
                const listings = generateListings(20, userIds);
                const existing = safeGetItem("mock_listings", { data: { listings: [] } });
                safeSetItem("mock_listings", {
                  success: true,
                  data: {
                    listings: [...(existing.data?.listings || []), ...listings],
                  },
                });
                setStats(getStateStats());
                alert(t("listingsGenerated") || "20 annonces générées!");
              }}
            >
              {t("generateListings") || "Générer 20 annonces"}
            </button>
          </div>
        </div>

        <div className="h-px bg-[var(--color-border)]" />

        {/* State Management */}
        <div>
          <div className="font-semibold mb-3">{t("stateManagement") || "Gestion de l'état"}</div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-secondary"
              onClick={() => {
                if (downloadAppState()) {
                  alert(t("stateExported") || "État exporté avec succès!");
                } else {
                  alert(t("stateExportFailed") || "Échec de l'exportation.");
                }
              }}
            >
              {t("exportState") || "Exporter l'état"}
            </button>
            <label className="btn-secondary cursor-pointer">
              {t("importState") || "Importer l'état"}
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  if (confirm(t("importStateConfirm") || "Cela remplacera toutes les données actuelles. Continuer?")) {
                    const success = await loadAppStateFromFile(file);
                    if (success) {
                      setStats(getStateStats());
                      alert(t("stateImported") || "État importé avec succès! Rechargez la page.");
                      setTimeout(() => window.location.reload(), 2000);
                    } else {
                      alert(t("stateImportFailed") || "Échec de l'importation.");
                    }
                  }
                  e.target.value = ""; // Reset input
                }}
              />
            </label>
            <button
              className="btn-secondary text-red-500"
              onClick={() => {
                if (confirm(t("clearStateConfirm") || "Voulez-vous vraiment effacer toutes les données? Cette action est irréversible.")) {
                  clearAppState();
                  setStats(getStateStats());
                  alert(t("stateCleared") || "État effacé. Rechargez la page.");
                  setTimeout(() => window.location.reload(), 2000);
                }
              }}
            >
              {t("clearState") || "Effacer l'état"}
            </button>
          </div>
        </div>

        <div className="h-px bg-[var(--color-border)]" />

        <div>
          <button
            className="btn-secondary text-red-500"
            onClick={() => {
              if (confirm(t("clearCacheConfirm") || "Voulez-vous vraiment vider le cache?")) {
                clearMockCaches();
                setStats(getStateStats());
                alert(t("mockCacheCleared") || "Cache vidé.");
              }
            }}
          >
            {t("mockClearCache") || "Vider le cache Mock"}
          </button>
        </div>
      </div>
    </div>
  );
}
