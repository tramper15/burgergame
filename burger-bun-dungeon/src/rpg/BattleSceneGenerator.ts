import type { RPGState } from '../types/game'
import type { CombatAction } from './CombatProcessor'

/**
 * BattleSceneGenerator - Generates text-based combat scenes and displays
 * Pure text generation, no side effects
 */
export class BattleSceneGenerator {
  /**
   * Generates the full battle scene display
   */
  static generateBattleScene(state: RPGState, combatLog: CombatAction[]): string {
    if (!state.currentEnemy) {
      return 'No enemy in combat.'
    }

    const enemy = state.currentEnemy

    // Calculate HP bars
    const playerHpBar = this.generateHpBar(state.hp, state.maxHp)
    const enemyHpBar = this.generateHpBar(enemy.hp, enemy.maxHp)

    // Build minion display
    let minionText = ''
    if (enemy.minions && enemy.minions.length > 0) {
      const minionLines = enemy.minions.map(minion => {
        const minionHpBar = this.generateHpBar(minion.hp, minion.maxHp)
        return `  ${minion.name}: ${minionHpBar} ${minion.hp}/${minion.maxHp}`
      }).join('\n')
      minionText = `\n\nMinions:\n${minionLines}`
    }

    // Build combat log
    const logText = combatLog.length > 0
      ? '\n' + combatLog.map(action => `→ ${action.message}`).join('\n')
      : ''

    return `═══════════════════════════════════════════
BATTLE
═══════════════════════════════════════════

${enemy.name} (Level ${enemy.level})
${enemy.description}

Enemy HP: ${enemyHpBar} ${enemy.hp}/${enemy.maxHp}${minionText}

───────────────────────────────────────────

Your HP: ${playerHpBar} ${state.hp}/${state.maxHp}
ATK: ${state.stats.atk} | DEF: ${state.stats.def} | SPD: ${state.stats.spd}
${state.playerDefending ? '🛡️ DEFENDING (50% damage reduction)' : ''}
${logText}

═══════════════════════════════════════════

What will you do?`
  }

  /**
   * Generates a victory screen
   */
  static generateVictoryScreen(
    enemyName: string,
    xpGained: number,
    currencyGained: number,
    itemsLooted: string[],
    leveledUp: boolean,
    newLevel?: number
  ): string {
    const itemText = itemsLooted.length > 0
      ? `\nItems Found:\n${itemsLooted.map(item => `  → ${item}`).join('\n')}`
      : ''

    const levelUpText = leveledUp
      ? `\n\n🌟 LEVEL UP! You are now Level ${newLevel}!\n   HP+10, ATK+2, DEF+1, SPD+1`
      : ''

    return `═══════════════════════════════════════════
VICTORY!
═══════════════════════════════════════════

You defeated the ${enemyName}!

XP Gained: +${xpGained}
Scraps: +${currencyGained}${itemText}${levelUpText}

═══════════════════════════════════════════`
  }

  /**
   * Generates a defeat screen
   */
  static generateDefeatScreen(): string {
    return `═══════════════════════════════════════════
DEFEAT
═══════════════════════════════════════════

You have been defeated...

The darkness takes you.

But you're not done yet.

═══════════════════════════════════════════`
  }

  /**
   * Generates a flee success screen
   */
  static generateFleeScreen(enemyName: string): string {
    return `═══════════════════════════════════════════
FLED FROM BATTLE
═══════════════════════════════════════════

You successfully escaped from the ${enemyName}.

Sometimes survival is more important than victory.

═══════════════════════════════════════════`
  }

  /**
   * Generates an HP bar visualization
   * Example: [████████░░] for 80% health
   */
  static generateHpBar(currentHp: number, maxHp: number, barLength: number = 10): string {
    // Guard against division by zero
    const percentage = maxHp <= 0 ? 0 : Math.max(0, Math.min(1, currentHp / maxHp))
    const filledBlocks = Math.floor(percentage * barLength)
    const emptyBlocks = barLength - filledBlocks

    const filled = '█'.repeat(filledBlocks)
    const empty = '░'.repeat(emptyBlocks)

    return `[${filled}${empty}]`
  }

  /**
   * Generates combat log text from actions
   */
  static generateCombatLog(actions: CombatAction[]): string {
    if (actions.length === 0) {
      return ''
    }

    return actions.map(action => {
      let prefix = action.actor === 'player' ? 'You' : 'Enemy'
      return `${prefix}: ${action.message}`
    }).join('\n')
  }

  /**
   * Generates enemy intro text when combat starts
   */
  static generateEnemyIntro(state: RPGState): string {
    if (!state.currentEnemy) {
      return 'An enemy appears!'
    }

    const enemy = state.currentEnemy
    const enemyData = enemy as any // Access raw enemy data for boss flags

    // Check if this is a boss with custom intro
    const isBoss = enemyData.isBoss === true
    const isSecretBoss = enemyData.isSecretBoss === true
    const bossIntro = enemyData.bossIntro

    // Generate boss-specific intro cutscenes from JSON data
    if (isBoss && bossIntro && Array.isArray(bossIntro)) {
      const encounterType = isSecretBoss
        ? '!!!  SECRET BOSS ENCOUNTER  !!!'
        : isBoss && enemy.level < 5
        ? '!!!  MINI-BOSS ENCOUNTER  !!!'
        : '!!!  BOSS ENCOUNTER  !!!'

      const introText = bossIntro.join('\n')

      return `═══════════════════════════════════════════
${encounterType}
═══════════════════════════════════════════

${introText}

${enemy.description}

Level ${enemy.level} | HP: ${enemy.maxHp}
ATK: ${enemy.atk} | DEF: ${enemy.def} | SPD: ${enemy.spd}

${isSecretBoss ? '' : 'The boss battle begins!'}

═══════════════════════════════════════════`
    }

    // Regular enemy encounter
    return `═══════════════════════════════════════════
ENEMY ENCOUNTER!
═══════════════════════════════════════════

A wild ${enemy.name} appears!

${enemy.description}

Level ${enemy.level}
HP: ${enemy.maxHp} | ATK: ${enemy.atk} | DEF: ${enemy.def}

Prepare for battle!

═══════════════════════════════════════════`
  }

  /**
   * Generates status display (for out-of-combat)
   */
  static generateStatusDisplay(state: RPGState): string {
    const hpBar = this.generateHpBar(state.hp, state.maxHp, 15)
    const xpBar = this.generateHpBar(state.xp, state.maxXp, 15)

    const ingredientPowers = Object.keys(state.ingredientBonuses)
    const powersList = ingredientPowers.length > 0
      ? ingredientPowers.map(id => `  → ${id}`).join('\n')
      : '  (none)'

    return `───────────────────────────────────────────
CHARACTER STATUS
───────────────────────────────────────────

Level ${state.level}
HP: ${hpBar} ${state.hp}/${state.maxHp}
XP: ${xpBar} ${state.xp}/${state.maxXp}

Stats:
  ATK: ${state.stats.atk}
  DEF: ${state.stats.def}
  SPD: ${state.stats.spd}

Scraps: ${state.currency}

Ingredient Powers Active:
${powersList}

Location: ${state.currentLocation}
───────────────────────────────────────────`
  }
}
