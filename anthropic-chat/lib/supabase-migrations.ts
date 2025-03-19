import { supabase } from './supabase'

/**
 * Function to log messages about migration status
 */
export async function setupSupabaseTables() {
  console.log('Setting up Supabase tables...')
  
  try {
    // Try inserting a test record to see if tables exist
    const testResult = await testTableExistence()
    
    if (testResult) {
      console.log('All tables appear to be working')
      return true
    }
    
    // If we get here, we couldn't verify all tables exist
    console.log('Tables may not exist, but we cannot create them automatically from the client')
    // We'll return true anyway so the app can continue with fallbacks
    return false
  } catch (error) {
    console.error('Error during table setup:', error)
    return false
  }
}

/**
 * Tests if all the required tables exist by attempting to interact with them
 */
async function testTableExistence() {
  try {
    const tables = [
      'ecosystem_state',
      'ecosystem_update',
      'entities',
      'entity_descriptions',
      'entity_properties',
      'entity_display_names',
      'entity_color_classes'
    ]
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1)
      
      if (error && error.code === '42P01') {
        console.error(`Table '${table}' does not exist:`, error)
        return false
      }
    }
    
    // All tables seem to exist
    return true
  } catch (error) {
    console.error('Error testing table existence:', error)
    return false
  }
}

// Export a function to run the migrations
export async function runMigrations() {
  try {
    // Try to use supabase.auth.getSession() as a simple connectivity test
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Supabase connectivity check failed:', error)
      return false
    }
    
    // We can only check if tables exist, not create them from the client
    // Return the result of our table check
    return await setupSupabaseTables()
  } catch (error) {
    console.error('Error running migrations:', error)
    return false
  }
}