# Implementation Plan

- [x] 1. Set up Stripe integration and database schema

  - ✅ Install Stripe SDK and configure environment variables
  - ✅ Create database migration for subscriptions and usage tracking tables
  - ✅ Add subscription tier and status enums to schema
  - _Requirements: 1.1, 2.1, 4.1_

  **Implementation Notes:**

  - Installed `stripe` package (v18.5.0) with built-in TypeScript definitions
  - Added Stripe environment variables to .env.example (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, VITE_STRIPE_PUBLISHABLE_KEY)
  - Created subscriptions table with unique constraints on userId, stripeCustomerId, and stripeSubscriptionId
  - Created usage_tracking table for efficient resource counting
  - Added subscription_tier enum ("free", "pro") and subscription_status enum with all Stripe statuses
  - Generated and applied database migration (0005_charming_ultimates.sql)
  - Updated design document to reflect implemented schema

- [x] 2. Implement core subscription service
- [x] 2.1 Create Stripe service wrapper

  - Write StripeService class with customer and subscription management methods
  - Implement error handling for Stripe API calls
  - Add configuration for Stripe test/live mode switching
  - _Requirements: 2.2, 6.2, 6.4_

- [x] 2.2 Create subscription database queries

  - Write database query functions for subscription CRUD operations
  - Implement usage tracking query functions
  - Add subscription status synchronization methods
  - _Requirements: 2.5, 3.5, 4.2, 4.3_

- [x] 3. Implement subscription management API endpoints
- [x] 3.1 Create checkout session endpoint

  - Implement POST /api/subscriptions/checkout endpoint
  - Handle Stripe checkout session creation for Pro tier upgrade
  - Add proper error handling and validation
  - _Requirements: 3.2, 6.1, 6.2_

- [x] 3.2 Create billing portal endpoint

  - Implement POST /api/subscriptions/portal endpoint
  - Generate Stripe Customer Portal sessions for subscription management
  - Add authentication and user validation
  - _Requirements: 3.3, 3.4_

- [x] 3.3 Create subscription status endpoint

  - Implement GET /api/subscriptions/current endpoint
  - Return current subscription tier, status, and billing information
  - Include usage limits and current usage counts
  - _Requirements: 3.1, 5.1, 5.2, 5.3_

- [x] 4. Implement Stripe webhook handling
- [x] 4.1 Create webhook endpoint and signature verification

  - Implement POST /api/webhooks/stripe endpoint
  - Add Stripe webhook signature verification
  - Create webhook event routing system
  - _Requirements: 4.1, 4.5_

- [x] 4.2 Handle subscription lifecycle events

  - Process subscription created, updated, and deleted events
  - Update user subscription tier based on Stripe events
  - Handle payment failure and retry scenarios
  - _Requirements: 4.2, 4.3, 4.4, 6.3_

- [x] 5. Implement tier-based access control middleware
- [x] 5.1 Create usage tracking system

  - Implement functions to count current user providers and schedules
  - Create usage update triggers for provider and schedule changes
  - Add usage synchronization and reconciliation logic
  - _Requirements: 1.2, 1.3, 1.4, 3.6_

- [x] 5.2 Create access control middleware

  - Implement middleware to check tier limits before resource creation
  - Add validation for minimum cron interval on Free tier
  - Create helper functions to get user tier and limits
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 2.2, 2.3, 2.4, 2.5_

- [x] 5.3 Apply access control to existing endpoints

  - Add tier validation to git provider creation endpoint
  - Add tier validation to messaging provider creation endpoint
  - Add tier validation to schedule creation endpoint with interval checking
  - _Requirements: 1.6, 5.4_

- [ ] 6. Create subscription management UI components
- [ ] 6.1 Create subscription status display component

  - Build component to show current tier and billing status
  - Display usage counts with progress bars for Free tier
  - Add upgrade button for Free tier users
  - _Requirements: 2.6, 5.1, 5.2, 5.3_

- [ ] 6.2 Create upgrade flow components

  - Implement upgrade button that redirects to Stripe Checkout
  - Add loading states and error handling for checkout process
  - Create success/cancel callback pages
  - _Requirements: 3.2, 6.1_

- [ ] 6.3 Create billing management component

  - Add "Manage Billing" button for Pro users
  - Implement redirect to Stripe Customer Portal
  - Display subscription details and next billing date
  - _Requirements: 3.1, 3.3_

- [ ] 7. Integrate subscription system with existing features
- [ ] 7.1 Update provider creation flows

  - Modify git provider creation to check tier limits
  - Modify messaging provider creation to check tier limits
  - Display upgrade prompts when limits are reached
  - _Requirements: 1.6, 5.4_

- [ ] 7.2 Update schedule creation flow

  - Add tier validation to schedule creation
  - Enforce 24-hour minimum interval for Free tier
  - Show tier-specific messaging in schedule creation UI
  - _Requirements: 1.5, 5.4_

- [ ] 7.3 Update navigation and dashboard

  - Add subscription status to main navigation or user menu
  - Display tier badge throughout the application
  - Update dashboard to show tier-specific information
  - _Requirements: 5.1, 5.5_

- [ ] 8. Handle subscription downgrades and cleanup
- [ ] 8.1 Implement downgrade logic

  - Create function to handle Pro to Free tier downgrades
  - Disable excess providers and schedules when downgrading
  - Notify users about disabled resources
  - _Requirements: 3.5, 3.6_

- [ ] 8.2 Add user initialization for existing users
  - Create migration script to assign Free tier to existing users
  - Initialize usage tracking for all existing users
  - Create Stripe customers for existing users if needed
  - _Requirements: 1.1_
