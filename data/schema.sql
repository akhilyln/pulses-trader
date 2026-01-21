-- Create Products Table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  telugu_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Brands Table
CREATE TABLE brands (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  prev_price DECIMAL(10,2),
  change DECIMAL(5,2),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Price History Table
CREATE TABLE price_history (
  id BIGSERIAL PRIMARY KEY,
  brand_id TEXT REFERENCES brands(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for live updates (Optional but recommended)
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE brands;
