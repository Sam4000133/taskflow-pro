/**
 * Environment configuration
 * NEXT_PUBLIC_ variables are replaced at build time by Next.js
 */

interface EnvConfig {
  NEXT_PUBLIC_API_URL: string;
  NODE_ENV: string;
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;
}

function getEnvConfig(): EnvConfig {
  // Static access required for Next.js build-time replacement
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    NEXT_PUBLIC_API_URL: apiUrl,
    NODE_ENV: nodeEnv,
    IS_PRODUCTION: nodeEnv === 'production',
    IS_DEVELOPMENT: nodeEnv === 'development',
  };
}

export const env = getEnvConfig();

/**
 * Get the API URL with proper formatting
 */
export function getApiUrl(): string {
  const url = env.NEXT_PUBLIC_API_URL;
  // Remove trailing slash if present
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Check if we're in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if we're in a server environment
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}
