/**
 * Robust localStorage utilities with error handling for mobile devices
 * Handles quota exceeded errors and provides fallbacks
 */

/**
 * Safely get item from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist or error occurs
 * @returns {any} - Parsed value or default
 */
export function safeGetItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Failed to get localStorage item "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely set item in localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 * @returns {boolean} - True if successful, false otherwise
 */
export function safeSetItem(key, value) {
  try {
    const stringified = JSON.stringify(value);
    localStorage.setItem(key, stringified);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.error(`localStorage quota exceeded for key "${key}". Attempting cleanup...`);
      // Try to clean up old data
      try {
        cleanupOldData();
        // Retry once after cleanup
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        console.error(`Failed to save after cleanup:`, retryError);
        return false;
      }
    }
    console.error(`Failed to set localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Safely remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - True if successful, false otherwise
 */
export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove localStorage item "${key}":`, error);
    return false;
  }
}

/**
 * Clean up old or large data to free space
 * Priority: Keep user data, listings, and recent inquiries
 */
function cleanupOldData() {
  try {
    // Remove old OTP data (older than 1 hour)
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mock_otp_')) {
        const timeKey = `mock_otp_time_${key.replace('mock_otp_', '')}`;
        const timeStr = localStorage.getItem(timeKey);
        if (timeStr) {
          const time = parseInt(timeStr);
          if (now - time > oneHour) {
            localStorage.removeItem(key);
            localStorage.removeItem(timeKey);
            localStorage.removeItem(`mock_otp_verified_${key.replace('mock_otp_', '')}`);
          }
        }
      }
    }
    
    // Limit inquiries to last 100
    const inquiries = safeGetItem('mock_inquiries', []);
    if (Array.isArray(inquiries) && inquiries.length > 100) {
      safeSetItem('mock_inquiries', inquiries.slice(0, 100));
    }
    
    // Limit saved listings to last 50
    const saved = safeGetItem('saved_listings_v1', []);
    if (Array.isArray(saved) && saved.length > 50) {
      safeSetItem('saved_listings_v1', saved.slice(0, 50));
    }
    
    console.log('localStorage cleanup completed');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

/**
 * Get storage usage info (for debugging)
 * @returns {object} - Storage info
 */
export function getStorageInfo() {
  try {
    let total = 0;
    const items = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      total += size;
      items[key] = {
        size,
        sizeKB: (size / 1024).toFixed(2),
      };
    }
    
    return {
      total,
      totalKB: (total / 1024).toFixed(2),
      totalMB: (total / (1024 * 1024)).toFixed(2),
      itemCount: localStorage.length,
      items,
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return null;
  }
}
