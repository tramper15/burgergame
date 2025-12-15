/**
 * Environment detection utilities
 */

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development'
}

export const isProduction = (): boolean => {
  return import.meta.env.PROD || import.meta.env.MODE === 'production'
}

export const isTest = (): boolean => {
  return import.meta.env.MODE === 'test'
}
