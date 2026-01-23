/**
 * Permission System - Role-based Access Control
 * 
 * Defines permissions for each role and provides helper functions
 * to check permissions throughout the application.
 */

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

export const PERMISSIONS = {
  // Listing permissions
  CREATE_LISTING: 'create_listing',
  EDIT_OWN_LISTING: 'edit_own_listing',
  DELETE_OWN_LISTING: 'delete_own_listing',
  EDIT_ANY_LISTING: 'edit_any_listing',
  DELETE_ANY_LISTING: 'delete_any_listing',
  VIEW_ALL_LISTINGS: 'view_all_listings',
  MODERATE_LISTINGS: 'moderate_listings',
  
  // User permissions
  VIEW_PROFILE: 'view_profile',
  EDIT_OWN_PROFILE: 'edit_own_profile',
  VIEW_ALL_USERS: 'view_all_users',
  CREATE_USER: 'create_user',
  EDIT_ANY_USER: 'edit_any_user',
  DELETE_USER: 'delete_user',
  CHANGE_USER_ROLE: 'change_user_role',
  
  // Admin panel permissions
  ACCESS_ADMIN_PANEL: 'access_admin_panel',
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ACTIVITY_LOGS: 'view_activity_logs',
  
  // Settings permissions
  MANAGE_SITE_SETTINGS: 'manage_site_settings',
  MANAGE_CATEGORIES: 'manage_categories',
  MANAGE_HERO_SLIDES: 'manage_hero_slides',
  MANAGE_MOVING_HEADER: 'manage_moving_header',
  MANAGE_FOOTER: 'manage_footer',
  MANAGE_LOGO: 'manage_logo',
  MANAGE_CTA: 'manage_cta',
  MANAGE_CALL_CENTERS: 'manage_call_centers',
  MANAGE_FILTRATION: 'manage_filtration',
  
  // Content permissions
  SAVE_LISTINGS: 'save_listings',
  CREATE_INQUIRIES: 'create_inquiries',
  VIEW_ORDERS: 'view_orders',
};

/**
 * Role-Permission Matrix
 * Maps each role to its allowed permissions
 */
const ROLE_PERMISSIONS = {
  [ROLES.USER]: [
    PERMISSIONS.CREATE_LISTING,
    PERMISSIONS.EDIT_OWN_LISTING,
    PERMISSIONS.DELETE_OWN_LISTING,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.ACCESS_ADMIN_PANEL,
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.SAVE_LISTINGS,
    PERMISSIONS.CREATE_INQUIRIES,
    PERMISSIONS.VIEW_ORDERS,
  ],
  
  [ROLES.ADMIN]: [
    // All user permissions
    ...ROLE_PERMISSIONS[ROLES.USER],
    // Plus admin permissions
    PERMISSIONS.VIEW_ALL_LISTINGS,
    PERMISSIONS.MODERATE_LISTINGS,
  ],
  
  [ROLES.SUPER_ADMIN]: [
    // All admin permissions
    ...(ROLE_PERMISSIONS[ROLES.ADMIN] || []),
    // Plus super admin permissions
    PERMISSIONS.EDIT_ANY_LISTING,
    PERMISSIONS.DELETE_ANY_LISTING,
    PERMISSIONS.VIEW_ALL_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_ANY_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.CHANGE_USER_ROLE,
    PERMISSIONS.VIEW_ACTIVITY_LOGS,
    PERMISSIONS.MANAGE_SITE_SETTINGS,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.MANAGE_HERO_SLIDES,
    PERMISSIONS.MANAGE_MOVING_HEADER,
    PERMISSIONS.MANAGE_FOOTER,
    PERMISSIONS.MANAGE_LOGO,
    PERMISSIONS.MANAGE_CTA,
    PERMISSIONS.MANAGE_CALL_CENTERS,
    PERMISSIONS.MANAGE_FILTRATION,
  ],
};

/**
 * Check if a user has a specific permission
 * @param {string} role - User role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  
  const normalizedRole = String(role).toLowerCase();
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  
  return permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function hasAnyPermission(role, permissions) {
  if (!permissions || permissions.length === 0) return false;
  return permissions.some(perm => hasPermission(role, perm));
}

/**
 * Check if user has all of the specified permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean}
 */
export function hasAllPermissions(role, permissions) {
  if (!permissions || permissions.length === 0) return true;
  return permissions.every(perm => hasPermission(role, perm));
}

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {string[]}
 */
export function getRolePermissions(role) {
  if (!role) return [];
  const normalizedRole = String(role).toLowerCase();
  return ROLE_PERMISSIONS[normalizedRole] || [];
}

/**
 * Check if user can edit a listing
 * @param {string} role - User role
 * @param {string} listingUserId - ID of user who created the listing
 * @param {string} currentUserId - Current user ID
 * @returns {boolean}
 */
export function canEditListing(role, listingUserId, currentUserId) {
  if (!role || !listingUserId || !currentUserId) return false;
  
  // Super admin can edit any listing
  if (hasPermission(role, PERMISSIONS.EDIT_ANY_LISTING)) return true;
  
  // User can edit own listing
  if (hasPermission(role, PERMISSIONS.EDIT_OWN_LISTING)) {
    return String(listingUserId) === String(currentUserId);
  }
  
  return false;
}

/**
 * Check if user can delete a listing
 * @param {string} role - User role
 * @param {string} listingUserId - ID of user who created the listing
 * @param {string} currentUserId - Current user ID
 * @returns {boolean}
 */
export function canDeleteListing(role, listingUserId, currentUserId) {
  if (!role || !listingUserId || !currentUserId) return false;
  
  // Super admin can delete any listing
  if (hasPermission(role, PERMISSIONS.DELETE_ANY_LISTING)) return true;
  
  // User can delete own listing
  if (hasPermission(role, PERMISSIONS.DELETE_OWN_LISTING)) {
    return String(listingUserId) === String(currentUserId);
  }
  
  return false;
}

/**
 * Check if user is admin or super admin
 * @param {string} role - User role
 * @returns {boolean}
 */
export function isAdmin(role) {
  if (!role) return false;
  const normalizedRole = String(role).toLowerCase();
  return normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.SUPER_ADMIN;
}

/**
 * Check if user is super admin
 * @param {string} role - User role
 * @returns {boolean}
 */
export function isSuperAdmin(role) {
  if (!role) return false;
  const normalizedRole = String(role).toLowerCase();
  return normalizedRole === ROLES.SUPER_ADMIN;
}

/**
 * Check if user can access admin panel
 * @param {string} role - User role
 * @returns {boolean}
 */
export function canAccessAdminPanel(role) {
  return hasPermission(role, PERMISSIONS.ACCESS_ADMIN_PANEL);
}

/**
 * Get role hierarchy level (higher = more permissions)
 * @param {string} role - User role
 * @returns {number}
 */
export function getRoleLevel(role) {
  if (!role) return 0;
  const normalizedRole = String(role).toLowerCase();
  
  switch (normalizedRole) {
    case ROLES.SUPER_ADMIN:
      return 3;
    case ROLES.ADMIN:
      return 2;
    case ROLES.USER:
      return 1;
    default:
      return 0;
  }
}

/**
 * Check if role1 has higher or equal level than role2
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {boolean}
 */
export function hasHigherOrEqualRole(role1, role2) {
  return getRoleLevel(role1) >= getRoleLevel(role2);
}
