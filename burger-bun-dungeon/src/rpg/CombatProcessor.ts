import type { RPGState, Enemy } from '../types/game'
import { InventoryManager } from './InventoryManager'
import { RPGStateManager } from './RPGStateManager'
import { COMBAT, PROGRESSION } from './RPGConstants'

export interface CombatAction {
  actor: 'player' | 'enemy'
  action: 'attack' | 'defend' | 'item' | 'flee' | 'revive'
  damage?: number        // HP lost (attacks, enemy actions)
  healAmount?: number    // HP gained (healing items, revives)
  success?: boolean
  message: string
  autoUsed?: boolean     // True for auto-consumed items (e.g., Moldy Bread revive)
}

export interface CombatResult {
  newState: RPGState
  actions: CombatAction[]
  outcome: 'continue' | 'victory' | 'defeat' | 'fled'
}

/**
 * CombatProcessor - Handles all combat logic and calculations
 * Pure functions that take state and return new state + combat log
 */
export class CombatProcessor {
  /**
   * Processes a full combat turn (player action + enemy response)
   */
  static processTurn(
    state: RPGState,
    playerAction: 'attack' | 'defend' | 'item' | 'flee',
    itemId?: string
  ): CombatResult {
    if (!state.currentEnemy) {
      return {
        newState: state,
        actions: [{ actor: 'player', action: playerAction, message: 'No enemy to fight!' }],
        outcome: 'continue'
      }
    }

    const actions: CombatAction[] = []
    let currentState = { ...state }

    // Player turn
    switch (playerAction) {
      case 'attack':
        const attackResult = this.playerAttack(currentState)
        currentState = attackResult.newState
        actions.push(...attackResult.actions)
        break

      case 'defend':
        const defendResult = this.playerDefend(currentState)
        currentState = defendResult.newState
        actions.push(...defendResult.actions)
        break

      case 'item':
        if (!itemId) {
          actions.push({
            actor: 'player',
            action: 'item',
            message: 'No item specified to use!'
          })
        } else {
          const itemResult = this.playerUseItem(currentState, itemId)
          currentState = itemResult.newState
          actions.push(...itemResult.actions)
        }
        break

      case 'flee':
        const fleeResult = this.playerFlee(currentState)
        if (fleeResult.success) {
          return {
            newState: fleeResult.newState,
            actions: fleeResult.actions,
            outcome: 'fled'
          }
        }
        currentState = fleeResult.newState
        actions.push(...fleeResult.actions)
        break
    }

    // Check if enemy is defeated
    if (currentState.currentEnemy && currentState.currentEnemy.hp <= 0) {
      return {
        newState: currentState,
        actions,
        outcome: 'victory'
      }
    }

    // Enemy turn (only if player didn't flee successfully)
    if (currentState.currentEnemy) {
      const enemyResult = this.enemyTurn(currentState)
      currentState = enemyResult.newState
      actions.push(...enemyResult.actions)

      // Reset defending state after enemy attacks
      currentState = { ...currentState, playerDefending: false }
    }

    // Check if player is defeated
    if (currentState.hp <= 0) {
      // Check for Moldy Bread auto-revive
      const moldyBread = currentState.inventory.find(item => item.id === 'moldy_bread')

      if (moldyBread && moldyBread.quantity > 0) {
        // Auto-consume Moldy Bread and revive to 50% HP
        const reviveHp = Math.floor(currentState.maxHp * 0.5)
        const removeResult = InventoryManager.removeItem(currentState, 'moldy_bread', 1)

        // Check if item removal was successful
        if (!removeResult.success) {
          // Failed to remove item - shouldn't happen, but handle gracefully
          return {
            newState: currentState,
            actions,
            outcome: 'defeat'
          }
        }

        // Apply revive
        currentState = {
          ...removeResult.newState,
          hp: reviveHp
        }

        actions.push({
          actor: 'player',
          action: 'revive',
          healAmount: reviveHp,
          success: true,
          autoUsed: true,
          message: `💀 You were defeated! But Moldy Bread activated, reviving you to ${reviveHp} HP!`
        })

        // Continue combat instead of ending in defeat
      } else {
        // No Moldy Bread - player is defeated
        return {
          newState: currentState,
          actions,
          outcome: 'defeat'
        }
      }
    }

    return {
      newState: currentState,
      actions,
      outcome: 'continue'
    }
  }

  /**
   * Player attacks the enemy
   */
  static playerAttack(state: RPGState): {
    newState: RPGState
    actions: CombatAction[]
  } {
    if (!state.currentEnemy) {
      return {
        newState: state,
        actions: []
      }
    }

    const damage = this.calculateDamage(
      { atk: state.stats.atk, def: 0 },
      { atk: 0, def: state.currentEnemy.def },
      false
    )

    const newEnemyHp = Math.max(0, state.currentEnemy.hp - damage)

    const newState: RPGState = {
      ...state,
      currentEnemy: {
        ...state.currentEnemy,
        hp: newEnemyHp
      }
    }

    const actions: CombatAction[] = [
      {
        actor: 'player',
        action: 'attack',
        damage,
        message: `You attack the ${state.currentEnemy.name} for ${damage} damage!`
      }
    ]

    return { newState, actions }
  }

  /**
   * Player defends (reduces incoming damage by 50% next turn)
   */
  static playerDefend(state: RPGState): {
    newState: RPGState
    actions: CombatAction[]
  } {
    const newState: RPGState = {
      ...state,
      playerDefending: true
    }

    const actions: CombatAction[] = [
      {
        actor: 'player',
        action: 'defend',
        message: 'You brace yourself. Incoming damage will be reduced by 50%.'
      }
    ]

    return { newState, actions }
  }

  /**
   * Player uses an item
   */
  static playerUseItem(state: RPGState, itemId: string): {
    newState: RPGState
    actions: CombatAction[]
  } {
    const useResult = InventoryManager.useConsumable(state, itemId)

    if (!useResult.success) {
      return {
        newState: state,
        actions: [
          {
            actor: 'player',
            action: 'item',
            message: useResult.message
          }
        ]
      }
    }

    return {
      newState: useResult.newState,
      actions: [
        {
          actor: 'player',
          action: 'item',
          healAmount: useResult.healAmount,
          success: true,
          message: useResult.message
        }
      ]
    }
  }

  /**
   * Player attempts to flee (50% base chance)
   */
  static playerFlee(state: RPGState): {
    newState: RPGState
    actions: CombatAction[]
    success: boolean
  } {
    if (!state.currentEnemy) {
      return {
        newState: state,
        actions: [],
        success: false
      }
    }

    // Cannot flee from boss battles
    const enemyData = state.currentEnemy as any
    if (enemyData.isBoss) {
      return {
        newState: state,
        actions: [
          {
            actor: 'player',
            action: 'flee',
            success: false,
            message: 'You cannot flee from a boss battle!'
          }
        ],
        success: false
      }
    }

    // Check flee chance
    const fleeSuccess = Math.random() < COMBAT.FLEE_CHANCE

    if (fleeSuccess) {
      return {
        newState: state,
        actions: [
          {
            actor: 'player',
            action: 'flee',
            success: true,
            message: 'You successfully fled from battle!'
          }
        ],
        success: true
      }
    }

    // Failed flee - enemy gets free attack
    const damage = this.calculateDamage(
      { atk: state.currentEnemy.atk, def: 0 },
      { atk: 0, def: state.stats.def },
      state.playerDefending
    )

    const newPlayerHp = Math.max(0, state.hp - damage)

    return {
      newState: { ...state, hp: newPlayerHp },
      actions: [
        {
          actor: 'player',
          action: 'flee',
          success: false,
          message: 'You failed to escape!'
        },
        {
          actor: 'enemy',
          action: 'attack',
          damage,
          message: `The ${state.currentEnemy.name} attacks while you flee, dealing ${damage} damage!`
        }
      ],
      success: false
    }
  }

  /**
   * Enemy takes their turn based on AI pattern
   */
  static enemyTurn(state: RPGState): {
    newState: RPGState
    actions: CombatAction[]
  } {
    if (!state.currentEnemy) {
      return {
        newState: state,
        actions: []
      }
    }

    const enemyAction = this.determineEnemyAction(state.currentEnemy)

    if (enemyAction === 'defend') {
      // Enemy defends (future implementation for defensive enemies)
      return {
        newState: state,
        actions: [
          {
            actor: 'enemy',
            action: 'defend',
            message: `The ${state.currentEnemy.name} takes a defensive stance.`
          }
        ]
      }
    }

    // Enemy attacks
    const damage = this.calculateDamage(
      { atk: state.currentEnemy.atk, def: 0 },
      { atk: 0, def: state.stats.def },
      state.playerDefending
    )

    const newPlayerHp = Math.max(0, state.hp - damage)

    const newState: RPGState = {
      ...state,
      hp: newPlayerHp
    }

    const actions: CombatAction[] = [
      {
        actor: 'enemy',
        action: 'attack',
        damage,
        message: `The ${state.currentEnemy.name} attacks you for ${damage} damage!`
      }
    ]

    return { newState, actions }
  }

  /**
   * Determines enemy action based on AI pattern
   */
  static determineEnemyAction(enemy: Enemy): 'attack' | 'defend' {
    switch (enemy.aiPattern) {
      case 'aggressive':
        return 'attack'

      case 'defensive':
        // 40% chance to defend
        return Math.random() < 0.4 ? 'defend' : 'attack'

      case 'random':
        // 20% chance to defend
        return Math.random() < 0.2 ? 'defend' : 'attack'

      default:
        return 'attack'
    }
  }

  /**
   * Calculates damage with variance
   * Formula: (ATK - DEF) + random(0 to variance-1) * defending multiplier
   */
  static calculateDamage(
    attacker: { atk: number; def: number },
    defender: { atk: number; def: number },
    isDefending: boolean
  ): number {
    const baseDamage = attacker.atk - defender.def
    const variance = Math.floor(Math.random() * COMBAT.DAMAGE_VARIANCE)
    const defendMultiplier = isDefending ? COMBAT.DEFENSE_MULTIPLIER : 1.0
    const finalDamage = Math.floor((baseDamage + variance) * defendMultiplier)

    return Math.max(COMBAT.MIN_DAMAGE, finalDamage)
  }

  /**
   * Starts combat with an enemy (loads from enemy data)
   */
  static startCombat(state: RPGState, enemyData: any): RPGState {
    // Create a fresh enemy instance with full HP
    const enemy: Enemy = {
      id: enemyData.id,
      name: enemyData.name,
      description: enemyData.description,
      level: enemyData.level,
      hp: enemyData.maxHp,
      maxHp: enemyData.maxHp,
      atk: enemyData.atk,
      def: enemyData.def,
      spd: enemyData.spd,
      xpReward: enemyData.xpReward,
      lootTable: enemyData.lootTable || [],
      aiPattern: enemyData.aiPattern
    }

    return {
      ...state,
      inCombat: true,
      currentEnemy: enemy,
      playerDefending: false
    }
  }

  /**
   * Ends combat and awards XP/loot
   */
  static endCombat(state: RPGState, victory: boolean): {
    newState: RPGState
    xpGained: number
    currencyGained: number
    itemsLooted: string[]
  } {
    if (!state.currentEnemy) {
      return {
        newState: state,
        xpGained: 0,
        currencyGained: 0,
        itemsLooted: []
      }
    }

    if (!victory) {
      // Defeat - just end combat
      return {
        newState: {
          ...state,
          inCombat: false,
          currentEnemy: undefined,
          playerDefending: false
        },
        xpGained: 0,
        currencyGained: 0,
        itemsLooted: []
      }
    }

    // Victory - award XP and loot
    const xpGained = state.currentEnemy.xpReward
    const currencyGained = this.rollCurrency(state.currentEnemy)
    const itemsLooted = this.rollLoot(state.currentEnemy)

    // Add XP (with level-up handling)
    let newState = { ...state }
    let remainingXp = newState.xp + xpGained

    // Check for level up - track remaining XP correctly across multiple levels
    while (remainingXp >= newState.maxXp && newState.level < PROGRESSION.MAX_LEVEL) {
      remainingXp = remainingXp - newState.maxXp
      newState = RPGStateManager.levelUp(newState)
    }

    // Set final XP (cap at maxXp if at max level)
    newState = {
      ...newState,
      xp: newState.level >= PROGRESSION.MAX_LEVEL ? Math.min(remainingXp, newState.maxXp) : remainingXp
    }

    // Add currency
    newState = {
      ...newState,
      currency: newState.currency + currencyGained
    }

    // Add looted items to inventory
    itemsLooted.forEach(itemId => {
      const addResult = InventoryManager.addItem(newState, itemId, 1)
      newState = addResult.newState
    })

    // End combat
    newState = {
      ...newState,
      inCombat: false,
      currentEnemy: undefined,
      playerDefending: false
    }

    return {
      newState,
      xpGained,
      currencyGained,
      itemsLooted
    }
  }

  /**
   * Rolls for currency drop
   */
  static rollCurrency(enemy: any): number {
    if (!enemy.currencyDrop) return 0

    const min = enemy.currencyDrop.min || 0
    const max = enemy.currencyDrop.max || 0
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * Rolls for item drops based on loot table
   */
  static rollLoot(enemy: Enemy): string[] {
    const loot: string[] = []

    enemy.lootTable.forEach(drop => {
      if (Math.random() < drop.chance) {
        loot.push(drop.itemId)
      }
    })

    return loot
  }

}
