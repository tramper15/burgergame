# Trash Odyssey - Act 2 Design Document

## Overview
**Trash Odyssey** is the unlockable Act 2 RPG mode for Burger Bun Dungeon. After achieving the "Avocado Savior" (Good Silent) ending in Act 1, players unlock this text-based RPG adventure where they fight through a trash-filled ecosystem to reach safety.

**Core Premise:** You've been thrown in the trash. Fight trash monsters and animals to reach the safety of the lunchbox in the shed.

**Design Philosophy:**
- Pure text-based (no images/sprites)
- Choice-driven combat and navigation
- Reuses Act 1's ingredient collection as RPG stats/abilities
- 45-90 minute experience
- Forgiving difficulty with checkpoints

---

## Feature Roadmap

### **Phase 1: Foundation** ✅ COMPLETE
- [x] F1.1: Create RPG state structure (`RPGState` interface)
- [x] F1.2: Add unlock condition (check for Avocado Savior achievement)
- [x] F1.3: Add "Start Trash Odyssey" button to main menu
- [x] F1.4: Create mode switcher (Adventure vs RPG)
- [x] F1.5: Build basic combat state management

### **Phase 2: Core Combat** ✅ COMPLETE
- [x] F2.1: Implement turn-based combat system
- [x] F2.2: Create `BattleSceneGenerator` (generates combat text)
- [x] F2.3: Build `CombatProcessor` (handles attack/defend/item logic)
- [x] F2.4: Add damage calculation system (ATK - DEF + RNG)
- [x] F2.5: Create 3 basic enemies (Slime Mold, Grease Glob, Angry Ant)
- [x] F2.6: Implement victory/defeat screens
- [x] F2.7: Add XP rewards and level-up system

### **Phase 3: World Navigation** ✅ COMPLETE
- [x] F3.1: Create location scenes (7-8 trash world locations)
- [x] F3.2: Build location navigation system
- [x] F3.3: Implement random encounter triggers
- [x] F3.4: Add checkpoint/save system (crumpled receipts)
- [x] F3.5: Create location transition text

### **Phase 4: Inventory & Items** ✅ COMPLETE
- [x] F4.1: Build inventory system (10 item slots)
- [x] F4.2: Create consumable items (Crumbs, Soda Drop, Moldy Bread)
- [x] F4.3: Implement item usage (in combat and out of combat)
- [x] F4.4: Add equipment slots (weapon, armor, shield)
- [x] F4.5: Create loot drop system

### **Phase 5: Progression Systems** ✅ COMPLETE
- [x] F5.1: Implement level/XP progression (levels 1-10)
- [x] F5.2: Add stat increases on level-up (HP/ATK/DEF/SPD)
- [x] F5.3: Convert Act 1 ingredients to abilities/bonuses
- [x] F5.4: Create ingredient power system
- [x] F5.5: Add currency system (Crumb Currency)

### **Phase 6: Shop & Trading** ✅ COMPLETE
- [x] F6.1: Create shop interface (text-based menu)
- [x] F6.2: Implement Cockroach Merchant character
- [x] F6.3: Add buy/sell functionality
- [x] F6.4: Create shop inventory and pricing

### **Phase 7: Enemy Roster** ✅ COMPLETE
- [x] F7.1: Write 10+ enemy types with descriptions (16 total enemies)
- [x] F7.2: Balance enemy stats (HP/ATK/DEF/SPD)
- [x] F7.3: Implement enemy AI patterns (aggressive/defensive/random)
- [x] F7.4: Create enemy loot tables

### **Phase 8: Boss Battles**
- [ ] F8.1: Design Spoiled Milk mini-boss (Level 3)
- [ ] F8.2: Design Raccoon King boss (Level 7)
- [ ] F8.3: Design The Hungry Dog final boss (Level 10)
- [ ] F8.4: Add boss intro cutscenes
- [ ] F8.5: Implement boss-specific mechanics
- [ ] F8.6: Make Sure All Enemy Special Abilities Are useable.

### **Phase 9: Content & Writing**
- [ ] F9.1: Write opening cutscene (thrown in trash)
- [ ] F9.2: Write all location descriptions
- [ ] F9.3: Write combat flavor text
- [ ] F9.4: Create victory ending scene
- [ ] F9.5: Add optional bad/secret endings

### **Phase 10: Polish & Balance**
- [ ] F10.1: Balance XP curve and difficulty
- [ ] F10.2: Tune enemy stats and encounter rates
- [ ] F10.3: Add Act 2 achievements
- [ ] F10.4: Playtest full run (45-90 min target)
- [ ] F10.5: Bug fixes and edge case handling

---

## Technical Architecture

### **State Management**

```typescript
interface RPGState {
  // Mode
  mode: 'adventure' | 'rpg' | null; // Which act player is in

  // Character Stats
  level: number;              // 1-10
  xp: number;                 // Current XP
  maxXp: number;              // XP needed for next level
  hp: number;                 // Current HP
  maxHp: number;              // Maximum HP
  stats: {
    atk: number;              // Attack power
    def: number;              // Defense
    spd: number;              // Speed (turn order)
  };

  // Inventory
  inventory: InventoryItem[];  // Max 10 slots
  equipment: {
    weapon: Equipment | null;
    armor: Equipment | null;
    shield: Equipment | null;
  };
  currency: number;            // Crumb Currency

  // World Progress
  currentLocation: string;     // Current scene ID
  checkpoints: string[];       // Unlocked save points
  defeatedBosses: string[];    // Boss IDs

  // Combat State
  inCombat: boolean;
  currentEnemy?: Enemy;
  playerDefending: boolean;    // Used for defend action

  // Ingredient Powers (from Act 1)
  ingredientBonuses: {
    [ingredientId: string]: StatBonus;
  };
}

interface Enemy {
  id: string;
  name: string;
  description: string;        // Flavor text
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  xpReward: number;
  lootTable: LootDrop[];      // Possible item drops
  aiPattern: 'aggressive' | 'defensive' | 'random';
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'equipment' | 'key';
  effect?: {
    healHp?: number;
    buffAtk?: number;
    buffDef?: number;
  };
  quantity: number;
}

interface Equipment extends InventoryItem {
  slot: 'weapon' | 'armor' | 'shield';
  stats: {
    atk?: number;
    def?: number;
    spd?: number;
  };
}
```

### **New Services/Modules**

```
src/
├── rpg/
│   ├── BattleSceneGenerator.ts    # Generates combat scenes
│   ├── CombatProcessor.ts         # Handles combat logic
│   ├── RPGStateManager.ts         # Manages RPG state
│   ├── IngredientConverter.ts     # Converts Act 1 ingredients to powers
│   ├── InventoryManager.ts        # Item/equipment handling
│   ├── LevelSystem.ts             # XP/leveling logic
│   ├── ShopSystem.ts              # Merchant interactions
│   └── EnemyAI.ts                 # Enemy behavior patterns
├── data/
│   ├── rpgEnemies.json            # Enemy definitions
│   ├── rpgLocations.json          # Trash world locations
│   ├── rpgItems.json              # Items/equipment
│   └── rpgShop.json               # Shop inventory
```

---

## Combat System Design

### **Turn Flow**
1. Display battle scene (enemy info, player stats, choices)
2. Player selects action (Attack/Defend/Item/Special/Flee)
3. Process player action
4. Enemy AI selects action
5. Process enemy action
6. Check victory/defeat conditions
7. Repeat or end combat

### **Damage Calculation**
```typescript
function calculateDamage(attacker: Combatant, defender: Combatant): number {
  const baseDamage = attacker.atk - defender.def;
  const variance = Math.floor(Math.random() * 3); // 0-2 random
  const defending = defender.isDefending ? 0.5 : 1; // Defend reduces damage by 50%
  return Math.max(1, Math.floor((baseDamage + variance) * defending));
}
```

### **Combat Actions**

**Attack:**
- Deal damage = (ATK - enemy.DEF) + random(0-2)
- Always hits (no miss chance initially)

**Defend:**
- Reduce incoming damage by 50% this turn
- Resets next turn

**Use Item:**
- Opens item submenu
- Consumables: Heal HP, buff stats
- Takes full turn

**Special Ability:**
- Ingredient-based powers (see Ingredient Powers section)
- Costs HP or has cooldown
- Higher damage/utility than basic attack

**Flee:**
- 50% base chance to escape
- Fails = enemy gets free attack
- Cannot flee from boss battles

---

## Progression System

### **Leveling Curve**
```
Level 1: 0 XP (starting level)
Level 2: 100 XP
Level 3: 250 XP
Level 4: 450 XP
Level 5: 700 XP
Level 6: 1000 XP
Level 7: 1350 XP
Level 8: 1750 XP
Level 9: 2200 XP
Level 10: 2700 XP (max level)
```

### **Stat Growth per Level**
```
HP: +10 per level (base 50 → max 140)
ATK: +2 per level (base 5 → max 23)
DEF: +1 per level (base 3 → max 12)
SPD: +1 per level (base 5 → max 14)
```

### **Starting Stats**
```
Level 1 Bun:
HP: 50/50
ATK: 5
DEF: 3
SPD: 5
```

---

## Ingredient Powers (Act 1 → Act 2)

Ingredients collected in Act 1 convert to permanent bonuses/abilities:

| Ingredient | Effect |
|------------|--------|
| **Cheese** | +5 DEF (protective coating) |
| **Bacon** | +5 ATK (greasy aggression) |
| **Lettuce** | +3 SPD (lightweight) |
| **Tomato** | +10 Max HP (juicy vitality) |
| **Avocado** | +15 Max HP (savior's blessing) - REQUIRED FOR UNLOCK |
| **Pickle** | Special: Poison Strike (5 dmg over 3 turns) |
| **Onion** | Special: Onion Tears (12 AOE damage, costs 10 HP) |
| **Special Sauce** | Ability: Heal 20 HP in battle (3 uses) |
| **Meat Patty** | +8 ATK (hearty strength) |
| **Questionable Water** | Cursed: -5 Max HP but +10 ATK (risky power) |

**Design Note:** Players who collected more ingredients in Act 1 start Act 2 stronger, rewarding thorough exploration.

---

## Trash World Locations

### **Linear Progression Map**

```
1. Garbage Can (Start)
   ↓
2. Coffee Grounds Cavern (Tutorial area)
   ↓
   ├─→ 3a. Banana Peel Bridge (shortcut, harder)
   └─→ 3b. Napkin Plains (safer, more XP)
   ↓
4. Yogurt Container Ruins (Mini-boss: Spoiled Milk)
   ↓
   ├─→ 5a. Chip Bag Forest (random encounters)
   └─→ 5b. Takeout Box Maze (puzzle + enemies)
   ↓
6. Trash Bag Depths (Checkpoint + Shop)
   ↓
7. Backyard Battlefield (Outdoor zone, weather hazards)
   ↓
8. Garden Gauntlet (Boss: Raccoon King)
   ↓
9. Shed Entrance (Final stretch)
   ↓
10. Lunchbox Sanctuary (VICTORY!)
```

### **Location Features**

**Garbage Can (Start):**
- Opening cutscene plays here
- Safe zone, no enemies
- Tutorial text explains controls

**Coffee Grounds Cavern:**
- First combat encounter (Slime Mold)
- Teaches attack/defend mechanics
- Find first consumable item (Crumbs)

**Banana Peel Bridge vs Napkin Plains:**
- Player choice: risk vs safety
- Bridge = harder enemies, faster progression
- Plains = easier enemies, more XP grinding

**Yogurt Container Ruins:**
- Mini-boss battle: Spoiled Milk (Level 3)
- First checkpoint unlocked after victory
- Loot: Wrapper Armor

**Trash Bag Depths:**
- Major checkpoint (save point)
- Cockroach Merchant shop introduced
- Safe zone to heal/prepare

**Backyard Battlefield:**
- Transition to outdoor environment
- Weather hazards (rain = water damage)
- Animal enemies appear (rats, birds)

**Garden Gauntlet:**
- Boss battle: Raccoon King (Level 7)
- Summons trash minions during fight
- Must defeat to access shed

**Shed Entrance:**
- Final enemy gauntlet
- No turning back point
- Optional final boss (The Hungry Dog) if special condition met

**Lunchbox Sanctuary:**
- Victory scene
- Final statistics display
- Achievement unlock

---

## Enemy Roster

### **Trash Monsters (Levels 1-3)**

**Slime Mold** (Level 1)
- HP: 25 | ATK: 4 | DEF: 2 | SPD: 3
- XP: 35 | Loot: Crumbs (70%)
- AI: Random
- Description: "Glistening and pulsating, it oozes toward you with malicious intent."

**Grease Glob** (Level 2)
- HP: 30 | ATK: 5 | DEF: 3 | SPD: 2
- XP: 45 | Loot: Crumbs (60%), Soda Drop (20%)
- AI: Defensive (uses defend action 40% of time)
- Description: "A congealed mass of cooking oil. It leaves slippery trails as it slides closer."

**Fuzzy Growth** (Level 2)
- HP: 20 | ATK: 6 | DEF: 2 | SPD: 4
- XP: 50 | Loot: Moldy Bread (30%)
- AI: Aggressive
- Special: Poison damage (2 dmg/turn for 2 turns)
- Description: "Blue-green fuzz covering a forgotten sandwich. Its spores make you queasy."

**Crumb Swarm** (Level 3)
- HP: 15 | ATK: 3 | DEF: 1 | SPD: 6
- XP: 40 | Loot: Crumbs (100%)
- AI: Aggressive (attacks in groups - double encounter chance)
- Description: "Dozens of animated breadcrumbs skitter like insects. Strength in numbers."

### **Insects (Levels 3-5)**

**Angry Ant** (Level 3)
- HP: 35 | ATK: 7 | DEF: 3 | SPD: 7
- XP: 60 | Loot: Crumbs (50%)
- AI: Aggressive (high speed, fast attacks)
- Description: "A soldier ant, twice your size. Its mandibles click menacingly."

**Roach Raider** (Level 4)
- HP: 40 | ATK: 6 | DEF: 4 | SPD: 5
- XP: 70 | Loot: Currency (20-40 Crumbs)
- AI: Random
- Special: 20% chance to steal item from inventory
- Description: "A battle-scarred cockroach. Not friendly like the merchant."

**Fly Swarm** (Level 4)
- HP: 25 | ATK: 5 | DEF: 2 | SPD: 9
- XP: 65 | Loot: Soda Drop (40%)
- AI: Random (high evasion - your attacks have 20% miss chance)
- Description: "Buzzing, erratic, infuriating. They land on you just to be annoying."

**Beetle Brawler** (Level 5)
- HP: 55 | ATK: 8 | DEF: 7 | SPD: 3
- XP: 85 | Loot: Foil Shield (15%)
- AI: Defensive (high DEF tank)
- Description: "A rhinoceros beetle. Its horn gleams. Its shell looks impenetrable."

### **Animals (Levels 5-8)**

**Scrappy Sparrow** (Level 5)
- HP: 45 | ATK: 9 | DEF: 3 | SPD: 8
- XP: 90 | Loot: Soda Drop (50%)
- AI: Aggressive (aerial attacks - harder to hit)
- Description: "A small bird with a sharp beak. It dive-bombs from above."

**Stray Cat** (Level 6)
- HP: 60 | ATK: 12 | DEF: 5 | SPD: 7
- XP: 110 | Loot: Wrapper Armor (20%)
- AI: Aggressive
- Special: Pounce (charges attack for 1 turn, then deals 2x damage)
- Description: "Feral and hungry. You're burger-sized. This is not good."

**Garden Snake** (Level 7)
- HP: 70 | ATK: 10 | DEF: 6 | SPD: 6
- XP: 130 | Loot: Toothpick Spear (10%)
- AI: Defensive
- Special: Constrict (multi-turn grapple, 5 dmg/turn for 3 turns)
- Description: "It slithers through the grass. You hope it's not venomous."

**Aggressive Squirrel** (Level 7)
- HP: 65 | ATK: 11 | DEF: 5 | SPD: 8
- XP: 125 | Loot: Currency (40-80 Crumbs)
- AI: Random
- Special: Nut Throw (ranged attack, ignores 50% DEF)
- Description: "Territorial and twitchy. It chatters angrily, gathering acorns."

### **Boss Battles**

**Spoiled Milk (Level 3 Mini-Boss)**
- HP: 100 | ATK: 8 | DEF: 4 | SPD: 3
- XP: 150 | Loot: Wrapper Armor (100%)
- AI: Aggressive
- Special: Splash Damage (AOE attack hits for 10 dmg, cannot be defended)
- Location: Yogurt Container Ruins
- Description: "A curdled nightmare. The smell alone could kill."

**Raccoon King (Level 7 Boss)**
- HP: 200 | ATK: 14 | DEF: 8 | SPD: 6
- XP: 300 | Loot: Raccoon Crown (accessory, +5 all stats)
- AI: Aggressive
- Special: Summon Trash Minions (calls 2 Crumb Swarms every 3 turns)
- Location: Garden Gauntlet
- Description: "The ruler of the backyard. Wearing a bottle cap as a crown."

**The Hungry Dog (Level 10 Final Boss - OPTIONAL)**
- HP: 350 | ATK: 18 | DEF: 10 | SPD: 7
- XP: 500 | Loot: Secret Ending
- AI: Three-phase fight
  - Phase 1: Normal attacks
  - Phase 2 (below 50% HP): Bite (2x damage attack)
  - Phase 3 (below 25% HP): Desperate frenzy (attacks twice per turn)
- Unlock Condition: Collected ALL ingredients in Act 1
- Location: Shed Entrance
- Description: "A massive golden retriever. To it, you're a snack. To you, it's apocalypse."

---

## Items & Equipment

### **Consumables**

**Crumbs** (Common)
- Effect: Heal 10 HP
- Cost: 15 Crumb Currency
- Description: "Leftover breadcrumbs. Better than nothing."

**Soda Drop** (Uncommon)
- Effect: Heal 25 HP
- Cost: 40 Crumb Currency
- Description: "A sugary droplet from a spilled can. Refreshing and sticky."

**Moldy Bread** (Rare)
- Effect: Revive from 0 HP to 50% max HP
- Cost: 60 Crumb Currency
- Description: "Ironically, mold gives life. Use when defeated."

### **Equipment**

**Weapons:**

**Toothpick Shiv** (Starting)
- ATK: +0
- Description: "A simple toothpick. Better than your bare... bun."

**Toothpick Spear** (Uncommon)
- ATK: +8
- Cost: 120 Crumb Currency
- Description: "Sharpened to a fine point. Now we're talking."

**Fork Tine Sword** (Rare)
- ATK: +15
- Boss Drop: Raccoon King
- Description: "A broken fork prong. To you, it's a legendary blade."

**Armor:**

**Exposed Bun** (Starting)
- DEF: +0
- Description: "No protection. Just you and your soft, vulnerable dough."

**Wrapper Armor** (Common)
- DEF: +5
- Cost: 100 Crumb Currency
- Description: "A burger wrapper fashioned into chest armor. Crinkly but effective."

**Aluminum Foil Plate** (Rare)
- DEF: +12
- Boss Drop: Spoiled Milk
- Description: "Reflective and sturdy. You look like a knight."

**Shields:**

**None** (Starting)
- DEF: +0

**Foil Shield** (Common)
- DEF: +3
- Cost: 80 Crumb Currency
- Description: "A scrap of aluminum foil. Blocks some hits."

**Bottle Cap Buckler** (Rare)
- DEF: +7
- Boss Drop: Raccoon King
- Description: "The Raccoon King's old shield. Heavy but reliable."

---

## Shop System

### **Cockroach Merchant**

**Location:** Trash Bag Depths (unlocked after Yogurt Container Ruins)

**Personality:** Friendly, entrepreneurial, speaks in broken English with enthusiasm

**Shop Inventory:**

| Item | Price | Stock |
|------|-------|-------|
| Crumbs | 15 | Unlimited |
| Soda Drop | 40 | Unlimited |
| Moldy Bread | 60 | Unlimited |
| Wrapper Armor | 100 | 1 (respawns if sold) |
| Toothpick Spear | 120 | 1 (respawns if sold) |
| Foil Shield | 80 | 1 (respawns if sold) |

**Currency System:**
- Crumb Currency earned from:
  - Defeating enemies (5-20 per enemy)
  - Selling items (50% of buy price)
  - Finding in locations (hidden caches)

**Sample Dialogue:**
```
"Welcome, welcome! You looking good for bun! Very strong!
What you need? I have best garbage merchandise!"
```

---

## Unlock & Transition

### **Unlock Condition**
- Player must achieve **"Avocado Savior"** ending (Good Silent ending)
- Achievement triggers unlock flag: `trashOdysseyUnlocked: true`

### **Entry Points**

**1. Main Menu Button** (Primary)
```
Main Menu:
→ Start New Game (Act 1)
→ Start Trash Odyssey (Act 2) [UNLOCKED]
→ View Achievements
→ Change Layout
```

**2. Post-Ending Choice** (Immediate)
```
[After Good Silent Ending text]

You feel different. Stronger. Ready.

Achievement Unlocked: Avocado Savior

A new journey awaits...

→ Continue to Trash Odyssey (NEW!)
→ Return to Main Menu
→ Restart Act 1
```

**3. Achievement Panel** (Convenience)
```
Achievement: Avocado Savior ✓
Description: You found peace and purpose.
Unlocked: [timestamp]

→ Play Trash Odyssey
```

### **Opening Cutscene**

```
═══════════════════════════════════════════
ACT 2: TRASH ODYSSEY
═══════════════════════════════════════════

You've found meaning. You've collected ingredients.
You've lingered in silence and found peace.

The person lifts you to their mouth...

"Ugh, too much avocado."

THUNK.

You tumble through darkness. Land in wetness.
Coffee grounds. Banana peels. The stench of decay.

The garbage can.

For a moment, you despair.

But then you remember: You have PURPOSE now.
You're not just a bun. You're a COMPLETE bun.

And complete buns don't give up.

Somewhere beyond this trash, beyond the backyard,
there's a shed. And in that shed, a lunchbox.

A place where forgotten foods rest in peace.

You will reach it.

No matter how many monsters stand in your way.

═══════════════════════════════════════════

→ Begin your journey
```

---

## Victory Ending

```
═══════════════════════════════════════════
LUNCHBOX SANCTUARY
═══════════════════════════════════════════

You crawl over the lip of the lunchbox.

Inside: A bruised apple. Stale crackers. A juice box,
long since drained. The faint smell of peanut butter.

It's quiet here. Safe.

You nestle between the crackers. They don't judge.
They don't throw you away.

This is home now.

You made it.

Through slime and grease and raccoons and fear,
you survived.

You are more than ingredients.
You are more than purpose.

You are a bun who CHOSE to live.

═══════════════════════════════════════════

FINAL STATISTICS:

Level Reached: [X]
Enemies Defeated: [X]
Bosses Slain: [X]
Items Collected: [X]
Deaths: [X]

Ingredient Powers Used:
[List of Act 1 ingredients and their bonuses]

═══════════════════════════════════════════

Achievement Unlocked: Trash Odyssey Champion

THE END

→ Return to Main Menu
→ Restart Trash Odyssey
→ Restart Act 1
```

---

## Additional Endings (Optional)

### **Bad Ending: Defeated**
**Trigger:** Lose to The Hungry Dog (if encountered) or die with 0 Moldy Bread

```
You fall.

The darkness takes you.

You tried. You fought.

But in the end, you were just a bun in a trash can.

Some stories don't have happy endings.

GAME OVER

→ Respawn at Last Checkpoint
→ Return to Main Menu
```

### **Secret Ending: Ultimate Victory**
**Trigger:** Defeat The Hungry Dog (requires ALL 11 ingredients from Act 1)

```
The dog whimpers and retreats.

You stand victorious.

A bun who conquered the kitchen.
A bun who survived the trash.
A bun who defeated a DOG.

Legends will be told of you.
(By the crackers, mostly.)

Achievement Unlocked: Legendary Bun

→ Return to Main Menu
```

---

## Achievements (Act 2)

| Achievement | Condition |
|-------------|-----------|
| **Trash Odyssey Unlocked** | Beat Act 1 with Avocado Savior ending |
| **First Blood** | Defeat your first enemy |
| **Trash Survivor** | Reach Trash Bag Depths checkpoint |
| **Mini-Boss Slayer** | Defeat Spoiled Milk |
| **King Slayer** | Defeat Raccoon King |
| **Trash Odyssey Champion** | Reach Lunchbox Sanctuary |
| **Legendary Bun** | Defeat The Hungry Dog (secret boss) |
| **Pacifist Route** | Reach Lunchbox with 0 enemy kills (flee from all) |
| **Speedrunner** | Complete Act 2 in under 30 minutes |
| **Hoarder** | Collect all equipment pieces |
| **Merchant's Friend** | Spend 500+ Crumb Currency at shop |
| **Deathless** | Complete Act 2 without dying |

---

## Implementation Priority Guide

**MUST HAVE (Core Experience):**
- ✅ RPG state structure
- ✅ Unlock system (Avocado Savior check)
- ✅ Turn-based combat
- ✅ 5-7 locations
- ✅ 10+ enemies
- ✅ 1-2 boss fights
- ✅ Level/XP system
- ✅ Ingredient powers
- ✅ Basic inventory
- ✅ Victory ending

**SHOULD HAVE (Polish):**
- Shop system
- Equipment slots
- 3 boss fights
- Checkpoints/saves
- Item drops
- All achievements
- Bad/secret endings

**NICE TO HAVE (Extras):**
- Enemy AI variety
- Multiple combat abilities
- Environmental hazards
- Easter eggs
- Speedrun mode
- Hard difficulty option

---

## Testing Checklist

- [ ] Unlock triggers correctly after Avocado Savior
- [ ] Combat calculations are accurate
- [ ] Level-up grants correct stat increases
- [ ] Ingredients convert to powers correctly
- [ ] Inventory limit enforced (10 items)
- [ ] Items usable in/out of combat
- [ ] Shop buy/sell works correctly
- [ ] Checkpoints save/load properly
- [ ] Boss battles function correctly
- [ ] Endings trigger on correct conditions
- [ ] Achievements unlock appropriately
- [ ] Balance: Can complete at level 8-10
- [ ] Balance: Combat is challenging but fair
- [ ] No softlocks or game-breaking bugs

---

## Future Expansion Ideas

*(Post-launch, if desired)*

- **Act 3:** "The Fridge Expanse" - A frozen wasteland adventure
- **Multiplayer:** Co-op mode (two buns, shared journey)
- **Roguelike Mode:** Randomized enemies, permadeath
- **Challenge Runs:** Speedrun, no-damage, low-level
- **More Ingredient Synergies:** Combo abilities (Bacon + Cheese = Grease Bomb)
- **Pet System:** Recruit friendly insects as companions
- **Crafting:** Combine items to create better equipment
- **Side Quests:** Optional objectives for bonus rewards

---

**Document Version:** 1.0
**Last Updated:** 2025-12-14
**Status:** Design Complete - Ready for Implementation
