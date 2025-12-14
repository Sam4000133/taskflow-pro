-- TaskFlow Pro Database Initialization Script
-- This script runs automatically when the PostgreSQL container is first created

-- Enable UUID extension (required for uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'TaskFlow Pro database initialized successfully';
END $$;
