/**
 * Environment configuration with validation
 * Validates required environment variables at build time
 */

const requiredEnvVars = ['NEXT_PUBLIC_API_URL'] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];

interface EnvConfig {
  NEXT_PUBLIC_API_URL: string;
  NODE_ENV: string;
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;
}

function validateEnv(): EnvConfig {
  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env.local file or deployment configuration.'
    );
  }

  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NODE_ENV: process.env.NODE_ENV || 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  };
}

export const env = validateEnv();

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
