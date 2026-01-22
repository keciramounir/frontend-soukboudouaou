# Complete Mock Setup Guide

This guide explains how the complete mock system works for the frontend.

## Authentication (All Working)

### Login
- **Default Credentials**: 
  - Email: `imad@soukboudouaou.com`
  - Password: `admin2025$`
- **Signup Users**: Can login with email/username and password they signed up with
- Mock login checks localStorage for signup users

### Signup
- Creates new user in localStorage (`mock_users`)
- Auto-login after successful signup
- Validates unique email/username

### Password Reset
- **Forgot Password**: 
  - Enter email
  - Mock OTP: `123456` (always works)
  - Message shows "Code OTP envoyé (mock: 123456)"
- **Verify OTP**: 
  - Enter OTP: `123456`
  - Verifies and stores verification token
- **Reset Password**: 
  - Enter new password
  - Updates password in localStorage for signup users
  - Works for default user too (but password not stored)

## Listings (All Working)

### View Listings
- Loads from `mock_listings` in localStorage
- Falls back to `listings.json` if empty
- Images use assets folder icons:
  - Poulet → `chicken.png`
  - Dinde → `chicken2.png`

### Create Listing
- Saves to localStorage
- Handles image files (creates object URLs)
- Falls back to category icon if no image
- Appears in "My Listings" immediately

### Edit/Delete Listing
- Updates localStorage
- Changes persist across page reloads

### Listing Details
- Shows full listing information
- Images display correctly with fallbacks
- All fields work properly

## Admin Panel (All Working)

### Enable Admin Mode
To access admin panel with default user:
```javascript
localStorage.setItem("mock_admin_mode", "1");
// Then logout and login again with imad@soukboudouaou.com / admin2025$
```

### Admin Features
- **Dashboard**: Shows stats from mock data
- **All Listings**: View and manage all listings
- **Users**: View and manage users (includes signup users)
- **Activity**: Shows mock audit clicks
- **Settings**: All settings work with localStorage

### Admin Users Management
- View all users (default + signup users)
- Create new users
- Update user details
- Delete users
- Filter by role, active status, search

## Image Handling

### Listing Images
1. **User Upload**: Creates object URL from File
2. **No Upload**: Uses default category icon from assets
3. **Fallback**: SVG placeholder if image fails

### Image Sources
- `/src/assets/chicken.png` - Poulet category
- `/src/assets/chicken2.png` - Dinde category
- Object URLs for uploaded images
- SVG placeholders as final fallback

## Mock Data Storage

All mock data is stored in localStorage:

- `mock_users` - Signup users
- `mock_listings` - All listings
- `mock_my_listings` - User's listings
- `mock_admin_users` - Admin users data
- `mock_inquiries` - User inquiries
- `mock_otp_*` - Password reset OTPs
- `use_mock` - Mock mode toggle
- `use_mock_listings` - Listings mock toggle
- `use_mock_users` - Users mock toggle
- `mock_admin_mode` - Admin mode for default user

## Enable/Disable Mock Mode

### Enable All Mock Features
```javascript
localStorage.setItem("use_mock", "1");
localStorage.setItem("use_mock_listings", "1");
localStorage.setItem("use_mock_users", "1");
```

### Disable Mock Mode
```javascript
localStorage.setItem("use_mock", "0");
localStorage.setItem("use_mock_listings", "0");
localStorage.setItem("use_mock_users", "0");
```

### Enable Admin Mode
```javascript
localStorage.setItem("mock_admin_mode", "1");
```

## Testing Checklist

✅ **Authentication**
- [x] Login with default credentials
- [x] Login with signup user
- [x] Signup new user
- [x] Forgot password flow
- [x] Verify OTP
- [x] Reset password
- [x] Logout

✅ **Listings**
- [x] View all listings
- [x] View listing details
- [x] Create listing with image
- [x] Create listing without image
- [x] Edit listing
- [x] Delete listing
- [x] My listings page

✅ **Admin Panel**
- [x] Access admin dashboard
- [x] View all listings
- [x] Manage listings (status, etc.)
- [x] View users
- [x] Create/update/delete users
- [x] View activity
- [x] Settings pages

✅ **Images**
- [x] Category icons display
- [x] Uploaded images work
- [x] Fallback images work
- [x] Image errors handled

## Quick Start

1. **Enable Mock Mode** (automatic in dev):
   - Mock is enabled by default in development

2. **Login**:
   - Email: `imad@soukboudouaou.com`
   - Password: `admin2025$`

3. **Enable Admin** (optional):
   ```javascript
   localStorage.setItem("mock_admin_mode", "1");
   // Logout and login again
   ```

4. **Test Features**:
   - Create listings
   - Signup new users
   - Test password reset
   - Access admin panel

## Notes

- All data persists in localStorage
- Clear localStorage to reset: `localStorage.clear()`
- Mock mode is automatic in development
- In production, set environment variables to enable mock
