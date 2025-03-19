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

-- Add comment to tables for documentation
COMMENT ON TABLE ecosystem_state IS 'Stores the current state of the ecosystem';
COMMENT ON TABLE ecosystem_update IS 'Stores the timestamp of the last update to the ecosystem';
COMMENT ON TABLE entities IS 'Stores entity data including patterns and classes';
COMMENT ON TABLE entity_descriptions IS 'Stores descriptions for each entity type';
COMMENT ON TABLE entity_properties IS 'Stores properties for each entity type';
COMMENT ON TABLE entity_display_names IS 'Stores display names for each entity type';
COMMENT ON TABLE entity_color_classes IS 'Stores color class information for each entity type';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ecosystem_state_updated_at ON ecosystem_state(updated_at);
CREATE INDEX IF NOT EXISTS idx_ecosystem_update_last_update ON ecosystem_update(last_update);
CREATE INDEX IF NOT EXISTS idx_entities_updated_at ON entities(updated_at);
CREATE INDEX IF NOT EXISTS idx_entity_descriptions_updated_at ON entity_descriptions(updated_at);
CREATE INDEX IF NOT EXISTS idx_entity_properties_updated_at ON entity_properties(updated_at);
CREATE INDEX IF NOT EXISTS idx_entity_display_names_updated_at ON entity_display_names(updated_at);
CREATE INDEX IF NOT EXISTS idx_entity_color_classes_updated_at ON entity_color_classes(updated_at);