# Mock Setup Verification Guide

This document verifies that all features work correctly in mock mode.

## ✅ Image Assets

**Categories & Images:**
- **Poulet** → Uses `chicken.png` from assets folder
- **Dinde** → Uses `turkey.png` from assets folder

**Image Handling:**
- ✅ Default images use correct assets based on category
- ✅ Uploaded images create object URLs
- ✅ Fallback images work correctly
- ✅ Images display in listings and listing details

## ✅ Translations

**Translation System:**
- ✅ French (fr) and Arabic (ar) translations work
- ✅ Language switching works
- ✅ RTL support for Arabic
- ✅ All UI elements translated
- ✅ Category labels translated (Poulet/Dinde)

**Translation Keys:**
- `cat_chicken` → "Poulet" (fr) / "دجاج" (ar)
- `cat_turkey` → "Dinde" (fr) / "ديك رومي" (ar)

## ✅ Theme Context

**Theme Features:**
- ✅ Dark mode toggle works
- ✅ Theme persists in localStorage
- ✅ CSS variables update correctly
- ✅ All components respect theme
- ✅ Smooth transitions between themes

## ✅ Authentication

### Login
- ✅ Default credentials: `imad@soukboudouaou.com` / `admin2025$`
- ✅ Signup users can login
- ✅ Error messages work
- ✅ Session persists

### Signup
- ✅ Creates new user in localStorage
- ✅ Validates unique email/username
- ✅ Auto-login after signup
- ✅ All fields work

### Password Reset
- ✅ Forgot password sends mock OTP: `123456`
- ✅ Verify OTP accepts `123456`
- ✅ Reset password updates localStorage
- ✅ All steps work correctly

## ✅ Listings

### View Listings
- ✅ Loads from localStorage
- ✅ Pagination works
- ✅ Filtering works
- ✅ Category filtering (Poulet/Dinde only)
- ✅ Images display correctly

### Create Listing
- ✅ Form validation works
- ✅ Image upload creates object URLs
- ✅ Falls back to category icon if no image
- ✅ Saves to localStorage
- ✅ Appears in "My Listings"
- ✅ All fields save correctly

### Edit/Delete Listing
- ✅ Edit updates localStorage
- ✅ Delete removes from localStorage
- ✅ Changes persist

### Listing Details
- ✅ Shows full information
- ✅ Images display with fallbacks
- ✅ All fields display correctly

## ✅ Admin Panel

### Access
- ✅ Enable admin mode: `localStorage.setItem("mock_admin_mode", "1")`
- ✅ Logout and login again
- ✅ Default user becomes `super_admin`

### Features
- ✅ Dashboard shows stats
- ✅ All Listings: view and manage
- ✅ Users: view and manage (includes signup users)
- ✅ Activity: shows mock audit clicks
- ✅ Settings: all work with localStorage
- ✅ Demo Settings: toggle mock modes

### User Management
- ✅ View all users
- ✅ Create users
- ✅ Update users
- ✅ Delete users
- ✅ Filter by role/status
- ✅ Search users

## ✅ Categories

**Only Two Categories:**
- ✅ Poulet (Chicken) - visible
- ✅ Dinde (Turkey) - visible
- ✅ Other categories hidden/removed
- ✅ Category dropdowns show only these two
- ✅ Category filtering works

## Quick Test Checklist

1. **Images**
   - [ ] View listings - see chicken.png for Poulet
   - [ ] View listings - see turkey.png for Dinde
   - [ ] Create listing without image - uses category icon
   - [ ] Create listing with image - shows uploaded image

2. **Translations**
   - [ ] Switch to French - all text in French
   - [ ] Switch to Arabic - all text in Arabic, RTL layout
   - [ ] Category labels translate correctly

3. **Theme**
   - [ ] Toggle dark mode - theme changes
   - [ ] Refresh page - theme persists
   - [ ] All components respect theme

4. **Authentication**
   - [ ] Login with default credentials
   - [ ] Signup new user
   - [ ] Login with signup user
   - [ ] Forgot password flow (OTP: 123456)
   - [ ] Reset password

5. **Listings**
   - [ ] View all listings
   - [ ] Filter by Poulet
   - [ ] Filter by Dinde
   - [ ] Create listing
   - [ ] Edit listing
   - [ ] Delete listing
   - [ ] View listing details

6. **Admin Panel**
   - [ ] Enable admin mode
   - [ ] Access admin dashboard
   - [ ] View all listings
   - [ ] Manage users
   - [ ] View activity
   - [ ] Access settings

## Reset Mock Data

To reset all mock data:
```javascript
localStorage.clear();
// Then refresh the page
```

## Enable Mock Mode

Mock mode is enabled by default in development. To explicitly enable:
```javascript
localStorage.setItem("use_mock", "1");
localStorage.setItem("use_mock_listings", "1");
localStorage.setItem("use_mock_users", "1");
```

## Enable Admin Mode

```javascript
localStorage.setItem("mock_admin_mode", "1");
// Logout and login again with imad@soukboudouaou.com
```
