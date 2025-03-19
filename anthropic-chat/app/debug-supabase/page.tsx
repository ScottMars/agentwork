"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DebugSupabasePage() {
  const [tables, setTables] = useState<string[]>([
    'ecosystem_state',
    'ecosystem_update',
    'entities',
    'entity_descriptions',
    'entity_properties', 
    'entity_display_names',
    'entity_color_classes'
  ])
  const [tableData, setTableData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string>('entities')

  // Function to check if tables exist
  const checkTables = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const results: Record<string, any> = {}
      
      for (const table of tables) {
        try {
          // Try to get data from the table
          const { data, error } = await supabase.from(table).select('*')
          
          if (error) {
            if (error.code === '42P01') {
              results[table] = { exists: false, error: 'Table does not exist' }
            } else {
              results[table] = { exists: true, error: error.message }
            }
          } else {
            results[table] = { 
              exists: true, 
              count: data?.length || 0,
              data: data || []
            }
          }
        } catch (err) {
          results[table] = { exists: false, error: String(err) }
        }
      }
      
      setTableData(results)
    } catch (err) {
      setError(`Error checking tables: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to create missing tables
  const createMissingTables = async () => {
    setLoading(true)
    setError(null)
    
    try {
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
      `
      
      // We can't execute SQL directly from the client
      // Just show the SQL that needs to be executed
      setError('Cannot create tables directly from the client. Please run this SQL in the Supabase dashboard.')
    } finally {
      setLoading(false)
      // Refresh the table info
      checkTables()
    }
  }

  // Insert test data
  const insertTestData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const testEntity = {
        id: 'main',
        data: {
          test_entity: {
            patterns: [['T', 'E', 'S', 'T']],
            className: 'text-[#ff7f7f]'
          }
        }
      }
      
      const { error } = await supabase.from('entities').upsert(testEntity)
      
      if (error) {
        setError(`Error inserting test data: ${error.message}`)
      } else {
        // Now check tables again
        await checkTables()
      }
    } catch (err) {
      setError(`Error inserting test data: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to load entity data from localStorage for debugging
  const checkLocalStorage = () => {
    try {
      const savedData = localStorage.getItem("ecosystem-entities")
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setTableData({
          ...tableData,
          localStorage: {
            exists: true,
            count: Object.keys(parsedData.entities || {}).length,
            data: parsedData
          }
        })
      } else {
        setTableData({
          ...tableData,
          localStorage: {
            exists: false,
            error: 'No data in localStorage'
          }
        })
      }
    } catch (err) {
      setTableData({
        ...tableData,
        localStorage: {
          exists: false,
          error: String(err)
        }
      })
    }
  }

  // Check tables on component mount
  useEffect(() => {
    checkTables()
    checkLocalStorage()
  }, [])

  return (
    <div className="bg-[#111] text-[#c4f5ff] font-mono min-h-screen p-5">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#7fdbff]">Supabase Debug Tool</h1>
          <div className="flex gap-2">
            <Link
              href="/wiki"
              className="bg-[#1a4e64] text-[#7fdbff] px-3 py-1 rounded border border-[#3a7c8c] hover:bg-[#2a6e84] transition-all"
            >
              View Wiki
            </Link>
            <Link
              href="/"
              className="bg-[#1a4e64] text-[#7fdbff] px-3 py-1 rounded border border-[#3a7c8c] hover:bg-[#2a6e84] transition-all"
            >
              View Ecosystem
            </Link>
          </div>
        </div>

        <div className="bg-[#0e2b36] border border-[#3a7c8c] p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.3)] mb-6">
          <h2 className="text-xl font-bold mb-4">Database Status</h2>
          
          {error && (
            <div className="bg-[#3a1c1c] text-[#ff7f7f] p-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={checkTables}
              disabled={loading}
              className="bg-[#1a4e64] text-[#7fdbff] px-4 py-2 rounded border border-[#3a7c8c] hover:bg-[#2a6e84] disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Refresh Table Info'}
            </button>
            
            <button
              onClick={createMissingTables}
              disabled={loading}
              className="bg-[#2a1a4e] text-[#db7fff] px-4 py-2 rounded border border-[#7c3a8c] hover:bg-[#3a2a5e] disabled:opacity-50"
            >
              Show Create Tables SQL
            </button>
            
            <button
              onClick={insertTestData}
              disabled={loading}
              className="bg-[#4e1a1a] text-[#ff7f7f] px-4 py-2 rounded border border-[#8c3a3a] hover:bg-[#5e2a2a] disabled:opacity-50"
            >
              Insert Test Data
            </button>

            <Link
              href="/adminadminadminadmin1234566789"
              className="bg-[#1a644e] text-[#7fffd4] px-4 py-2 rounded border border-[#3a8c7c] hover:bg-[#2a846e] transition-all"
            >
              Admin Panel
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {tables.map(table => (
              <div 
                key={table}
                onClick={() => setSelectedTable(table)}
                className={`p-3 rounded cursor-pointer ${
                  selectedTable === table 
                    ? 'bg-[#1a4e64] border-[#7fdbff] border-2' 
                    : 'bg-[#0a1a1f] border border-[#3a7c8c] hover:bg-[#112530]'
                }`}
              >
                <h3 className="font-bold mb-1">{table}</h3>
                {tableData[table] ? (
                  <div>
                    <div className={tableData[table].exists ? 'text-[#7fff7f]' : 'text-[#ff7f7f]'}>
                      {tableData[table].exists ? 'Exists' : 'Missing'}
                    </div>
                    {tableData[table].exists && (
                      <div className="text-sm">
                        Records: {tableData[table].count}
                      </div>
                    )}
                    {tableData[table].error && (
                      <div className="text-[#ff7f7f] text-xs mt-1">{tableData[table].error}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm italic opacity-70">Loading...</div>
                )}
              </div>
            ))}
            
            {/* LocalStorage info */}
            <div 
              onClick={() => setSelectedTable('localStorage')}
              className={`p-3 rounded cursor-pointer ${
                selectedTable === 'localStorage' 
                  ? 'bg-[#1a4e64] border-[#7fdbff] border-2' 
                  : 'bg-[#0a1a1f] border border-[#3a7c8c] hover:bg-[#112530]'
              }`}
            >
              <h3 className="font-bold mb-1">localStorage</h3>
              {tableData['localStorage'] ? (
                <div>
                  <div className={tableData['localStorage'].exists ? 'text-[#7fff7f]' : 'text-[#ff7f7f]'}>
                    {tableData['localStorage'].exists ? 'Has Data' : 'No Data'}
                  </div>
                  {tableData['localStorage'].exists && (
                    <div className="text-sm">
                      Entity Count: {tableData['localStorage'].count}
                    </div>
                  )}
                  {tableData['localStorage'].error && (
                    <div className="text-[#ff7f7f] text-xs mt-1">{tableData['localStorage'].error}</div>
                  )}
                </div>
              ) : (
                <div className="text-sm italic opacity-70">Loading...</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Data viewer */}
        <div className="bg-[#0e2b36] border border-[#3a7c8c] p-6 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.3)]">
          <h2 className="text-xl font-bold mb-4">
            {selectedTable === 'localStorage' ? 'LocalStorage Data' : `${selectedTable} Table Data`}
          </h2>
          
          {tableData[selectedTable]?.exists ? (
            <div>
              <div className="mb-2">Records: {tableData[selectedTable].count}</div>
              <pre className="bg-[#0a1a1f] p-4 rounded overflow-auto max-h-[400px] text-xs">
                {JSON.stringify(tableData[selectedTable].data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="text-[#ff7f7f]">
              {selectedTable === 'localStorage' 
                ? 'No data in localStorage' 
                : `Table ${selectedTable} doesn't exist or is empty`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}