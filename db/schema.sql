CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
  image TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  "expiresAt" TIMESTAMP NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  scope TEXT,
  password TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS session_userId_idx ON session ("userId");
CREATE INDEX IF NOT EXISTS account_userId_idx ON account ("userId");
CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification (identifier);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
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

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions (date DESC);
CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON transactions (user_id, date DESC);

CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL CHECK (length(trim(name)) > 0),
  cost NUMERIC(18, 0) NOT NULL CHECK (cost > 0),
  priority TEXT NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  category TEXT NOT NULL CHECK (category IN (
    'FOOD', 'TRAVEL', 'HOUSEHOLD', 'TECHNOLOGY', 'FASHION',
    'HEALTH', 'EDUCATION', 'ENTERTAINMENT', 'OTHER'
  )),
  saved_amount NUMERIC(18, 0) NOT NULL DEFAULT 0 CHECK (saved_amount >= 0),
  notified INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE wishlist
  ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE;

ALTER TABLE wishlist
  ADD COLUMN IF NOT EXISTS saved_amount NUMERIC(18, 0) NOT NULL DEFAULT 0 CHECK (saved_amount >= 0);

CREATE INDEX IF NOT EXISTS wishlist_created_at_idx ON wishlist (created_at DESC);
CREATE INDEX IF NOT EXISTS wishlist_user_created_at_idx ON wishlist (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS finance_fund_lock (
  id INTEGER PRIMARY KEY CHECK (id = 1)
);

INSERT INTO finance_fund_lock (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS finance_data_owner (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION claim_legacy_finance_data()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO finance_data_owner (id, user_id)
  VALUES (1, NEW.id)
  ON CONFLICT (id) DO NOTHING;

  UPDATE transactions
  SET user_id = (SELECT user_id FROM finance_data_owner WHERE id = 1)
  WHERE user_id IS NULL;

  UPDATE wishlist
  SET user_id = (SELECT user_id FROM finance_data_owner WHERE id = 1)
  WHERE user_id IS NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS claim_legacy_finance_data_after_user_insert ON "user";
CREATE TRIGGER claim_legacy_finance_data_after_user_insert
AFTER INSERT ON "user"
FOR EACH ROW
EXECUTE FUNCTION claim_legacy_finance_data();
