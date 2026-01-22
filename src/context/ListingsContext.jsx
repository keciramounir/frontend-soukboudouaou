/**
 * ListingsContext - Single source of truth for listings
 * Syncs with localStorage and provides reactive updates
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getAllListings,
  getListingById,
  createListing as createListingStorage,
  updateListing as updateListingStorage,
  deleteListing as deleteListingStorage,
  getListingsByCreator,
  searchListings as searchListingsStorage,
  filterListingsByCategory,
  getSavedListings,
  toggleSavedListing as toggleSavedListingStorage,
} from '../utils/listingsStorage';

const ListingsContext = createContext(null);

export function useListings() {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within ListingsProvider');
  }
  return context;
}

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load listings from localStorage
  const loadListings = useCallback(() => {
    try {
      const loaded = getAllListings();
      setListings(loaded);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load listings:', error);
      setListings([]);
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadListings();
  }, [loadListings]);

  // Listen for storage updates (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'mock_listings' || e.type === 'listings-updated') {
        loadListings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('listings-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('listings-updated', handleStorageChange);
    };
  }, [loadListings]);

  // Create listing
  const createListing = useCallback((listingData) => {
    const newListing = createListingStorage(listingData);
    loadListings(); // Reload to sync
    return newListing;
  }, [loadListings]);

  // Update listing
  const updateListing = useCallback((id, updates) => {
    const updated = updateListingStorage(id, updates);
    if (updated) {
      loadListings(); // Reload to sync
    }
    return updated;
  }, [loadListings]);

  // Delete listing
  const deleteListing = useCallback((id) => {
    const success = deleteListingStorage(id);
    if (success) {
      loadListings(); // Reload to sync
    }
    return success;
  }, [loadListings]);

  // Get listing by ID
  const getListing = useCallback((id) => {
    return getListingById(id);
  }, []);

  // Get listings by creator
  const getMyListings = useCallback((userId) => {
    return getListingsByCreator(userId);
  }, []);

  // Search listings
  const searchListings = useCallback((query) => {
    return searchListingsStorage(query);
  }, []);

  // Filter by category
  const filterByCategory = useCallback((category) => {
    return filterListingsByCategory(category);
  }, []);

  // Get saved listings
  const getSaved = useCallback((userId) => {
    return getSavedListings(userId);
  }, []);

  // Toggle saved
  const toggleSaved = useCallback((listingId, userId) => {
    const updated = toggleSavedListingStorage(listingId, userId);
    if (updated) {
      loadListings(); // Reload to sync
    }
    return updated;
  }, [loadListings]);

  const value = {
    listings,
    loading,
    createListing,
    updateListing,
    deleteListing,
    getListing,
    getMyListings,
    searchListings,
    filterByCategory,
    getSaved,
    toggleSaved,
    refresh: loadListings,
  };

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
}
