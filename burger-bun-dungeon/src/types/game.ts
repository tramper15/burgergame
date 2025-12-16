export interface Ingredient {
  name: string
  description: string
  onAdd: string
  points: number
  likes: string[]
  dislikes: string[]
  reactions: Record<string, string>
}

export interface Choice {
  label: string
  next?: string
  take?: string
  reflect?: boolean
  silence?: boolean
  restart?: boolean
  end?: boolean
}

export interface Scene {
  text: string
  ingredient?: string
  choices: Choice[]
}

export type IngredientsData = Record<string, Ingredient>
export type ScenesData = Record<string, Scene>

export interface GameState {
  currentSceneId: string
  bunIngredients: string[]
  visitedScenes: string[]
  seenSilenceMessages: number[]
}

export interface Achievement {
  title: string
  description: string
  criteria: {
    ending?: string
    exactIngredients?: string[]
    bossDefeated?: string
    minLevel?: number
    minAtk?: number
    minHp?: number
    minSpd?: number
    minCurrency?: number
    minIngredients?: number
  }
}

export type AchievementsData = Record<string, Achievement>

export interface AchievementProgress {
  unlockedAchievements: string[]
  unlockedAt: Record<string, number>
  trashOdysseyUnlocked?: boolean
}

// RPG Mode (Act 2: Trash Odyssey) Types

export interface RPGState {
  // Mode
  mode: 'adventure' | 'rpg' | null

  // Character Stats
  level: number
  xp: number
  maxXp: number
  hp: number
  maxHp: number
  stats: {
    atk: number
    def: number
    spd: number
  }

  // Inventory
  inventory: InventoryItem[]
  equipment: {
    weapon: Equipment | null
    armor: Equipment | null
    shield: Equipment | null
    accessory: Equipment | null
    accessory2: Equipment | null
  }
  currency: number

  // World Progress
  currentLocation: string
  visitedLocations: string[]
  checkpoints: string[]
  defeatedBosses: string[]

  // Combat State
  inCombat: boolean
  currentEnemy?: Enemy
  playerDefending: boolean

  // Ingredient Powers (from Act 1)
  ingredientBonuses: Record<string, StatBonus>
}

// Base special ability with common properties
interface BaseSpecialAbility {
  target?: 'self' | 'player' | 'all'
  chance?: number // Chance for ability to trigger
}

// Discriminated union for special abilities
export type EnemySpecialAbility =
  | (BaseSpecialAbility & { type: 'summon'; minions?: string[]; maxMinions?: number })
  | (BaseSpecialAbility & { type: 'summon_minions'; summonCount: number; summonId: string; summonInterval?: number })
  | (BaseSpecialAbility & { type: 'multi_attack'; attacksPerTurn?: number })
  | (BaseSpecialAbility & { type: 'charge'; damageMultiplier?: number })
  | (BaseSpecialAbility & { type: 'poison'; damage?: number; duration?: number })
  | (BaseSpecialAbility & { type: 'constrict'; damage?: number; duration?: number })
  | (BaseSpecialAbility & { type: 'status_effect'; statusEffect?: string; duration?: number })
  | (BaseSpecialAbility & { type: 'frenzy'; attacksPerTurn?: number; damageMultiplier?: number })
  | (BaseSpecialAbility & { type: 'splash_damage'; damage: number })
  | (BaseSpecialAbility & { type: 'pounce'; damageMultiplier: number })
  | (BaseSpecialAbility & { type: 'nut_throw'; defenseIgnore: number })
  | (BaseSpecialAbility & { type: 'wrench_throw'; damageMultiplier: number })
  | (BaseSpecialAbility & { type: 'rabid_bite'; damageMultiplier: number })
  | (BaseSpecialAbility & { type: 'crushing_blow'; damageMultiplier: number })
  | (BaseSpecialAbility & { type: 'bite'; damageMultiplier: number })
  | (BaseSpecialAbility & { type: 'evasion'; missChance: number })
  | (BaseSpecialAbility & { type: 'steal_item' })

export interface EnemyPhase {
  healthThreshold: number // Percentage of HP when this phase triggers
  aiPattern?: string
  phaseMessage?: string
  special?: EnemySpecialAbility
  statChanges?: {
    atk?: number
    def?: number
    spd?: number
  }
}

export interface Enemy {
  id: string
  name: string
  description: string
  level: number
  hp: number
  maxHp: number
  atk: number
  def: number
  spd: number
  xpReward: number
  currencyDrop?: { min: number; max: number } // Currency drop range
  lootTable: LootDrop[]
  aiPattern: 'aggressive' | 'defensive' | 'random'
  special?: EnemySpecialAbility // Special abilities data from enemy JSON
  isBoss?: boolean
  isSecretBoss?: boolean
  phases?: EnemyPhase[] // For multi-phase bosses like Hungry Dog
  currentPhase?: number // Track current phase
  turnCounter?: number // For abilities that trigger every N turns
  charging?: boolean // For charge-up abilities like Pounce
  poisonTurns?: number // For poison effects
  constrictTurns?: number // For constrict effects
  minions?: Enemy[] // Summoned minions fighting alongside this enemy
}

export interface InventoryItem {
  id: string
  name: string
  description: string
  type: 'consumable' | 'equipment' | 'key'
  effect?: {
    healHp?: number
    buffAtk?: number
    buffDef?: number
  }
  quantity: number
}

export interface Equipment extends InventoryItem {
  type: 'equipment'
  slot: 'weapon' | 'armor' | 'shield' | 'accessory'
  stats: {
    atk?: number
    def?: number
    spd?: number
  }
}

export interface LootDrop {
  itemId: string
  chance: number
}

export interface StatBonus {
  atk?: number
  def?: number
  spd?: number
  maxHp?: number
  ability?: string
}

// RPG Scene and Choice Types (Act 2)

export interface EncounterEntry {
  enemyId: string
  weight: number
}

export interface RPGChoice {
  label: string
  next?: string
  action?: string
  enemyId?: string
  requiresBossDefeated?: string
  condition?: string
  itemId?: string
  slot?: 'weapon' | 'armor' | 'shield' | 'accessory' | 'accessory2'
  abilityId?: string
}

export interface RPGScene {
  name: string
  description?: string
  firstVisit?: string
  type: 'exploration' | 'combat' | 'boss_battle' | 'boss' | 'safe' | 'ending' | 'checkpoint' | 'shop' | 'cutscene'
  boss?: string
  onVictory?: string
  onDefeat?: string
  encounterTable?: EncounterEntry[]
  encounterRate?: number
  choices?: RPGChoice[]
  endingType?: string
  isCheckpoint?: boolean
  cutsceneText?: string[]
  bossIntro?: string[]
}

export interface EnemyData {
  id: string
  name: string
  description: string
  level: number
  maxHp: number
  atk: number
  def: number
  spd: number
  xpReward: number
  currencyDrop?: { min: number; max: number }
  lootTable?: LootDrop[]
  aiPattern: 'aggressive' | 'defensive' | 'random'
  special?: EnemySpecialAbility
  isBoss?: boolean
  isSecretBoss?: boolean
  phases?: EnemyPhase[]
  bossIntro?: string[]
}

export type RPGScenesData = Record<string, RPGScene>
export type RPGEnemiesData = Record<string, EnemyData>
