// Script for running the migrations manually in the Supabase SQL editor
// Copy the contents of this file and paste into the SQL editor in Supabase

async function createTables() {
  const sql = `
-- Create ecosystem_state table
CREATE TABLE IF NOT EXISTS ecosystem_state (
  id TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ecosystem_update table
CREATE TABLE IF NOT EXISTS ecosystem_update (
  id TEXT PRIMARY KEY,
  last_update BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entities table
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entity_descriptions table
CREATE TABLE IF NOT EXISTS entity_descriptions (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entity_properties table
CREATE TABLE IF NOT EXISTS entity_properties (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entity_display_names table
CREATE TABLE IF NOT EXISTS entity_display_names (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create entity_color_classes table
CREATE TABLE IF NOT EXISTS entity_color_classes (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

  console.log(sql);
  console.log("\n----------------\n");
  console.log("Copy the SQL above and run it in the Supabase SQL editor to create all required tables.");
}

// Run the function if executed directly from the command line
if (typeof require !== 'undefined' && require.main === module) {
  createTables();
}

module.exports = { createTables };