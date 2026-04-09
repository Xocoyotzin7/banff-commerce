-- Banff Commerce
-- SQL migration for shipping dimensions, order fulfillment fields, and saved payment methods.
-- Apply this after the base schema exists.

-- Order status enum extension for fulfillment tracking.
DO $$
BEGIN
  ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'out_for_delivery';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Product physical shipping fields.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS weight_kg numeric(6,3),
  ADD COLUMN IF NOT EXISTS length_cm numeric(6,1),
  ADD COLUMN IF NOT EXISTS width_cm numeric(6,1),
  ADD COLUMN IF NOT EXISTS height_cm numeric(6,1);

-- Backfill safe defaults for existing rows in demo/dev data.
UPDATE products
SET
  weight_kg = COALESCE(weight_kg, 1.000),
  length_cm = COALESCE(length_cm, 1.0),
  width_cm = COALESCE(width_cm, 1.0),
  height_cm = COALESCE(height_cm, 1.0);

ALTER TABLE products
  ALTER COLUMN weight_kg SET NOT NULL,
  ALTER COLUMN length_cm SET NOT NULL,
  ALTER COLUMN width_cm SET NOT NULL,
  ALTER COLUMN height_cm SET NOT NULL;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS volumetric_weight_kg numeric(6,3)
  GENERATED ALWAYS AS (((length_cm * width_cm * height_cm) / 5000)) STORED;

-- Order fulfillment and tracking fields.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS country varchar(8),
  ADD COLUMN IF NOT EXISTS selected_carrier varchar(64),
  ADD COLUMN IF NOT EXISTS carrier varchar(64),
  ADD COLUMN IF NOT EXISTS tracking_id varchar(128),
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS out_for_delivery_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS out_for_delivery_notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS quoted_rates jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS shipping_address jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gross_total numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_amount numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_sales numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_rating integer,
  ADD COLUMN IF NOT EXISTS review_comment text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS source_type varchar(32) NOT NULL DEFAULT 'store';

-- Saved payment methods, token-only storage.
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  country varchar(2) NOT NULL,
  stripe_payment_method_id varchar(50),
  stripe_customer_id varchar(50),
  openpay_card_id varchar(50),
  openpay_customer_id varchar(50),
  card_brand varchar(20) NOT NULL,
  card_last4 varchar(4) NOT NULL,
  card_exp_month integer NOT NULL,
  card_exp_year integer NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_country ON payment_methods(country);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(user_id, is_default);
