import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useListings } from "../../context/ListingsContext";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../context/translationContext";
import { useToast } from "../../context/ToastContext";

export default function MyListings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const toast = useToast();
  const { getMyListings, deleteListing, searchListings } = useListings();
  const [q, setQ] = useState("");

  // Get current user ID
  const currentUserId = user?.id || user?._id || user?.email;
  
  // Get my listings from context
  const myListings = useMemo(() => {
    if (!currentUserId) return [];
    
    if (q.trim()) {
      const searched = searchListings(q.trim());
      return searched.filter((l) => String(l.createdBy) === String(currentUserId));
    }
    
    return getMyListings(currentUserId);
  }, [q, currentUserId, getMyListings, searchListings]);
  
  const items = myListings;

  const rows = useMemo(() => {
    return (items || []).map((l) => ({
      id: l.id || l._id,
      title: l.title,
      status: l.status || "published",
      views: Number(l.views || 0),
      category: l.category || "—",
      wilaya: l.wilaya || "—",
      createdAt: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "—",
      image: l.image || "", // base64 string
    }));
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="responsive-title m-0">{t("adminNavMyListings")}</h1>
          <p className="text-sm opacity-60 mt-1">
            {rows.length} {t("adminListingsCount")}
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => navigate("/create-listing")}
        >
          <Plus className="w-4 h-4" />
          {t("create")}
        </button>
      </div>

      <div className="detail-card">
        <div className="relative">
          <input
            className="form-input w-full pl-4 pr-10"
            placeholder={t("adminListingsSearchPlaceholder") || "Rechercher..."}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40">
            <svg
              className="w-4 h-4"
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
        </div>
      </div>

      <div className="detail-card p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-muted)]">
              <tr>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  {t("title")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  {t("category")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  {t("wilaya")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  {t("status")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  {t("views")}
                </th>
                <th className="text-left px-4 py-3 whitespace-nowrap">
                  {t("createdAt")}
                </th>
                <th className="text-right px-4 py-3 whitespace-nowrap">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-12 text-center opacity-70 italic"
                    colSpan={7}
                  >
                    {t("adminNoListings")}
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  // Get full listing data to access image (new model: image is base64 string)
                  const fullListing = items.find(l => (l.id || l._id) === r.id);
                  const listingImage = fullListing?.image || null; // base64 string
                  
                  return (
                    <tr
                      key={r.id}
                      className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium min-w-[200px]">
                        <div className="flex items-center gap-3">
                          {listingImage && (
                            <img
                              src={listingImage}
                              alt={r.title}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <span>{r.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="opacity-70">{r.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="opacity-70">{r.wilaya}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={r.status} t={t} />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs opacity-70">
                        {r.views}
                      </td>
                      <td className="px-4 py-3 opacity-60 text-xs">
                        {r.createdAt}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="btn-secondary flex items-center gap-2 py-1.5 px-3 text-xs"
                            onClick={() => navigate(`/edit-listing/${r.id}`)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            {t("editListing")}
                          </button>
                          <button
                            className="btn-secondary bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white py-1.5 px-2.5 h-[32px] w-[32px] flex items-center justify-center transition-all"
                            onClick={async () => {
                              if (!confirm(t("adminListingDeleteConfirm")))
                                return;
                              const success = deleteListing(r.id);
                              if (!success) {
                                toast.error(t("deleteFailed") || "Échec de la suppression");
                              } else {
                                toast.success(t("listingDeleted") || "Annonce supprimée");
                              }
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status, t }) {
  const isDraft = String(status || "").toLowerCase() === "draft";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
        isDraft
          ? "bg-[var(--color-surface-muted)] border-[var(--color-border)] opacity-60"
          : "bg-[var(--category-accent)]/10 border-[var(--category-accent)] text-[var(--category-accent)]"
      }`}
    >
      {isDraft ? t("draft") : t("published")}
    </span>
  );
}
