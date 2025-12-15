import type { RPGState, Enemy } from '../types/game'
import { InventoryManager } from './InventoryManager'
import { RPGStateManager } from './RPGStateManager'
import { COMBAT, PROGRESSION } from './RPGConstants'
import { SpecialAbilities } from './SpecialAbilities'
import rpgEnemiesData from '../data/rpgEnemies.json'

export interface CombatAction {
  actor: 'player' | 'enemy'
  action: 'attack' | 'defend' | 'item' | 'flee' | 'revive' | 'ability'
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
    playerAction: 'attack' | 'defend' | 'item' | 'flee' | 'ability',
    itemOrAbilityId?: string
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
        if (!itemOrAbilityId) {
          actions.push({
            actor: 'player',
            action: 'item',
            message: 'No item specified to use!'
          })
        } else {
          const itemResult = this.playerUseItem(currentState, itemOrAbilityId)
          currentState = itemResult.newState
          actions.push(...itemResult.actions)
        }
        break

      case 'ability':
        if (!itemOrAbilityId) {
          actions.push({
            actor: 'player',
            action: 'ability',
            message: 'No ability specified to use!'
          })
        } else {
          const abilityResult = this.playerUseAbility(currentState, itemOrAbilityId)
          currentState = abilityResult.newState
          actions.push(...abilityResult.actions)
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
      const wasDefending = currentState.playerDefending
      const enemyResult = this.enemyTurn(currentState)
      currentState = enemyResult.newState
      actions.push(...enemyResult.actions)

      // Counter-attack if player was defending and survived
      if (wasDefending && currentState.hp > 0 && currentState.currentEnemy && currentState.currentEnemy.hp > 0) {
        const counterDamage = Math.floor(
          this.calculateDamage(
            { atk: currentState.stats.atk, def: 0 },
            { atk: 0, def: currentState.currentEnemy.def },
            false
          ) * COMBAT.COUNTER_MULTIPLIER
        )

        const newEnemyHp = Math.max(0, currentState.currentEnemy.hp - counterDamage)
        currentState = {
          ...currentState,
          currentEnemy: {
            ...currentState.currentEnemy,
            hp: newEnemyHp
          }
        }

        actions.push({
          actor: 'player',
          action: 'attack',
          damage: counterDamage,
          message: `You counter-attack for ${counterDamage} damage!`
        })
      }

      // Reset defending state after enemy attacks and counter
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

    // Priority: Attack minions first, then boss
    let target = state.currentEnemy
    let targetIsMinion = false
    let minionIndex = -1

    if (state.currentEnemy.minions && state.currentEnemy.minions.length > 0) {
      // Attack the first alive minion
      target = state.currentEnemy.minions[0]
      targetIsMinion = true
      minionIndex = 0
    }

    // Check for evasion
    if (SpecialAbilities.checkEvasion(target)) {
      return {
        newState: state,
        actions: [
          {
            actor: 'player',
            action: 'attack',
            damage: 0,
            message: `You attack the ${target.name}, but it dodges!`
          }
        ]
      }
    }

    const damage = this.calculateDamage(
      { atk: state.stats.atk, def: 0 },
      { atk: 0, def: target.def },
      false
    )

    const newTargetHp = Math.max(0, target.hp - damage)

    let newState: RPGState = { ...state }
    const actions: CombatAction[] = []

    if (targetIsMinion && state.currentEnemy.minions) {
      // Update minion HP
      const updatedMinions = [...state.currentEnemy.minions]
      updatedMinions[minionIndex] = {
        ...updatedMinions[minionIndex],
        hp: newTargetHp
      }

      // Remove dead minions
      const aliveMinions = updatedMinions.filter(m => m.hp > 0)

      if (newTargetHp <= 0) {
        actions.push({
          actor: 'player',
          action: 'attack',
          damage,
          message: `You attack the ${target.name} for ${damage} damage and defeat it!`
        })
      } else {
        actions.push({
          actor: 'player',
          action: 'attack',
          damage,
          message: `You attack the ${target.name} for ${damage} damage!`
        })
      }

      newState = {
        ...state,
        currentEnemy: {
          ...state.currentEnemy,
          minions: aliveMinions
        }
      }
    } else {
      // Attack main enemy
      newState = {
        ...state,
        currentEnemy: {
          ...state.currentEnemy,
          hp: newTargetHp
        }
      }

      actions.push({
        actor: 'player',
        action: 'attack',
        damage,
        message: `You attack the ${state.currentEnemy.name} for ${damage} damage!`
      })

      // Check for boss phase transitions after damage
      if (newState.currentEnemy) {
        const phaseResult = SpecialAbilities.updateBossPhase(newState.currentEnemy)
        if (phaseResult.phaseChanged && phaseResult.phaseMessage) {
          actions.push({
            actor: 'enemy',
            action: 'attack',
            message: `⚠️ ${phaseResult.phaseMessage}`
          })
        }
      }
    }

    return { newState, actions }
  }

  /**
   * Player defends (reduces incoming damage by 75% and counter-attacks)
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
        message: 'You take a defensive stance, ready to counter-attack! Incoming damage reduced by 75%.'
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
   * Player uses a special ability from ingredients
   */
  static playerUseAbility(state: RPGState, abilityId: string): {
    newState: RPGState
    actions: CombatAction[]
  } {
    if (!state.currentEnemy) {
      return {
        newState: state,
        actions: [
          {
            actor: 'player',
            action: 'ability',
            message: 'No enemy to target!'
          }
        ]
      }
    }

    const actions: CombatAction[] = []
    let newState = { ...state }

    switch (abilityId) {
      case 'poison_strike':
        // Poison Strike - 5 damage over 3 turns
        const poisonDamage = 5
        actions.push({
          actor: 'player',
          action: 'ability',
          message: `You use Poison Strike! The ${state.currentEnemy.name} is poisoned and will take ${poisonDamage} damage for 3 turns!`
        })
        // Apply poison effect
        newState = {
          ...newState,
          currentEnemy: {
            ...newState.currentEnemy!,
            poisonTurns: 3
          }
        }
        break

      case 'onion_tears':
        // Onion Tears - 12 AOE damage (costs 10 HP)
        const hpCost = 10
        const aoeDamage = 12

        if (state.hp <= hpCost) {
          actions.push({
            actor: 'player',
            action: 'ability',
            success: false,
            message: 'Not enough HP to use Onion Tears! (Costs 10 HP)'
          })
        } else {
          // Pay HP cost
          newState = {
            ...newState,
            hp: Math.max(0, state.hp - hpCost)
          }

          // Deal AOE damage to enemy
          const newEnemyHp = Math.max(0, state.currentEnemy.hp - aoeDamage)
          newState = {
            ...newState,
            currentEnemy: {
              ...newState.currentEnemy!,
              hp: newEnemyHp
            }
          }

          // Also damage all minions if present
          if (state.currentEnemy.minions && state.currentEnemy.minions.length > 0) {
            const damagedMinions = state.currentEnemy.minions.map(minion => ({
              ...minion,
              hp: Math.max(0, minion.hp - aoeDamage)
            })).filter(m => m.hp > 0) // Remove defeated minions

            newState = {
              ...newState,
              currentEnemy: {
                ...newState.currentEnemy!,
                minions: damagedMinions
              }
            }
          }

          actions.push({
            actor: 'player',
            action: 'ability',
            damage: aoeDamage,
            success: true,
            message: `You cry tears of onion! ${aoeDamage} AOE damage dealt! (Cost ${hpCost} HP)`
          })
        }
        break

      case 'heal':
        // Heal - Restore 20 HP (3 uses per battle)
        // TODO: Need to track uses per battle - for now, allow unlimited
        const healAmount = 20
        const oldHp = state.hp
        const newHp = Math.min(state.maxHp, state.hp + healAmount)
        const actualHeal = newHp - oldHp

        newState = {
          ...newState,
          hp: newHp
        }

        actions.push({
          actor: 'player',
          action: 'ability',
          healAmount: actualHeal,
          success: true,
          message: `You use Special Sauce to heal! Restored ${actualHeal} HP!`
        })
        break

      default:
        actions.push({
          actor: 'player',
          action: 'ability',
          message: `Unknown ability: ${abilityId}`
        })
        break
    }

    return { newState, actions }
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
   * Creates a minion enemy from enemy data
   */
  static createMinion(enemyData: any): Enemy {
    return {
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
      currencyDrop: enemyData.currencyDrop,
      lootTable: enemyData.lootTable || [],
      aiPattern: enemyData.aiPattern,
      special: enemyData.special,
      currentPhase: 0,
      turnCounter: 0,
      charging: false,
      poisonTurns: 0,
      constrictTurns: 0
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

    // Increment turn counter for interval-based abilities
    if (state.currentEnemy.turnCounter !== undefined) {
      state.currentEnemy.turnCounter += 1
    } else {
      state.currentEnemy.turnCounter = 1
    }

    const actions: CombatAction[] = []
    let currentState = state

    // Apply poison damage at start of enemy turn
    if (state.currentEnemy.poisonTurns && state.currentEnemy.poisonTurns > 0) {
      const poisonDamage = 5
      const newEnemyHp = Math.max(0, state.currentEnemy.hp - poisonDamage)
      const newPoisonTurns = (state.currentEnemy.poisonTurns || 0) - 1

      currentState = {
        ...currentState,
        currentEnemy: {
          ...currentState.currentEnemy!,
          hp: newEnemyHp,
          poisonTurns: newPoisonTurns
        }
      }

      actions.push({
        actor: 'enemy',
        action: 'attack',
        damage: poisonDamage,
        message: `The ${state.currentEnemy.name} takes ${poisonDamage} poison damage! (${newPoisonTurns} turns remaining)`
      })

      // Check if poison killed the enemy
      if (newEnemyHp <= 0) {
        return { newState: currentState, actions }
      }
    }

    const enemyAction = this.determineEnemyAction(currentState.currentEnemy!)

    if (enemyAction === 'defend') {
      // Enemy defends
      actions.push({
        actor: 'enemy',
        action: 'defend',
        message: `The ${currentState.currentEnemy!.name} takes a defensive stance.`
      })
      return {
        newState: currentState,
        actions
      }
    }

    // Calculate base damage
    let baseDamage = this.calculateDamage(
      { atk: currentState.currentEnemy!.atk, def: 0 },
      { atk: 0, def: currentState.stats.def },
      currentState.playerDefending
    )

    let finalDamage = baseDamage

    // Process special abilities
    if (currentState.currentEnemy!.special) {
      const specialResult = SpecialAbilities.processSpecialAbility(
        currentState,
        currentState.currentEnemy!,
        baseDamage
      )

      actions.push(...specialResult.actions)
      finalDamage = specialResult.modifiedDamage

      // Handle summon minions - actually create the minions
      if (currentState.currentEnemy!.special.type === 'summon_minions' &&
          currentState.currentEnemy!.turnCounter === 0) {
        const special = currentState.currentEnemy!.special
        const currentMinionCount = currentState.currentEnemy!.minions?.length || 0

        if (currentMinionCount < special.summonCount) {
          // Load minion enemy data
          const rpgEnemies = rpgEnemiesData as Record<string, any>
          const minionData = rpgEnemies[special.summonId]

          if (minionData) {
            const newMinion = this.createMinion(minionData)
            const newMinions = [...(currentState.currentEnemy!.minions || []), newMinion]
            currentState = {
              ...currentState,
              currentEnemy: {
                ...currentState.currentEnemy!,
                minions: newMinions
              }
            }
          }
        }
      }

      // Handle item stealing
      if (specialResult.stolenItemIndex !== undefined) {
        const itemToRemove = currentState.inventory[specialResult.stolenItemIndex]
        if (itemToRemove) {
          const removeResult = InventoryManager.removeItem(
            currentState,
            itemToRemove.id,
            1
          )
          if (removeResult.success) {
            currentState = removeResult.newState
          }
        }
      }
    } else {
      // Normal attack without special ability
      actions.push({
        actor: 'enemy',
        action: 'attack',
        damage: finalDamage,
        message: `The ${currentState.currentEnemy!.name} attacks you for ${finalDamage} damage!`
      })
    }

    // Check for frenzy (attacks twice per turn)
    const isFrenzy = currentState.currentEnemy!.special?.type === 'frenzy'
    if (isFrenzy) {
      const secondAttackDamage = this.calculateDamage(
        { atk: currentState.currentEnemy!.atk, def: 0 },
        { atk: 0, def: currentState.stats.def },
        currentState.playerDefending
      )
      finalDamage += secondAttackDamage
      actions.push({
        actor: 'enemy',
        action: 'attack',
        damage: secondAttackDamage,
        message: `The ${currentState.currentEnemy!.name} attacks AGAIN! ${secondAttackDamage} damage!`
      })
    }

    // Minions attack
    if (currentState.currentEnemy!.minions && currentState.currentEnemy!.minions.length > 0) {
      currentState.currentEnemy!.minions.forEach(minion => {
        const minionDamage = this.calculateDamage(
          { atk: minion.atk, def: 0 },
          { atk: 0, def: currentState.stats.def },
          currentState.playerDefending
        )
        finalDamage += minionDamage
        actions.push({
          actor: 'enemy',
          action: 'attack',
          damage: minionDamage,
          message: `${minion.name} attacks for ${minionDamage} damage!`
        })
      })
    }

    const newPlayerHp = Math.max(0, currentState.hp - finalDamage)

    const newState: RPGState = {
      ...currentState,
      hp: newPlayerHp
    }

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
      currencyDrop: enemyData.currencyDrop,
      lootTable: enemyData.lootTable || [],
      aiPattern: enemyData.aiPattern,
      // Boss-specific data
      special: enemyData.special,
      isBoss: enemyData.isBoss,
      isSecretBoss: enemyData.isSecretBoss,
      phases: enemyData.phases,
      currentPhase: 0,
      turnCounter: 0,
      charging: false,
      poisonTurns: 0,
      constrictTurns: 0
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
