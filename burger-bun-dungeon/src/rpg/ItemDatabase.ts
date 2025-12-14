import rpgItemsData from '../data/rpgItems.json'

/**
 * Item definition from JSON data
 */
export interface ItemDefinition {
  id: string
  name: string
  description: string
  type: 'consumable' | 'equipment'
  slot?: 'weapon' | 'armor' | 'shield' | 'accessory'
  effect?: {
    healHp?: number
    healHpPercent?: number
    buffAtk?: number
    buffDef?: number
    revive?: boolean
  }
  stats?: {
    atk?: number
    def?: number
    spd?: number
  }
  shopPrice?: number
  sellPrice?: number
  isStartingEquipment?: boolean
  isBossDrop?: boolean
  droppedBy?: string
}

/**
 * ItemDatabase - Centralized access to item data
 * Single source of truth for item lookups
 */
export class ItemDatabase {
  private static itemCache: Map<string, ItemDefinition> | null = null

  /**
   * Validates that an object conforms to ItemDefinition structure
   * Returns the validated item with guaranteed id field, or null if invalid
   */
  private static validateItemDefinition(itemId: string, data: unknown): ItemDefinition | null {
    // Type guard: check if data is an object
    if (typeof data !== 'object' || data === null) {
      console.warn(`[ItemDatabase] Invalid item data for "${itemId}": not an object`)
      return null
    }

    const item = data as Record<string, unknown>

    // Required fields validation
    if (typeof item.name !== 'string') {
      console.warn(`[ItemDatabase] Invalid item "${itemId}": missing or invalid "name"`)
      return null
    }

    if (typeof item.description !== 'string') {
      console.warn(`[ItemDatabase] Invalid item "${itemId}": missing or invalid "description"`)
      return null
    }

    if (item.type !== 'consumable' && item.type !== 'equipment') {
      console.warn(`[ItemDatabase] Invalid item "${itemId}": invalid type "${item.type}"`)
      return null
    }

    // ID consistency check: ensure item.id matches the key, or set it
    if ('id' in item && item.id !== itemId) {
      console.warn(`[ItemDatabase] ID mismatch for "${itemId}": item.id is "${item.id}", expected "${itemId}". Using key as source of truth.`)
    }

    // Build validated item definition
    const validatedItem: ItemDefinition = {
      id: itemId, // Always use the key as the authoritative ID
      name: item.name,
      description: item.description,
      type: item.type as 'consumable' | 'equipment',
    }

    // Optional fields with type checking
    if (item.slot !== undefined) {
      if (typeof item.slot === 'string' &&
          ['weapon', 'armor', 'shield', 'accessory'].includes(item.slot)) {
        validatedItem.slot = item.slot as 'weapon' | 'armor' | 'shield' | 'accessory'
      } else {
        console.warn(`[ItemDatabase] Invalid slot for "${itemId}": "${item.slot}"`)
      }
    }

    if (item.effect !== undefined && typeof item.effect === 'object' && item.effect !== null) {
      validatedItem.effect = item.effect as ItemDefinition['effect']
    }

    if (item.stats !== undefined && typeof item.stats === 'object' && item.stats !== null) {
      validatedItem.stats = item.stats as ItemDefinition['stats']
    }

    if (typeof item.shopPrice === 'number') {
      validatedItem.shopPrice = item.shopPrice
    }

    if (typeof item.sellPrice === 'number') {
      validatedItem.sellPrice = item.sellPrice
    }

    if (typeof item.isStartingEquipment === 'boolean') {
      validatedItem.isStartingEquipment = item.isStartingEquipment
    }

    if (typeof item.isBossDrop === 'boolean') {
      validatedItem.isBossDrop = item.isBossDrop
    }

    if (typeof item.droppedBy === 'string') {
      validatedItem.droppedBy = item.droppedBy
    }

    return validatedItem
  }

  /**
   * Initialize the item cache by flattening all categories
   */
  private static initializeCache(): void {
    if (this.itemCache !== null) {
      return
    }

    this.itemCache = new Map<string, ItemDefinition>()
    const data = rpgItemsData as Record<string, unknown>

    let validItemCount = 0
    let invalidItemCount = 0

    // Flatten all categories into a single map
    for (const [categoryName, category] of Object.entries(data)) {
      if (typeof category !== 'object' || category === null) {
        continue
      }

      // Skip shop_inventory and other non-item categories
      if (categoryName === 'shop_inventory') {
        continue
      }

      // Process each item in the category
      for (const [itemId, itemData] of Object.entries(category)) {
        // Basic check: must have a name field to be considered an item
        if (typeof itemData !== 'object' || itemData === null || !('name' in itemData)) {
          continue
        }

        const validatedItem = this.validateItemDefinition(itemId, itemData)

        if (validatedItem) {
          this.itemCache.set(itemId, validatedItem)
          validItemCount++
        } else {
          invalidItemCount++
        }
      }
    }

    console.log(`[ItemDatabase] Initialized with ${validItemCount} valid items, ${invalidItemCount} invalid items skipped`)
  }

  /**
   * Get an item definition by ID
   * Returns null if item not found
   */
  static getItem(itemId: string): ItemDefinition | null {
    this.initializeCache()
    return this.itemCache!.get(itemId) || null
  }

  /**
   * Check if an item exists
   */
  static hasItem(itemId: string): boolean {
    this.initializeCache()
    return this.itemCache!.has(itemId)
  }

  /**
   * Get all items of a specific type
   */
  static getItemsByType(type: 'consumable' | 'equipment'): ItemDefinition[] {
    this.initializeCache()
    const items: ItemDefinition[] = []

    for (const item of this.itemCache!.values()) {
      if (item.type === type) {
        items.push(item)
      }
    }

    return items
  }

  /**
   * Get all items for a specific equipment slot
   */
  static getItemsBySlot(slot: 'weapon' | 'armor' | 'shield' | 'accessory'): ItemDefinition[] {
    this.initializeCache()
    const items: ItemDefinition[] = []

    for (const item of this.itemCache!.values()) {
      if (item.type === 'equipment' && item.slot === slot) {
        items.push(item)
      }
    }

    return items
  }

  /**
   * Check if an item is starting equipment
   */
  static isStartingEquipment(itemId: string): boolean {
    const item = this.getItem(itemId)
    return item?.isStartingEquipment === true
  }

  /**
   * Get validation statistics
   * Useful for debugging and ensuring all items loaded correctly
   */
  static getStats(): { totalItems: number; categories: string[] } {
    this.initializeCache()

    const categories = new Set<string>()
    for (const item of this.itemCache!.values()) {
      if (item.type === 'equipment' && item.slot) {
        categories.add(item.slot)
      } else {
        categories.add(item.type)
      }
    }

    return {
      totalItems: this.itemCache!.size,
      categories: Array.from(categories).sort()
    }
  }

  /**
   * Validate all items and return detailed results
   * Useful for development/debugging
   */
  static validateAll(): {
    valid: string[]
    invalid: Array<{ id: string; reason: string }>
  } {
    const data = rpgItemsData as Record<string, unknown>
    const valid: string[] = []
    const invalid: Array<{ id: string; reason: string }> = []

    for (const [categoryName, category] of Object.entries(data)) {
      if (typeof category !== 'object' || category === null || categoryName === 'shop_inventory') {
        continue
      }

      for (const [itemId, itemData] of Object.entries(category)) {
        if (typeof itemData !== 'object' || itemData === null || !('name' in itemData)) {
          continue
        }

        const validatedItem = this.validateItemDefinition(itemId, itemData)
        if (validatedItem) {
          valid.push(itemId)
        } else {
          invalid.push({ id: itemId, reason: 'Failed validation' })
        }
      }
    }

    return { valid, invalid }
  }

  /**
   * Clear the cache (useful for testing)
   */
  static clearCache(): void {
    this.itemCache = null
  }
}
