import type { RPGState } from '../types/game'
import { ItemDatabase, type ItemDefinition } from './ItemDatabase'
import { InventoryManager } from './InventoryManager'
import rpgItemsData from '../data/rpgItems.json'

/**
 * Shop inventory item configuration
 */
interface ShopInventoryItem {
  itemId: string
  stock: number | 'unlimited'
  respawns?: boolean
}

/**
 * Result of a shop transaction
 */
export interface ShopTransactionResult {
  success: boolean
  newState: RPGState
  message: string
}

/**
 * ShopProcessor - Handles buying and selling items at shops
 */
export class ShopProcessor {
  /**
   * Get the shop inventory for a specific location
   */
  static getShopInventory(locationId: string): ShopInventoryItem[] {
    const shopData = (rpgItemsData as any).shop_inventory
    if (!shopData || !shopData[locationId]) {
      console.warn(`[ShopProcessor] No shop inventory found for location: ${locationId}`)
      return []
    }
    return shopData[locationId] as ShopInventoryItem[]
  }

  /**
   * Get available items for purchase at a shop
   * Returns items with their definitions and availability
   */
  static getAvailableItems(locationId: string): Array<{
    item: ItemDefinition
    stock: number | 'unlimited'
    canAfford: boolean
    playerCurrency: number
  }> {
    const inventory = this.getShopInventory(locationId)

    return inventory
      .map(shopItem => {
        const item = ItemDatabase.getItem(shopItem.itemId)
        if (!item) return null

        return {
          item,
          stock: shopItem.stock,
          canAfford: false, // Will be set when we have player state
          playerCurrency: 0
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }

  /**
   * Get available items with player context
   */
  static getAvailableItemsForPlayer(locationId: string, playerCurrency: number): Array<{
    item: ItemDefinition
    stock: number | 'unlimited'
    canAfford: boolean
    playerCurrency: number
  }> {
    const items = this.getAvailableItems(locationId)

    return items.map(shopItem => ({
      ...shopItem,
      canAfford: (shopItem.item.shopPrice || 0) <= playerCurrency,
      playerCurrency
    }))
  }

  /**
   * Buy an item from the shop
   */
  static buyItem(state: RPGState, itemId: string, locationId: string): ShopTransactionResult {
    // Get item definition
    const item = ItemDatabase.getItem(itemId)
    if (!item) {
      return {
        success: false,
        newState: state,
        message: `Item ${itemId} not found.`
      }
    }

    // Check if item is available in this shop
    const shopInventory = this.getShopInventory(locationId)
    const shopItem = shopInventory.find(si => si.itemId === itemId)

    if (!shopItem) {
      return {
        success: false,
        newState: state,
        message: `${item.name} is not available in this shop.`
      }
    }

    // Check if item has a price
    if (item.shopPrice === undefined || item.shopPrice === 0) {
      return {
        success: false,
        newState: state,
        message: `${item.name} cannot be purchased.`
      }
    }

    // Check if player can afford it
    if (state.currency < item.shopPrice) {
      return {
        success: false,
        newState: state,
        message: `Not enough Crumbs! Need ${item.shopPrice}, have ${state.currency}.`
      }
    }

    // Add item to inventory
    const addResult = InventoryManager.addItem(state, itemId, 1)

    if (!addResult.success) {
      return {
        success: false,
        newState: state,
        message: addResult.message || 'Could not add item to inventory.'
      }
    }

    // Deduct currency
    const newState = {
      ...addResult.newState,
      currency: addResult.newState.currency - item.shopPrice
    }

    return {
      success: true,
      newState,
      message: `Purchased ${item.name} for ${item.shopPrice} Crumbs!`
    }
  }

  /**
   * Sell an item to the shop
   * Can only sell equipment that is not currently equipped
   */
  static sellItem(state: RPGState, itemId: string): ShopTransactionResult {
    // Get item definition
    const item = ItemDatabase.getItem(itemId)
    if (!item) {
      return {
        success: false,
        newState: state,
        message: `Item ${itemId} not found.`
      }
    }

    // Check if item has a sell price
    if (item.sellPrice === undefined || item.sellPrice === 0) {
      return {
        success: false,
        newState: state,
        message: `${item.name} cannot be sold.`
      }
    }

    // Check if item is starting equipment
    if (item.isStartingEquipment) {
      return {
        success: false,
        newState: state,
        message: `${item.name} is starting equipment and cannot be sold.`
      }
    }

    // Check if item is currently equipped
    if (item.type === 'equipment') {
      const { weapon, armor, shield } = state.equipment
      const equippedItems = [weapon?.id, armor?.id, shield?.id]

      if (equippedItems.includes(itemId)) {
        return {
          success: false,
          newState: state,
          message: `${item.name} is currently equipped. Unequip it first.`
        }
      }
    }

    // Check if player has the item
    const inventoryItem = state.inventory.find(i => i.id === itemId)
    if (!inventoryItem || inventoryItem.quantity < 1) {
      return {
        success: false,
        newState: state,
        message: `You don't have ${item.name} to sell.`
      }
    }

    // Remove item from inventory
    const removeResult = InventoryManager.removeItem(state, itemId, 1)

    if (!removeResult.success) {
      return {
        success: false,
        newState: state,
        message: 'Could not remove item from inventory.'
      }
    }

    // Add currency
    const newState = {
      ...removeResult.newState,
      currency: removeResult.newState.currency + item.sellPrice
    }

    return {
      success: true,
      newState,
      message: `Sold ${item.name} for ${item.sellPrice} Crumbs!`
    }
  }

  /**
   * Get all items in player's inventory that can be sold
   */
  static getSellableItems(state: RPGState): Array<{
    item: ItemDefinition
    quantity: number
    sellPrice: number
  }> {
    const { weapon, armor, shield } = state.equipment
    const equippedItemIds = [weapon?.id, armor?.id, shield?.id]

    return state.inventory
      .map(invItem => {
        const item = ItemDatabase.getItem(invItem.id)
        if (!item) return null

        // Can't sell starting equipment
        if (item.isStartingEquipment) return null

        // Can't sell equipped items
        if (equippedItemIds.includes(item.id)) return null

        // Can't sell items with no sell price
        if (!item.sellPrice || item.sellPrice === 0) return null

        return {
          item,
          quantity: invItem.quantity,
          sellPrice: item.sellPrice
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }
}
