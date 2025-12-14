import type { RPGState, InventoryItem, Equipment } from '../types/game'
import rpgItemsData from '../data/rpgItems.json'

const rpgItems = rpgItemsData as Record<string, any>

/**
 * InventoryManager - Handles inventory operations, item usage, and equipment management
 */
export class InventoryManager {
  private static readonly MAX_INVENTORY_SIZE = 10

  /**
   * Add an item to the inventory
   * Returns updated state and success boolean
   */
  static addItem(state: RPGState, itemId: string, quantity: number = 1): { newState: RPGState; success: boolean; message: string } {
    // Find the item definition
    const itemDef = this.getItemDefinition(itemId)
    if (!itemDef) {
      return { newState: state, success: false, message: `Item ${itemId} not found` }
    }

    // Check if item already exists in inventory
    const existingItemIndex = state.inventory.findIndex(item => item.id === itemId)

    if (existingItemIndex !== -1) {
      // Stack with existing item
      const newInventory = [...state.inventory]
      newInventory[existingItemIndex] = {
        ...newInventory[existingItemIndex],
        quantity: newInventory[existingItemIndex].quantity + quantity
      }

      return {
        newState: { ...state, inventory: newInventory },
        success: true,
        message: `Received ${quantity}x ${itemDef.name}`
      }
    } else {
      // Check inventory space
      if (state.inventory.length >= this.MAX_INVENTORY_SIZE) {
        return { newState: state, success: false, message: 'Inventory is full!' }
      }

      // Add new item
      const newItem: InventoryItem = {
        id: itemId,
        name: itemDef.name,
        description: itemDef.description,
        type: itemDef.type,
        effect: itemDef.effect,
        quantity
      }

      return {
        newState: { ...state, inventory: [...state.inventory, newItem] },
        success: true,
        message: `Received ${quantity}x ${itemDef.name}`
      }
    }
  }

  /**
   * Remove an item from inventory
   */
  static removeItem(state: RPGState, itemId: string, quantity: number = 1): { newState: RPGState; success: boolean } {
    const existingItemIndex = state.inventory.findIndex(item => item.id === itemId)

    if (existingItemIndex === -1) {
      return { newState: state, success: false }
    }

    const newInventory = [...state.inventory]
    const item = newInventory[existingItemIndex]

    if (item.quantity <= quantity) {
      // Remove item entirely
      newInventory.splice(existingItemIndex, 1)
    } else {
      // Reduce quantity
      newInventory[existingItemIndex] = {
        ...item,
        quantity: item.quantity - quantity
      }
    }

    return {
      newState: { ...state, inventory: newInventory },
      success: true
    }
  }

  /**
   * Use a consumable item
   */
  static useConsumable(state: RPGState, itemId: string): { newState: RPGState; success: boolean; message: string; healAmount?: number } {
    const item = state.inventory.find(i => i.id === itemId)

    if (!item) {
      return { newState: state, success: false, message: 'Item not found in inventory' }
    }

    if (item.type !== 'consumable') {
      return { newState: state, success: false, message: 'This item cannot be used' }
    }

    if (!item.effect) {
      return { newState: state, success: false, message: 'This item has no effect' }
    }

    let newState = { ...state }
    let message = ''
    let healAmount = 0

    // Apply healing effect
    if (item.effect.healHp) {
      const hpBefore = newState.hp
      newState.hp = Math.min(newState.maxHp, newState.hp + item.effect.healHp)
      healAmount = newState.hp - hpBefore
      message = `Healed ${healAmount} HP!`
    }

    // Apply stat buffs (temporary - would need combat state to track)
    if (item.effect.buffAtk || item.effect.buffDef) {
      message += ' (Buffs not yet implemented)'
    }

    // Remove one of the item
    const removeResult = this.removeItem(newState, itemId, 1)
    newState = removeResult.newState

    return { newState, success: true, message, healAmount }
  }

  /**
   * Equip an item to the appropriate slot
   */
  static equipItem(state: RPGState, itemId: string): { newState: RPGState; success: boolean; message: string } {
    const itemDef = this.getItemDefinition(itemId)

    if (!itemDef || itemDef.type !== 'equipment') {
      return { newState: state, success: false, message: 'Item cannot be equipped' }
    }

    const slot = itemDef.slot as 'weapon' | 'armor' | 'shield'
    const currentEquipment = state.equipment[slot]

    // Unequip current item (if any and not a starting item)
    let newState = { ...state }
    if (currentEquipment && !this.isStartingEquipment(currentEquipment.id)) {
      const addResult = this.addItem(newState, currentEquipment.id, 1)
      newState = addResult.newState
    }

    // Remove the new item from inventory
    const removeResult = this.removeItem(newState, itemId, 1)
    if (!removeResult.success) {
      // Item not in inventory - cannot equip
      return { newState: state, success: false, message: 'Item not found in inventory' }
    }
    newState = removeResult.newState

    // Equip the new item
    const equipment: Equipment = {
      id: itemId,
      name: itemDef.name,
      description: itemDef.description,
      type: 'equipment',
      slot: itemDef.slot,
      stats: itemDef.stats,
      quantity: 1
    }

    newState = {
      ...newState,
      equipment: {
        ...newState.equipment,
        [slot]: equipment
      }
    }

    // Recalculate stats
    newState = this.recalculateStats(newState)

    return {
      newState,
      success: true,
      message: `Equipped ${itemDef.name}`
    }
  }

  /**
   * Unequip an item from a slot
   */
  static unequipItem(state: RPGState, slot: 'weapon' | 'armor' | 'shield'): { newState: RPGState; success: boolean; message: string } {
    const currentEquipment = state.equipment[slot]

    if (!currentEquipment) {
      return { newState: state, success: false, message: 'No item equipped in this slot' }
    }

    // Don't allow unequipping starting equipment
    if (this.isStartingEquipment(currentEquipment.id)) {
      return { newState: state, success: false, message: 'Cannot unequip starting equipment' }
    }

    // Add to inventory
    const addResult = this.addItem(state, currentEquipment.id, 1)
    if (!addResult.success) {
      return { newState: state, success: false, message: 'Inventory is full' }
    }

    // Get the starting equipment for this slot
    const startingEquipmentId = this.getStartingEquipmentId(slot)
    const startingEquipmentDef = this.getItemDefinition(startingEquipmentId)

    if (!startingEquipmentDef) {
      throw new Error(`Starting equipment definition not found for ${slot} (${startingEquipmentId})`)
    }

    const startingEquipment: Equipment = {
      id: startingEquipmentId,
      name: startingEquipmentDef.name,
      description: startingEquipmentDef.description,
      type: 'equipment',
      slot,
      stats: startingEquipmentDef.stats,
      quantity: 1
    }

    let newState = {
      ...addResult.newState,
      equipment: {
        ...addResult.newState.equipment,
        [slot]: startingEquipment
      }
    }

    // Recalculate stats
    newState = this.recalculateStats(newState)

    return {
      newState,
      success: true,
      message: `Unequipped ${currentEquipment.name}`
    }
  }

  /**
   * Recalculate player stats based on equipment
   */
  private static recalculateStats(state: RPGState): RPGState {
    // Start with base stats (calculated from level)
    const baseAtk = 5 + (state.level - 1) * 2
    const baseDef = 3 + (state.level - 1) * 1
    const baseSpd = 5 + (state.level - 1) * 1

    let totalAtk = baseAtk
    let totalDef = baseDef
    let totalSpd = baseSpd

    // Add equipment bonuses
    const { weapon, armor, shield } = state.equipment

    if (weapon?.stats) {
      totalAtk += weapon.stats.atk || 0
      totalDef += weapon.stats.def || 0
      totalSpd += weapon.stats.spd || 0
    }

    if (armor?.stats) {
      totalAtk += armor.stats.atk || 0
      totalDef += armor.stats.def || 0
      totalSpd += armor.stats.spd || 0
    }

    if (shield?.stats) {
      totalAtk += shield.stats.atk || 0
      totalDef += shield.stats.def || 0
      totalSpd += shield.stats.spd || 0
    }

    // Add ingredient bonuses
    Object.values(state.ingredientBonuses).forEach(bonus => {
      totalAtk += bonus.atk || 0
      totalDef += bonus.def || 0
      totalSpd += bonus.spd || 0
    })

    return {
      ...state,
      stats: {
        atk: totalAtk,
        def: totalDef,
        spd: totalSpd
      }
    }
  }

  /**
   * Get item definition from JSON data
   */
  private static getItemDefinition(itemId: string): any {
    // Search through all categories
    for (const category of Object.values(rpgItems)) {
      if (typeof category === 'object' && category !== null && itemId in category) {
        return category[itemId]
      }
    }
    return null
  }

  /**
   * Check if an item is starting equipment
   */
  private static isStartingEquipment(itemId: string): boolean {
    const itemDef = this.getItemDefinition(itemId)
    return itemDef?.isStartingEquipment === true
  }

  /**
   * Get starting equipment ID for a slot
   */
  private static getStartingEquipmentId(slot: 'weapon' | 'armor' | 'shield'): string {
    const startingEquipment = {
      weapon: 'toothpick_shiv',
      armor: 'exposed_bun',
      shield: 'no_shield'
    }
    return startingEquipment[slot]
  }

  /**
   * Get a list of usable consumable items
   */
  static getUsableConsumables(state: RPGState): InventoryItem[] {
    return state.inventory.filter(item => item.type === 'consumable')
  }

  /**
   * Get a list of equippable items
   */
  static getEquippableItems(state: RPGState): Equipment[] {
    return state.inventory.filter(item => item.type === 'equipment') as Equipment[]
  }
}
