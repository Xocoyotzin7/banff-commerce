# Repository Split Plan

## Status

The codebase is currently organized as a single working tree, but it is already classified into three ownership zones:

- client app and content
- agency-owned reusable core
- third-party integrations

This document describes the safe split path without breaking the current application.

The reusable agency core now lives physically under `agency-core/`, with legacy paths kept as thin shims so existing imports continue to work.

## Recommended Buckets

### 1. Client App

Keep these in the client application repo:

- `app/**/*`
- `content/**/*`
- `public/**/*`
- visible copy and product data
- page routes, CMS content, and deployment config

### 2. Agency Core

Move reusable logic into a private package:

- `agency-core/seo/*`
- `agency-core/components/seo/*`
- `agency-core/components/shared/*`
- `agency-core/components/shared/DotBackground.tsx`
- `agency-core/components/shared/ScrollReveal.tsx`
- `agency-core/components/shared/ScrollRevealStagger.tsx`
- `agency-core/components/shared/SectionShell.tsx`
- `agency-core/components/language-switcher.tsx`
- `agency-core/components/theme-switcher.tsx`
- `agency-core/components/theme-provider.tsx`
- `agency-core/components/site-theme-transition.tsx`
- `agency-core/components/analytics/PassiveAnalyticsTracker.tsx`
- `agency-core/components/layout/PageTransition.tsx`
- `agency-core/lib/navigation.ts`
- `agency-core/lib/locale.ts`
- `agency-core/lib/theme.ts`
- `agency-core/lib/utils.ts`
- legacy paths are kept as re-export shims until the client app finishes the migration

### 3. Third-Party Integrations

Keep vendor-specific adapters isolated:

- Stripe
- Openpay
- Listmonk
- geo/IP provider
- DB adapters
- UI primitive wrappers that are direct vendor adaptations

## Safe Migration Strategy

1. Create the private agency package first.
2. Add re-export shims in the current app so imports keep working.
3. Move one subsystem at a time:
   - SEO
   - JSON-LD
   - motion/layout
   - auth/analytics helpers
4. Only then move the app to consume the package through explicit imports.

## Breakage Risk

- A direct file move will break imports unless every consumer is updated in the same change.
- A staged move with re-exports is the safest approach.
- The current app can stay working during the migration if the old module paths remain as thin wrappers.
