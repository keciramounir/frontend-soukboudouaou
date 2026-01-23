/**
 * Centralized App State Management
 * 
 * Provides functions to save, load, and export/import the entire app state.
 * This enables full state persistence and restoration.
 */

import { safeGetItem, safeSetItem, safeRemoveItem } from './localStorage';

const APP_STATE_KEY = 'app_state_v1';

/**
 * App State Schema
 * 
 * {
 *   version: string,
 *   timestamp: string,
 *   user: object,
 *   listings: array,
 *   categories: array,
 *   settings: {
 *     theme: string,
 *     language: string,
 *     site: object
 *   },
 *   ui: {
 *     sidebarOpen: boolean,
 *     userMenuOpen: boolean,
 *     // ... other UI state
 *   }
 * }
 */

/**
 * Get current app state from all contexts and localStorage
 * @returns {object} Complete app state snapshot
 */
export function getAppState() {
  try {
    // Get user
    const user = safeGetItem('user');
    
    // Get listings
    const listingsData = safeGetItem('mock_listings');
    const listings = listingsData?.data?.listings || [];
    
    // Get categories
    const categories = safeGetItem('admin_categories_v1') || { data: { categories: [] } };
    
    // Get site settings
    const movingHeader = safeGetItem('site_moving_header_v1');
    const heroSlides = safeGetItem('site_hero_slides_v1');
    const footer = safeGetItem('site_footer_settings_v1');
    const logo = safeGetItem('site_logo_settings_v1');
    const cta = safeGetItem('site_cta_settings_v1');
    
    // Get theme and language
    const theme = localStorage.getItem('theme') || 'light';
    const language = localStorage.getItem('language') || 'fr';
    
    // Get mock users
    const mockUsers = safeGetItem('mock_users', []);
    const adminUsers = safeGetItem('mock_admin_users');
    
    // Get inquiries
    const inquiries = safeGetItem('mock_inquiries', []);
    
    // Get orders
    const orders = safeGetItem('mock_orders');
    
    const state = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      user,
      listings,
      categories: categories?.data?.categories || [],
      users: {
        mock: mockUsers,
        admin: adminUsers?.data?.users || [],
      },
      inquiries,
      orders: orders?.data?.orders || [],
      settings: {
        theme,
        language,
        site: {
          movingHeader: movingHeader?.data || {},
          heroSlides: heroSlides?.data || {},
          footer: footer || {},
          logo: logo || {},
          cta: cta || {},
        },
      },
    };
    
    return state;
  } catch (error) {
    console.error('Failed to get app state:', error);
    return null;
  }
}

/**
 * Save app state to localStorage
 * @param {object} state - App state to save
 * @returns {boolean} Success status
 */
export function saveAppState(state) {
  try {
    if (!state) return false;
    
    // Save user
    if (state.user) {
      safeSetItem('user', state.user);
    }
    
    // Save listings
    if (state.listings) {
      safeSetItem('mock_listings', {
        success: true,
        data: { listings: state.listings },
      });
    }
    
    // Save categories
    if (state.categories) {
      safeSetItem('admin_categories_v1', {
        data: { categories: state.categories },
      });
    }
    
    // Save users
    if (state.users) {
      if (state.users.mock) {
        safeSetItem('mock_users', state.users.mock);
      }
      if (state.users.admin) {
        safeSetItem('mock_admin_users', {
          data: { users: state.users.admin },
        });
      }
    }
    
    // Save inquiries
    if (state.inquiries) {
      safeSetItem('mock_inquiries', state.inquiries);
    }
    
    // Save orders
    if (state.orders) {
      safeSetItem('mock_orders', {
        data: { orders: state.orders },
      });
    }
    
    // Save settings
    if (state.settings) {
      if (state.settings.theme) {
        localStorage.setItem('theme', state.settings.theme);
      }
      if (state.settings.language) {
        localStorage.setItem('language', state.settings.language);
      }
      
      if (state.settings.site) {
        const { site } = state.settings;
        if (site.movingHeader) {
          safeSetItem('site_moving_header_v1', {
            success: true,
            data: site.movingHeader,
          });
        }
        if (site.heroSlides) {
          safeSetItem('site_hero_slides_v1', {
            success: true,
            data: site.heroSlides,
          });
        }
        if (site.footer) {
          safeSetItem('site_footer_settings_v1', site.footer);
        }
        if (site.logo) {
          safeSetItem('site_logo_settings_v1', site.logo);
        }
        if (site.cta) {
          safeSetItem('site_cta_settings_v1', site.cta);
        }
      }
    }
    
    // Save full state snapshot
    safeSetItem(APP_STATE_KEY, {
      version: state.version || '1.0.0',
      timestamp: state.timestamp || new Date().toISOString(),
      snapshot: state,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to save app state:', error);
    return false;
  }
}

/**
 * Export app state as JSON (for download)
 * @returns {string} JSON string
 */
export function exportAppState() {
  const state = getAppState();
  if (!state) return null;
  
  try {
    return JSON.stringify(state, null, 2);
  } catch (error) {
    console.error('Failed to export app state:', error);
    return null;
  }
}

/**
 * Import app state from JSON
 * @param {string} jsonString - JSON string to import
 * @returns {boolean} Success status
 */
export function importAppState(jsonString) {
  try {
    const state = JSON.parse(jsonString);
    if (!state || typeof state !== 'object') {
      throw new Error('Invalid state format');
    }
    
    return saveAppState(state);
  } catch (error) {
    console.error('Failed to import app state:', error);
    return false;
  }
}

/**
 * Download app state as JSON file
 */
export function downloadAppState() {
  const json = exportAppState();
  if (!json) {
    console.error('Failed to export state');
    return false;
  }
  
  try {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `souk-boudouaou-state-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to download state:', error);
    return false;
  }
}

/**
 * Load app state from file (for upload)
 * @param {File} file - JSON file to load
 * @returns {Promise<boolean>} Success status
 */
export function loadAppStateFromFile(file) {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const json = e.target.result;
        const success = importAppState(json);
        resolve(success);
      };
      reader.onerror = () => {
        console.error('Failed to read file');
        resolve(false);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Failed to load state from file:', error);
      resolve(false);
    }
  });
}

/**
 * Clear all app state (reset to defaults)
 * @returns {boolean} Success status
 */
export function clearAppState() {
  try {
    // Clear user
    safeRemoveItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Clear listings
    safeRemoveItem('mock_listings');
    safeRemoveItem('mock_my_listings');
    
    // Clear users
    safeRemoveItem('mock_users');
    safeRemoveItem('mock_admin_users');
    
    // Clear inquiries
    safeRemoveItem('mock_inquiries');
    
    // Clear orders
    safeRemoveItem('mock_orders');
    
    // Clear site settings
    safeRemoveItem('site_moving_header_v1');
    safeRemoveItem('site_hero_slides_v1');
    safeRemoveItem('site_footer_settings_v1');
    safeRemoveItem('site_logo_settings_v1');
    safeRemoveItem('site_cta_settings_v1');
    safeRemoveItem('admin_categories_v1');
    
    // Clear state snapshot
    safeRemoveItem(APP_STATE_KEY);
    
    return true;
  } catch (error) {
    console.error('Failed to clear app state:', error);
    return false;
  }
}

/**
 * Get state statistics
 * @returns {object} Statistics about current state
 */
export function getStateStats() {
  const state = getAppState();
  if (!state) {
    return {
      listings: 0,
      users: 0,
      inquiries: 0,
      orders: 0,
      categories: 0,
    };
  }
  
  return {
    listings: state.listings?.length || 0,
    users: (state.users?.mock?.length || 0) + (state.users?.admin?.length || 0),
    inquiries: state.inquiries?.length || 0,
    orders: state.orders?.length || 0,
    categories: state.categories?.length || 0,
    timestamp: state.timestamp,
    version: state.version,
  };
}
