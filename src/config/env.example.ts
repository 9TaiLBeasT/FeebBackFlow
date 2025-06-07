import { z } from 'zod';

// Environment variable schema
export const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Email Configuration
  EMAIL_SERVICE: z.enum(['resend', 'sendgrid']),
  EMAIL_API_KEY: z.string().min(1),
  EMAIL_FROM_ADDRESS: z.string().email(),
  EMAIL_TEMPLATE_SURVEY_INVITE: z.string().optional(),
  EMAIL_TEMPLATE_REMINDER: z.string().optional(),
  EMAIL_TEMPLATE_NOTIFICATION: z.string().optional(),

  // OneSignal Configuration
  ONESIGNAL_APP_ID: z.string().min(1),
  ONESIGNAL_SAFARI_WEB_ID: z.string().min(1),
  ONESIGNAL_REST_API_KEY: z.string().min(1),

  // QR Code Configuration
  QR_SERVICE: z.enum(['qrserver', 'google-charts']).default('qrserver'),
  QR_API_KEY: z.string().optional(),

  // Database Configuration
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),

  // Authentication
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Storage Configuration
  STORAGE_BUCKET_NAME: z.string().min(1),
  STORAGE_REGION: z.string().min(1),
});

// Export environment variables type
export type Env = z.infer<typeof envSchema>;

// Function to validate environment variables
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment variables');
  }
}

// Example usage of environment variables with validation
export function getValidatedEnv(): Env {
  if (process.env.NODE_ENV === 'development') {
    // In development, warn about missing .env file
    try {
      require('fs').accessSync('.env');
    } catch (error) {
      console.warn('⚠️  No .env file found. Please copy .env.example to .env');
    }
  }

  return validateEnv();
} 