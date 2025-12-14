/**
 * RPGConstants - Centralized constants for RPG game mechanics
 * Makes balancing easier and prevents magic numbers throughout the code
 */

// Combat Constants
export const COMBAT = {
  DAMAGE_VARIANCE: 3,           // Random variance added to damage (0 to DAMAGE_VARIANCE-1)
  DEFENSE_MULTIPLIER: 0.5,      // Damage reduction when defending
  FLEE_CHANCE: 0.5,             // Base chance to flee from combat (50%)
  MIN_DAMAGE: 1,                // Minimum damage dealt by any attack
} as const

// Progression Constants
export const PROGRESSION = {
  MAX_LEVEL: 10,
  LEVEL_UP_HP_GAIN: 10,
  LEVEL_UP_ATK_GAIN: 2,
  LEVEL_UP_DEF_GAIN: 1,
  LEVEL_UP_SPD_GAIN: 1,
  XP_CURVE: [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700] as const,
} as const

// Starting Stats
export const STARTING_STATS = {
  HP: 50,
  ATK: 5,
  DEF: 3,
  SPD: 5,
  LEVEL: 1,
  XP: 0,
  CURRENCY: 0,
} as const

// Inventory Constants
export const INVENTORY = {
  MAX_SIZE: 10,
} as const

// Starting Equipment IDs
export const STARTING_EQUIPMENT = {
  WEAPON: 'toothpick_shiv',
  ARMOR: 'exposed_bun',
  SHIELD: 'no_shield',
} as const

// Base stats calculation (per level)
export function calculateBaseStat(baseStat: number, level: number, growthPerLevel: number): number {
  return baseStat + (level - 1) * growthPerLevel
}
