import type { RPGState, StatBonus, Equipment } from '../types/game'
import ingredientPowersData from '../data/ingredientPowers.json'
import { ItemDatabase } from './ItemDatabase'
import { STARTING_STATS, STARTING_EQUIPMENT, PROGRESSION } from './RPGConstants'

const ingredientPowers = ingredientPowersData as Record<string, StatBonus & { description: string }>

/**
 * RPGStateManager - Manages RPG state initialization and updates
 * Following the pattern from existing services (stateless, static methods)
 */
export class RPGStateManager {
  /**
   * Creates initial RPG state for a new game
   * @param ingredientsFromAct1 - Array of ingredient IDs collected in Act 1
   * @returns Initial RPG state
   */
  static createInitialState(ingredientsFromAct1: string[]): RPGState {
    const ingredientBonuses = this.convertIngredientsToBonuses(ingredientsFromAct1)
    const baseStats = this.calculateBaseStats(ingredientBonuses)

    return {
      mode: 'rpg',

      // Character Stats
      level: 1,
      xp: 0,
      maxXp: 100, // Level 2 requires 100 XP
      hp: baseStats.maxHp,
      maxHp: baseStats.maxHp,
      stats: {
        atk: baseStats.atk,
        def: baseStats.def,
        spd: baseStats.spd
      },

      // Inventory
      inventory: [],
      equipment: {
        weapon: this.createStartingEquipment('weapon'),
        armor: this.createStartingEquipment('armor'),
        shield: this.createStartingEquipment('shield')
      },
      currency: 0,

      // World Progress
      currentLocation: 'garbage_can_start',
      visitedLocations: ['garbage_can_start'],
      checkpoints: ['garbage_can_start'],
      defeatedBosses: [],

      // Combat State
      inCombat: false,
      currentEnemy: undefined,
      playerDefending: false,

      // Ingredient Powers
      ingredientBonuses
    }
  }

  /**
   * Converts Act 1 ingredients to stat bonuses
   * Loads from ingredientPowers.json for easy balancing
   * Note: questionable_water is excluded (incompatible with Act 2 unlock)
   */
  static convertIngredientsToBonuses(ingredients: string[]): Record<string, StatBonus> {
    const bonuses: Record<string, StatBonus> = {}

    ingredients.forEach(ingredientId => {
      const power = ingredientPowers[ingredientId]
      if (power) {
        // Extract only StatBonus fields (exclude description)
        const { description: _description, ...statBonus } = power
        bonuses[ingredientId] = statBonus
      }
    })

    return bonuses
  }

  /**
   * Calculates base stats with ingredient bonuses applied
   * Starting stats from RPGConstants
   */
  static calculateBaseStats(ingredientBonuses: Record<string, StatBonus>): {
    maxHp: number
    atk: number
    def: number
    spd: number
  } {
    let maxHp: number = STARTING_STATS.HP
    let atk: number = STARTING_STATS.ATK
    let def: number = STARTING_STATS.DEF
    let spd: number = STARTING_STATS.SPD

    // Apply ingredient bonuses
    Object.values(ingredientBonuses).forEach(bonus => {
      if (bonus.maxHp) maxHp += bonus.maxHp
      if (bonus.atk) atk += bonus.atk
      if (bonus.def) def += bonus.def
      if (bonus.spd) spd += bonus.spd
    })

    // Ensure stats don't go negative
    maxHp = Math.max(1, maxHp)
    atk = Math.max(1, atk)
    def = Math.max(0, def)
    spd = Math.max(1, spd)

    return { maxHp, atk, def, spd }
  }

  /**
   * Starts combat with an enemy
   */
  static startCombat(state: RPGState, enemy: any): RPGState {
    return {
      ...state,
      inCombat: true,
      currentEnemy: { ...enemy },
      playerDefending: false
    }
  }

  /**
   * Ends combat
   */
  static endCombat(state: RPGState): RPGState {
    return {
      ...state,
      inCombat: false,
      currentEnemy: undefined,
      playerDefending: false
    }
  }

  /**
   * Updates player HP
   */
  static updatePlayerHp(state: RPGState, newHp: number): RPGState {
    return {
      ...state,
      hp: Math.min(Math.max(0, newHp), state.maxHp)
    }
  }

  /**
   * Updates enemy HP
   */
  static updateEnemyHp(state: RPGState, newHp: number): RPGState {
    if (!state.currentEnemy) return state

    return {
      ...state,
      currentEnemy: {
        ...state.currentEnemy,
        hp: Math.max(0, newHp)
      }
    }
  }

  /**
   * Sets player defending state
   */
  static setDefending(state: RPGState, defending: boolean): RPGState {
    return {
      ...state,
      playerDefending: defending
    }
  }

  /**
   * Adds XP and handles level up
   */
  static addXp(state: RPGState, xpGained: number): RPGState {
    const newXp = state.xp + xpGained
    let newState = { ...state, xp: newXp }

    // Check for level up
    while (newState.xp >= newState.maxXp && newState.level < 10) {
      newState = this.levelUp(newState)
    }

    return newState
  }

  /**
   * Levels up the player
   * Stat growth from RPGConstants
   */
  static levelUp(state: RPGState): RPGState {
    const newLevel = state.level + 1
    const xpCarryover = state.xp - state.maxXp

    // XP curve from constants
    const newMaxXp = PROGRESSION.XP_CURVE[newLevel] ?? PROGRESSION.XP_CURVE[PROGRESSION.XP_CURVE.length - 1]

    return {
      ...state,
      level: newLevel,
      xp: xpCarryover,
      maxXp: newMaxXp,
      maxHp: state.maxHp + PROGRESSION.LEVEL_UP_HP_GAIN,
      hp: state.hp + PROGRESSION.LEVEL_UP_HP_GAIN, // Heal on level up
      stats: {
        atk: state.stats.atk + PROGRESSION.LEVEL_UP_ATK_GAIN,
        def: state.stats.def + PROGRESSION.LEVEL_UP_DEF_GAIN,
        spd: state.stats.spd + PROGRESSION.LEVEL_UP_SPD_GAIN
      }
    }
  }

  /**
   * Adds currency
   */
  static addCurrency(state: RPGState, amount: number): RPGState {
    return {
      ...state,
      currency: state.currency + amount
    }
  }

  /**
   * Changes current location and marks it as visited
   */
  static changeLocation(state: RPGState, locationId: string): RPGState {
    const visitedLocations = state.visitedLocations.includes(locationId)
      ? state.visitedLocations
      : [...state.visitedLocations, locationId]

    return {
      ...state,
      currentLocation: locationId,
      visitedLocations
    }
  }

  /**
   * Adds a checkpoint
   */
  static addCheckpoint(state: RPGState, checkpointId: string): RPGState {
    if (state.checkpoints.includes(checkpointId)) {
      return state
    }

    return {
      ...state,
      checkpoints: [...state.checkpoints, checkpointId]
    }
  }

  /**
   * Marks a boss as defeated
   */
  static defeatBoss(state: RPGState, bossId: string): RPGState {
    if (state.defeatedBosses.includes(bossId)) {
      return state
    }

    return {
      ...state,
      defeatedBosses: [...state.defeatedBosses, bossId]
    }
  }

  /**
   * Creates starting equipment for a slot
   */
  private static createStartingEquipment(slot: 'weapon' | 'armor' | 'shield'): Equipment {
    const startingIds = {
      weapon: STARTING_EQUIPMENT.WEAPON,
      armor: STARTING_EQUIPMENT.ARMOR,
      shield: STARTING_EQUIPMENT.SHIELD
    }

    const itemId = startingIds[slot]
    const itemDef = ItemDatabase.getItem(itemId)

    if (!itemDef) {
      throw new Error(`Starting equipment definition not found for ${slot} (${itemId})`)
    }

    return {
      id: itemId,
      name: itemDef.name,
      description: itemDef.description,
      type: 'equipment',
      slot,
      stats: itemDef.stats || {},
      quantity: 1
    }
  }
}
