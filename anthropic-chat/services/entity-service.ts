import { supabase } from "@/lib/supabase"

// Supabase table names
const ENTITIES_TABLE = "entities"
const ENTITY_DESCRIPTIONS_TABLE = "entity_descriptions"
const ENTITY_PROPERTIES_TABLE = "entity_properties"
const ENTITY_DISPLAY_NAMES_TABLE = "entity_display_names"
const ENTITY_COLOR_CLASSES_TABLE = "entity_color_classes"

// Entity service interface
export interface EntityService {
  saveEntities(entities: any): Promise<void>
  saveEntityDescriptions(descriptions: any): Promise<void>
  saveEntityProperties(properties: any): Promise<void>
  saveEntityDisplayNames(displayNames: any): Promise<void>
  saveEntityColorClasses(colorClasses: any): Promise<void>
  loadEntities(): Promise<any>
  loadEntityDescriptions(): Promise<any>
  loadEntityProperties(): Promise<any>
  loadEntityDisplayNames(): Promise<any>
  loadEntityColorClasses(): Promise<any>
  saveAllEntityData(entities: any, descriptions: any, properties: any, displayNames: any, colorClasses: any): Promise<void>
}

class SupabaseEntityService implements EntityService {
  
  // Save entities to Supabase
  public async saveEntities(entities: any): Promise<void> {
    const { error } = await supabase
      .from(ENTITIES_TABLE)
      .upsert(
        {
          id: 'main',
          data: entities,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (error) {
      console.error("Failed to save entities to Supabase:", error)
      throw error
    }

    console.log("Entities saved to Supabase")
  }

  // Save entity descriptions to Supabase
  public async saveEntityDescriptions(descriptions: any): Promise<void> {
    const { error } = await supabase
      .from(ENTITY_DESCRIPTIONS_TABLE)
      .upsert(
        {
          id: 'main',
          data: descriptions,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (error) {
      console.error("Failed to save entity descriptions to Supabase:", error)
      throw error
    }

    console.log("Entity descriptions saved to Supabase")
  }

  // Save entity properties to Supabase
  public async saveEntityProperties(properties: any): Promise<void> {
    const { error } = await supabase
      .from(ENTITY_PROPERTIES_TABLE)
      .upsert(
        {
          id: 'main',
          data: properties,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (error) {
      console.error("Failed to save entity properties to Supabase:", error)
      throw error
    }

    console.log("Entity properties saved to Supabase")
  }

  // Save entity display names to Supabase
  public async saveEntityDisplayNames(displayNames: any): Promise<void> {
    const { error } = await supabase
      .from(ENTITY_DISPLAY_NAMES_TABLE)
      .upsert(
        {
          id: 'main',
          data: displayNames,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (error) {
      console.error("Failed to save entity display names to Supabase:", error)
      throw error
    }

    console.log("Entity display names saved to Supabase")
  }

  // Save entity color classes to Supabase
  public async saveEntityColorClasses(colorClasses: any): Promise<void> {
    const { error } = await supabase
      .from(ENTITY_COLOR_CLASSES_TABLE)
      .upsert(
        {
          id: 'main',
          data: colorClasses,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (error) {
      console.error("Failed to save entity color classes to Supabase:", error)
      throw error
    }

    console.log("Entity color classes saved to Supabase")
  }

  // Load entities from Supabase
  public async loadEntities(): Promise<any> {
    const { data, error } = await supabase
      .from(ENTITIES_TABLE)
      .select('data')
      .eq('id', 'main')
      .single()

    if (error) {
      console.error("Failed to load entities from Supabase:", error)
      return null
    }

    if (data && data.data) {
      console.log("Entities loaded from Supabase")
      return data.data
    }
    
    return null
  }

  // Load entity descriptions from Supabase
  public async loadEntityDescriptions(): Promise<any> {
    const { data, error } = await supabase
      .from(ENTITY_DESCRIPTIONS_TABLE)
      .select('data')
      .eq('id', 'main')
      .single()

    if (error) {
      console.error("Failed to load entity descriptions from Supabase:", error)
      return null
    }

    if (data && data.data) {
      console.log("Entity descriptions loaded from Supabase")
      return data.data
    }
    
    return null
  }

  // Load entity properties from Supabase
  public async loadEntityProperties(): Promise<any> {
    const { data, error } = await supabase
      .from(ENTITY_PROPERTIES_TABLE)
      .select('data')
      .eq('id', 'main')
      .single()

    if (error) {
      console.error("Failed to load entity properties from Supabase:", error)
      return null
    }

    if (data && data.data) {
      console.log("Entity properties loaded from Supabase")
      return data.data
    }
    
    return null
  }

  // Load entity display names from Supabase
  public async loadEntityDisplayNames(): Promise<any> {
    const { data, error } = await supabase
      .from(ENTITY_DISPLAY_NAMES_TABLE)
      .select('data')
      .eq('id', 'main')
      .single()

    if (error) {
      console.error("Failed to load entity display names from Supabase:", error)
      return null
    }

    if (data && data.data) {
      console.log("Entity display names loaded from Supabase")
      return data.data
    }
    
    return null
  }

  // Load entity color classes from Supabase
  public async loadEntityColorClasses(): Promise<any> {
    const { data, error } = await supabase
      .from(ENTITY_COLOR_CLASSES_TABLE)
      .select('data')
      .eq('id', 'main')
      .single()

    if (error) {
      console.error("Failed to load entity color classes from Supabase:", error)
      return null
    }

    if (data && data.data) {
      console.log("Entity color classes loaded from Supabase")
      return data.data
    }
    
    return null
  }

  // Save all entity data
  public async saveAllEntityData(
    entities: any,
    descriptions: any,
    properties: any,
    displayNames: any,
    colorClasses: any
  ): Promise<void> {
    try {
      await this.saveEntities(entities)
      await this.saveEntityDescriptions(descriptions)
      await this.saveEntityProperties(properties)
      await this.saveEntityDisplayNames(displayNames)
      await this.saveEntityColorClasses(colorClasses)
      
      console.log("All entity data saved to Supabase")
    } catch (error) {
      console.error("Failed to save all entity data to Supabase:", error)
      throw error
    }
  }
}

// Export service instance
const entityService = new SupabaseEntityService()
export default entityService