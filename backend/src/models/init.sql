-- init.sql: crea tablas
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS searches (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100),
  query TEXT NOT NULL,
  pokemon_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
