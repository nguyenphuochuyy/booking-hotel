// API Endpoints Constants
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    GOOGLE_LOGIN: '/auth/google',
    FACEBOOK_LOGIN: '/auth/facebook',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/update-profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // User Management
  USER: {
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/avatar',
    BOOKING_HISTORY: '/users/bookings',
    CANCEL_BOOKING: '/users/bookings/:id/cancel',
  },

  // Hotels & Rooms
  HOTELS: {
    LIST: '/hotels',
    DETAIL: '/hotels/:id',
    ROOMS: '/hotels/:id/rooms',
    SEARCH: '/hotels/search',
    FEATURED: '/hotels/featured',
  },

  // Rooms
  ROOMS: {
    LIST: '/rooms',
    DETAIL: '/rooms/:id',
    AVAILABILITY: '/rooms/:id/availability',
    BOOK: '/rooms/:id/book',
  },

  // Bookings
  BOOKINGS: {
    CREATE: '/bookings',
    LIST: '/bookings',
    DETAIL: '/bookings/:id',
    CANCEL: '/bookings/:id/cancel',
    CONFIRM: '/bookings/:id/confirm',
  },
  WALK_IN: {
    CREATE_USER: '/users/quick-create',
  },
  // Services
  SERVICES: {
    GET_SERVICES: '/services',
    GET_SERVICE_BY_ID: (id) => `/services/${id}`,
    CREATE_SERVICE: '/services',
    UPDATE_SERVICE: (id) => `/services/${id}`,
    DELETE_SERVICE: (id) => `/services/${id}`,
    CATEGORIES: '/services/categories',
  },

  // Reviews
  REVIEWS: {
    LIST: '/reviews',
    CREATE: '/reviews',
    UPDATE: '/reviews/:id',
    DELETE: '/reviews/:id',
    BY_HOTEL: '/hotels/:id/reviews',
  },

  // Payments
  PAYMENTS: {
    CREATE: '/payments',
    VERIFY: '/payments/verify',
    METHODS: '/payments/methods',
    HISTORY: '/payments/history',
  },

  // Posts/News
  POSTS: {
    GET_POSTS: '/posts',
    GET_POST_BY_ID: (id) => `/posts/${id}`,
    GET_POST_BY_SLUG: (slug) => `/posts/slug/${slug}`,
    CREATE_POST: '/posts',
    UPDATE_POST: (id) => `/posts/${id}`,
    DELETE_POST: (id) => `/posts/${id}`,
  },

  // Categories
  CATEGORIES: {
    GET_CATEGORIES: '/categories',
    GET_CATEGORY_BY_ID: (id) => `/categories/${id}`,
    GET_CATEGORY_BY_SLUG: (slug) => `/categories/slug/${slug}`,
    CREATE_CATEGORY: '/categories',
    UPDATE_CATEGORY: (id) => `/categories/${id}`,
    DELETE_CATEGORY: (id) => `/categories/${id}`,
  },

  // General
  GENERAL: {
    CONTACT: '/contact',
    NEWSLETTER: '/newsletter/subscribe',
    UPLOAD: '/upload',
  },

  // Admin APIs
  ADMIN: {
    // User Management
    USERS: {
      LIST: '/users',
      DETAIL: '/users/:id',
      CREATE: '/users',
      UPDATE: '/users/:id',
      DELETE: '/users/:id',
      SEARCH: '/users/search/email',
    },
    // Hotel Management
    HOTELS: {
      LIST: '/hotels',
      DETAIL: '/hotels/:id',
      CREATE: '/hotels',
      UPDATE: '/hotels/:id',
      DELETE: '/hotels/:id',
    },
    // Room Type Management
    ROOM_TYPES: {
      LIST: '/room-types',
      DETAIL: '/room-types/:id',
      CREATE: '/room-types',
      UPDATE: '/room-types/:id',
      DELETE: '/room-types/:id',
    },
    // Room Management
    ROOMS: {
      LIST: '/rooms',
      DETAIL: '/rooms/:id',
      CREATE: '/rooms',
      UPDATE: '/rooms/:id',
      DELETE: '/rooms/:id',
    },
    // Room Price Management
    ROOM_PRICES: {
      LIST: '/room-prices',
      CREATE: '/room-prices',
      UPDATE: '/room-prices/:id',
      DELETE: '/room-prices/:id',
    },
    // Service Management
    SERVICES: {
      LIST: '/services',
      DETAIL: '/services/:id',
      CREATE: '/services',
      UPDATE: '/services/:id',
      DELETE: '/services/:id',
    },
    // Promotion Management
    PROMOTIONS: {
      LIST: '/promotions',
      DETAIL: '/promotions/:id',
      CREATE: '/promotions',
      UPDATE: '/promotions/:id',
      DELETE: '/promotions/:id',
    },
    // Post Management
    POSTS: {
      LIST: '/posts',
      DETAIL: '/posts/:id',
      CREATE: '/posts',
      UPDATE: '/posts/:id',
      DELETE: '/posts/:id',
    },
    // Category Management
    CATEGORIES: {
      LIST: '/categories',
      DETAIL: '/categories/:id',
      CREATE: '/categories',
      UPDATE: '/categories/:id',
      DELETE: '/categories/:id',
    },
  }
}

// Helper function to replace parameters in URLs
export const buildUrl = (endpoint, params = {}) => {
  let url = endpoint
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key])
  })
  return url
}

// Export individual endpoint groups for easier imports
export const {
  AUTH,
  USER,
  HOTELS,
  ROOMS,
  BOOKINGS,
  SERVICES,
  REVIEWS,
  PAYMENTS,
  POSTS,
  CATEGORIES,
  GENERAL,
  ADMIN
} = API_ENDPOINTS
