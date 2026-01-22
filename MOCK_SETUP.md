# Mock Frontend Setup

This frontend is configured with a complete mock setup for demonstration purposes.

## Mock Authentication

**Login Credentials:**
- **Email**: `imad@soukboudouaou.com`
- **Password**: `admin2025$`

The mock login is automatically enabled in development mode. When you log in with these credentials, you'll be authenticated as:
- **Name**: Imad Soukboudouaou
- **Email**: imad@soukboudouaou.com
- **Phone**: 0550 12 34 56
- **Role**: user

## Mock Listings

The mock setup includes listings in two categories:

### 1. **Poulet** (Chicken)
- Uses icon: `chicken.png` from assets folder
- Multiple listings available

### 2. **Dinde** (Turkey)
- Uses icon: `chicken2.png` from assets folder
- Multiple listings available

## Features

✅ **Mock Login**: Works with the credentials above
✅ **Mock Listings**: View and browse listings (Poulet and Dinde only)
✅ **Create Listing**: Create new listings that are saved to localStorage
✅ **My Listings**: View your created listings
✅ **Icons**: Uses assets from `src/assets/` folder

## How It Works

1. **Mock Mode**: Automatically enabled in development mode
2. **Data Storage**: Mock data is stored in localStorage
3. **Images**: Uses imported assets (`chicken.png` and `chicken2.png`)
4. **Authentication**: Mock login bypasses API and uses local credentials

## Enabling/Disabling Mock Mode

### Enable Mock Mode
```javascript
localStorage.setItem("use_mock", "1");
localStorage.setItem("use_mock_listings", "1");
```

### Disable Mock Mode
```javascript
localStorage.setItem("use_mock", "0");
localStorage.setItem("use_mock_listings", "0");
```

Or set environment variables:
```bash
VITE_USE_MOCK=1
VITE_USE_MOCK_LISTINGS=1
```

## Creating Listings

When mock mode is enabled:
1. Go to "Create Listing" page
2. Fill in the form
3. Select category: "Poulet" or "Dinde"
4. Submit the form
5. The listing will be saved to localStorage and appear in your listings

## Notes

- All mock data persists in browser localStorage
- To reset mock data, clear localStorage: `localStorage.clear()`
- Mock mode is automatically enabled in development
- In production, mock mode must be explicitly enabled via environment variables
