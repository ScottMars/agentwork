-- Create tables
CREATE TABLE IF NOT EXISTS "Entity" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "patterns" JSONB NOT NULL,
    "className" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Environment" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "patterns" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Environment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GuardianTrait" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GuardianTrait_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Entity_type_key" ON "Entity"("type");
CREATE UNIQUE INDEX IF NOT EXISTS "Environment_type_key" ON "Environment"("type");

-- Insert initial data
INSERT INTO "Entity" ("id", "type", "patterns", "className", "createdAt", "updatedAt")
VALUES 
    ('1', 'resonant', '[[" · ", " / \\ ", " / \\ ", " · · "], [" * ", " / \\ ", " / \\ ", " · · "]]', 'entity-resonant', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('2', 'prismatic', '[[" ✧ ", " /|\\ ", " / | \\ ", " / | \\ ", " · | · ", " / | \\ ", " · | · "]]', 'entity-prismatic', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Environment" ("id", "type", "patterns", "createdAt", "updatedAt")
VALUES 
    ('1', 'tranquil', '["~~~~~~~~~~~~~~~~~~~~~~~", "~ ~ ~ ~ ~ ~", " ~ ~ ~ ~ ~"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('2', 'harmonic', '["≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈", "≈ ≈ ≈ ~ ~ ~ ≈ ≈ ≈ ≈ ≈ ≈"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "GuardianTrait" ("id", "type", "values", "createdAt", "updatedAt")
VALUES 
    ('1', 'mood', '["analytical", "catalytic", "protective", "contemplative", "nurturing"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('2', 'focus', '["entity harmony", "dimensional stability", "energy patterns"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 