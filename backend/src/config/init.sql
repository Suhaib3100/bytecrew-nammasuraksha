-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create message_analyses table for message analysis
CREATE TABLE IF NOT EXISTS message_analyses (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  result JSONB NOT NULL,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_message_analyses_user_id ON message_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_message_analyses_created_at ON message_analyses(created_at); 