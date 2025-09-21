export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  appName: import.meta.env.VITE_APP_NAME || 'Hotel Booking FE',
  enableMock: String(import.meta.env.VITE_ENABLE_MOCK).toLowerCase() === 'true'
}

export function getEnv(key, fallback = '') {
  const value = import.meta.env[key]
  return value ?? fallback
}

