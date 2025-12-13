# Burger Bun Dungeon - Architecture

## Overview

Burger Bun Dungeon is a narrative-driven browser game built with React and TypeScript. The architecture follows Clean Code and SOLID principles with a focus on maintainability and itch.io deployment compatibility.

## Project Structure

```
src/
├── components/
│   ├── BurgerGame.tsx              # Main game orchestrator (90 lines)
│   ├── layouts/
│   │   ├── ClassicDinerLayout.tsx  # Classic diner theme
│   │   ├── ModernMinimalLayout.tsx # Modern minimal theme
│   │   ├── PlayfulCartoonLayout.tsx# Playful cartoon theme
│   │   ├── types.ts                # Shared layout types
│   │   └── index.ts                # Layout registry
│   ├── Layout1.css                 # Classic diner styles
│   ├── Layout2.css                 # Modern minimal styles
│   └── Layout3.css                 # Playful cartoon styles
├── services/
│   ├── SceneGenerator.ts           # Dynamic scene generation
│   ├── SynergyCalculator.ts        # Ingredient synergy logic
│   └── ChoiceProcessor.ts          # Player choice handling
├── constants/
│   └── gameConstants.ts            # Game constants (scene IDs, etc.)
├── types/
│   └── game.ts                     # TypeScript type definitions
├── data/
│   ├── scenes.json                 # Scene definitions
│   └── ingredients.json            # Ingredient definitions
├── App.tsx                         # Layout switcher
├── App.css                         # App-level styles
├── index.css                       # Global styles
└── main.tsx                        # React entry point
```

## Design Principles

### 1. Separation of Concerns

**Before Refactoring:**
- Single 411-line BurgerGame.tsx component handling everything
- Game logic, UI rendering, and scene generation all mixed together

**After Refactoring:**
- **Components** (`layouts/`) - Pure UI rendering
- **Services** (`services/`) - Business logic and game mechanics
- **Constants** (`constants/`) - Configuration and magic values
- **Data** (`data/`) - Content separated from code

### 2. Open/Closed Principle

The layout system uses a **registry pattern** to allow adding new layouts without modifying existing code:

```typescript
// layouts/index.ts
export const layouts: Record<LayoutType, LayoutComponent> = {
  layout1: ClassicDinerLayout,
  layout2: ModernMinimalLayout,
  layout3: PlayfulCartoonLayout
}
```

To add a new layout:
1. Create new layout component (e.g., `Layout4.tsx`)
2. Add to registry
3. No changes to BurgerGame.tsx needed

### 3. Single Responsibility Principle

Each service has a single, well-defined responsibility:

- **SceneGenerator**: Generates dynamic scenes (reflection, ending)
- **SynergyCalculator**: Calculates ingredient interactions and scores
- **ChoiceProcessor**: Handles player choice logic and state updates

### 4. DRY (Don't Repeat Yourself)

**Before:** 3 layout renderings with ~300 lines of duplicated code
**After:** 3 layout components sharing common interface, zero duplication

## Key Components

### BurgerGame.tsx (Orchestrator)

Responsibilities:
- Manages game state
- Determines current scene (static or dynamic)
- Filters available choices
- Delegates to services for business logic
- Renders selected layout component

Does NOT:
- Contain layout-specific rendering
- Implement game logic directly
- Calculate synergies or scores

### Layout Components

Each layout component:
- Receives props via `LayoutProps` interface
- Renders the same game content with different visual styling
- Handles no business logic (pure presentation)

**Shared Interface:**
```typescript
interface LayoutProps {
  sceneText: string
  availableChoices: Choice[]
  selectedChoice: number
  onChoiceChange: (index: number) => void  // Auto-submits on valid selection
  onSubmit: () => void                      // Legacy, kept for compatibility
  onRestart: () => void
}
```

**UI Behavior:**
- Selecting a choice from the dropdown automatically advances the game (no submit button needed)
- Submit buttons have been removed from all layouts for streamlined UX
- Only restart button remains visible to players

### Service Layer

#### SceneGenerator
- `generateReflectionScene()` - Creates inventory/synergy review scene
- `generateEndingScene()` - Creates final score and ending scene

#### SynergyCalculator
- `calculateSynergyText()` - Gets reaction text for ingredient pairs
- `calculateSynergyScore()` - Calculates points and formatted messages
- `calculateIngredientAddedSynergy()` - Gets synergy for newly added ingredient

#### ChoiceProcessor
- `processChoice()` - Main entry point for choice handling
- `processReflection()` - Handles reflection choice
- `processEnding()` - Handles ending trigger
- `processIngredientPickup()` - Handles taking ingredients
- `processNavigation()` - Handles scene navigation

## Data Flow

```
User Action
    ↓
Layout Component (onChoiceChange/onSubmit)
    ↓
BurgerGame (handleChoiceChange/handleSubmit)
    ↓
ChoiceProcessor.processChoice()
    ↓
    ├─→ SceneGenerator (if dynamic scene)
    ├─→ SynergyCalculator (if ingredient interaction)
    └─→ State Update (setGameState)
    ↓
Re-render with new state
    ↓
Layout Component displays new scene
```

## State Management

Game state is centralized in BurgerGame.tsx:

```typescript
interface GameState {
  currentSceneId: string      // Current scene ID or 'REFLECT'/'ENDING'
  bunIngredients: string[]    // Collected ingredient IDs
  visitedScenes: string[]     // History of visited scenes
}
```

**State Updates:**
- All updates via `setGameState()` with immutable patterns
- Services receive state as parameters (no direct access)
- No global state or Context API (keeps it simple)

## Build & Deployment

### Itch.io Optimization

The vite.config.ts is optimized for itch.io:

```typescript
export default defineConfig({
  base: './',              // Relative paths
  build: {
    sourcemap: false,      // Reduce size
    rollupOptions: {
      output: {
        inlineDynamicImports: true,  // Single bundle
        manualChunks: undefined       // No code splitting
      }
    }
  }
})
```

**Why these settings:**
- `base: './'` - Works in itch.io's iframe
- `sourcemap: false` - Smaller upload size
- `inlineDynamicImports: true` - Single JS file (no chunk loading issues)

### Viewport Configuration

The game uses a fixed viewport (1280x800) to ensure consistent display in itch.io's iframe:

**index.html:**
- Meta viewport prevents scaling: `maximum-scale=1.0, user-scalable=no`
- Fixed html/body sizing with `overflow: hidden`

**CSS Strategy:**
- All containers use `height: 100%` instead of `min-height: 100vh`
- Root level has `overflow: hidden` to prevent page scrolling
- Layout containers have `overflow-y: auto` for internal scrolling
- Content max-width increased to 900px to utilize horizontal space

**Why Fixed Viewport:**
- Prevents variable height issues in itch.io iframe
- Ensures consistent experience across browsers
- No unwanted scrollbars or overflow
- Content stays within visible area

### Build Output

```
dist/
├── index.html              (~0.5kb)
├── assets/
│   ├── index-[hash].css    (~9kb)
│   └── index-[hash].js     (~208kb uncompressed, ~65kb gzipped)
```

**Total size:** ~218kb uncompressed, ~68kb compressed

## Adding New Features

### Adding a New Layout

1. Create `src/components/layouts/NewLayout.tsx`
2. Implement `LayoutProps` interface
3. Add to `src/components/layouts/index.ts`:
   ```typescript
   export const layouts = {
     layout1: ClassicDinerLayout,
     layout2: ModernMinimalLayout,
     layout3: PlayfulCartoonLayout,
     layout4: NewLayout  // Add here
   }
   ```
4. Update `LayoutType` union

### Adding a New Scene

Edit `src/data/scenes.json` (see HOW_TO_ADD_SCENES.md)

### Adding a New Ingredient

Edit `src/data/ingredients.json` (see HOW_TO_ADD_SCENES.md)

### Adding Game Mechanics

Add new service in `src/services/`:
1. Create service class with static methods
2. Import in BurgerGame.tsx or ChoiceProcessor.ts
3. Call from appropriate location in game flow

## Testing

Currently no automated tests, but the refactored architecture makes testing easier:

**Testable services:**
- `SceneGenerator.generateReflectionScene()` - Pure function
- `SynergyCalculator.calculateSynergyScore()` - Pure function
- Layout components - Can test with mock props

**To add testing:**
1. Install Vitest: `npm install -D vitest`
2. Create `src/__tests__/` directory
3. Write unit tests for services
4. Add test script to package.json

## Performance Considerations

- No unnecessary re-renders (state updates are minimal)
- No large dependencies (only React)
- Single bundle for fast loading
- CSS kept separate (cacheable)
- Synergy calculations memoizable (future optimization)

## Future Improvements

Potential enhancements (maintaining itch.io compatibility):

1. **localStorage persistence** - Save game state
2. **Undo/redo** - Track state history
3. **Toast notifications** - Replace browser alerts
4. **Keyboard shortcuts** - Better accessibility
5. **CSS Modules** - Better style encapsulation
6. **Unit tests** - Automated testing
7. **Scene validation** - Runtime checks for data integrity

## Dependencies

**Runtime (bundled in build):**
- react: ^19.2.0
- react-dom: ^19.2.0

**Development only:**
- TypeScript, Vite, ESLint (not in final bundle)

**Total bundle size:** ~208kb (65kb gzipped) - Well within itch.io limits
