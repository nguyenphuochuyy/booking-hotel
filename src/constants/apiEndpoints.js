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

  // Services
  SERVICES: {
    LIST: '/services',
    DETAIL: '/services/:id',
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

  // General
  GENERAL: {
    CONTACT: '/contact',
    NEWSLETTER: '/newsletter/subscribe',
    UPLOAD: '/upload',
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
  GENERAL
} = API_ENDPOINTS
