CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  amount NUMERIC(18, 0) NOT NULL CHECK (amount > 0),
  description VARCHAR(120) NOT NULL CHECK (length(trim(description)) > 0),
  category TEXT NOT NULL CHECK (category IN (
    'FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'SHOPPING',
    'BILLS', 'SALARY', 'INVESTMENT', 'OTHER'
  )),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions (date DESC);

CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) NOT NULL CHECK (length(trim(name)) > 0),
  cost NUMERIC(18, 0) NOT NULL CHECK (cost > 0),
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  category TEXT NOT NULL CHECK (category IN (
    'FOOD', 'TRAVEL', 'HOUSEHOLD', 'TECHNOLOGY', 'FASHION',
    'HEALTH', 'EDUCATION', 'ENTERTAINMENT', 'OTHER'
  )),
  notified INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wishlist_created_at_idx ON wishlist (created_at DESC);
