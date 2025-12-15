import type { Equipment } from '../types/game'

/**
 * Equipment validation utilities
 * Ensures equipment items have safe stat structures for combat calculations
 */

/**
 * Validates and normalizes equipment stats to ensure combat safety
 * Returns a new equipment object without mutating the input
 * All stat properties should exist and be numbers (can be 0)
 */
export function validateEquipmentStats(equipment: Equipment): Equipment {
  // Get stats object or use empty object if missing (no mutation)
  const stats = equipment.stats ?? {}

  // Ensure all expected stat properties exist with safe defaults (0)
  // This prevents NaN or undefined in combat calculations
  const normalizedStats = {
    atk: typeof stats.atk === 'number' ? stats.atk : 0,
    def: typeof stats.def === 'number' ? stats.def : 0,
    spd: typeof stats.spd === 'number' ? stats.spd : 0
  }

  // Return new object without mutating input
  return {
    ...equipment,
    stats: normalizedStats
  }
}

/**
 * Creates a safe fallback equipment item with valid stats structure
 */
export function createFallbackEquipment(
  slot: 'weapon' | 'armor' | 'shield' | 'accessory',
  itemId: string
): Equipment {
  return {
    id: itemId,
    name: slot.charAt(0).toUpperCase() + slot.slice(1),
    description: `Basic ${slot} (fallback)`,
    type: 'equipment',
    slot,
    stats: {
      atk: 0,
      def: 0,
      spd: 0
    },
    quantity: 1
  }
}

/**
 * Runtime assertion to verify equipment is combat-safe
 * Always throws an error if validation fails
 */
export function assertEquipmentValid(equipment: Equipment, context: string): void {
  const issues: string[] = []

  if (!equipment.stats) {
    issues.push('Missing stats object')
  } else {
    if (typeof equipment.stats.atk !== 'number') {
      issues.push(`Invalid atk stat: ${equipment.stats.atk}`)
    }
    if (typeof equipment.stats.def !== 'number') {
      issues.push(`Invalid def stat: ${equipment.stats.def}`)
    }
    if (typeof equipment.stats.spd !== 'number') {
      issues.push(`Invalid spd stat: ${equipment.stats.spd}`)
    }
  }

  if (!equipment.slot || !['weapon', 'armor', 'shield', 'accessory'].includes(equipment.slot)) {
    issues.push(`Invalid slot: ${equipment.slot}`)
  }

  if (issues.length > 0) {
    throw new Error(`Equipment validation failed for ${context}: ${issues.join(', ')}`)
  }
}
