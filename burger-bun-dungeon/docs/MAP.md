# Burger Bun Dungeon - Scene Map

This document shows the complete layout of the dungeon and how scenes connect.

## Visual Map

```
                    KITCHEN COUNTER (START)
                            |
                    [Get off the plate]
                            |
                            v
                    KITCHEN FLOOR ─────────────────┐
                    /    |    \                    |
                   /     |     \                   |
         [Hallway] [Fridge] [Under Table]    [Reflect]
              /       |         \
             /        |          \
            v         v           v
        HALLWAY   FRIDGE      UNDER TABLE
            |     EXTERIOR    (lettuce)
            |         |
      [Living Room] [Enter]
            |         |
            v         v
      LIVING ROOM  FRIDGE INTERIOR
         /    \      (cheese)
        /      \        |
  [Couch] [Pantry]  [Take/Leave]
     /         \        |
    v           v       v
BEHIND      PANTRY   FRIDGE AFTER
COUCH      (pickle)      |
(tomato)       |     [Freezer]
               |         |
          [Take/Leave]   v
               |      FREEZER
               v      (bacon)
          PANTRY         |
           AFTER         |
               |    [Back to Kitchen]
          [Stairs]       |
               |         v
               v    KITCHEN FLOOR
          BASEMENT
       (onion/special_sauce)
               |
          [Take one/neither]
               |
               v
        BASEMENT AFTER
               |
         [Final Door]
               |
               v
         FINAL ROOM
               |
          [Complete]
               |
               v
           ENDING
```

## Scene Details

### Kitchen Area

**kitchen_counter** (START)
- Description: Alone on a counter, feeling incomplete
- Exits: kitchen_floor
- Ingredient: None
- Special: Starting location

**kitchen_floor** (HUB)
- Description: Vast floor with cold tiles
- Exits: hallway, fridge_exterior, under_table
- Ingredient: None
- Special: Main hub, multiple paths

**under_table**
- Description: Dark and dusty space
- Exits: kitchen_floor
- Ingredient: **lettuce**
- Special: Dead end with ingredient

### Refrigerator Path

**fridge_exterior**
- Description: Tall white refrigerator with open door
- Exits: fridge_interior, kitchen_floor
- Ingredient: None

**fridge_interior**
- Description: Cold white light, cheese on shelf
- Exits: fridge_interior_after
- Ingredient: **cheese**
- Special: Choice to take or leave

**fridge_interior_after**
- Description: Empty shelf, see freezer door
- Exits: freezer, kitchen_floor
- Ingredient: None

**freezer**
- Description: Very cold, ice crystals, frozen bacon
- Exits: kitchen_floor
- Ingredient: **bacon**
- Special: Dead end with ingredient

### Hallway & Living Room

**hallway**
- Description: Long bare hallway, silent
- Exits: living_room, kitchen_floor
- Ingredient: None
- Special: Connector

**living_room**
- Description: Empty room with couch and pantry door
- Exits: behind_couch, pantry, hallway
- Ingredient: None
- Special: Hub for this area

**behind_couch**
- Description: Shadow behind couch
- Exits: living_room
- Ingredient: **tomato**
- Special: Dead end with ingredient

### Pantry & Basement

**pantry**
- Description: Dark pantry with jars, pickle on shelf
- Exits: pantry_after
- Ingredient: **pickle**
- Special: Choice to take or leave

**pantry_after**
- Description: See stairs going down
- Exits: basement, living_room
- Ingredient: None

**basement**
- Description: Cold and dark, two items available
- Exits: basement_after
- Ingredient: **onion** OR **special_sauce**
- Special: Choice between two ingredients

**basement_after**
- Description: Final door visible
- Exits: final_room, pantry_after
- Ingredient: None
- Special: Last chance to turn back

### Ending

**final_room**
- Description: Small empty room, the end
- Exits: ENDING (via complete)
- Ingredient: None
- Special: Triggers ending

**ENDING** (Generated)
- Description: Shows final burger composition and score
- Exits: kitchen_counter (restart)
- Special: Dynamic scene with scoring

## Ingredient Locations

1. **Cheese** - fridge_interior
2. **Bacon** - freezer
3. **Lettuce** - under_table
4. **Tomato** - behind_couch
5. **Pickle** - pantry
6. **Onion** - basement (choice 1)
7. **Special Sauce** - basement (choice 2)

## Critical Paths

### Minimum Path (No ingredients)
kitchen_counter → kitchen_floor → hallway → living_room → pantry → pantry_after → basement → basement_after → final_room → ENDING

### Maximum Ingredients (6 items)
1. Start at kitchen_counter
2. kitchen_floor → under_table (get lettuce)
3. kitchen_floor → fridge_exterior → fridge_interior (get cheese)
4. fridge_interior_after → freezer (get bacon)
5. kitchen_floor → hallway → living_room → behind_couch (get tomato)
6. living_room → pantry (get pickle)
7. pantry_after → basement (get onion OR special_sauce)
8. basement_after → final_room → ENDING

### Special Feature: Reflection
At any scene with "Reflect on your Ingredients" choice:
- Shows current ingredients on bun
- Shows synergy reactions
- Returns to previous scene
- Available at most scenes (not at ingredient pickup points)

## Notes for Expansion

- Kitchen area is fully explored
- Could add more rooms off hallway
- Could add attic/closet branches
- Could add backyard/garage areas
- Basement could have multiple rooms
- Could add alternate paths to same locations
