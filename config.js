// Expense Categories with icons and subcategories
const EXPENSE_CATEGORIES = {
  FOOD_DRINKS: {
    icon: "🍽️",
    name: "Food & Drinks",
    subcategories: [
      "Groceries",
      "Restaurant",
      "Coffee",
      "Food Delivery",
      "Snacks",
      "Dinner",
    ],
  },
  HOME: {
    icon: "🏠",
    name: "Home",
    subcategories: ["Rent", "Utilities", "Maintenance", "Supplies"],
  },
  TRANSPORTATION: {
    icon: "🚗",
    name: "Transportation",
    subcategories: ["Fuel", "Parking", "Public Transport", "Cab"],
  },
  SHOPPING: {
    icon: "🛍️",
    name: "Shopping",
    subcategories: ["Clothing", "Electronics", "Household"],
  },
  ENTERTAINMENT: {
    icon: "🎭",
    name: "Entertainment",
    subcategories: ["Movies", "Games", "Events", "Sports"],
  },
  TRAVEL: {
    icon: "✈️",
    name: "Travel",
    subcategories: ["Flights", "Hotels", "Sightseeing", "Transport"],
  },
  HEALTH: {
    icon: "⚕️",
    name: "Health",
    subcategories: ["Medical", "Pharmacy", "Fitness"],
  },
  OTHERS: {
    icon: "📦",
    name: "Others",
    subcategories: ["Miscellaneous", "Gifts", "Charity"],
  },
};

// Split Methods
const SPLIT_METHODS = {
  EQUAL: "equal",
  PERCENTAGE: "percentage",
  EXACT: "exact",
  SHARES: "shares",
  ADJUSTMENT: "adjustment",
};

// Default Group Settings
const DEFAULT_GROUP = {
  id: "default",
  name: "Default Group",
  description: "Default expense group",
  category: "HOME",
  members: [], // Will be populated from existing members
  expenses: [], // Will store group expenses
  created_at: new Date().toISOString(),
};

// Local Storage Keys
const STORAGE_KEYS = {
  GROUPS: "groups",
  BALANCES: "balances",
  HISTORY: "historyData",
  USER_SETTINGS: "userSettings",
  CATEGORIES: "customCategories",
};

// Members Configuration
const MEMBERS = [
  {
    id: "rushit",
    name: "Rushit",
    avatar: "👨",
    defaultShare: 1,
  },
  {
    id: "jeet",
    name: "Jeet",
    avatar: "👨",
    defaultShare: 1,
  },
  {
    id: "charmi",
    name: "Charmi",
    avatar: "👩",
    defaultShare: 1,
  },
  {
    id: "darshan",
    name: "Darshan",
    avatar: "👨",
    defaultShare: 1,
  },
  {
    id: "drashti",
    name: "Drashti",
    avatar: "👩",
    defaultShare: 1,
  },
  {
    id: "janki",
    name: "Janki",
    avatar: "👩",
    defaultShare: 1,
  },
  {
    id: "akshay",
    name: "Akshay",
    avatar: "👨",
    defaultShare: 1,
  },
  {
    id: "raj",
    name: "Raj",
    avatar: "👨",
    defaultShare: 1,
  },
  {
    id: "sujal",
    name: "Sujal",
    avatar: "👨",
    defaultShare: 1,
  },
  {
    id: "hardik",
    name: "Hardik",
    avatar: "👨",
    defaultShare: 1,
  },
];

// Export all constants
window.APP_CONFIG = {
  EXPENSE_CATEGORIES,
  SPLIT_METHODS,
  DEFAULT_GROUP,
  STORAGE_KEYS,
  MEMBERS,
};
