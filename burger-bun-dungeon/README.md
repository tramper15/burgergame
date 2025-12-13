# 🍔 The Buns Journey

A narrative-driven text adventure game where you play as a burger bun exploring a kitchen, collecting ingredients, and discovering your purpose. Built with React, TypeScript, and Vite.

## About the Game

The Buns Journey is an existential text adventure that combines whimsy with introspection. As a sentient burger bun, you'll navigate through various kitchen locations, gather ingredients, and reflect on your journey toward completeness.

### Features

- **Multiple Endings**: Your choices and ingredients determine different narrative outcomes
- **Synergy System**: Ingredients interact in meaningful ways, creating unique flavor combinations and story beats
- **Reflective Moments**: Pause to contemplate your journey through silence and introspection
- **Three Visual Themes**: Switch between Classic Diner, Modern Minimal, and Playful Cartoon layouts
- **Rich Narrative**: Explore kitchen locations from the counter to beneath the couch

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd burger-bun-dungeon

# Install dependencies
npm install
```

### Running the Game

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
burger-bun-dungeon/
├── src/
│   ├── components/
│   │   ├── css/                    # Layout stylesheets
│   │   │   ├── ClassicDiner.css
│   │   │   ├── ModernMinimal.css
│   │   │   └── PlayfulCartoon.css
│   │   ├── layouts/                # Layout components
│   │   │   ├── ClassicDinerLayout.tsx
│   │   │   ├── ModernMinimalLayout.tsx
│   │   │   └── PlayfulCartoonLayout.tsx
│   │   ├── BurgerGame.tsx          # Main game component
│   │   └── ToastProvider.tsx       # Toast notification system
│   ├── services/
│   │   ├── SceneGenerator.ts       # Scene generation logic
│   │   ├── SynergyCalculator.ts    # Ingredient synergy system
│   │   └── EndingFactory.ts        # Ending narratives
│   ├── scenes/                     # Game scenes and locations
│   ├── ingredients/                # Ingredient definitions
│   ├── constants/                  # Game constants
│   └── types/                      # TypeScript type definitions
└── docs/                           # Documentation
```

## Gameplay

1. **Explore**: Navigate through different kitchen locations
2. **Collect**: Gather ingredients for your burger
3. **Reflect**: Use silence and introspection to understand your journey
4. **Complete**: Reach one of multiple endings based on your choices

## Tech Stack

- **React 19**: UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **ESLint**: Code quality and consistency

## Development

The game uses a modular architecture with:
- **Scene System**: Dynamically generated scenes based on game state
- **State Management**: React hooks for game state
- **Layout System**: Pluggable UI themes
- **Service Layer**: Business logic separated from UI

## License

This project is private and not currently licensed for public use.

## Acknowledgments

Built with curiosity and a love for narrative games.
