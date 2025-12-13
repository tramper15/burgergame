# How to Add New Scenes

This guide shows you how to easily add new content to your Burger Bun Dungeon game.

## Adding a New Scene

1. Open `src/data/scenes.json`
2. Copy this template:

```json
"your_scene_id": {
  "text": "Description of what the player sees and feels.",
  "ingredient": "ingredient_id",
  "choices": [
    { "label": "First choice", "next": "next_scene_id" },
    { "label": "Second choice", "next": "other_scene_id" },
    { "label": "Reflect on your Ingredients", "reflect": true }
  ]
}
```

3. Customize:
   - **your_scene_id**: Unique ID for this scene (e.g., "attic", "closet_interior")
   - **text**: The story text the player reads
   - **ingredient**: (Optional) ID of ingredient found here
   - **choices**: Array of options the player can choose

## Choice Types

### Navigate to another scene
```json
{ "label": "Go to the hallway", "next": "hallway" }
```

### Take an ingredient
```json
{ "label": "Take the cheese", "take": "cheese", "next": "next_scene" }
```

### Reflect (check inventory)
```json
{ "label": "Reflect on your Ingredients", "reflect": true }
```

### End the game
```json
{ "label": "You are complete", "end": true }
```

## Adding a New Ingredient

1. Open `src/data/ingredients.json`
2. Copy this template:

```json
"your_ingredient_id": {
  "name": "Ingredient Name",
  "description": "Short description of the ingredient.",
  "onAdd": "Text shown when player takes this ingredient.",
  "points": 2,
  "likes": ["cheese", "bacon"],
  "dislikes": ["avocado"],
  "reactions": {
    "cheese": "This ingredient likes the cheese.",
    "bacon": "This ingredient remembers the bacon.",
    "avocado": "This ingredient does not like this."
  }
}
```

3. Customize:
   - **name**: Display name
   - **description**: Shown in reflection screen
   - **onAdd**: Message when picked up
   - **points**: Base score value
   - **likes**: Array of ingredient IDs it likes (+2 synergy)
   - **dislikes**: Array of ingredient IDs it dislikes (-2 synergy)
   - **reactions**: Text shown when meeting other ingredients

## Example: Adding a New Room

Let's add an attic scene:

```json
"attic": {
  "text": "The attic is dusty and quiet. Sunlight comes through a small window. You find mushrooms growing in a corner.",
  "ingredient": "mushroom",
  "choices": [
    { "label": "Take the mushrooms", "take": "mushroom", "next": "hallway" },
    { "label": "Leave them alone", "next": "hallway" }
  ]
}
```

Then add the mushroom ingredient:

```json
"mushroom": {
  "name": "Mushroom",
  "description": "Small brown mushrooms. They smell earthy.",
  "onAdd": "The mushrooms settle on you. They feel strange.",
  "points": 2,
  "likes": ["onion", "cheese"],
  "dislikes": ["pickle"],
  "reactions": {
    "onion": "The mushroom and onion are natural companions.",
    "cheese": "The mushroom melts into the cheese.",
    "pickle": "The mushroom pulls away from the pickle."
  }
}
```

## Tips

- Always use unique scene IDs
- Make sure all `next` scene IDs actually exist
- Make sure all `take` and ingredient references exist
- Use `"reflect": true` to let players check their progress
- Keep text atmospheric and slightly strange
- Preserve the melancholy, quiet tone

## Testing Your Changes

1. Save your JSON files
2. The dev server will auto-reload
3. Play through your new content
4. Check for broken links or missing ingredients

That's it! No code changes needed - just edit the JSON files.
