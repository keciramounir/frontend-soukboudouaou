# 🔐 Role & Permission Matrix

**Last Updated:** 2026-01-23  
**Version:** 1.0.0

---

## 📊 Role Hierarchy

```
super_admin (Level 3)
    ↓
admin (Level 2)
    ↓
user (Level 1)
```

---

## 👥 Roles

### 1. **user** (Level 1)
**Description:** Standard marketplace user  
**Default Role:** All new signups

**Capabilities:**
- Create and manage own listings
- Save/favorite listings
- Create inquiries on listings
- View own profile and orders
- Access basic admin dashboard (own content only)

---

### 2. **admin** (Level 2)
**Description:** Content moderator  
**Access:** Requires promotion by super_admin

**Capabilities:**
- All user permissions
- View all listings
- Moderate listings (approve/reject)
- Cannot manage users or site settings

---

### 3. **super_admin** (Level 3)
**Description:** Full system administrator  
**Access:** Highest level, full control

**Capabilities:**
- All admin permissions
- Edit/delete any listing
- Manage all users (CRUD)
- Change user roles
- Manage site settings
- Access activity logs
- Full system configuration

---

## 🔑 Permission Matrix

| Permission | user | admin | super_admin |
|-----------|------|-------|-------------|
| **Listings** |
| `create_listing` | ✅ | ✅ | ✅ |
| `edit_own_listing` | ✅ | ✅ | ✅ |
| `delete_own_listing` | ✅ | ✅ | ✅ |
| `edit_any_listing` | ❌ | ❌ | ✅ |
| `delete_any_listing` | ❌ | ❌ | ✅ |
| `view_all_listings` | ❌ | ✅ | ✅ |
| `moderate_listings` | ❌ | ✅ | ✅ |
| **Users** |
| `view_profile` | ✅ | ✅ | ✅ |
| `edit_own_profile` | ✅ | ✅ | ✅ |
| `view_all_users` | ❌ | ❌ | ✅ |
| `create_user` | ❌ | ❌ | ✅ |
| `edit_any_user` | ❌ | ❌ | ✅ |
| `delete_user` | ❌ | ❌ | ✅ |
| `change_user_role` | ❌ | ❌ | ✅ |
| **Admin Panel** |
| `access_admin_panel` | ✅ | ✅ | ✅ |
| `view_dashboard` | ✅ | ✅ | ✅ |
| `view_activity_logs` | ❌ | ❌ | ✅ |
| **Settings** |
| `manage_site_settings` | ❌ | ❌ | ✅ |
| `manage_categories` | ❌ | ❌ | ✅ |
| `manage_hero_slides` | ❌ | ❌ | ✅ |
| `manage_moving_header` | ❌ | ❌ | ✅ |
| `manage_footer` | ❌ | ❌ | ✅ |
| `manage_logo` | ❌ | ❌ | ✅ |
| `manage_cta` | ❌ | ❌ | ✅ |
| `manage_call_centers` | ❌ | ❌ | ✅ |
| `manage_filtration` | ❌ | ❌ | ✅ |
| **Content** |
| `save_listings` | ✅ | ✅ | ✅ |
| `create_inquiries` | ✅ | ✅ | ✅ |
| `view_orders` | ✅ | ✅ | ✅ |

---

## 🛡️ Route Protection

### Public Routes
- `/` - Home
- `/auth` - Authentication
- `/auth/verify-email` - Email verification
- `/listing/:id` - Listing details
- `/saved` - Saved listings (public view)

### Protected Routes (User+)
- `/profile` - User profile
- `/settings` - User settings
- `/orders` - User orders
- `/create-listing` - Create listing
- `/edit-listing/:id` - Edit listing (own only for users)

### Admin Routes (`/admin/*`)
- `/admin` - Dashboard (all authenticated users)
- `/admin/my-listings` - Own listings (all)
- `/admin/my-account` - Account settings (all)
- `/admin/settings` - Admin settings (all)

### Super Admin Only Routes
- `/admin/listings` - All listings management
- `/admin/users` - User management
- `/admin/activity` - Activity logs
- `/admin/moving-header` - Moving header settings
- `/admin/hero-slides` - Hero slides management
- `/admin/categories` - Category management
- `/admin/filtration` - Filtration settings
- `/admin/demo` - Demo mode settings
- `/admin/call-centers` - Call center management

---

## 🔒 Permission Checks

### Listing Operations

**Edit Listing:**
```javascript
// User can edit own listing
canEditListing('user', listingUserId, currentUserId) // true if owner

// Super admin can edit any listing
canEditListing('super_admin', listingUserId, currentUserId) // always true
```

**Delete Listing:**
```javascript
// User can delete own listing
canDeleteListing('user', listingUserId, currentUserId) // true if owner

// Super admin can delete any listing
canDeleteListing('super_admin', listingUserId, currentUserId) // always true
```

### User Operations

**View Users:**
```javascript
hasPermission('user', 'view_all_users') // false
hasPermission('admin', 'view_all_users') // false
hasPermission('super_admin', 'view_all_users') // true
```

**Change Role:**
```javascript
hasPermission('super_admin', 'change_user_role') // true
// Only super_admin can change roles
```

---

## 🧪 Testing Roles

### Mock Users

**Super Admin:**
- Email: `imad@soukboudouaou.com`
- Password: `admin2025$`
- Role: `super_admin`

**Admin:**
- Email: `admin@test.com`
- Password: `admin123`
- Role: `admin`

**User:**
- Email: `user1@test.com`
- Password: `user123`
- Role: `user`

**User 2:**
- Email: `user2@test.com`
- Password: `user123`
- Role: `user`

---

## 📝 Implementation Notes

### Role Normalization
Roles are normalized to lowercase for comparison:
- `"ADMIN"` → `"admin"`
- `"super_admin"` → `"super_admin"`
- `"user"` → `"user"`

### Permission Checking
Use the permission utilities from `src/utils/permissions.js`:

```javascript
import { hasPermission, canEditListing, isSuperAdmin } from '../utils/permissions';

// Check permission
if (hasPermission(user.role, 'edit_any_listing')) {
  // Allow edit
}

// Check role
if (isSuperAdmin(user.role)) {
  // Show super admin features
}
```

### Route Protection
Routes are protected using `ProtectedRoute` component:

```jsx
<Route
  path="/admin/users"
  element={
    <ProtectedRoute requiredRole="super_admin">
      <UsersPage />
    </ProtectedRoute>
  }
/>
```

---

## 🔄 Role Promotion

### Current Implementation
- Roles are set during user creation
- Only super_admin can change roles
- Role changes are immediate (no approval needed in mock mode)

### Future Enhancements
- Role change approval workflow
- Role change audit logs
- Temporary role assignments
- Role expiration

---

## ⚠️ Security Considerations

1. **Never trust client-side role checks alone**
   - Always validate permissions on backend
   - Client-side checks are for UX only

2. **Role assignment**
   - Only super_admin can assign roles
   - Role changes should be logged

3. **Permission inheritance**
   - Higher roles inherit lower role permissions
   - Super admin has all permissions

4. **Default role**
   - New users default to `user` role
   - Explicit promotion required for admin/super_admin

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-01-23
