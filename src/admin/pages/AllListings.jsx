import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/translationContext";
import { useListings } from "../../context/ListingsContext";
import { useToast } from "../../context/ToastContext";
import { isSuperAdmin, hasPermission, PERMISSIONS } from "../../utils/permissions";

export default function AllListings() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const toast = useToast();
  const { listings, loading: listingsLoading, searchListings, deleteListing, updateListing } = useListings();
  const role = user?.role || "user";
  const isSuper = isSuperAdmin(role);
  const canDelete = hasPermission(role, PERMISSIONS.DELETE_ANY_LISTING);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const allowDelete = canDelete;
  
  // Filter listings
  const filteredListings = useMemo(() => {
    let result = listings || [];
    
    // Search
    if (q.trim()) {
      result = searchListings(q.trim());
    }
    
    // Filter by status
    if (status) {
      result = result.filter(l => String(l.status || "").toLowerCase() === String(status).toLowerCase());
    }
    
    return result;
  }, [listings, q, status, searchListings]);
  
  const rows = filteredListings;

  const tableRows = useMemo(() => {
    return (rows || []).map((l) => ({
      id: l.id || l._id,
      title: l.title,
      status: l.status || "published",
      views: Number(l.views || 0),
      category: l.category || "—",
      wilaya: l.wilaya || "—",
      owner: l.User?.email || l.user?.email || l.farmer?.name || "—",
      createdAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "—",
    }));
  }, [rows]);

  if (!isSuper) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">{t("accessDenied") || "Accès refusé"}</h1>
          <p className="text-[var(--color-text-muted)]">{t("adminSuperAdminOnly") || "Cette page est réservée aux super administrateurs"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="responsive-title mb-0">{t("adminNavAllListings")}</h1>
          <p className="text-sm opacity-60">
            {tableRows.length} {t("adminListingsCount")}
          </p>
        </div>
      </div>

      <div className="detail-card">
        <div className="responsive-grid-2">
          <div className="relative group">
            <input
              className="form-input pl-10"
              placeholder={t("adminListingsSearchPlaceholder")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <svg
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">{t("adminAllStatuses")}</option>
            <option value="published">{t("published")}</option>
            <option value="draft">{t("draft")}</option>
          </select>
        </div>
      </div>

      <div className="detail-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)]">
              <tr>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("title")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("adminOwner")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("category")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("wilaya")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("views")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("status")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                  {t("createdAt")}
                </th>
                {allowDelete ? (
                  <th className="text-left px-4 py-3 whitespace-nowrap opacity-60 font-bold uppercase tracking-wider text-[10px]">
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {listingsLoading ? (
                <tr>
                  <td
                    className="px-4 py-12 text-center"
                    colSpan={allowDelete ? 8 : 7}
                  >
                    <div className="inline-block w-6 h-6 border-2 border-[var(--category-accent)] border-t-transparent rounded-full animate-spin"></div>
                    <div className="mt-2 text-xs opacity-50 font-medium">
                      {t("loading")}
                    </div>
                  </td>
                </tr>
              ) : tableRows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-12 text-center opacity-40 italic"
                    colSpan={allowDelete ? 8 : 7}
                  >
                    {t("adminNoListings")}
                  </td>
                </tr>
              ) : (
                tableRows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium min-w-[200px]">
                      {r.title}
                    </td>
                    <td className="px-4 py-3 opacity-70 truncate max-w-[150px]">
                      {r.owner}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-[10px]">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 opacity-70">{r.wilaya}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--category-accent)]">
                      {r.views}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="form-select text-[10px] font-bold uppercase tracking-tight py-1 bg-[var(--color-surface)] border-[var(--color-border)]"
                        value={r.status}
                        onChange={async (e) => {
                          const next = e.target.value;
                          try {
                            const updated = updateListing(r.id, { status: next });
                            if (updated) {
                              toast.success(t("statusUpdated") || "Statut mis à jour");
                            } else {
                              toast.error(t("updateFailed") || "Mise à jour échouée");
                            }
                          } catch (e) {
                            toast.error(e?.message || t("updateFailed") || "Mise à jour échouée");
                          }
                        }}
                      >
                        <option value="published">{t("published")}</option>
                        <option value="draft">{t("draft")}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 opacity-70 text-[10px] whitespace-nowrap">
                      {r.createdAt}
                    </td>
                    {allowDelete ? (
                      <td className="px-4 py-3">
                        <button
                          className="btn-secondary text-red-500 border-red-500/10 hover:bg-red-500 hover:text-white py-1 px-3 text-[10px] font-bold uppercase tracking-wider"
                          onClick={async () => {
                            const confirmDelete = window.confirm(
                              t("confirmDelete") || t("confirm") || "Supprimer cette annonce ?"
                            );
                            if (!confirmDelete) return;
                            try {
                              const res = await deleteListing(r.id);
                              if (res?.success === false) {
                                toast.error(res.message || t("deleteFailed") || "Suppression impossible");
                                return;
                              }
                              toast.success(t("listingDeleted") || t("deleted") || "Annonce supprimée");
                              // Listings will refresh automatically via context
                              window.location.reload();
                            } catch (e) {
                              toast.error(e?.message || t("deleteFailed") || "Suppression impossible");
                            }
                          }}
                        >
                          {t("delete") || "Supprimer"}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
