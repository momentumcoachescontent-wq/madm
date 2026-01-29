export type CloudflareBindings = {
  DB: D1Database
  IMAGES_BUCKET: R2Bucket
  STRIPE_SECRET_KEY: string
  STRIPE_PUBLISHABLE_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  PAYPAL_CLIENT_ID: string
  PAYPAL_CLIENT_SECRET: string
  PAYPAL_MODE: string
  PAYPAL_WEBHOOK_ID: string
  RESEND_API_KEY: string
  FROM_EMAIL: string
}
