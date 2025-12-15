import type { RPGState, Enemy } from '../types/game'
import type { CombatAction } from './CombatProcessor'

/**
 * SpecialAbilities - Handles all enemy special abilities
 * Data-driven system that processes special abilities from enemy JSON
 */
export class SpecialAbilities {
  /**
   * Processes an enemy's special ability and returns combat actions
   */
  static processSpecialAbility(
    state: RPGState,
    enemy: Enemy,
    baseDamage: number
  ): {
    actions: CombatAction[]
    modifiedDamage: number
    stateChanges: Partial<RPGState>
    stolenItemIndex?: number
  } {
    const actions: CombatAction[] = []
    let modifiedDamage = baseDamage
    const stateChanges: Partial<RPGState> = {}
    let stolenItemIndex: number | undefined = undefined

    if (!enemy.special) {
      return { actions, modifiedDamage, stateChanges, stolenItemIndex }
    }

    const special = enemy.special
    const specialType = special.type

    // Check if ability should trigger (based on chance or conditions)
    const shouldTrigger = special.chance ? Math.random() < special.chance : true

    if (!shouldTrigger) {
      return { actions, modifiedDamage, stateChanges }
    }

    switch (specialType) {
      // POISON - Deals damage over time
      case 'poison':
        actions.push({
          actor: 'enemy',
          action: 'attack',
          message: `${enemy.name} inflicts POISON! You'll take ${special.damage} damage for ${special.duration} turns!`
        })
        // Note: Poison tracking would need to be added to RPGState
        break

      // SPLASH DAMAGE - AOE attack that ignores defense
      case 'splash_damage':
        modifiedDamage = special.damage
        actions.push({
          actor: 'enemy',
          action: 'attack',
          damage: special.damage,
          message: `${enemy.name} uses SPLASH DAMAGE! ${special.damage} unblockable damage!`
        })
        break

      // SUMMON MINIONS - Boss spawns additional enemies
      case 'summon_minions':
        // Check turn counter for interval-based summoning
        const currentTurn = enemy.turnCounter || 0
        if (currentTurn >= special.summonInterval) {
          // Cap total minions at summonCount
          const currentMinionCount = enemy.minions?.length || 0
          if (currentMinionCount < special.summonCount) {
            actions.push({
              actor: 'enemy',
              action: 'attack',
              message: `${enemy.name} summons ${special.summonId.replace(/_/g, ' ')}s to aid in battle!`
            })
            // Mark that summon happened (actual minion creation in CombatProcessor)
            enemy.turnCounter = 0
          }
        } else {
          // Persist turn counter increment (actual increment happens in enemyTurn)
          enemy.turnCounter = currentTurn
        }
        break

      // POUNCE - Charges for 1 turn, then deals 2x damage
      case 'pounce':
        if (enemy.charging) {
          modifiedDamage = baseDamage * (special.damageMultiplier || 2)
          actions.push({
            actor: 'enemy',
            action: 'attack',
            damage: modifiedDamage,
            message: `${enemy.name} POUNCES! ${modifiedDamage} damage!`
          })
          if (state.currentEnemy) {
            state.currentEnemy.charging = false
          }
        } else {
          actions.push({
            actor: 'enemy',
            action: 'attack',
            message: `${enemy.name} crouches low, preparing to pounce...`
          })
          if (state.currentEnemy) {
            state.currentEnemy.charging = true
          }
          modifiedDamage = 0 // No damage this turn
        }
        break

      // CONSTRICT - Multi-turn grapple damage
      case 'constrict':
        actions.push({
          actor: 'enemy',
          action: 'attack',
          message: `${enemy.name} CONSTRICTS you! ${special.damage} damage per turn for ${special.duration} turns!`
        })
        // Constrict tracking would need to be added to RPGState
        break

      // NUT THROW - Ranged attack that ignores part of defense
      case 'nut_throw':
        const defenseIgnored = Math.floor(state.stats.def * (special.defenseIgnore || 0.5))
        modifiedDamage = baseDamage + defenseIgnored
        actions.push({
          actor: 'enemy',
          action: 'attack',
          damage: modifiedDamage,
          message: `${enemy.name} throws an acorn! Ignores ${defenseIgnored} DEF!`
        })
        break

      // WRENCH THROW - High damage ranged attack
      case 'wrench_throw':
        modifiedDamage = Math.floor(baseDamage * (special.damageMultiplier || 1.5))
        actions.push({
          actor: 'enemy',
          action: 'attack',
          damage: modifiedDamage,
          message: `${enemy.name} throws itself at you like a metal projectile! ${modifiedDamage} damage!`
        })
        break

      // RABID BITE - High damage bite attack
      case 'rabid_bite':
        modifiedDamage = Math.floor(baseDamage * (special.damageMultiplier || 1.5))
        actions.push({
          actor: 'enemy',
          action: 'attack',
          damage: modifiedDamage,
          message: `${enemy.name} bites with rabid fury! ${modifiedDamage} damage!`
        })
        break

      // CRUSHING BLOW - Heavy damage attack
      case 'crushing_blow':
        modifiedDamage = Math.floor(baseDamage * (special.damageMultiplier || 2))
        actions.push({
          actor: 'enemy',
          action: 'attack',
          damage: modifiedDamage,
          message: `${enemy.name} delivers a CRUSHING BLOW! ${modifiedDamage} damage!`
        })
        break

      // BITE - Boss phase 2 ability (2x damage)
      case 'bite':
        modifiedDamage = Math.floor(baseDamage * (special.damageMultiplier || 2))
        actions.push({
          actor: 'enemy',
          action: 'attack',
          damage: modifiedDamage,
          message: `${enemy.name} BITES with terrifying force! ${modifiedDamage} damage!`
        })
        break

      // FRENZY - Boss phase 3 ability (attacks twice)
      case 'frenzy':
        // This is handled in the main combat flow
        // Just add a message here
        actions.push({
          actor: 'enemy',
          action: 'attack',
          message: `${enemy.name} attacks in a FRENZY!`
        })
        break

      // EVASION - Passive ability (handled in attack resolution)
      case 'evasion':
        // This is checked when player attacks
        break

      // STEAL ITEM - Attempts to steal from player inventory
      case 'steal_item':
        if (state.inventory.length > 0) {
          const randomIndex = Math.floor(Math.random() * state.inventory.length)
          const stolenItem = state.inventory[randomIndex]
          stolenItemIndex = randomIndex
          actions.push({
            actor: 'enemy',
            action: 'attack',
            message: `${enemy.name} steals ${stolenItem.name}!`
          })
        }
        break

      default:
        // Unknown special ability type
        break
    }

    return { actions, modifiedDamage, stateChanges, stolenItemIndex }
  }

  /**
   * Updates enemy phase for multi-phase bosses (like Hungry Dog)
   */
  static updateBossPhase(enemy: Enemy): { phaseChanged: boolean; phaseMessage?: string } {
    if (!enemy.phases || enemy.phases.length === 0) {
      return { phaseChanged: false }
    }

    const currentPhaseIndex = enemy.currentPhase || 0
    const healthPercentage = enemy.hp / enemy.maxHp

    // Check if we should transition to next phase
    for (let i = enemy.phases.length - 1; i > currentPhaseIndex; i--) {
      const phase = enemy.phases[i]
      if (healthPercentage <= phase.healthThreshold) {
        enemy.currentPhase = i

        // Update enemy special ability for this phase
        if (phase.special) {
          enemy.special = phase.special
        }

        return {
          phaseChanged: true,
          phaseMessage: phase.phaseMessage || `${enemy.name} enters a new phase!`
        }
      }
    }

    return { phaseChanged: false }
  }

  /**
   * Checks if player's attack should miss due to evasion
   */
  static checkEvasion(enemy: Enemy): boolean {
    if (enemy.special?.type === 'evasion') {
      const missChance = enemy.special.missChance || 0.2
      return Math.random() < missChance
    }
    return false
  }
}
