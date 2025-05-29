# PaintQuote Pro - MVP Development Prompts

## Overview
This document contains structured prompts for implementing the MVP features over 4 weeks. Each prompt includes context, requirements, and implementation details.

---

## Week 1: Quote Management System

### Prompt 1: Quote Management Page

```
I need to create a quote management system for a painting quote app. The app is located at /Users/sepg/Desktop/painting-quote-app and uses Next.js 14 (App Router), Supabase, and Tailwind CSS with a Claude-inspired design system.

Current app structure:
- Supabase tables: projects, quotes, chat_messages, profiles, cost_settings
- Design system uses semantic colors: primary (blue #007aff), muted, foreground, background
- Authentication is already set up with Google OAuth

Please create:

1. A quotes listing page at /app/(dashboard)/quotes/page.tsx that shows:
   - All quotes for the current user with search/filter functionality
   - Each quote card showing: client name, property address, quote amount, date created, status
   - Status badges: Draft, Sent, Viewed, Accepted, Expired (30 days)
   - Actions: View, Copy Link, Download PDF, Duplicate
   - Sort options: Date (newest/oldest), Amount (high/low), Client name (A-Z)
   - Search by client name or address

2. Update the dashboard header to include a "Quotes" navigation item

3. Add proper TypeScript types for quote status in /types/database.ts

4. The UI should match the existing Claude-inspired design with:
   - Sidebar layout similar to dashboard
   - Clean card-based design
   - Smooth hover states and transitions
   - Empty state when no quotes exist

Current colors from globals.css:
- Primary: hsl(211 100% 50%)
- Muted: hsl(0 0% 96%)
- Success: hsl(142 71% 45%)
- Foreground: hsl(0 0% 11%)

Make sure to handle loading states and errors properly.
```

### Prompt 2: Individual Quote View Page

```
I need to create an individual quote view page for the painting quote app at /Users/sepg/Desktop/painting-quote-app.

Context:
- The app already has a PDF generator at /lib/pdf-generator.tsx
- Quotes are stored in Supabase with base_costs, markup_percentage, final_price, and details
- The UI uses a Claude-inspired design system

Please create:

1. A quote detail page at /app/(dashboard)/quotes/[id]/page.tsx that includes:
   - Professional quote display matching the PDF layout but optimized for web viewing
   - Company info section (from profiles table)
   - Client info section
   - Itemized breakdown by room
   - Total price (no cost/markup details shown)
   - Terms & conditions
   - Quote validity indicator (expires 30 days from creation)

2. Add these interactive features:
   - Copy to clipboard button for the entire quote (formatted text)
   - Copy link button that generates a shareable link
   - Download PDF button (using existing generator)
   - "Send to Client" button (placeholder for now)
   - Edit button that redirects to the chat with this project

3. Create a quote status tracker component showing:
   - Created → Sent → Viewed → Accepted/Rejected
   - Timestamps for each status change

4. Add a notes section where users can add internal notes

5. Style requirements:
   - Clean, print-friendly layout
   - Mobile responsive
   - Use the same color scheme and spacing as the rest of the app
   - Add subtle animations for status changes

The page should feel professional enough that a user could screen-share it with a client during a call.
```

---

## Week 2: Subscription & Usage System

### Prompt 3: Billing and Usage Page

```
I need to implement a subscription and usage tracking system for the painting quote app at /Users/sepg/Desktop/painting-quote-app.

Current setup:
- Supabase for database and auth
- User profiles table exists
- Need to track quote usage and limits

Please create:

1. Update the database schema by creating a new file /supabase/migrations/add_subscription_tables.sql:
   - user_subscriptions table: user_id, plan_type, quotes_limit, quotes_used, billing_cycle_start, billing_cycle_end, status
   - user_credits table: user_id, credits_balance, last_updated
   - usage_logs table: user_id, action_type, created_at

2. Create /app/(dashboard)/billing/page.tsx with:
   - Current plan display (Free/Starter/Pro)
   - Usage visualization: progress bar showing "3 of 10 quotes used this month"
   - Credit balance display
   - Plan comparison cards:
     * Free: 3 quotes/month
     * Starter: 10 quotes/month - $19/mo
     * Pro: 50 quotes/month - $49/mo
     * Enterprise: Unlimited - Contact us
   - "Buy Credits" section: $2 per quote, packages of 5 ($9), 10 ($18), 20 ($35)
   - Billing history table

3. Create a usage tracking hook at /hooks/useQuoteUsage.ts:
   - Check if user can create new quote
   - Increment usage when quote is created
   - Reset monthly usage
   - Handle credit deduction

4. Update the chat interface to:
   - Check usage limits before allowing new quotes
   - Show usage warning when approaching limit
   - Prompt to upgrade or buy credits when limit reached

5. Create middleware at /lib/subscription-check.ts to enforce limits

6. UI requirements:
   - Use existing design system colors
   - Progress bars with primary color
   - Success/warning states for usage
   - Smooth animations for usage updates
   - Mobile responsive cards

For now, use placeholder Stripe integration (just UI, no actual payments).
```

### Prompt 4: Usage Tracking Implementation

```
I need to implement the usage tracking logic for the painting quote app at /Users/sepg/Desktop/painting-quote-app.

Building on the subscription system, please:

1. Update /app/api/chat/route.ts to:
   - Check user's quote limits before processing
   - Track usage when a quote is successfully generated
   - Return appropriate error if limit exceeded
   - Deduct credits if user is over monthly limit

2. Create /lib/usage-tracker.ts with functions:
   - checkQuoteLimit(userId): returns { canCreate: boolean, remaining: number, totalLimit: number }
   - incrementUsage(userId): updates quotes_used
   - deductCredit(userId): reduces credit balance
   - resetMonthlyUsage(): cron job logic for monthly reset

3. Add a usage indicator component at /components/usage-indicator.tsx:
   - Small pill that shows "3/10 quotes" in the header
   - Color changes: green (< 50%), yellow (50-80%), red (> 80%)
   - Clicking opens billing page

4. Create /app/api/usage/route.ts endpoint:
   - GET: returns current usage stats
   - POST: manually trigger usage reset (admin only)

5. Update the "New Quote" button behavior:
   - Disable if limit reached
   - Show tooltip with "Upgrade to create more quotes"
   - Add animation when approaching limit

6. Add toast notifications:
   - "Quote created! 7 remaining this month"
   - "You've used 80% of your monthly quotes"
   - "Monthly limit reached. Upgrade or buy credits to continue"

Ensure all database operations use proper error handling and transactions where appropriate.
```

---

## Week 3: Demo Mode & Templates

### Prompt 5: Demo Mode Implementation

```
I need to create a demo mode for the painting quote app at /Users/sepg/Desktop/painting-quote-app to help with sales and onboarding.

Please create:

1. Add a "Try Demo" button on the login page (/app/(auth)/login/page.tsx):
   - Prominent placement below Google login
   - Different styling to stand out

2. Create demo functionality at /lib/demo-data.ts:
   - Pre-written conversation flow for a typical 3-bedroom house quote
   - Realistic client details (John Smith, 123 Demo Street)
   - Step-by-step messages that demonstrate the AI interaction
   - Final quote generation with sample data

3. Create /app/demo/page.tsx:
   - Simulated chat interface (read-only)
   - Auto-playing conversation (typewriter effect)
   - Pause/play controls
   - Skip to next message button
   - "See Quote" button that shows a sample generated quote
   - Call-to-action: "Ready to create your own? Sign up free"

4. Add demo features:
   - Highlight key features as they appear (tooltips)
   - Show time saved calculator: "This quote took 3 minutes vs 30 minutes traditional way"
   - Display sample PDF preview
   - No database writes - all in-memory

5. Create /components/demo/demo-tooltip.tsx:
   - Pulse animation to draw attention
   - Dismissible tooltips explaining features:
     * "AI understands natural language"
     * "Automatic calculations"
     * "Professional PDF generation"
     * "Flexible markup control"

The demo should feel interactive even though it's scripted, giving users confidence in the product before signing up.
```

### Prompt 6: Quote Templates System

```
I need to implement a quote templates feature for the painting quote app at /Users/sepg/Desktop/painting-quote-app.

Please create:

1. Update database with /supabase/migrations/add_templates_table.sql:
   - quote_templates table: id, user_id, name, description, room_configurations, is_public, usage_count
   - template_categories: residential, commercial, interior, exterior

2. Create /app/(dashboard)/templates/page.tsx:
   - Grid view of available templates
   - Categories: "My Templates", "Popular Templates", "Quick Starts"
   - Each template card shows:
     * Name and description
     * Typical price range
     * Number of rooms/areas
     * Usage count
     * "Use Template" button

3. Create template data at /lib/default-templates.ts:
   - Single Room: 1 bedroom, 2 coats, standard paint
   - Small Home: 2 bed, 1 bath, living room
   - Medium Home: 3 bed, 2 bath, living, kitchen
   - Large Home: 4+ bed, 3 bath, multiple living areas
   - Commercial Office: Square footage based
   - Exterior Only: Siding, trim, doors

4. Update chat interface to:
   - Add "Start from Template" button
   - When template selected, pre-fill the conversation
   - Allow user to modify template values
   - Show "Based on [Template Name]" indicator

5. Create /components/templates/template-selector.tsx:
   - Modal with template categories
   - Search functionality
   - Preview before selection
   - Recent templates section

6. Add "Save as Template" feature:
   - After quote generation, offer to save as template
   - Name and description input
   - Option to make public (future marketplace)

This will significantly speed up quote creation for common job types.
```

---

## Week 4: Client Portal & Analytics

### Prompt 7: Client Portal

```
I need to create a client-facing quote viewing system for the painting quote app at /Users/sepg/Desktop/painting-quote-app.

Please create:

1. Create public route at /app/quote/[shareId]/page.tsx:
   - No authentication required
   - Clean, professional layout
   - Company branding prominent
   - Mobile-first design

2. Update quotes table with /supabase/migrations/add_quote_sharing.sql:
   - Add columns: share_id (unique string), share_enabled, viewed_at, accepted_at, rejected_at
   - Add client_email, client_phone columns

3. Client portal features:
   - Professional quote display (similar to internal view but cleaner)
   - Company logo and contact info
   - "Accept Quote" / "Request Changes" buttons
   - Comments section for client questions
   - Validity countdown timer
   - Download PDF option

4. Create /app/api/quote/[shareId]/route.ts:
   - GET: Retrieve quote data
   - POST: Handle accept/reject actions
   - Track view events

5. Create /components/client-portal/quote-actions.tsx:
   - Accept button (green, prominent)
   - Request changes (opens comment form)
   - Rejection reason selector
   - Contact painter button (phone/email)

6. Add email notification stubs at /lib/notifications.ts:
   - Quote viewed notification
   - Quote accepted notification
   - Comment added notification

7. Security considerations:
   - Share IDs should be unguessable (nanoid)
   - Rate limiting on public endpoints
   - No sensitive business data exposed

The portal should feel trustworthy and professional, helping close deals faster.
```

### Prompt 8: Analytics Dashboard

```
I need to create an analytics dashboard for the painting quote app at /Users/sepg/Desktop/painting-quote-app.

Please create:

1. Create /app/(dashboard)/insights/page.tsx with these sections:
   - Overview cards: Total quotes, acceptance rate, average quote value, total revenue
   - Monthly trends chart (using recharts, already installed)
   - Top clients table
   - Popular services breakdown

2. Create analytics components:

   a. /components/analytics/overview-cards.tsx:
      - Animated number counting
      - Period comparison (vs last month)
      - Trend indicators (up/down arrows)

   b. /components/analytics/trends-chart.tsx:
      - Line chart showing quotes created vs accepted
      - Toggle between monthly/weekly view
      - Hover tooltips with details

   c. /components/analytics/client-insights.tsx:
      - Top 10 clients by revenue
      - Repeat client indicator
      - Average quote per client

   d. /components/analytics/service-breakdown.tsx:
      - Pie chart of room types quoted
      - Most profitable service types
      - Paint quality preferences

3. Create /lib/analytics.ts with calculation functions:
   - calculateAcceptanceRate()
   - getAverageQuoteValue()
   - getMonthlyTrends()
   - getTopClients()
   - getServiceBreakdown()

4. Add export functionality:
   - Export data as CSV button
   - Date range selector
   - Printable reports view

5. Add insights/tips:
   - "Your acceptance rate is 10% below average. Consider reviewing your pricing."
   - "Tuesday afternoons see the highest quote acceptance."
   - "3-bedroom homes are your most profitable service."

Use the existing color scheme and ensure all charts are mobile responsive.
```

---

## Implementation Notes

### For each prompt, remember to:

1. **Check existing code structure** at `/Users/sepg/Desktop/painting-quote-app`
2. **Use the established design system**:
   - Colors from `globals.css`
   - Existing UI components in `/components/ui`
   - Claude-inspired aesthetic
3. **Follow Next.js 14 App Router patterns**
4. **Use Supabase for all data operations**
5. **Implement proper TypeScript types**
6. **Add loading and error states**
7. **Ensure mobile responsiveness**
8. **Use existing authentication context**

### Testing checklist for each feature:
- [ ] Works on desktop and mobile
- [ ] Handles errors gracefully
- [ ] Shows loading states
- [ ] Follows existing design patterns
- [ ] TypeScript types are correct
- [ ] Database queries are optimized
- [ ] User permissions are checked

### Resources to reference:
- Existing chat implementation: `/components/chat/chat-interface.tsx`
- Database types: `/types/database.ts`
- Supabase client setup: `/lib/supabase/client.ts` and `/lib/supabase/server.ts`
- Current UI components: `/components/ui/`
- PDF generator: `/lib/pdf-generator.tsx`
