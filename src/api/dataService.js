import api from "./api";
import { normalizeEndpointPath } from "./apiBase";
import userMockFile from "../mocks/user.json";
import ordersMockFile from "../mocks/orders.json";
import mockAdminUsers from "../mocks/adminUsers.json";
import mockAuditClicks from "../mocks/auditClicks.json";
import listingsMockFile from "../mocks/listings.json";
import myListingsMockFile from "../mocks/myListings.json";
// Import asset images for mock listings
import chickenImg from "../assets/chicken.png";
import turkeyImg from "../assets/turkey.png";
// Import hero slide images
import slideImg1 from "../assets/pexels-james-collington-2147687246-29771450.jpg";
import slideImg2 from "../assets/pexels-james-collington-2147687246-29771458.jpg";
import slideImg3 from "../assets/pexels-photocorp-20867250.jpg";
import { safeGetItem, safeSetItem } from "../utils/localStorage";

// Get API origin from environment variable (without /api suffix)
// This is used for image URLs and other direct backend URLs
export const API_ORIGIN = (import.meta.env.VITE_API_URL || "")
  .replace(/\/api$/, "")
  .replace(/\/+$/, "");
// Enable mock mode by default for demo
// Check localStorage first, then env vars, then default to enabled in dev
const getMockSetting = (key, envKey) => {
  const stored = localStorage.getItem(key);
  if (stored === "1") return true;
  if (stored === "0") return false;
  if (import.meta.env[envKey] === "1") return true;
  if (import.meta.env[envKey] === "0") return false;
  // Default to enabled in dev mode for demo
  return import.meta.env.DEV;
};

const ENV_MOCK = getMockSetting("use_mock", "VITE_USE_MOCK");
const ENV_MOCK_LISTINGS = getMockSetting("use_mock_listings", "VITE_USE_MOCK_LISTINGS");
const ENV_MOCK_USERS = getMockSetting("use_mock_users", "VITE_USE_MOCK_USERS");
const THROW_ON_API_PREFIX = import.meta.env.DEV;

function apiPath(path) {
  return normalizeEndpointPath(path, { throwOnApiPrefix: THROW_ON_API_PREFIX });
}

export function isMockEnabled() {
  try {
    const stored = localStorage.getItem("use_mock");
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    // ignore
  }
  return ENV_MOCK;
}

export function setMockEnabled(enabled) {
  try {
    localStorage.setItem("use_mock", enabled ? "1" : "0");
  } catch {
    // ignore
  }
}

export function isMockListingsEnabled() {
  try {
    const stored = localStorage.getItem("use_mock_listings");
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    // ignore
  }
  return ENV_MOCK_LISTINGS || isMockEnabled();
}

export function setMockListingsEnabled(enabled) {
  try {
    localStorage.setItem("use_mock_listings", enabled ? "1" : "0");
  } catch {
    // ignore
  }
}

export function isMockUsersEnabled() {
  try {
    const stored = localStorage.getItem("use_mock_users");
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    // ignore
  }
  return ENV_MOCK_USERS || isMockEnabled();
}

export function setMockUsersEnabled(enabled) {
  try {
    localStorage.setItem("use_mock_users", enabled ? "1" : "0");
  } catch {
    // ignore
  }
}

export function clearMockCaches() {
  try {
    localStorage.removeItem("mock_orders");
    localStorage.removeItem("mock_admin_users");
    localStorage.removeItem("mock_inquiries");
    localStorage.removeItem("mock_listings");
    localStorage.removeItem("mock_my_listings");
  } catch {
    // ignore
  }
}

let MOCK_USER = structuredClone(userMockFile.user);

function defaultListingImage(category) {
  const normalized = String(category || "").toLowerCase();

  // Use assets folder icons (imported as modules)
  // Poulet → chicken.png, Dinde → turkey.png
  if (normalized.includes("dinde") || normalized.includes("turkey"))
    return turkeyImg;
  if (normalized.includes("poulet") || normalized.includes("chicken"))
    return chickenImg;

  // Default to chicken icon
  return chickenImg;
}

/**
 * Load listings from persistent storage (localStorage)
 * CRITICAL: Never replace data URLs - they are real uploaded images
 * Only normalize the data structure, never modify image URLs
 */
function loadMockListings() {
  const stored = safeGetItem("mock_listings");
  if (stored && stored?.data?.listings) {
    // Normalize listings structure but PRESERVE all image URLs
    stored.data.listings = stored.data.listings.map((l, idx) => {
      const listing = {
        id: l.id || l._id || `mock-${idx + 1}`,
        ...l,
      };
      
      // Normalize images array - preserve data URLs and real URLs
      // Convert photo field to images array if needed
      if (listing.photo && !listing.images) {
        listing.images = Array.isArray(listing.photo) ? listing.photo : [listing.photo];
      }
      
      // Ensure images is always an array
      if (!listing.images || !Array.isArray(listing.images)) {
        listing.images = [];
      }
      
      // CRITICAL: Preserve ALL data URLs - these are uploaded images
      // Only convert placeholder strings (not data URLs) to fallbacks
      listing.images = listing.images.map(img => {
        const imgStr = String(img || "").trim();
        
        // PRESERVE: data URLs (uploaded images), blob URLs, full URLs, asset imports
        if (imgStr.startsWith("data:") || 
            imgStr.startsWith("blob:") || 
            imgStr.startsWith("http://") || 
            imgStr.startsWith("https://") ||
            imgStr.includes("/assets/") || 
            imgStr.startsWith("/src/")) {
          return imgStr; // NEVER MODIFY - this is a real image
        }
        
        // Only convert placeholder strings to fallbacks (for initial mock data)
        if (imgStr === "chicken.png" || imgStr === "chicken" || imgStr.toLowerCase().includes("chicken")) {
          return chickenImg;
        }
        if (imgStr === "turkey.png" || imgStr === "turkey" || imgStr.toLowerCase().includes("turkey") || imgStr === "chicken2.png") {
          return turkeyImg;
        }
        
        // If empty or invalid, return empty string (will use fallback in UI)
        return imgStr || "";
      }).filter(Boolean);
      
      // Only add fallback if NO images exist (not even placeholders)
      if (listing.images.length === 0) {
        listing.images = [defaultListingImage(listing.category)];
      }
      
      return listing;
    });
    return stored;
  }
  
  // Initial load from mock file - convert placeholders to assets
  const cloned = structuredClone(listingsMockFile);
  if (cloned?.data?.listings) {
    cloned.data.listings = cloned.data.listings.map((l, idx) => {
      const listing = {
        id: l.id || l._id || `mock-${idx + 1}`,
        ...l,
      };
      
      // Normalize images array
      if (listing.photo && !listing.images) {
        listing.images = Array.isArray(listing.photo) ? listing.photo : [listing.photo];
      }
      
      if (!listing.images || !Array.isArray(listing.images)) {
        listing.images = [];
      }
      
      // Convert placeholder strings to asset imports (only for initial mock data)
      listing.images = listing.images.map(img => {
        const imgStr = String(img || "").trim();
        
        // Preserve real URLs
        if (imgStr.startsWith("data:") || 
            imgStr.startsWith("blob:") || 
            imgStr.startsWith("http://") || 
            imgStr.startsWith("https://") ||
            imgStr.includes("/assets/") || 
            imgStr.startsWith("/src/")) {
          return imgStr;
        }
        
        // Convert placeholders
        if (imgStr === "chicken.png" || imgStr === "chicken" || imgStr.toLowerCase().includes("chicken")) {
          return chickenImg;
        }
        if (imgStr === "turkey.png" || imgStr === "turkey" || imgStr.toLowerCase().includes("turkey") || imgStr === "chicken2.png") {
          return turkeyImg;
        }
        
        return imgStr || "";
      }).filter(Boolean);
      
      if (listing.images.length === 0) {
        listing.images = [defaultListingImage(listing.category)];
      }
      
      return listing;
    });
  }
  return cloned;
}

/**
 * Save listings to persistent storage
 * CRITICAL: Save images array exactly as provided - never modify data URLs
 */
function saveMockListings(listings) {
  // Normalize listings before saving - ensure consistent structure
  const normalized = listings.map(l => {
    const listing = { ...l };
    
    // Ensure images is always an array
    if (listing.photo && !listing.images) {
      listing.images = Array.isArray(listing.photo) ? listing.photo : [listing.photo];
    }
    if (!listing.images || !Array.isArray(listing.images)) {
      listing.images = [];
    }
    
    // CRITICAL: Preserve all image URLs exactly as they are
    // Data URLs must be saved as-is - they are uploaded images
    listing.images = listing.images.filter(Boolean);
    
    // Ensure id exists
    if (!listing.id && !listing._id) {
      listing.id = `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    listing._id = listing.id || listing._id;
    
    return listing;
  });
  
  const payload = { success: true, data: { listings: normalized } };
  const saved = safeSetItem("mock_listings", payload);
  if (!saved) {
    console.error("Failed to save listings to localStorage");
  }
  return payload;
}

function loadMockMyListings() {
  const stored = safeGetItem("mock_my_listings");
  if (stored) {
    return stored;
  }
  return structuredClone(myListingsMockFile);
}

function saveMockMyListings(listings) {
  const payload = { success: true, data: listings };
  const saved = safeSetItem("mock_my_listings", payload);
  if (!saved) {
    console.error("Failed to save my listings to localStorage");
  }
  return payload;
}

/* =========================
   Listings (mock supported)
   ========================= */

export async function getListings(params) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const page = Math.max(1, Number(params?.page || 1));
    const limit = Math.max(1, Number(params?.limit || 20));
    const start = (page - 1) * limit;
    const slice = listings.slice(start, start + limit);
    return {
      success: true,
      data: {
        listings: slice,
        pagination: {
          page,
          limit,
          total: listings.length,
          totalPages: Math.max(1, Math.ceil(listings.length / limit)),
          hasNext: start + limit < listings.length,
          hasPrev: page > 1,
        },
      },
    };
  }
  try {
    const res = await api.get(apiPath("/listings"), { params });
    return res.data;
  } catch (e) {
    // Return empty array structure instead of error to prevent app crash
    return {
      success: true,
      data: {
        listings: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 20,
      },
    };
  }
}

export async function getListingDetails(id) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const target = listings.find(
      (l) => String(l.id || l._id || l.slug) === String(id || "")
    );
    if (!target) return { success: false, message: "Not found" };
    return { success: true, data: { listing: target } };
  }
  try {
    const res = await api.get(apiPath(`/public/listings/${id}`));
    return res.data;
  } catch (e) {
    console.error("getListingDetails error:", e);
    return {
      success: false,
      message:
        e?.response?.data?.message || e?.message || "Failed to fetch listing",
    };
  }
}

export async function getMyListings() {
  if (isMockListingsEnabled()) {
    // Get full listings data with images, not just simplified my listings
    const base = loadMockListings();
    const allListings = base?.data?.listings || [];
    // For mock mode, return all listings (in real app, would filter by userId)
    // But preserve full listing data including images
    return { success: true, data: allListings };
  }
  try {
    const res = await api.get(apiPath("/user/my-listings"));
    return res.data;
  } catch (e) {
    console.error("getMyListings error:", e);
    return {
      success: false,
      message:
        e?.response?.data?.message || e?.message || "Failed to fetch listings",
    };
  }
}

/**
 * Create a new listing
 * CRITICAL: Images are converted to data URLs and saved persistently
 * Listing model: id, title, description, price, category, images[], createdBy, createdAt
 */
export async function createListing(fd) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const entries = Object.fromEntries(fd.entries());
    const category = entries.category || "Poulet";
    
    // Generate unique ID
    const id = `listing-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    // Get current user ID for createdBy field
    const currentUser = safeGetItem("user");
    const createdBy = currentUser?.id || currentUser?._id || currentUser?.email || "anonymous";
    
    // Handle images - convert uploaded files to data URLs for persistence
    let images = [];
    if (fd instanceof FormData) {
      const imageFiles = [];
      // Check for photo files (could be photo, photos, image, images, etc.)
      for (const [key, value] of fd.entries()) {
        if ((key.includes("photo") || key.includes("image")) && value instanceof File) {
          imageFiles.push(value);
        }
      }
      
      if (imageFiles.length > 0) {
        // Convert files to data URLs for persistence in localStorage
        // Data URLs are the ONLY way to persist images in frontend-only mock mode
        const dataUrlPromises = imageFiles.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result); // Returns data URL
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          });
        });
        const dataUrls = await Promise.all(dataUrlPromises);
        images = dataUrls.filter(Boolean); // Filter out any failed reads
      }
    }
    
    // Only use default fallback image if NO images were uploaded
    if (images.length === 0) {
      images = [defaultListingImage(category)];
    }
    
    // Normalized listing model - single source of truth
    const listing = {
      id,
      _id: id, // Keep both for compatibility
      title: entries.title || "Annonce",
      description: entries.description || entries.details || "",
      price: Number(entries.pricePerKg || entries.price || 0) || 0,
      pricePerKg: Number(entries.pricePerKg || entries.price || 0) || 0,
      unit: entries.unit || "kg",
      category,
      images, // Array of image URLs (data URLs for uploaded images)
      createdBy, // User who created this listing
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: entries.status || "published",
      wilaya: entries.wilaya || "",
      commune: entries.commune || "",
      listingDate: entries.listingDate || "",
      breedingDate: entries.breedingDate || "",
      preparationDate: entries.preparationDate || "",
      trainingType: entries.trainingType || "",
      medicationsUsed: entries.medicationsUsed || "",
      vaccinated: entries.vaccinated === "true" || entries.vaccinated === true,
      views: 0,
      inquiries: 0,
      quantity: Number(entries.quantity || 0) || 0,
      delivery: entries.delivery === "true" || entries.delivery === true,
      averageWeight: Number(entries.averageWeight || 0) || 0,
    };
    
    // Save to persistent storage - NEWEST FIRST (listing at the beginning)
    const next = [listing, ...listings];
    saveMockListings(next);
    
    // Trigger storage event to refresh context
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'mock_listings',
        newValue: JSON.stringify({ success: true, data: { listings: next } }),
        storageArea: localStorage
      }));
      window.dispatchEvent(new CustomEvent('listings-updated', {
        detail: { listings: next }
      }));
    } catch (e) {
      // ignore event errors
    }
    
    // Also update my listings index (for quick lookup)
    const myBase = loadMockMyListings();
    const myNext = [{ _id: id, title: listing.title, createdBy }, ...(myBase?.data || [])];
    saveMockMyListings(myNext);
    
    return { success: true, data: { listing } };
  }
  const res = await api.post(apiPath("/listings"), fd);
  return res.data;
}

/**
 * Update an existing listing
 * CRITICAL: Preserves existing images if no new image is uploaded
 * Replaces images only if new files are provided
 */
export async function updateListing(id, fd) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const idx = listings.findIndex((l) => String(l.id || l._id) === String(id));
    if (idx === -1) return { success: false, message: "Not found" };
    
    const entries = Object.fromEntries(fd.entries());
    const existing = listings[idx];
    const next = { ...existing };
    
    // CRITICAL: Preserve existing images array - these are real uploaded images
    // Only replace if new images are uploaded
    if (!next.images || !Array.isArray(next.images)) {
      // Normalize from photo field if needed
      if (next.photo) {
        next.images = Array.isArray(next.photo) ? next.photo : [next.photo];
      } else {
        next.images = [];
      }
    }
    
    // Update fields
    if (entries.title) next.title = entries.title;
    if (entries.description || entries.details) {
      next.description = entries.description || entries.details;
    }
    if (entries.category) {
      next.category = entries.category;
    }
    if (entries.wilaya) next.wilaya = entries.wilaya;
    if (entries.commune) next.commune = entries.commune;
    if (entries.pricePerKg || entries.price) {
      const price = Number(entries.pricePerKg || entries.price || 0) || 0;
      next.price = price;
      next.pricePerKg = price;
    }
    if (entries.unit) next.unit = entries.unit;
    if (entries.status) next.status = entries.status;
    if (entries.listingDate) next.listingDate = entries.listingDate;
    if (entries.breedingDate) next.breedingDate = entries.breedingDate;
    if (entries.preparationDate) next.preparationDate = entries.preparationDate;
    if (entries.trainingType) next.trainingType = entries.trainingType;
    if (entries.medicationsUsed) next.medicationsUsed = entries.medicationsUsed;
    if (entries.vaccinated !== undefined) {
      next.vaccinated = entries.vaccinated === "true" || entries.vaccinated === true;
    }
    
    // Update timestamp
    next.updatedAt = new Date().toISOString();
    
    // Handle image updates - ONLY if new files are uploaded
    if (fd instanceof FormData) {
      const imageFiles = [];
      for (const [key, value] of fd.entries()) {
        if ((key.includes("photo") || key.includes("image")) && value instanceof File) {
          imageFiles.push(value);
        }
      }
      
      if (imageFiles.length > 0) {
        // New images uploaded - convert to data URLs and REPLACE existing images
        const dataUrlPromises = imageFiles.map(file => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result); // Returns data URL
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          });
        });
        const dataUrls = await Promise.all(dataUrlPromises);
        next.images = dataUrls.filter(Boolean); // Replace with new images
      }
      // If no new images uploaded, existing images are already preserved above
      // Only use fallback if no images exist at all
      if (next.images.length === 0) {
        next.images = [defaultListingImage(next.category || entries.category || "Poulet")];
      }
    }
    
    listings[idx] = next;
    saveMockListings(listings);
    
    // Also update my listings if title changed
    if (entries.title) {
      const myBase = loadMockMyListings();
      const myListings = myBase?.data || [];
      const myIdx = myListings.findIndex((l) => String(l._id || l.id) === String(id));
      if (myIdx !== -1) {
        myListings[myIdx] = { ...myListings[myIdx], title: entries.title };
        saveMockMyListings(myListings);
      }
    }
    
    return { success: true, data: { listing: next } };
  }
  const res = await api.put(apiPath(`/listings/${id}`), fd);
  return res.data;
}

export async function deleteListing(id) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const next = listings.filter((l) => String(l.id || l._id) !== String(id));
    saveMockListings(next);
    const myBase = loadMockMyListings();
    const myNext = (myBase?.data || []).filter(
      (l) => String(l.id || l._id) !== String(id)
    );
    saveMockMyListings(myNext);
    return { success: true };
  }
  const res = await api.delete(apiPath(`/listings/${id}`));
  return res.data;
}

export async function searchListings(q) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const term = String(q || "").toLowerCase();
    const filtered = term
      ? listings.filter((l) => {
          const title = String(l.title || "").toLowerCase();
          const desc = String(l.description || "").toLowerCase();
          return title.includes(term) || desc.includes(term);
        })
      : listings;
    return { success: true, data: { listings: filtered } };
  }
  const res = await api.get(apiPath("/listings/search"), { params: { q } });
  return res.data;
}

export async function setListingStatus(id, status) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const idx = listings.findIndex((l) => String(l.id || l._id) === String(id));
    if (idx === -1) return { success: false, message: "Not found" };
    listings[idx] = { ...listings[idx], status };
    saveMockListings(listings);
    
    // Also update in my listings if it exists there
    const myBase = loadMockMyListings();
    const myListings = myBase?.data || [];
    const myIdx = myListings.findIndex((l) => String(l._id || l.id) === String(id));
    if (myIdx !== -1) {
      // Update status in my listings if needed
      myListings[myIdx] = { ...myListings[myIdx], status };
      saveMockMyListings(myListings);
    }
    
    return { success: true, data: { listing: listings[idx] } };
  }
  const res = await api.patch(apiPath(`/listings/${id}/status`), { status });
  return res.data;
}

/* =========================
   Profile
   ========================= */

export async function getProfile() {
  if (isMockEnabled()) {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        return { success: true, user: JSON.parse(saved) };
      } catch {
        // ignore parse error
      }
    }
    return { success: true, user: MOCK_USER };
  }
  
  try {
    const res = await api.get(apiPath("/dashboard/user"));
    return res.data;
  } catch (e) {
    console.error("getProfile error:", e);
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        return { success: true, user: JSON.parse(saved) };
      } catch {
        // ignore parse error
      }
    }
    return { success: false };
  }
}

export async function updateProfile(body) {
  if (!isMockEnabled()) {
    try {
      const res = await api.put(apiPath("/auth/update"), body);
      return res.data;
    } catch (e) {
      console.error("updateProfile error:", e);
      return {
        success: false,
        message:
          e?.response?.data?.message ||
          e?.message ||
          "Update failed. Please try again.",
      };
    }
  }
  MOCK_USER = { ...MOCK_USER, ...body };
  return { success: true, user: MOCK_USER };
}

/* =========================
   Inquiries
   ========================= */

export async function createInquiry(slugOrId, body) {
  if (!isMockEnabled()) {
    const res = await api.post(
      apiPath(`/public/listings/${slugOrId}/inquiries`),
      body
    );
    return res.data;
  }
  const all = safeGetItem("mock_inquiries", []);
  const inquiry = {
    id: `iq${Date.now()}`,
    listingId: String(slugOrId),
    userId: MOCK_USER?.id || null,
    name: body?.name || MOCK_USER?.fullName || MOCK_USER?.username || "",
    email: body?.email || MOCK_USER?.email || "",
    phone: body?.phone || MOCK_USER?.phone || "",
    message: body?.message || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: MOCK_USER || null,
    listing: null,
  };
  all.unshift(inquiry);
  const saved = safeSetItem("mock_inquiries", all);
  if (!saved) {
    return {
      success: false,
      message: "Impossible de sauvegarder. Espace de stockage insuffisant."
    };
  }
  return { success: true, data: { inquiry } };
}

export async function adminGetInquiries(params) {
  if (!isMockEnabled()) {
    const res = await api.get(apiPath("/admin/inquiries"), { params });
    return res.data;
  }
  const all = safeGetItem("mock_inquiries", []);
  return {
    success: true,
    data: {
      inquiries: all.slice(0, params?.limit || 50),
      total: all.length,
      page: 1,
      limit: params?.limit || 50,
    },
  };
}

/* =========================
   Orders (mock-supported)
   ========================= */

export async function getOrders() {
  if (!isMockEnabled()) {
    try {
      const res = await api.get(apiPath("/orders"));
      return res.data;
    } catch (e) {
      console.error("getOrders error:", e);
    }
  }
  return ordersMockFile;
}

export async function getUserOrders() {
  if (!isMockEnabled()) {
    try {
      const res = await api.get(apiPath("/user/orders"));
      return res.data;
    } catch (e) {
      console.error("getUserOrders error:", e);
    }
  }
  return ordersMockFile;
}

/* =========================
   Admin (listings/users)
   ========================= */

export async function getAdminListings(params) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    return {
      success: true,
      data: {
        listings,
        total: listings.length,
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    };
  }
  const res = await api.get(apiPath("/admin/listings"), { params });
  return res.data;
}

export async function adminSetListingStatus(id, status) {
  if (isMockListingsEnabled()) {
    const base = loadMockListings();
    const listings = base?.data?.listings || [];
    const idx = listings.findIndex((l) => String(l.id || l._id) === String(id));
    if (idx === -1) return { success: false, message: "Not found" };
    listings[idx] = { ...listings[idx], status };
    saveMockListings(listings);
    return { success: true, data: { listing: listings[idx] } };
  }
  const res = await api.patch(apiPath(`/admin/listings/${id}/status`), {
    status,
  });
  return res.data;
}

export async function getAdminUsers(params) {
  if (isMockUsersEnabled()) {
    // Combine default admin users with signup users
    const base = safeGetItem("mock_admin_users", mockAdminUsers);
    const defaultUsers = base?.data?.users || [];
    
    // Get signup users from localStorage
    const signupUsers = safeGetItem("mock_users", []);
    const signupUsersFormatted = signupUsers.map((u, idx) => ({
      id: (defaultUsers.length || 0) + idx + 1,
      email: u.email,
      username: u.username,
      fullName: u.fullName || u.username,
      role: u.role || "user",
      isActive: u.isActive !== false,
      verified: u.verified || false,
      createdAt: u.createdAt || new Date().toISOString(),
    }));
    
    // Combine all users
    const allUsers = [...defaultUsers, ...signupUsersFormatted];
    
    // Apply filters
    let filtered = allUsers;
    if (params?.q) {
      const query = params.q.toLowerCase();
      filtered = filtered.filter(u => 
        u.email?.toLowerCase().includes(query) ||
        u.username?.toLowerCase().includes(query) ||
        u.fullName?.toLowerCase().includes(query)
      );
    }
    if (params?.role) {
      filtered = filtered.filter(u => u.role === params.role);
    }
    if (params?.isActive !== undefined) {
      filtered = filtered.filter(u => u.isActive === params.isActive);
    }
    
    return {
      success: true,
      data: {
        users: filtered,
        total: filtered.length,
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    };
  }
  
  const res = await api.get(apiPath("/admin/users"), { params });
  return res.data;
}

export async function adminCreateUser(body) {
  if (!isMockUsersEnabled()) {
    const res = await api.post(apiPath("/admin/users"), body);
    return res.data;
  }
  const base = safeGetItem("mock_admin_users", mockAdminUsers);
  const users = base?.data?.users || [];
  const nextId = users.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0) + 1;
  const user = {
    id: nextId,
    email: body.email,
    username: body.username || `user${nextId}`,
    fullName: body.fullName || "",
    role: body.role || "user",
    isActive: body.isActive !== false,
    verified: body.verified === true,
    createdAt: new Date().toISOString(),
    password: body.password,
  };
  const next = {
    ...base,
    data: { ...(base.data || {}), users: [user, ...users] },
  };
  const saved = safeSetItem("mock_admin_users", next);
  if (!saved) {
    return { success: false, message: "Impossible de sauvegarder. Espace de stockage insuffisant." };
  }
  return { success: true, data: { user } };
}

export async function adminUpdateUser(id, body) {
  if (!isMockUsersEnabled()) {
    const res = await api.patch(apiPath(`/admin/users/${id}`), body);
    return res.data;
  }
  const base = safeGetItem("mock_admin_users", mockAdminUsers);
  const users = base?.data?.users || [];
  const idx = users.findIndex((u) => Number(u.id) === Number(id));
  if (idx === -1) return { success: false, message: "Not found" };
  users[idx] = { ...users[idx], ...body };
  const next = { ...base, data: { ...(base.data || {}), users } };
  const saved = safeSetItem("mock_admin_users", next);
  if (!saved) {
    return { success: false, message: "Impossible de sauvegarder. Espace de stockage insuffisant." };
  }
  return { success: true, data: { user: users[idx] } };
}

export async function adminDeleteUser(id) {
  if (!isMockUsersEnabled()) {
    const res = await api.delete(apiPath(`/admin/users/${id}`));
    return res.data;
  }
  const base = safeGetItem("mock_admin_users", mockAdminUsers);
  const users = base?.data?.users || [];
  const nextUsers = users.filter((u) => Number(u.id) !== Number(id));
  const next = { ...base, data: { ...(base.data || {}), users: nextUsers } };
  const saved = safeSetItem("mock_admin_users", next);
  if (!saved) {
    return { success: false, message: "Impossible de sauvegarder. Espace de stockage insuffisant." };
  }
  return { success: true };
}

/* =========================
   Site settings
   ========================= */

export const DEFAULT_MOVING_HEADER_FONT_CONFIG = {
  fontFamily: "Inter",
  fontSize: 15,
  fontWeight: "600",
  fontStyle: "normal",
  letterSpacing: 0.28,
  wordSpacing: 0.35,
};

export async function getMovingHeaderSettings() {
  if (isMockEnabled()) {
    return loadLocalMovingHeader();
  }
  
  try {
    const res = await api.get(apiPath("/public/site/moving-header"));
    return res.data;
  } catch (err) {
    // Silently fallback to local storage
    return loadLocalMovingHeader();
  }
}

export async function getAdminMovingHeaderSettings() {
  if (isMockEnabled()) {
    return loadLocalMovingHeader();
  }
  
  try {
    const res = await api.get(apiPath("/admin/site/moving-header"));
    return res.data;
  } catch {
    return loadLocalMovingHeader();
  }
}

const MOVING_HEADER_KEY = "site_moving_header_v1";

function loadLocalMovingHeader() {
  const stored = safeGetItem(MOVING_HEADER_KEY);
  if (stored) return stored;
  
  // Initialize with mock data for all 69 Algerian wilayas at 250/kg
  const { generateMovingHeaderItems } = require("../utils/algerianWilayas");
  const mockItems = generateMovingHeaderItems(250, "Poulet", "kg");
  
  const defaultData = {
    success: true,
    data: {
      items: mockItems,
      fontConfig: DEFAULT_MOVING_HEADER_FONT_CONFIG,
      prefixFr: "",
      prefixAr: "",
      textColor: "",
      backgroundColor: "",
      animationDuration: 25,
      heightPx: 60,
      translateWilayaAr: true,
    },
  };
  
  // Save default data
  safeSetItem(MOVING_HEADER_KEY, defaultData);
  
  return defaultData;
}

function saveLocalMovingHeader(payload) {
  const saved = safeSetItem(MOVING_HEADER_KEY, payload);
  if (!saved) {
    console.error("Failed to save moving header settings");
  } else {
    // Trigger storage event for cross-tab sync
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: MOVING_HEADER_KEY,
        newValue: JSON.stringify(payload),
        storageArea: localStorage
      }));
      // Also dispatch custom event for same-tab updates
      // Pass the data object directly (unwrap if it's in payload.data)
      const dataToPass = payload?.data || payload;
      window.dispatchEvent(new CustomEvent('moving-header-updated', {
        detail: dataToPass
      }));
    } catch (e) {
      // ignore event errors
    }
  }
  return payload;
}

export async function updateMovingHeaderSettings(payload) {
  // Extract all fields from payload
  const items = payload?.items || payload?.data?.items || [];
  const fontConfig = payload?.fontConfig || payload?.data?.fontConfig || DEFAULT_MOVING_HEADER_FONT_CONFIG;
  const prefixFr = payload?.prefixFr || payload?.data?.prefixFr || "";
  const prefixAr = payload?.prefixAr || payload?.data?.prefixAr || "";
  const textColor = payload?.textColor || payload?.data?.textColor || "";
  const backgroundColor = payload?.backgroundColor || payload?.data?.backgroundColor || "";
  const animationDuration = payload?.animationDuration !== undefined ? payload.animationDuration : (payload?.data?.animationDuration !== undefined ? payload.data.animationDuration : 25);
  const heightPx = payload?.heightPx !== undefined ? payload.heightPx : (payload?.data?.heightPx !== undefined ? payload.data.heightPx : 60);
  const translateWilayaAr = payload?.translateWilayaAr !== undefined ? payload.translateWilayaAr : (payload?.data?.translateWilayaAr !== undefined ? payload.data.translateWilayaAr : true);
  
  const next = {
    success: true,
    data: {
      items,
      fontConfig,
      prefixFr,
      prefixAr,
      textColor,
      backgroundColor,
      animationDuration,
      heightPx,
      translateWilayaAr,
    },
  };
  
  if (isMockEnabled()) {
    // Save the full response object (with success and data)
    saveLocalMovingHeader(next);
    return next;
  }
  
  try {
    const res = await api.put(apiPath("/admin/site/moving-header"), payload);
    // Also save to localStorage as backup
    if (res.data) {
      saveLocalMovingHeader({ success: true, data: res.data });
    }
    return res.data || next;
  } catch {
    // Fallback to localStorage
    saveLocalMovingHeader(next);
    return next;
  }
}

const HERO_KEY = "site_hero_slides_v1";

function loadLocalHeroSlides() {
  try {
    const raw = localStorage.getItem(HERO_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean up any blob URLs in slides
      if (parsed?.data?.slides && parsed.data.slides.length > 0) {
        parsed.data.slides = parsed.data.slides.map(slide => {
          if (slide.url && typeof slide.url === 'string' && slide.url.startsWith('blob:')) {
            return { ...slide, url: '' }; // Remove blob URLs
          }
          return slide;
        });
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  
  // Initialize with default chicken farm images if no slides exist
  const defaultSlides = [
    {
      id: "hero-1",
      url: slideImg1,
      durationSeconds: 5,
      durationMs: 5000,
    },
    {
      id: "hero-2",
      url: slideImg2,
      durationSeconds: 5,
      durationMs: 5000,
    },
    {
      id: "hero-3",
      url: slideImg3,
      durationSeconds: 5,
      durationMs: 5000,
    },
  ];
  
  const defaultData = {
    success: true,
    data: {
      slides: defaultSlides,
    },
  };
  
  // Save default slides
  try {
    localStorage.setItem(HERO_KEY, JSON.stringify(defaultData));
  } catch {
    // ignore
  }
  
  return defaultData;
}

function saveLocalHeroSlides(payload) {
  try {
    localStorage.setItem(HERO_KEY, JSON.stringify(payload));
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: HERO_KEY,
      newValue: JSON.stringify(payload),
      storageArea: localStorage
    }));
    // Also dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('hero-slides-updated', {
      detail: payload
    }));
  } catch {
    // ignore
  }
  return payload;
}

export async function getHeroSlides() {
  // In mock mode, always use localStorage
  if (isMockEnabled()) {
    return loadLocalHeroSlides();
  }
  
  try {
    const res = await api.get(apiPath("/public/site/hero-slides"));
    return res.data;
  } catch (err) {
    // Silently fallback to local slides
    return loadLocalHeroSlides();
  }
}

export async function adminGetHeroSlides() {
  // In mock mode, always use localStorage
  if (isMockEnabled()) {
    return loadLocalHeroSlides();
  }
  
  try {
    const res = await api.get(apiPath("/admin/site/hero-slides"));
    return res.data;
  } catch {
    return loadLocalHeroSlides();
  }
}

export async function adminAddHeroSlide({ file, durationSeconds }) {
  if (isMockEnabled()) {
    const base = loadLocalHeroSlides();
    const slides = base?.data?.slides || [];
    
    // Convert file to base64 for persistence
    let imageBase64 = "";
    if (file) {
      try {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } catch (error) {
        console.error("Failed to convert hero slide image to base64:", error);
        throw new Error("Failed to process image");
      }
    }
    
    const next = {
      id: `hero-${Date.now()}`,
      url: imageBase64, // base64 data URL for persistence
      durationMs: (durationSeconds ?? 5) * 1000,
      durationSeconds: durationSeconds ?? 5,
    };
    const payload = { success: true, data: { slides: [...slides, next] } };
    saveLocalHeroSlides(payload);
    return payload;
  }
  
  const fd = new FormData();
  fd.append("photo", file);
  fd.append("durationSeconds", String(durationSeconds ?? 5));
  try {
    const res = await api.post(apiPath("/admin/site/hero-slides"), fd);
    return res.data;
  } catch {
    const base = loadLocalHeroSlides();
    const slides = base?.data?.slides || [];
    
    // Convert file to base64 for persistence
    let imageBase64 = "";
    if (file) {
      try {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } catch (error) {
        console.error("Failed to convert hero slide image to base64:", error);
        // Fallback to empty string
      }
    }
    
    const next = {
      id: `hero-${Date.now()}`,
      url: imageBase64, // base64 data URL for persistence
      durationSeconds: durationSeconds ?? 5,
      durationMs: (durationSeconds ?? 5) * 1000,
    };
    const payload = { success: true, data: { slides: [...slides, next] } };
    return saveLocalHeroSlides(payload);
  }
}

export async function adminUpdateHeroSlides(payload) {
  if (isMockEnabled()) {
    const slides = payload?.slides || payload?.data?.slides || [];
    // Ensure slides have durationMs
    const normalizedSlides = slides.map(s => ({
      ...s,
      durationMs: s.durationMs || (s.durationSeconds ? s.durationSeconds * 1000 : 6000),
      durationSeconds: s.durationSeconds || (s.durationMs ? s.durationMs / 1000 : 6),
    }));
    const next = { success: true, data: { slides: normalizedSlides } };
    saveLocalHeroSlides(next);
    return next;
  }
  
  try {
    const res = await api.put(apiPath("/admin/site/hero-slides"), payload);
    return res.data;
  } catch {
    const base = loadLocalHeroSlides();
    const slides = payload?.slides || payload?.data?.slides || [];
    const next = { success: true, data: { slides } };
    return saveLocalHeroSlides(next);
  }
}

export async function adminDeleteHeroSlide(id) {
  if (isMockEnabled()) {
    const base = loadLocalHeroSlides();
    const slides = base?.data?.slides || [];
    const filtered = slides.filter(s => String(s.id) !== String(id));
    const next = { success: true, data: { slides: filtered } };
    saveLocalHeroSlides(next);
    return next;
  }
  
  try {
    const res = await api.delete(apiPath(`/admin/site/hero-slides/${id}`));
    return res.data;
  } catch {
    const base = loadLocalHeroSlides();
    const slides = (base?.data?.slides || []).filter(
      (s) => String(s.id || s._id) !== String(id)
    );
    const next = { success: true, data: { slides } };
    return saveLocalHeroSlides(next);
  }
}

/* =========================
   CTA settings (fallback local)
   ========================= */
const CTA_KEY = "site_cta_settings_v1";
const defaultCta = {
  imageUrl: "",
  titleFr: "Rejoignez le Souk",
  titleAr: "انضم إلى السوق",
  subtitleFr: "Publiez vos lots, le centre d'appel gere les contacts.",
  subtitleAr: "انشر منتجاتك وندير مكالمات المهتمين.",
  buttonFr: "Poster une annonce",
  buttonAr: "انشر منشور",
  link: "/create-listing",
};

const FOOTER_KEY = "site_footer_settings_v1";
const defaultFooter = {
  aboutFr:
    "Marche agricole digital, appui par centre d appel, et categories avec icones claires pour naviguer vite.",
  aboutAr: "سوق رقمي للمنتجات الفلاحية مع مركز نداء وتصفح سريع بالايقونات.",
  callCenters: ["+213 791 948 070", "+213 561 234 567", "+213 550 987 654"],
  columns: [
    {
      titleFr: "Navigation",
      titleAr: "روابط",
      links: [
        { labelFr: "Favoris", labelAr: "المحفوظات", href: "/saved" },
        { labelFr: "Parametres", labelAr: "الإعدادات", href: "/settings" },
        { labelFr: "Admin", labelAr: "الادارة", href: "/admin" },
      ],
    },
  ],
};

function loadLocalCta() {
  try {
    const raw = localStorage.getItem(CTA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleaned = { ...defaultCta, ...parsed };
      // Clean up any blob URLs
      if (cleaned.imageUrl && typeof cleaned.imageUrl === 'string' && cleaned.imageUrl.startsWith('blob:')) {
        cleaned.imageUrl = '';
      }
      return cleaned;
    }
  } catch {
    // ignore
  }
  return { ...defaultCta };
}

function saveLocalCta(payload) {
  try {
    localStorage.setItem(CTA_KEY, JSON.stringify(payload));
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: CTA_KEY,
      newValue: JSON.stringify(payload),
      storageArea: localStorage
    }));
    window.dispatchEvent(new CustomEvent('cta-settings-updated', { detail: payload }));
  } catch {
    // ignore
  }
}

export async function getCtaSettings() {
  // In mock mode, always use localStorage
  if (isMockEnabled()) {
    return { success: true, data: { cta: loadLocalCta() } };
  }
  
  try {
    const res = await api.get(apiPath("/public/site/cta"));
    return res.data;
  } catch (err) {
    // Suppress 404 errors - these are expected if endpoint doesn't exist
    if (err?.response?.status !== 404) {
      console.error("getCtaSettings error:", err);
    }
    return { success: true, data: { cta: loadLocalCta() } };
  }
}

export async function adminGetCtaSettings() {
  // In mock mode, always use localStorage
  if (isMockEnabled()) {
    return { success: true, data: { cta: loadLocalCta() } };
  }
  
  try {
    const res = await api.get(apiPath("/admin/site/cta"));
    return res.data;
  } catch {
    return { success: true, data: { cta: loadLocalCta() } };
  }
}

export async function adminUpdateCtaSettings(payload) {
  const current = loadLocalCta();
  const next = { ...current };
  
  const isFormData =
    typeof FormData !== "undefined" && payload instanceof FormData;
  
  if (isFormData) {
    // Handle FormData - extract text fields and handle image
    const imageFile = payload.get("image") || payload.get("imageUrl");
    if (imageFile instanceof File) {
      // Convert to base64 for persistence
      try {
        const reader = new FileReader();
        next.imageUrl = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      } catch (error) {
        console.error("Failed to convert CTA image to base64:", error);
        // Keep existing imageUrl if conversion fails
      }
    }
    
    // Extract text fields from FormData
    const titleFr = payload.get("titleFr");
    const titleAr = payload.get("titleAr");
    const subtitleFr = payload.get("subtitleFr");
    const subtitleAr = payload.get("subtitleAr");
    const buttonFr = payload.get("buttonFr");
    const buttonAr = payload.get("buttonAr");
    const link = payload.get("link");
    
    if (titleFr) next.titleFr = titleFr;
    if (titleAr) next.titleAr = titleAr;
    if (subtitleFr) next.subtitleFr = subtitleFr;
    if (subtitleAr) next.subtitleAr = subtitleAr;
    if (buttonFr) next.buttonFr = buttonFr;
    if (buttonAr) next.buttonAr = buttonAr;
    if (link) next.link = link;
  } else {
    // Handle JSON payload
    const ctaData = payload?.cta || payload || {};
    Object.assign(next, ctaData);
  }
  
  // In mock mode, always use localStorage
  if (isMockEnabled()) {
    saveLocalCta(next);
    return { success: true, data: { cta: next } };
  }
  
  try {
    const res = await api.put(
      apiPath("/admin/site/cta"),
      payload,
      isFormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined
    );
    return res.data;
  } catch (e) {
    if (isFormData) throw e;
    const next = { ...loadLocalCta(), ...(payload?.cta || payload || {}) };
    saveLocalCta(next);
    return { success: true, data: { cta: next } };
  }
}

function loadLocalFooter() {
  try {
    const raw = localStorage.getItem(FOOTER_KEY);
    if (raw) return { ...defaultFooter, ...(JSON.parse(raw) || {}) };
  } catch {
    // ignore
  }
  return { ...defaultFooter };
}

function saveLocalFooter(payload) {
  try {
    localStorage.setItem(FOOTER_KEY, JSON.stringify(payload));
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: FOOTER_KEY,
      newValue: JSON.stringify(payload),
      storageArea: localStorage
    }));
    window.dispatchEvent(new CustomEvent('footer-settings-updated', { detail: payload }));
  } catch {
    // ignore
  }
}

export async function getFooterSettings() {
  // In mock mode, always use localStorage
  if (isMockEnabled()) {
    return { success: true, data: { footer: loadLocalFooter() } };
  }
  
  try {
    const res = await api.get(apiPath("/public/site/footer"));
    return res.data;
  } catch (err) {
    // Silently fallback to local footer
    return { success: true, data: { footer: loadLocalFooter() } };
  }
}

export async function adminGetFooterSettings() {
  // In mock mode, always use localStorage
  if (isMockEnabled()) {
    return { success: true, data: { footer: loadLocalFooter() } };
  }
  
  try {
    const res = await api.get(apiPath("/admin/site/footer"));
    return res.data;
  } catch {
    return { success: true, data: { footer: loadLocalFooter() } };
  }
}

export async function adminUpdateFooterSettings(payload) {
  // In mock mode, always use localStorage
  if (isMockEnabled()) {
    const next = {
      ...loadLocalFooter(),
      ...(payload?.footer || payload || {}),
    };
    saveLocalFooter(next);
    return { success: true, data: { footer: next } };
  }
  
  try {
    const res = await api.put(apiPath("/admin/site/footer"), payload);
    // Also save to localStorage as backup
    if (res.data?.footer) {
      saveLocalFooter(res.data.footer);
    }
    return res.data;
  } catch {
    const next = {
      ...loadLocalFooter(),
      ...(payload?.footer || payload || {}),
    };
    saveLocalFooter(next);
    return { success: true, data: { footer: next } };
  }
}

/* =========================
   Logo settings
   ========================= */
const LOGO_KEY = "site_logo_settings_v1";
const defaultLogo = {
  logoLight: "",
  logoDark: "",
};

function loadLocalLogo() {
  try {
    const raw = localStorage.getItem(LOGO_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean up any blob URLs
      const cleaned = { ...defaultLogo, ...parsed };
      if (cleaned.logoLight && typeof cleaned.logoLight === 'string' && cleaned.logoLight.startsWith('blob:')) {
        cleaned.logoLight = '';
      }
      if (cleaned.logoDark && typeof cleaned.logoDark === 'string' && cleaned.logoDark.startsWith('blob:')) {
        cleaned.logoDark = '';
      }
      return cleaned;
    }
  } catch {
    // ignore
  }
  return { ...defaultLogo };
}

function saveLocalLogo(payload) {
  try {
    localStorage.setItem(LOGO_KEY, JSON.stringify(payload));
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: LOGO_KEY,
      newValue: JSON.stringify(payload),
      storageArea: localStorage
    }));
    window.dispatchEvent(new CustomEvent('logo-settings-updated', { detail: payload }));
  } catch {
    // ignore
  }
}

export async function getLogoSettings() {
  // In mock mode, always use localStorage
  if (isMockEnabled()) {
    return { success: true, data: { logo: loadLocalLogo() } };
  }
  
  try {
    const res = await api.get(apiPath("/public/site/logo"));
    return res.data;
  } catch (err) {
    // Silently fallback to local logo - don't spam console
    return { success: true, data: { logo: loadLocalLogo() } };
  }
}

export async function adminGetLogoSettings() {
  // In mock mode, always use localStorage
  if (isMockEnabled()) {
    return { success: true, data: { logo: loadLocalLogo() } };
  }
  
  try {
    const res = await api.get(apiPath("/admin/site/logo"));
    return res.data;
  } catch {
    return { success: true, data: { logo: loadLocalLogo() } };
  }
}

export async function adminUpdateLogoSettings(formData) {
  if (isMockEnabled()) {
    const current = loadLocalLogo();
    const next = { ...current };
    
    // Handle file uploads - create object URLs
    if (formData instanceof FormData) {
      const logoLightFile = formData.get("logoLight");
      const logoDarkFile = formData.get("logoDark");
      
      if (logoLightFile instanceof File) {
        // Convert to base64 for persistence
        try {
          const reader = new FileReader();
          next.logoLight = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(logoLightFile);
          });
        } catch (error) {
          console.error("Failed to convert logo light to base64:", error);
        }
      }
      if (logoDarkFile instanceof File) {
        // Convert to base64 for persistence
        try {
          const reader = new FileReader();
          next.logoDark = await new Promise((resolve, reject) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(logoDarkFile);
          });
        } catch (error) {
          console.error("Failed to convert logo dark to base64:", error);
        }
      }
    } else {
      // Handle JSON payload
      if (formData?.logoLight) next.logoLight = formData.logoLight;
      if (formData?.logoDark) next.logoDark = formData.logoDark;
    }
    
    saveLocalLogo(next);
    return { success: true, data: { logo: next } };
  }
  
  try {
    const res = await api.put(apiPath("/admin/site/logo"), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch {
    const current = loadLocalLogo();
    const next = { ...current };
    // Note: Can't save files to localStorage, so this is just for structure
    saveLocalLogo(next);
    return { success: true, data: { logo: next } };
  }
}

/* =========================
   Audit
   ========================= */

export async function getAuditClicks(params) {
  if (!isMockEnabled()) {
    const res = await api.get(apiPath("/admin/audit/clicks"), { params });
    return res.data;
  }
  return mockAuditClicks;
}
