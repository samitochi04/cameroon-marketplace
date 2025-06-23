-- Add last_stock_notification column to products table if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS last_stock_notification TIMESTAMPTZ;

-- Add an index for efficient querying
CREATE INDEX IF NOT EXISTS idx_products_stock_notification 
ON products(last_stock_notification);

-- Add an index for stock quantity for efficient low stock queries
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity 
ON products(stock_quantity);

-- Add a check constraint to ensure stock_quantity is not negative
ALTER TABLE products 
ADD CONSTRAINT check_stock_quantity_non_negative 
CHECK (stock_quantity >= 0);