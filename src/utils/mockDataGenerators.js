/**
 * Mock Data Generators
 * 
 * Generates realistic mock data for users, listings, orders, and activities.
 * Uses timestamps and realistic data structures.
 */

// Algerian wilayas (provinces)
const WILAYAS = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Djelfa',
  'Sétif', 'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'Tiaret', 'Béjaïa',
  'Tlemcen', 'Bordj Bou Arréridj', 'Béchar', 'Boumerdès', 'El Tarf',
  'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras',
  'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
  'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar',
  'Ouled Djellal', 'Béni Abbès', 'In Salah', 'In Guezzam',
  'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa',
];

// Categories
const CATEGORIES = [
  'Poulet', 'Dinde', 'Œufs', 'Légumes', 'Fruits', 'Céréales',
  'Lait', 'Fromage', 'Miel', 'Huile d\'olive', 'Dattes', 'Amandes',
];

// First names (Algerian)
const FIRST_NAMES = [
  'Ahmed', 'Mohamed', 'Ali', 'Omar', 'Youssef', 'Karim', 'Said',
  'Fatima', 'Aicha', 'Khadija', 'Zineb', 'Salma', 'Nour', 'Lina',
  'Imad', 'Bilal', 'Amine', 'Yacine', 'Nassim', 'Rachid',
];

// Last names (Algerian)
const LAST_NAMES = [
  'Benali', 'Bensaid', 'Bouaziz', 'Boukhalfa', 'Boumediene', 'Bouhafs',
  'Bouazza', 'Boukhari', 'Bouazzaoui', 'Bouazza', 'Bouazza', 'Bouazza',
  'Bouazza', 'Bouazza', 'Bouazza', 'Bouazza', 'Bouazza', 'Bouazza',
];

// Phone number prefixes (Algerian)
const PHONE_PREFIXES = ['0550', '0551', '0552', '0553', '0554', '0555', '0556', '0557', '0558', '0559'];

/**
 * Generate a random UUID
 */
function generateId() {
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Generate a random phone number
 */
function generatePhone() {
  const prefix = PHONE_PREFIXES[Math.floor(Math.random() * PHONE_PREFIXES.length)];
  const number = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix} ${number.toString().slice(0, 2)} ${number.toString().slice(2, 4)} ${number.toString().slice(4, 6)}`;
}

/**
 * Generate a random email
 */
function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
  return `${username}@${domain}`;
}

/**
 * Generate a random date within the last N days
 */
function randomDate(daysAgo = 30) {
  const now = Date.now();
  const days = Math.floor(Math.random() * daysAgo);
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  const date = new Date(now - (days * 24 * 60 * 60 * 1000) - (hours * 60 * 60 * 1000) - (minutes * 60 * 1000));
  return date.toISOString();
}

/**
 * Generate a random price
 */
function generatePrice(min = 100, max = 5000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate mock users
 * @param {number} count - Number of users to generate
 * @param {object} options - Options for generation
 * @returns {array} Array of user objects
 */
export function generateUsers(count = 10, options = {}) {
  const users = [];
  const roles = options.roles || ['user', 'user', 'user', 'admin', 'super_admin']; // Weighted
  
  for (let i = 0; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const fullName = `${firstName} ${lastName}`;
    const email = generateEmail(firstName, lastName);
    const username = `${firstName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
    const wilaya = WILAYAS[Math.floor(Math.random() * WILAYAS.length)];
    
    const user = {
      _id: generateId(),
      id: generateId(),
      username,
      email,
      fullName,
      phone: generatePhone(),
      wilaya,
      role: roles[Math.floor(Math.random() * roles.length)],
      verified: Math.random() > 0.2, // 80% verified
      isActive: Math.random() > 0.1, // 90% active
      createdAt: randomDate(365), // Within last year
      password: 'user123', // Default password for mock users
    };
    
    users.push(user);
  }
  
  return users;
}

/**
 * Generate mock listings
 * @param {number} count - Number of listings to generate
 * @param {array} userIds - Array of user IDs to assign as creators
 * @returns {array} Array of listing objects
 */
export function generateListings(count = 20, userIds = []) {
  const listings = [];
  
  // Use string paths for images - will be resolved by the calling code
  // The actual image imports are handled in dataService.js
  const chickenImg = '/src/assets/chicken.png';
  const turkeyImg = '/src/assets/turkey.png';
  
  for (let i = 0; i < count; i++) {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const title = `${category} - Lot de ${Math.floor(Math.random() * 50) + 10} ${category.toLowerCase()}`;
    const price = generatePrice(500, 3000);
    const wilaya = WILAYAS[Math.floor(Math.random() * WILAYAS.length)];
    const createdBy = userIds.length > 0 
      ? userIds[Math.floor(Math.random() * userIds.length)]
      : generateId();
    
    // Determine image based on category
    let images = [];
    if (category.toLowerCase().includes('dinde') || category.toLowerCase().includes('turkey')) {
      images = [turkeyImg];
    } else if (category.toLowerCase().includes('poulet') || category.toLowerCase().includes('chicken')) {
      images = [chickenImg];
    } else {
      images = [chickenImg]; // Default
    }
    
    const listing = {
      id: generateId(),
      _id: generateId(),
      title,
      description: `Lot de ${category.toLowerCase()} de qualité supérieure, élevé dans les meilleures conditions. Disponible pour livraison ou retrait sur place.`,
      price,
      pricePerKg: price,
      unit: 'kg',
      category,
      images,
      createdBy,
      createdAt: randomDate(60), // Within last 60 days
      updatedAt: randomDate(30),
      status: Math.random() > 0.1 ? 'published' : 'draft', // 90% published
      wilaya,
      commune: `Commune ${Math.floor(Math.random() * 20) + 1}`,
      listingDate: randomDate(30),
      breedingDate: randomDate(90),
      preparationDate: randomDate(7),
      trainingType: Math.random() > 0.5 ? 'Traditionnel' : 'Moderne',
      medicationsUsed: Math.random() > 0.7 ? 'Aucun' : 'Vaccins standards',
      vaccinated: Math.random() > 0.3, // 70% vaccinated
      views: Math.floor(Math.random() * 500),
      inquiries: Math.floor(Math.random() * 20),
      quantity: Math.floor(Math.random() * 100) + 10,
      delivery: Math.random() > 0.4, // 60% offer delivery
      averageWeight: Math.floor(Math.random() * 5) + 1,
    };
    
    listings.push(listing);
  }
  
  return listings;
}

/**
 * Generate mock orders
 * @param {number} count - Number of orders to generate
 * @param {array} userIds - Array of user IDs
 * @param {array} listingIds - Array of listing IDs
 * @returns {array} Array of order objects
 */
export function generateOrders(count = 15, userIds = [], listingIds = []) {
  const orders = [];
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  for (let i = 0; i < count; i++) {
    const userId = userIds.length > 0 
      ? userIds[Math.floor(Math.random() * userIds.length)]
      : generateId();
    const listingId = listingIds.length > 0
      ? listingIds[Math.floor(Math.random() * listingIds.length)]
      : generateId();
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;
    const price = generatePrice(500, 3000);
    
    const order = {
      id: generateId(),
      _id: generateId(),
      userId,
      listingId,
      quantity,
      price,
      total: quantity * price,
      status,
      createdAt: randomDate(90),
      updatedAt: randomDate(30),
      shippingAddress: {
        wilaya: WILAYAS[Math.floor(Math.random() * WILAYAS.length)],
        commune: `Commune ${Math.floor(Math.random() * 20) + 1}`,
        street: `Rue ${Math.floor(Math.random() * 100) + 1}`,
      },
    };
    
    orders.push(order);
  }
  
  return orders;
}

/**
 * Generate mock inquiries
 * @param {number} count - Number of inquiries to generate
 * @param {array} userIds - Array of user IDs
 * @param {array} listingIds - Array of listing IDs
 * @returns {array} Array of inquiry objects
 */
export function generateInquiries(count = 25, userIds = [], listingIds = []) {
  const inquiries = [];
  
  for (let i = 0; i < count; i++) {
    const userId = userIds.length > 0 
      ? userIds[Math.floor(Math.random() * userIds.length)]
      : null; // Some inquiries from non-users
    const listingId = listingIds.length > 0
      ? listingIds[Math.floor(Math.random() * listingIds.length)]
      : generateId();
    
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    
    const inquiry = {
      id: generateId(),
      _id: generateId(),
      listingId,
      userId,
      name: `${firstName} ${lastName}`,
      email: generateEmail(firstName, lastName),
      phone: generatePhone(),
      message: `Bonjour, je suis intéressé par cette annonce. Pouvez-vous me donner plus d'informations ?`,
      createdAt: randomDate(30),
      updatedAt: randomDate(30),
    };
    
    inquiries.push(inquiry);
  }
  
  return inquiries;
}

/**
 * Generate mock activity logs
 * @param {number} count - Number of activity logs to generate
 * @returns {array} Array of activity objects
 */
export function generateActivityLogs(count = 50) {
  const activities = [];
  const actions = ['view', 'click', 'search', 'create', 'update', 'delete', 'login', 'logout'];
  const resources = ['listing', 'user', 'category', 'settings', 'page'];
  
  for (let i = 0; i < count; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const resourceId = generateId();
    
    const activity = {
      id: generateId(),
      _id: generateId(),
      action,
      resource,
      resourceId,
      userId: Math.random() > 0.3 ? generateId() : null, // 70% have userId
      ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      createdAt: randomDate(7), // Within last 7 days
    };
    
    activities.push(activity);
  }
  
  return activities;
}

/**
 * Generate complete mock dataset
 * @param {object} options - Generation options
 * @returns {object} Complete dataset
 */
export function generateMockDataset(options = {}) {
  const {
    userCount = 20,
    listingCount = 50,
    orderCount = 30,
    inquiryCount = 40,
    activityCount = 100,
  } = options;
  
  // Generate users first
  const users = generateUsers(userCount);
  const userIds = users.map(u => u._id || u.id);
  
  // Generate listings
  const listings = generateListings(listingCount, userIds);
  const listingIds = listings.map(l => l.id || l._id);
  
  // Generate orders
  const orders = generateOrders(orderCount, userIds, listingIds);
  
  // Generate inquiries
  const inquiries = generateInquiries(inquiryCount, userIds, listingIds);
  
  // Generate activity logs
  const activities = generateActivityLogs(activityCount);
  
  return {
    users,
    listings,
    orders,
    inquiries,
    activities,
  };
}
