-- Wave2 E7′: link GitHub OAuth subject to accounts (NULL = anonymous cookie-only)
ALTER TABLE accounts ADD COLUMN auth_subject TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_auth_subject
  ON accounts (auth_subject)
  WHERE auth_subject IS NOT NULL;
