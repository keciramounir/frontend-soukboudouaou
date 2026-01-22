/**
 * Persistent Mock Storage for Listings
 * Single source of truth: localStorage key "mock_listings"
 * 
 * Listing Model:
 * {
 *   id: string,
 *   title: string,
 *   description: string,
 *   price: number,
 *   category: string,
 *   image: string, // base64 data URL
 *   createdBy: string,
 *   createdAt: string,
 *   savedBy: string[] // Array of user IDs who saved this listing
 * }
 */

const STORAGE_KEY = "mock_listings";

/**
 * Get all listings from persistent storage
 */
export function getAllListings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (error) {
    console.error("Failed to load listings:", error);
  }
  return [];
}

/**
 * Save all listings to persistent storage
 */
export function saveAllListings(listings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    // Dispatch event for cross-component sync
    window.dispatchEvent(new CustomEvent('listings-updated', { detail: listings }));
    return true;
  } catch (error) {
    console.error("Failed to save listings:", error);
    return false;
  }
}

/**
 * Get listing by ID
 */
export function getListingById(id) {
  const listings = getAllListings();
  return listings.find(l => String(l.id || l._id) === String(id)) || null;
}

/**
 * Create a new listing
 */
export function createListing(listingData) {
  const listings = getAllListings();
  const newListing = {
    id: `listing-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: listingData.title || "",
    description: listingData.description || "",
    price: Number(listingData.price || 0),
    category: listingData.category || "Poulet",
    image: listingData.image || "", // base64 string
    createdBy: listingData.createdBy || "anonymous",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: listingData.status || "published",
    wilaya: listingData.wilaya || "",
    savedBy: [], // Array of user IDs
    // Additional fields
    ...listingData,
  };
  
  const updated = [newListing, ...listings];
  saveAllListings(updated);
  return newListing;
}

/**
 * Update an existing listing
 */
export function updateListing(id, updates) {
  const listings = getAllListings();
  const index = listings.findIndex(l => String(l.id || l._id) === String(id));
  
  if (index === -1) {
    return null;
  }
  
  const updated = {
    ...listings[index],
    ...updates,
    id: listings[index].id || listings[index]._id, // Preserve original ID
    updatedAt: new Date().toISOString(),
  };
  
  // Preserve image if not being updated
  if (!updates.image && listings[index].image) {
    updated.image = listings[index].image;
  }
  
  listings[index] = updated;
  saveAllListings(listings);
  return updated;
}

/**
 * Delete a listing
 */
export function deleteListing(id) {
  const listings = getAllListings();
  const filtered = listings.filter(l => String(l.id || l._id) !== String(id));
  saveAllListings(filtered);
  return true;
}

/**
 * Convert File to base64 data URL
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result); // Returns data:image/...;base64,...
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

/**
 * Get listings by creator
 */
export function getListingsByCreator(userId) {
  const listings = getAllListings();
  return listings.filter(l => String(l.createdBy) === String(userId));
}

/**
 * Search listings
 */
export function searchListings(query) {
  const listings = getAllListings();
  const term = String(query || "").toLowerCase().trim();
  if (!term) return listings;
  
  return listings.filter(l => {
    const title = String(l.title || "").toLowerCase();
    const desc = String(l.description || "").toLowerCase();
    return title.includes(term) || desc.includes(term);
  });
}

/**
 * Filter listings by category
 */
export function filterListingsByCategory(category) {
  const listings = getAllListings();
  if (!category) return listings;
  return listings.filter(l => String(l.category || "").toLowerCase() === String(category).toLowerCase());
}

/**
 * Toggle saved listing for user
 */
export function toggleSavedListing(listingId, userId) {
  const listing = getListingById(listingId);
  if (!listing) return null;
  
  const savedBy = Array.isArray(listing.savedBy) ? listing.savedBy : [];
  const index = savedBy.indexOf(userId);
  
  if (index === -1) {
    // Add to saved
    savedBy.push(userId);
  } else {
    // Remove from saved
    savedBy.splice(index, 1);
  }
  
  return updateListing(listingId, { savedBy });
}

/**
 * Get saved listings for user
 */
export function getSavedListings(userId) {
  const listings = getAllListings();
  return listings.filter(l => {
    const savedBy = Array.isArray(l.savedBy) ? l.savedBy : [];
    return savedBy.includes(userId);
  });
}
