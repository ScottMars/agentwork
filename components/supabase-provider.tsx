"use client"

import { useEffect, useState } from 'react'
import { runMigrations } from '@/lib/supabase-migrations'

interface SupabaseProviderProps {
  children: React.ReactNode
}

const SupabaseProvider: React.FC<SupabaseProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [showManualInstructions, setShowManualInstructions] = useState(false)
  const [tablesExist, setTablesExist] = useState(false)

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        // Check if tables exist (we can't create them automatically)
        const tablesReady = await runMigrations()
        
        setTablesExist(tablesReady)
        
        if (tablesReady) {
          console.log('Supabase tables exist and are ready to use')
        } else {
          console.warn('Supabase tables do not exist or could not be verified')
          setShowManualInstructions(true)
        }
        
        // Even if tables don't exist, consider the app initialized
        // so it can fall back to localStorage
        setIsInitialized(true)
      } catch (err) {
        console.error('Failed to check Supabase tables:', err)
        setError(err instanceof Error ? err : new Error('Unknown error checking Supabase tables'))
        setShowManualInstructions(true)
        // Still mark as initialized so the app can continue with localStorage fallback
        setIsInitialized(true)
      }
    }

    initializeSupabase()
  }, [])

  // If still initializing, show a loading indicator
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111]">
        <div className="text-[#7fdbff] font-mono">
          <div className="text-center">
            <div className="text-xl">Initializing database...</div>
            <div className="mt-2 text-sm opacity-70">Please wait while we set up the connection.</div>
          </div>
        </div>
      </div>
    )
  }

  // If there was an error and we need to show manual instructions
  if (showManualInstructions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#111] text-[#7fdbff] font-mono p-6">
        <div className="max-w-3xl w-full">
          <h1 className="text-3xl mb-4 text-center font-bold">⚠️ Database Setup Required ⚠️</h1>
          <p className="text-center mb-6">{tablesExist 
            ? "Tables exist but we're showing these instructions for reference" 
            : "Supabase tables need to be created for data persistence"}</p>
          
          <div className="bg-[#0a1a1f] p-4 rounded-md mb-4">
            <p className="mb-2">We encountered an issue setting up the database tables automatically. You have two options:</p>
            
            <ol className="list-decimal pl-6 mb-4">
              <li className="mb-2">Continue using the app with local storage (data will only be saved in this browser)</li>
              <li className="mb-2">Set up the database tables manually (recommended for persistent data)</li>
            </ol>
            
            <div className="bg-[#152639] p-3 rounded-md mb-4 overflow-auto">
              <h2 className="text-lg mb-2">Manual Database Setup Instructions:</h2>
              <ol className="list-decimal pl-6">
                <li className="mb-2">Go to your <a href="https://app.supabase.com/" target="_blank" rel="noopener noreferrer" className="text-[#7fdbff] underline">Supabase dashboard</a></li>
                <li className="mb-2">Select your project</li>
                <li className="mb-2">Open the SQL Editor</li>
                <li className="mb-2">Create a new query</li>
                <li className="mb-2">Paste the SQL below and run it</li>
              </ol>
            </div>
            
            <pre className="bg-[#1a2b3c] p-3 rounded-md overflow-auto text-xs mt-4">
              {`-- Create ecosystem_state table
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
);`}
            </pre>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowManualInstructions(false)}
              className="bg-[#1a4e64] text-[#7fdbff] px-6 py-2 rounded-md hover:bg-[#2a6e84] transition-all"
            >
              {tablesExist 
                ? "Close this message" 
                : "Continue with localStorage for now"}
            </button>
            {!tablesExist && (
              <div className="text-sm text-[#ff7f7f] mt-2 text-center">
                <p>Note: Your data will not be saved to Supabase until tables are created</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render children once initialized (even if there was an error)
  return <>{children}</>
}

export default SupabaseProvider