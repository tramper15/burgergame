import type { RPGState, StatBonus } from '../types/game'

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
        weapon: null,
        armor: null,
        shield: null
      },
      currency: 0,

      // World Progress
      currentLocation: 'garbage_can_start',
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
   * Based on design doc ingredient power table
   */
  static convertIngredientsToBonuses(ingredients: string[]): Record<string, StatBonus> {
    const bonuses: Record<string, StatBonus> = {}

    // Ingredient power mappings from design doc
    const ingredientEffects: Record<string, StatBonus> = {
      'cheese': { def: 5 },
      'bacon': { atk: 5 },
      'lettuce': { spd: 3 },
      'tomato': { maxHp: 10 },
      'avocado': { maxHp: 15 }, // Required for unlock
      'pickle': { ability: 'poison_strike' },
      'onion': { ability: 'onion_tears' },
      'special_sauce': { ability: 'heal' },
      'meat_patty': { atk: 8 },
      'questionable_water': { atk: 10, maxHp: -5 } // Cursed
    }

    ingredients.forEach(ingredientId => {
      const effect = ingredientEffects[ingredientId]
      if (effect) {
        bonuses[ingredientId] = effect
      }
    })

    return bonuses
  }

  /**
   * Calculates base stats with ingredient bonuses applied
   * Starting stats from design doc:
   * HP: 50, ATK: 5, DEF: 3, SPD: 5
   */
  static calculateBaseStats(ingredientBonuses: Record<string, StatBonus>): {
    maxHp: number
    atk: number
    def: number
    spd: number
  } {
    let maxHp = 50
    let atk = 5
    let def = 3
    let spd = 5

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
   * Stat growth from design doc:
   * HP: +10, ATK: +2, DEF: +1, SPD: +1
   */
  static levelUp(state: RPGState): RPGState {
    const newLevel = state.level + 1
    const xpCarryover = state.xp - state.maxXp

    // XP curve from design doc
    const xpRequired = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700]
    const newMaxXp = xpRequired[newLevel] || 2700

    return {
      ...state,
      level: newLevel,
      xp: xpCarryover,
      maxXp: newMaxXp,
      maxHp: state.maxHp + 10,
      hp: state.hp + 10, // Heal on level up
      stats: {
        atk: state.stats.atk + 2,
        def: state.stats.def + 1,
        spd: state.stats.spd + 1
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
   * Changes current location
   */
  static changeLocation(state: RPGState, locationId: string): RPGState {
    return {
      ...state,
      currentLocation: locationId
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
}
