# IP Audit

## Scope

This audit classifies the current codebase into:

- `CLIENTE_OWNED`: client content, brand assets, product data, images, and copy
- `AGENCY_OWNED`: reusable architecture, SEO system, motion system, shared layouts, internal helpers
- `THIRD_PARTY_INTEGRATION`: provider SDKs, external APIs, adapters, and generated wrappers around third-party primitives
- `MIXED`: files that combine client content with agency-owned logic or third-party integration

Where ownership depends on contract or authorship history, the file is marked `requires review legal/contractual`.

The reusable agency core is now physically stored under `agency-core/`. Legacy paths remain as compatibility shims so the client app keeps working during migration.

## Functional Summary

The application is a bilingual/trilingual marketing and commerce site with these main capabilities:

- Landing pages with animated hero, featured destinations, package showcases, and testimonials
- Locale-aware navigation and content switching
- Global header with desktop mega-menu, language switcher, theme switcher, and mobile dock
- Destination browsing with image cards, story sections, and cross-linked details
- Package browsing with filters, tiers, and checkout entry points
- Checkout flow with geo-aware gateway selection, Stripe/Openpay handoff, and confirmation UI
- Blog and case-study routes backed by MDX content
- Admin area with login, metrics, product management, reservations, and inventory views
- Analytics tracking, cron-based inventory alerts, reservation receipts, and transactional email flows
- Technical SEO via `generateMetadata`, canonical URLs, robots, sitemap, and JSON-LD entities

## Critical Dependencies

| Dependency | Type | Integration points | Notes |
|---|---|---|---|
| Next.js App Router | Framework | `app/layout.tsx`, route files, `generateMetadata`, `robots.ts`, `sitemap.ts` | Core routing and metadata surface |
| React 19 + TypeScript | Runtime / type system | All components and route modules | Strict typing expected for reusable modules |
| Framer Motion | UI motion | `src/components/layout/PageTransition.tsx`, `src/components/shared/*`, checkout/UI cards | Agency-owned motion language built on a third-party library |
| next-themes | Theme state | `components/theme-switcher.tsx`, `components/theme-provider.tsx`, header shells | Third-party theming provider |
| Radix UI / shadcn wrappers | UI primitives | `components/ui/*`, `src/components/ui/*` | External primitives wrapped for app styling |
| Stripe | Payments | `lib/stripe.ts`, `components/checkout/PaymentForm.tsx`, `app/api/checkout/route.ts` | Third-party payment provider |
| Openpay | Payments | `lib/openpay.ts`, `app/api/checkout/route.ts`, geo routing | Third-party payment provider, currently partially stubbed |
| Listmonk | Transactional email | `lib/mailer/listmonk.ts`, `lib/mailer/triggers.ts` | External email provider |
| Geo/IP provider | Geo routing | `lib/geo.ts`, `app/api/geo/route.ts`, checkout UI | External IP lookup through a provider/API |
| Drizzle + DB adapter | Data access | `lib/db/*`, admin routes, reservation/metrics APIs | Adapter boundary between SQLite and Neon |
| Vercel metadata/cron | Platform integration | `app/robots.ts`, `app/sitemap.ts`, `app/api/cron/inventory-check/route.ts`, `vercel.json` | Deployment/platform-specific behavior |
| MDX content pipeline | Content ingestion | `lib/blog.ts`, `lib/mdx.ts`, `content/**/*` | Client-owned content rendered through reusable parsers |

## Ownership Inventory

### AGENCY_OWNED

| Archivo / familia | Razón de clasificación | Licencia | Exponer al cliente |
|---|---|---|---|
| `agency-core/seo/*`, `lib/seo/*` | Metadata builders, canonical URL logic, schema/entity builders, breadcrumbs, SEO config | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/components/seo/*`, `components/seo/*` | Safe JSON-LD rendering and composition | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/components/shared/*`, `src/components/shared/*` | Reusable motion tokens and shared interaction patterns | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/components/shared/DotBackground.tsx`, `components/dot-background.tsx` | Shared decorative canvas background used across marketing and article shells | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/components/shared/ScrollReveal.tsx`, `components/scroll-reveal.tsx` | Reusable scroll reveal interaction | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/components/shared/ScrollRevealStagger.tsx`, `components/scroll-reveal-stagger.tsx` | Reusable staggered reveal helper | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/components/shared/SectionShell.tsx`, `components/section-shell.tsx` | Shared section frame and heading composition | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/components/layout/PageTransition.tsx`, `src/components/layout/PageTransition.tsx` | Shared transition system for route changes | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/components/language-switcher.tsx`, `components/language-switcher.tsx` | Reusable locale cookie + refresh behavior | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/components/theme-switcher.tsx`, `components/theme-switcher.tsx` | Reusable theme toggle interaction and transition orchestration | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/components/theme-provider.tsx`, `components/theme-provider.tsx` | Shared theme provider wrapper around `next-themes` | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/components/site-theme-transition.tsx`, `components/site-theme-transition.tsx` | Reserved hook for future transition orchestration | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/components/analytics/PassiveAnalyticsTracker.tsx`, `components/analytics/PassiveAnalyticsTracker.tsx` | Passive analytics collector and beacon fallback | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/lib/navigation.ts`, `lib/navigation.ts` | Locale/path helpers for navigation | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/lib/theme.ts`, `lib/theme.ts` | Request-based theme resolution | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/lib/locale.ts`, `lib/locale.ts` | Locale resolution helpers | Agency proprietary / reusable module | Internal package or shared library |
| `agency-core/lib/utils.ts`, `lib/utils.ts` | Shared utility helpers | Agency proprietary / reusable module | Internal package or shared library |
| `lib/db/*` | Runtime DB adapter selection and schema exports | Agency proprietary / reusable module | Internal package or shared library |
| `lib/admin-auth.ts`, `lib/admin-session.ts`, `lib/auth.ts` | Custom auth/session implementation | Agency proprietary / reusable module | Internal package or shared library |
| `lib/metrics/*` | Metrics types/export/service layer | Agency proprietary / reusable module | Internal package or shared library |
| `lib/seo/example-pages.ts` | Demo data for reusable SEO patterns | Agency proprietary / reusable module | Internal package or shared library |
| `scripts/generate-destination-blog-posts.mjs` | Content generation automation | Agency proprietary tooling | Internal only |
| `docs/sql/*` | Schema/migration artifacts for internal data model | Agency proprietary tooling | Internal only |
| `tests/seo.test.tsx` | Verification of reusable SEO module | Agency proprietary test asset | Internal only |
| `app/robots.ts` | Search-engine metadata derived from SEO config | Agency proprietary route helper | Client app only, not a standalone asset |
| `app/sitemap.ts` | Search-engine sitemap assembly | Agency proprietary route helper | Client app only, not a standalone asset |
| `app/opengraph-image.tsx`, `app/icon.tsx`, `app/apple-icon.tsx`, `app/icon-192/route.tsx`, `app/icon-512/route.tsx`, `app/favicon.ico/route.ts` | Shared brand/metadata assets generated by the app | Agency proprietary unless contract assigns the artwork | Client app only |

### CLIENTE_OWNED

| Archivo / familia | Razón de clasificación | Licencia | Exponer al cliente |
|---|---|---|---|
| `content/pages/**/*` | Page-level MDX content and localized copy | Client content; contract may need confirmation | Yes |
| `content/blog/**/*` | Blog articles and localized blog posts | Client content; contract may need confirmation | Yes |
| `public/BanffOscuro.jpeg`, `public/BanffClaro.jpeg`, `public/CripTEC-logo-VER-WHITE.png`, `public/CripTEC-logo-VER-COLOR.png`, `public/serene-nature-sharp.jpg`, `public/final preview.png`, `screenshot.png` | Brand/media assets and screenshots | Client asset unless assignment says otherwise | Yes |
| `lib/travel-copy.ts` | Visible marketing copy and CTA text | Client content; requires contract review if authored by agency | Yes |
| `lib/data/destinations.ts`, `lib/data/packages.ts`, `lib/data/flights.ts` | Product catalog / offering data | Client-owned product data | Yes |
| `lib/site-content.ts` | Contains brand copy, nav labels, and content models used by the site | Mixed authorship possible; requires review legal/contractual | Partial |

### THIRD_PARTY_INTEGRATION

| Archivo / family | Razón de clasificación | Licencia | Exponer al cliente |
|---|---|---|---|
| `lib/stripe.ts` | Stripe SDK wrapper and provider key selection | Stripe license + Stripe API terms | Yes, within app |
| `lib/openpay.ts` | Openpay gateway placeholder | Openpay license + provider terms | Yes, within app |
| `lib/mailer/listmonk.ts` | Transactional email transport to Listmonk | Listmonk/provider terms | Yes, within app |
| `lib/geo.ts` | Geo lookup using external IP service | Provider/API terms | Yes, within app |
| `app/api/geo/route.ts` | Thin API wrapper over the geo lookup adapter | Provider/API terms | Yes, within app |
| `components/ui/*`, `src/components/ui/*` | Generated wrappers around external UI primitives | Upstream primitive licenses + project-specific adaptation | Yes, within app |

### MIXED

| Archivo / familia | Razón de clasificación | Licencia | Exponer al cliente |
|---|---|---|---|
| `app/layout.tsx` | Shared layout shell plus client branding, navigation, analytics, and theme wiring | Mixed; requires review legal/contractual | Yes, as compiled app |
| `src/app/page.tsx` | Page composition plus client-facing copy and content selection | Mixed; requires review legal/contractual | Yes |
| `app/servicios/[slug]/page.tsx` | SEO builder usage plus page content from example data | Mixed; requires review legal/contractual | Yes |
| `app/blog/[slug]/page.tsx` | MDX content rendering plus structured data and page chrome | Mixed; requires review legal/contractual | Yes |
| `app/casos/[slug]/page.tsx` | Case-study content plus structured data | Mixed; requires review legal/contractual | Yes |
| `app/about/page.tsx`, `app/services/page.tsx`, `app/packages/page.tsx`, `app/packages/[id]/page.tsx`, `app/destinations/page.tsx`, `app/destinations/[slug]/page.tsx`, `app/reservations/page.tsx`, `app/checkout/page.tsx`, `app/[locale]/about/page.tsx`, `app/[locale]/packages/page.tsx`, `app/[locale]/services/page.tsx` | Route-level composition of reusable layout and client/business content | Mixed; requires review legal/contractual | Yes |
| `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx` | Shared header/footer architecture plus client brand labels and CTAs | Mixed; requires review legal/contractual | Yes |
| `components/site-header.tsx`, `components/site-footer.tsx` | Global shell with brand copy, theme switch, language switch, and mobile dock | Mixed; requires review legal/contractual | Yes |
| `src/components/home/*`, `src/components/destinations/*`, `src/components/packages/*` | Reusable presentation patterns combined with client-specific product/content data | Mixed; requires review legal/contractual | Yes |
| `components/checkout/*`, `src/components/checkout/*` | Checkout UX plus third-party payment handoff and geo-aware gateway selection | Mixed; requires review legal/contractual | Yes |
| `components/heading-typewriter.tsx`, `components/scroll-reveal.tsx`, `components/dot-background.tsx`, `components/section-shell.tsx`, `components/about-page-content.tsx`, `components/services-page-content.tsx`, `components/portfolio-page-content.tsx`, `components/mdx-article.tsx`, `components/blog-article.tsx`, `components/theme-provider.tsx`, `components/icons/minimal-whatsapp-icon.tsx` | Presentation layer that mixes reusable UI with brand/content decisions | Mixed; requires review legal/contractual | Yes |
| `lib/blog.ts` | Reusable MDX parsing wrapped around client-owned blog content | Mixed; requires review legal/contractual | Partial |
| `lib/mailer.ts`, `lib/mailer/triggers.ts` | Provider-agnostic orchestration plus provider-specific template IDs | Mixed; requires review legal/contractual | Partial |
| `app/api/checkout/route.ts` | Internal checkout orchestration plus Stripe/Openpay/email integrations | Mixed; requires review legal/contractual | No direct exposure |
| `app/api/analytics/track/route.ts` | Internal analytics ingestion plus DB writes | Mixed; requires review legal/contractual | No direct exposure |
| `app/api/cron/inventory-check/route.ts` | Cron authorization plus DB and alerting integrations | Mixed; requires review legal/contractual | No direct exposure |
| `app/api/admin/*`, `app/api/reservations/*`, `app/api/products/*`, `app/api/metrics/*` | Business logic endpoints that combine reusable core with app-specific integrations | Mixed; requires review legal/contractual | No direct exposure |
| `lib/blog.ts`, `lib/site-content.ts`, `lib/reservations*.ts`, `lib/inventory-alerts.ts`, `lib/admin/*` | Internal business logic that sits between reusable infrastructure and client data | Mixed; requires review legal/contractual | Internal only |

## Notes on Reuse and Licensing

- Agency-owned core should be packaged separately when possible, for example as a private internal package with clear import boundaries for SEO, JSON-LD, motion, and shared layout shells.
- Client content should stay outside the reusable package so it can be replaced without changing the core code.
- Third-party SDKs and generated wrappers should keep their upstream license notices and usage terms.
- Mixed files should be treated as the primary legal risk area; ownership depends on whether the content was commissioned, authored, or transferred under contract.

## Separation Recommendations

1. `repo/app-del-cliente`
   - Route files, client-owned content, media, env values, business copy, and runtime configuration
   - Keep `content/**/*`, `public/**/*`, and page-level MDX/content here

2. `paquete-privado-de-la-agencia`
   - `lib/seo/*`
   - `components/seo/*`
   - `src/components/shared/*`
   - `components/language-switcher.tsx`
   - `components/theme-switcher.tsx`
   - `components/site-theme-transition.tsx`
   - `src/components/layout/PageTransition.tsx`
   - shared motion tokens, schema builders, canonical URL helpers, and reusable metadata helpers

3. `integraciones-de-terceros`
   - Stripe, Openpay, Listmonk, geo-IP provider, DB provider, Radix/shadcn wrappers, and platform-specific hooks like Vercel cron
   - Keep provider keys, terms, and SDK updates isolated from reusable business logic

## Review Flags

- `lib/site-content.ts`: requires review legal/contractual because it mixes layout models with visible copy
- `app/layout.tsx`: requires review legal/contractual because it combines app shell, analytics, and brand presentation
- `src/components/layout/Navbar.tsx` and `components/site-header.tsx`: requires review legal/contractual because the motion system is reusable but the actual branding is client-specific
- `components/ui/*`: requires review legal/contractual if any file diverges materially from upstream wrappers
