# Banff Studio

Banff Studio is a website-first studio focused on Mexico and Canada. The site is built around clear UX/UI, bilingual and multilingual delivery, SEO, practical content support, and lightweight marketing when a project needs it. AI, automation, Web3, and mobile apps remain available as selective capabilities and can be quoted separately when needed.

This repository was forked from:
https://github.com/Chatbase-co/nextjs-marketplace-template

## What we do

- Bilingual websites in English, French, and Spanish.
- SEO, content, and practical marketing support.
- Website redesigns and modernization for older sites.
- Selective mobile app work quoted separately when the project truly needs it.
- AI, automation, and Web3 integrations when they add real value.

## What is implemented

### Client site

- Bilingual and multilingual homepage, services, packages, portfolio, blog, about, and contact sections.
- Locale-aware content with English, Spanish, and French variants.
- Mobile-first destination preview experiences with animated destination lists and region-based presentation.
- Destination image previews are populated from curated travel imagery so the preview does not show broken placeholders.
- Reservation flows with a darkened receipt popup, QR code, and copy-code action.
- Header and CTA cleanup for a more focused browsing flow.

### Mobile experience

- Mobile header collapses into a compact drawer instead of showing the desktop nav inline.
- The mobile drawer includes the same core options as desktop:
  - Destinations
  - Packages
  - Tours
  - About us
  - Admin access
  - Client access
- The mobile home view keeps the hero, primary CTAs, and destination previews readable on iPhone-sized screens.
- Customer panels and reservation/order detail views are stacked for narrow screens instead of forcing desktop columns.

### Reservations

- Recent reservations table in admin.
- Reservation receipt popup with QR code and copy action.
- Customer-facing reservation receipt details and mobile-friendly presentation.

### Delivery and fulfillment

- Product shipping dimensions stored in the product schema.
- Volumetric weight calculation for parcels and cart-level shipping aggregation.
- Country routing:
  - `MX` -> Skydropx
  - `CA` -> Easyship
- Shipping rates API at `/api/shipping/rates`.
- Shipping selector in checkout step 2 with mocked fallback rates for demo mode.
- Shipping preview sheet in admin that opens after saving shipping dimensions.
- Mock shipping confirmation flow showing:
  - shipping options
  - selected rate
  - customer summary
  - shipping address
  - product photos
  - cart items
- Admin fulfillment queue and order detail sheet for shipping actions.
- Manual tracking capture and shipped-order status updates.
- Client order history and tracking pages.
- Shipment status polling through a Vercel cron job every 6 hours.
- Listmonk transactional email triggers for shipping confirmation, out for delivery, and delivered events.

### Payments

- Saved payment methods using provider tokens only.
- `CA` uses Stripe Payment Method and Customer IDs.
- `MX` uses Openpay customer and card token IDs.
- No raw PAN, CVV, or full card data is stored.

### Admin

- Product management drawer and product edit page.
- Product shipping dimensions section with live volumetric weight preview.
- Shipping preview modal launched from the product save flow.
- Order fulfillment queue with urgency badges, sorting, search, and paginated rows.
- Order detail sheet with carrier override, tracking capture, and shipped confirmation.
- Admin copy localized for English, Spanish, and French.

### Demo mode

- Shipping provider calls are mocked in demo mode.
- Payment provider flows are token-only and safe for demo usage.
- Shipping previews for products are demo-friendly and do not rely on live carrier credentials.
- Admin and client flows keep working with seeded/demo data when the database is not available.

### Location

- Banff Studio is presented as based in Banff, Alberta, Canada.
- The repo does not define a public street address, so the README uses Banff as the visible location reference.

## Site structure

- Home
- About Us
- Packages
- Portfolio
- Blog
- Services
- Contact

## Delivery and fulfillment demo

This repo includes a mock-first shipping and fulfillment flow for Mexico and Canada:

- Shipping dimensions are stored on products in Drizzle/PostgreSQL.
- Cart parcel aggregation computes billable weight from product weights and dimensions.
- Shipping rates are fetched from `/api/shipping/rates` and routed by country:
  - `MX` -> Skydropx
  - `CA` -> Easyship
- Checkout Step 2 shows a country-specific shipping selector with mocked/demo fallback data.
- Admin orders include a fulfillment queue, detail sheet, carrier override, and manual tracking capture.
- Shipping confirmation, out-for-delivery, and delivered emails are triggered through Listmonk transactional templates.
- A Vercel cron job polls carrier tracking every 6 hours and advances shipment status automatically.
- Saved payment methods store provider tokens only:
  - `CA` -> Stripe Payment Method + Customer IDs
  - `MX` -> Openpay customer + card token IDs
- Delivery-related provider calls are mocked in demo mode so the site can be shown safely without live credentials.
- Admin shipping preview and checkout shipping quotes are mock-first when demo mode is enabled.
- Client order tracking and shipping confirmation flows are wired to the same shipping state model used by admin.

### Delivery environment variables

The delivery and payment flows expect these environment variables:

- `SKYDROPX_API_KEY`
- `EASYSHIP_API_KEY`
- `MERCHANT_ORIGIN_ZIP_MX`
- `MERCHANT_ORIGIN_ZIP_CA`
- `CRON_SECRET`
- `LISTMONK_URL`
- `LISTMONK_TEMPLATE_SHIPPING_CONFIRMED`
- `LISTMONK_TEMPLATE_OUT_FOR_DELIVERY`
- `LISTMONK_TEMPLATE_DELIVERED`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `OPENPAY_MERCHANT_ID`
- `OPENPAY_PRIVATE_KEY`
- `OPENPAY_PUBLIC_KEY`
- `OPENPAY_IS_SANDBOX`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` if you expose Stripe Elements on the client
- `NEXT_PUBLIC_OPENPAY_PUBLIC_KEY` if you expose Openpay hosted fields on the client

## English

Banff Studio builds websites for teams that want to operate across Mexico and Canada. The studio combines design, content, SEO, and technical execution with a clear bilingual workflow.

What we offer:

- Launch-ready websites.
- Multilingual structure in English, French, and Spanish.
- SEO and local visibility.
- Content support and light marketing.
- Selective mobile app work quoted separately when needed.
- AI, automation, and Web3 integration when it makes sense.

Delivery demo capabilities:

- Shipping quotes by country with Skydropx and Easyship routing.
- Admin fulfillment queue with manual tracking confirmation.
- Tracking email automations and scheduled shipment polling.
- Token-only saved payment methods for Stripe and Openpay.
- Product shipping dimension previews with mock carrier selection.
- Client order history and tracking pages.

## Français

Banff Studio crée des sites web pour des équipes qui veulent travailler entre le Mexique et le Canada. Le studio combine design, contenu, SEO et exécution technique avec un flux bilingue clair.

Ce que nous proposons :

- Sites prêts à lancer.
- Structure multilingue en anglais, français et espagnol.
- SEO et visibilité locale.
- Soutien en contenu et marketing léger.
- Travail mobile sélectif quand le projet le demande.
- Intégrations IA, automatisation et Web3 lorsque c’est pertinent.

Capacités de livraison:

- Devis d’expédition par pays avec routage Skydropx et Easyship.
- File d’attente de préparation des commandes avec confirmation manuelle du suivi.
- Automatisations d’emails de suivi et polling planifié des expéditions.
- Méthodes de paiement sauvegardées en mode jeton uniquement pour Stripe et Openpay.
- Aperçu d’expédition depuis l’admin avec sélection simulée du transporteur.
- Pages de suivi et d’historique de commande côté client.

## Español

Banff Studio crea sitios web para equipos que quieren operar entre México y Canadá. El estudio combina diseño, contenido, SEO y ejecución técnica con un flujo bilingüe claro.

Lo que ofrecemos:

- Sitios listos para lanzar.
- Estructura multilingüe en inglés, francés y español.
- SEO y visibilidad local.
- Apoyo en contenido y marketing ligero.
- Trabajo móvil selectivo cuando el proyecto lo necesita.
- Integraciones de AI, automatización y Web3 cuando aportan valor real.

Capacidades de delivery:

- Cotización de envíos por país con ruteo Skydropx y Easyship.
- Cola de fulfillment en admin con confirmación manual de guía.
- Automatizaciones de email de seguimiento y polling programado de envíos.
- Métodos de pago guardados solo con tokens para Stripe y Openpay.
- Vista previa de envío desde admin con selección simulada de paquetería.
- Historial y tracking de pedidos para el cliente.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Notes

- Default language: English.
- Default theme: Dark.
- The site supports language switching between English, French, and Spanish.
- The portfolio, services, packages, blog, and contact pages are all tailored to the studio’s website-first positioning.
- Delivery and fulfillment are demo-friendly by default, with provider mocks available for safe previews.
- Admin shipping previews default to Canada unless the locale or browser signal clearly indicates Mexico.
- Public location reference: Banff, Alberta, Canada.
- If Vercel shows an older release, verify the project is linked to the current GitHub repo and the `main` branch, then trigger a fresh deployment from the latest commit.
