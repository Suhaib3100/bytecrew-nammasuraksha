-- Create tables for the security analysis system

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    content TEXT,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER
);

-- URL Analyses table
CREATE TABLE IF NOT EXISTS url_analyses (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER
);

-- Threats table
CREATE TABLE IF NOT EXISTS threats (
    id SERIAL PRIMARY KEY,
    threat_type VARCHAR(50) NOT NULL,
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
    description TEXT,
    impact_analysis TEXT,
    mitigation_steps JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Phishing Checks table
CREATE TABLE IF NOT EXISTS phishing_checks (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    is_phishing BOOLEAN NOT NULL,
    confidence FLOAT NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Phishing Reports table
CREATE TABLE IF NOT EXISTS phishing_reports (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    description TEXT,
    evidence JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'false_positive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    parameters JSONB,
    content BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analyses_url ON analyses(url);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_url_analyses_url ON url_analyses(url);
CREATE INDEX IF NOT EXISTS idx_threats_type ON threats(threat_type);
CREATE INDEX IF NOT EXISTS idx_phishing_checks_url ON phishing_checks(url);
CREATE INDEX IF NOT EXISTS idx_phishing_reports_url ON phishing_reports(url);
CREATE INDEX IF NOT EXISTS idx_phishing_reports_status ON phishing_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add foreign key constraints
ALTER TABLE analyses ADD CONSTRAINT fk_analyses_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE url_analyses ADD CONSTRAINT fk_url_analyses_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE phishing_reports ADD CONSTRAINT fk_phishing_reports_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE reports ADD CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id); 