# Code Cleanup Checklist

> **Status**: Pre-Competition Cleanup
> **Target**: Itch.io Deployment
> **Last Updated**: 2025-12-15

This document outlines code quality improvements and cleanup tasks needed before competition submission.

---

## Priority 1: Must Fix Before Submission 🔴

### 1.1 Remove Debug Code
**Impact**: Professional appearance, reduced bundle size

- [ ] Remove all `console.log` statements
  - [RPGGame.tsx:369](../src/components/RPGGame.tsx#L369) - `console.log('Boss battle! Setting pending navigation...')`
  - [RPGGame.tsx:387](../src/components/RPGGame.tsx#L387) - `console.log('Random encounter triggered!')`
  - [RPGGame.tsx:718-723](../src/components/RPGGame.tsx#L718-L723) - Victory continue debug logs
  - [RPGGame.tsx:729](../src/components/RPGGame.tsx#L729) - `console.log('Navigating to pending location...')`

- [ ] Remove or convert `console.error` to user-facing errors
  - [RPGGame.tsx:247](../src/components/RPGGame.tsx#L247) - `console.error(Enemy not found)` → Show toast instead
  - [RPGGame.tsx:357](../src/components/RPGGame.tsx#L357) - `console.error(Location not found)` → Show toast instead

**Action**:
```bash
# Search for all console statements
grep -r "console\." src/
```

---

### 1.2 Resolve TODOs
**Impact**: Feature completeness

- [ ] **[CombatProcessor.ts:481](../src/rpg/CombatProcessor.ts#L481)** - Heal ability usage tracking
  ```typescript
  // TODO: Need to track uses per battle - for now, allow unlimited
  ```

  **Options**:
  - A) Implement the 3-use limit with battle state tracking
  - B) Change description from "3 uses per battle" to "Unlimited"
  - C) Keep unlimited but remove misleading comment

**Recommendation**: Option B or C for simplicity (itch.io users prefer clarity over complexity)

---

### 1.3 Improve Error Handling
**Impact**: User experience, game stability

- [ ] **[RPGStateManager.ts:299](../src/rpg/RPGStateManager.ts#L299)** - Replace `throw new Error` with graceful fallback
  ```typescript
  // Current (crashes game):
  throw new Error(`Starting equipment definition not found...`)

  // Better:
  console.warn(`Starting equipment definition not found for ${slot} (${itemId})`);
  return defaultEquipment[slot]; // Provide safe fallback
  ```

- [ ] **[RPGGame.tsx:247-249](../src/components/RPGGame.tsx#L247-L249)** - Handle missing enemies gracefully
  ```typescript
  if (!enemyData) {
    showToast('Combat error! Returning to safety...');
    setCombatPhase('exploration');
    return;
  }
  ```

---

### 1.4 Test All Game Paths
**Impact**: Bug-free competition entry

- [ ] Test all Act 1 endings:
  - [ ] Empty burger ending
  - [ ] Dysentery ending (questionable_water)
  - [ ] Not a real burger ending (no meat_patty)
  - [ ] Good silent ending (all silences + avocado)
  - [ ] Bad silent ending (all silences, no avocado)
  - [ ] Default ending

- [ ] Test all Act 2 boss battles:
  - [ ] Slime Mold King
  - [ ] Hungry Dog (multi-phase)
  - [ ] Any secret bosses

- [ ] Verify all achievements unlock correctly
  - [ ] Act 1 achievements
  - [ ] Act 2 achievements (levels, stats, bosses)

---

## Priority 2: Should Fix (Code Quality) 🟡

### 2.1 Replace `any` Types with Proper Interfaces
**Impact**: Type safety, maintainability

**Affected Files**:
- [RPGGame.tsx:17-18](../src/components/RPGGame.tsx#L17-L18)
- [CombatProcessor.ts:530](../src/rpg/CombatProcessor.ts#L530)
- [CombatProcessor.ts:596](../src/rpg/CombatProcessor.ts#L596)
- [CombatProcessor.ts:842](../src/rpg/CombatProcessor.ts#L842)
- [CombatProcessor.ts:963](../src/rpg/CombatProcessor.ts#L963)

**Action**: Create proper interfaces in [types/game.ts](../src/types/game.ts)

```typescript
export interface RPGScene {
  name: string
  description: string
  firstVisit?: string
  type: 'exploration' | 'combat' | 'boss_battle' | 'safe' | 'ending' | 'checkpoint'
  boss?: string
  onVictory?: string
  encounterTable?: Array<{ enemyId: string; weight: number }>
  encounterRate?: number
  choices: RPGChoice[]
  endingType?: string
}

export interface RPGChoice {
  label: string
  next?: string
  action?: string
  enemyId?: string
  requiresBossDefeated?: string
  condition?: string
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
  lootTable?: Array<{ itemId: string; chance: number }>
  aiPattern: 'aggressive' | 'defensive' | 'random'
  special?: any // Can be refined further
  isBoss?: boolean
  isSecretBoss?: boolean
  phases?: any[]
}
```

**Then update**:
```typescript
// In RPGGame.tsx
const rpgScenes = rpgScenesData as Record<string, RPGScene>
const rpgEnemies = rpgEnemiesData as Record<string, EnemyData>
```

---

### 2.2 Extract Magic Numbers to Constants
**Impact**: Maintainability, balance tweaking

**Create**: [src/rpg/AbilityConstants.ts](../src/rpg/AbilityConstants.ts)

```typescript
export const ABILITIES = {
  POISON_STRIKE: {
    DAMAGE: 5,
    DURATION: 3,
    NAME: 'Poison Strike',
    DESCRIPTION: '5 damage over 3 turns'
  },
  ONION_TEARS: {
    HP_COST: 10,
    AOE_DAMAGE: 12,
    NAME: 'Onion Tears',
    DESCRIPTION: '12 AOE damage (costs 10 HP)'
  },
  HEAL: {
    HP_RESTORED: 20,
    MAX_USES: 3, // or null for unlimited
    NAME: 'Special Sauce',
    DESCRIPTION: 'Restore 20 HP'
  }
} as const;
```

**Update locations**:
- [CombatProcessor.ts:408-409](../src/rpg/CombatProcessor.ts#L408-L409)
- [CombatProcessor.ts:426-427](../src/rpg/CombatProcessor.ts#L426-L427)
- [CombatProcessor.ts:482](../src/rpg/CombatProcessor.ts#L482)
- [RPGGame.tsx:677-681](../src/components/RPGGame.tsx#L677-L681)

**Also extract**:
```typescript
// In src/constants/gameConstants.ts or UIConstants.ts
export const UI = {
  TOAST_DELAY_MS: 500,
  ACHIEVEMENT_TOAST_DELAY_MS: 500
} as const;
```

Update: [AchievementService.ts:100](../src/services/AchievementService.ts#L100), [BurgerGame.tsx:100](../src/components/BurgerGame.tsx#L100)

---

### 2.3 Refactor Large Components (Done to Here)
**Impact**: Testability, readability

**Target**: [RPGGame.tsx](../src/components/RPGGame.tsx) (912 lines)

**Suggested Structure**:
```
src/components/rpg/
├── RPGGame.tsx (main coordinator, ~200 lines)
├── ExplorationView.tsx (location navigation)
├── CombatView.tsx (battle UI)
├── InventoryView.tsx (inventory management)
├── ShopView.tsx (buy/sell interface)
└── CombatOutcomeScreens.tsx (victory/defeat/fled)
```

**Benefits**:
- Easier to test individual UI states
- Clearer separation of concerns
- Reduced prop drilling

**Note**: This is optional for competition but highly recommended for long-term maintainability.

---

### 2.4 Extract Complex Conditionals
**Impact**: Readability

**Example 1**: [RPGGame.tsx:208-240](../src/components/RPGGame.tsx#L208-L240) - Choice filtering

```typescript
// Create: src/rpg/ChoiceFilter.ts
export class ChoiceFilter {
  static isChoiceAvailable(choice: RPGChoice, state: RPGState): boolean {
    if (choice.requiresBossDefeated) {
      return state.defeatedBosses.includes(choice.requiresBossDefeated);
    }

    if (choice.condition) {
      return this.checkCondition(choice.condition, state);
    }

    if (choice.next) {
      return this.checkNextSceneAvailable(choice.next, state);
    }

    return true;
  }

  private static checkCondition(condition: string, state: RPGState): boolean {
    if (condition.startsWith('visited_')) {
      const locationId = condition.replace('visited_', '');
      return state.visitedLocations.includes(locationId);
    }

    if (condition === 'has_all_ingredients') {
      return Object.keys(state.ingredientBonuses).length >= 5;
    }

    return false;
  }

  private static checkNextSceneAvailable(nextSceneId: string, state: RPGState): boolean {
    const nextScene = rpgScenes[nextSceneId];
    if (!nextScene) return false;

    if (nextScene.type === 'boss_battle' && nextScene.boss) {
      return !state.defeatedBosses.includes(nextScene.boss);
    }

    return true;
  }
}
```

**Example 2**: [AchievementService.ts:106-148](../src/services/AchievementService.ts#L106-L148)

```typescript
// In AchievementService.ts
private static checkCriteria(
  criteria: Achievement['criteria'],
  state: RPGState,
  endingType: string | null
): boolean {
  return (
    this.checkEnding(criteria.ending, endingType) ||
    this.checkBoss(criteria.bossDefeated, state) ||
    this.checkLevel(criteria.minLevel, state) ||
    this.checkStats(criteria, state) ||
    this.checkCurrency(criteria.minCurrency, state) ||
    this.checkIngredients(criteria.minIngredients, state)
  );
}

private static checkEnding(required: string | undefined, actual: string | null): boolean {
  return required ? required === actual : false;
}

private static checkBoss(bossId: string | undefined, state: RPGState): boolean {
  return bossId ? state.defeatedBosses.includes(bossId) : false;
}

// ... etc for each criterion
```

---

## Priority 3: Nice to Have (Optional) 🟢

### 3.1 Add LocalStorage Persistence
**Impact**: User experience (prevents progress loss on refresh)

**Create**: [src/hooks/useGamePersistence.ts](../src/hooks/useGamePersistence.ts)

```typescript
export function useGamePersistence() {
  const saveGame = (gameState: GameState | RPGState, mode: 'act1' | 'act2') => {
    try {
      localStorage.setItem(`burger-game-${mode}`, JSON.stringify(gameState));
    } catch (error) {
      console.warn('Failed to save game:', error);
    }
  };

  const loadGame = (mode: 'act1' | 'act2') => {
    try {
      const saved = localStorage.getItem(`burger-game-${mode}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.warn('Failed to load game:', error);
      return null;
    }
  };

  const clearSave = (mode: 'act1' | 'act2') => {
    localStorage.removeItem(`burger-game-${mode}`);
  };

  return { saveGame, loadGame, clearSave };
}
```

---

### 3.2 Consolidate State Reset Logic
**Impact**: DRY principle

**Files**:
- [BurgerGame.tsx:78-82](../src/components/BurgerGame.tsx#L78-L82)
- [RPGGame.tsx:79-90](../src/components/RPGGame.tsx#L79-L90)

**Create**: [src/utils/gameResetUtils.ts](../src/utils/gameResetUtils.ts)

```typescript
export const resetBurgerGame = (
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  setSelectedChoice: React.Dispatch<React.SetStateAction<number>>
) => {
  setGameState(() => ({
    currentSceneId: SCENE_IDS.START,
    bunIngredients: [],
    visitedScenes: [SCENE_IDS.START],
    seenSilenceMessages: []
  }));
  setSelectedChoice(-1);
};

export const resetRPGGame = (
  ingredientsFromAct1: string[],
  setRpgState: React.Dispatch<React.SetStateAction<RPGState>>,
  setCombatPhase: React.Dispatch<React.SetStateAction<CombatPhase>>,
  // ... other setters
) => {
  // Reset logic from RPGGame.tsx:79-90
};
```

---

### 3.3 Add Loading States
**Impact**: Better UX for long computations

**Example**: Combat with many minions might take a moment

```typescript
const [isProcessing, setIsProcessing] = useState(false);

const handleCombatAction = async (action: ...) => {
  setIsProcessing(true);
  try {
    // ... existing logic
  } finally {
    setIsProcessing(false);
  }
};

// In render:
{isProcessing && <div className="loading-spinner">Processing...</div>}
```

---

## Code Quality Metrics

### Current Status
| Metric | Status | Target |
|--------|--------|--------|
| TypeScript `any` usage | 🟡 Moderate | 🟢 Minimal |
| Magic numbers | 🟡 Some | 🟢 None |
| Component size | 🟡 Large | 🟢 <300 lines |
| Error handling | 🟡 Basic | 🟢 Comprehensive |
| Debug code | 🔴 Present | 🟢 Removed |
| TODOs | 🔴 1 unresolved | 🟢 0 |

### After Priority 1 Fixes
| Metric | Expected Status |
|--------|----------------|
| TypeScript `any` usage | 🟡 Moderate |
| Magic numbers | 🟡 Some |
| Component size | 🟡 Large |
| Error handling | 🟢 Comprehensive |
| Debug code | 🟢 Removed |
| TODOs | 🟢 0 |

---

## Testing Checklist

### Manual Testing Required

#### Act 1 (Adventure Mode)
- [ ] Play through to all 6 endings
- [ ] Verify ingredient synergies display correctly
- [ ] Test "Linger in Silence" 5+ times (for silent endings)
- [ ] Confirm all Act 1 achievements unlock
- [ ] Test restart functionality

#### Act 2 (RPG Mode)
- [ ] Unlock Trash Odyssey via Act 1 completion
- [ ] Test all ingredient bonuses from Act 1 apply correctly
- [ ] Complete all boss battles
- [ ] Test shop buying/selling
- [ ] Test inventory equip/unequip
- [ ] Test all special abilities (Poison Strike, Onion Tears, Heal)
- [ ] Test defeat → checkpoint respawn
- [ ] Test fleeing from combat
- [ ] Verify all Act 2 achievements unlock
- [ ] Test random encounters on risky routes

#### Cross-Mode
- [ ] Achievement panel displays correctly
- [ ] Toast notifications don't overlap
- [ ] Theme switching works in all game states
- [ ] Browser refresh doesn't cause errors

---

## Pre-Submission Checklist

### Code
- [ ] All Priority 1 tasks completed
- [ ] No `console.log` in production code
- [ ] No unresolved TODOs
- [ ] All error cases handled gracefully

### Build
- [ ] Run `npm run build` successfully
- [ ] Test production build locally (`npm run preview`)
- [ ] Check bundle size is reasonable (<5MB)

### Testing
- [ ] All game paths tested manually
- [ ] All achievements verified unlockable
- [ ] No crashes or error modals during gameplay

### Polish
- [ ] README.md updated with game description
- [ ] Credits added (if applicable)
- [ ] Known issues documented (if any)

---

## Post-Competition Improvements

These can wait until after the competition:

1. **Performance Optimization**
   - Add React.memo to large components
   - Virtualize long item lists (if needed)
   - Lazy load RPG mode until unlocked

2. **Accessibility**
   - Add ARIA labels
   - Keyboard navigation improvements
   - Screen reader support

3. **Advanced Features**
   - Multiple save slots
   - Export/import save data
   - Statistics tracking (playtime, deaths, etc.)

---

## Questions or Issues?

If you encounter problems during cleanup:
1. Check existing docs: [ARCHITECTURE.md](./ARCHITECTURE.md), [HOW_TO_ADD_SCENES.md](./HOW_TO_ADD_SCENES.md)
2. Test in isolation first
3. Make small, incremental changes
4. Commit frequently during cleanup

**Good luck with the competition!** 🍔🎮
