/**
 * Simple validation test for ItemDatabase
 * Run this file manually in dev mode to check item validation
 *
 * To test: Import this in main.tsx temporarily and check console
 */

import { ItemDatabase } from './ItemDatabase'

export function testItemDatabase(): void {
  console.log('=== ItemDatabase Validation Test ===')

  // Get stats
  const stats = ItemDatabase.getStats()
  console.log(`Total items loaded: ${stats.totalItems}`)
  console.log(`Categories: ${stats.categories.join(', ')}`)

  // Validate all items
  const validation = ItemDatabase.validateAll()
  console.log(`\nValid items: ${validation.valid.length}`)
  console.log(`Invalid items: ${validation.invalid.length}`)

  if (validation.invalid.length > 0) {
    console.warn('Invalid items found:')
    validation.invalid.forEach(item => {
      console.warn(`  - ${item.id}: ${item.reason}`)
    })
  }

  // Test specific items
  console.log('\n=== Testing Specific Items ===')

  const testItems = [
    'toothpick_shiv',
    'crumbs',
    'moldy_bread',
    'fork_tine_sword',
    'nonexistent_item'
  ]

  testItems.forEach(itemId => {
    const item = ItemDatabase.getItem(itemId)
    if (item) {
      console.log(`✓ ${itemId}: ${item.name} (${item.type})`)
      if (item.id !== itemId) {
        console.error(`  ERROR: ID mismatch! Expected "${itemId}", got "${item.id}"`)
      }
    } else {
      console.log(`✗ ${itemId}: Not found`)
    }
  })

  // Test starting equipment
  console.log('\n=== Testing Starting Equipment ===')
  const startingItems = ['toothpick_shiv', 'exposed_bun', 'no_shield']
  startingItems.forEach(itemId => {
    const isStarting = ItemDatabase.isStartingEquipment(itemId)
    console.log(`${itemId}: ${isStarting ? 'IS' : 'NOT'} starting equipment`)
  })

  console.log('\n=== Test Complete ===')
}

// Uncomment to run automatically (for manual testing):
// testItemDatabase()
