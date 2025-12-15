# Error Handling Improvements

## Overview

Enhanced error handling in RPGStateManager to be environment-aware, providing fail-fast behavior in development while gracefully handling errors in production with proper logging.

## Changes Made

### 1. Environment Detection Utility
**File**: [src/utils/environment.ts](../src/utils/environment.ts)

Provides environment detection functions:
- `isDevelopment()` - Returns true in development mode
- `isProduction()` - Returns true in production mode
- `isTest()` - Returns true in test mode

### 2. Error Tracking Utility
**File**: [src/utils/errorTracking.ts](../src/utils/errorTracking.ts)

Production-ready error logging with context:
- `errorTracker.logError(message, context, error?)` - Logs errors with full context including stack trace, timestamp, userAgent, URL
- `errorTracker.logWarning(message, context)` - Logs warnings with context
- Structured for future integration with error tracking services (Sentry, etc.)

### 3. Equipment Validation
**File**: [src/rpg/EquipmentValidator.ts](../src/rpg/EquipmentValidator.ts)

Three core functions to ensure combat-safe equipment:

#### `validateEquipmentStats(equipment: Equipment): Equipment`
Normalizes equipment stats to prevent undefined/NaN in combat calculations:
- Ensures stats object exists
- Fills missing stat properties (atk, def, spd) with 0
- Validates stat types are numbers

#### `createFallbackEquipment(slot, itemId): Equipment`
Creates safe fallback equipment when definitions are missing:
- Returns properly structured Equipment object
- All stats initialized to 0 (combat-safe)
- Clearly labeled as fallback in description

#### `assertEquipmentValid(equipment: Equipment, context: string): void`
Runtime assertion to verify equipment integrity:
- Checks stats object exists
- Validates all stat properties are numbers
- Validates slot is valid
- Throws descriptive error if validation fails

### 4. Updated RPGStateManager
**File**: [src/rpg/RPGStateManager.ts](../src/rpg/RPGStateManager.ts)

Environment-aware error handling in `createStartingEquipment()`:

**Development/Test Mode (Fail Fast)**:
```typescript
if (isDevelopment() || isTest()) {
  throw new Error(`Starting equipment definition not found...`)
}
```
- Immediately throws with detailed error message
- Includes full context (slot, itemId, stack trace)
- Helps catch data integrity issues early

**Production Mode (Graceful Degradation)**:
```typescript
errorTracker.logError(
  `Starting equipment definition not found...`,
  { slot, itemId, startingIds, stackTrace }
)
const fallbackEquipment = createFallbackEquipment(slot, itemId)
assertEquipmentValid(fallbackEquipment, `fallback for ${slot}`)
return fallbackEquipment
```
- Logs error with full context to error tracking system
- Returns combat-safe fallback equipment
- Validates fallback before returning
- Game continues without crashing

**All Equipment Normalized**:
```typescript
return validateEquipmentStats(equipment)
```
- Even valid equipment is normalized to ensure stats are combat-safe
- Prevents issues from malformed data files

## Testing & Verification

### Unit Tests
**File**: [src/rpg/EquipmentValidator.test.ts](../src/rpg/EquipmentValidator.test.ts)

Comprehensive test suite covering:
- ✅ Stats normalization (missing stats → 0)
- ✅ Preserving valid stats
- ✅ Handling missing stats object
- ✅ Normalizing invalid stat types
- ✅ Fallback equipment creation for all slots
- ✅ Valid equipment assertions pass
- ✅ Invalid equipment assertions throw
- ✅ Combat safety integration (no NaN in calculations)

**Note**: Requires vitest to be installed. Tests are ready when test infrastructure is set up.

### Runtime Verification
**File**: [src/rpg/EquipmentValidator.verify.ts](../src/rpg/EquipmentValidator.verify.ts)

Can be run independently or imported during app initialization in dev mode:
```typescript
import { verifyEquipmentValidation } from './rpg/EquipmentValidator.verify'

if (isDevelopment()) {
  verifyEquipmentValidation()
}
```

Verifies:
- Stats normalization works correctly
- Fallback equipment is created properly
- Valid equipment passes assertions
- Invalid equipment throws errors
- Combat calculations produce valid numbers (no NaN)

## Benefits

### For Development
- **Fail Fast**: Immediate, descriptive errors when data is malformed
- **Rich Context**: Full stack traces and context help debug issues quickly
- **Data Integrity**: Catches missing/invalid equipment definitions early

### For Production
- **No Crashes**: Graceful degradation with safe fallbacks
- **Error Visibility**: Full error context logged for monitoring
- **User Experience**: Game continues working even with data issues
- **Future-Ready**: Structured for integration with error tracking services

### For Combat System
- **Type Safety**: All stats guaranteed to be numbers (never undefined/NaN)
- **Safe Calculations**: `totalAtk = baseAtk + (equipment.stats.atk || 0)` always works
- **Validated Data**: Fallback equipment passes same validation as real equipment
- **Predictable Behavior**: No runtime surprises from missing stat properties

## Integration Points

### Current
- [RPGStateManager.ts:298-342](../src/rpg/RPGStateManager.ts#L298-L342) - Starting equipment creation

### Future Opportunities
1. **InventoryManager.ts:245** - Another throw for missing equipment (can apply same pattern)
2. **ItemDatabase.ts** - Could add validation when loading item definitions
3. **Error Tracking Service** - Integrate errorTracker with Sentry/LogRocket/etc.
4. **User Feedback** - Could show toast notification in production when fallback is used

## Maintenance Notes

### Adding New Stats
When adding new stat properties to equipment:
1. Update `Equipment` interface in [types/game.ts](../src/types/game.ts)
2. Update `validateEquipmentStats()` to normalize new properties
3. Update `assertEquipmentValid()` to validate new properties
4. Update tests to cover new properties

### Environment Configuration
Environment detection uses Vite's built-in `import.meta.env`:
- `import.meta.env.DEV` - Development mode
- `import.meta.env.PROD` - Production mode
- `import.meta.env.MODE` - Current mode string

No additional configuration needed.

## Example Error Logs

### Development (Console)
```
Error: Starting equipment definition not found for weapon (toothpick_shiv).
This indicates a data integrity issue. Check ItemDatabase and STARTING_EQUIPMENT constants.
Context: {
  "slot": "weapon",
  "itemId": "toothpick_shiv",
  "startingIds": {...},
  "stackTrace": "Error: ..."
}
```

### Production (Console + Future Service)
```
[Production Error] Starting equipment definition not found for weapon (toothpick_shiv) {
  timestamp: "2025-12-15T19:00:00.000Z",
  message: "Starting equipment definition not found for weapon (toothpick_shiv)",
  context: {
    slot: "weapon",
    itemId: "toothpick_shiv",
    startingIds: {...},
    stackTrace: "Error\n    at createStartingEquipment..."
  },
  userAgent: "Mozilla/5.0...",
  url: "https://example.com/game"
}
```

## Related Files

- [src/utils/environment.ts](../src/utils/environment.ts) - Environment detection
- [src/utils/errorTracking.ts](../src/utils/errorTracking.ts) - Error logging
- [src/rpg/EquipmentValidator.ts](../src/rpg/EquipmentValidator.ts) - Validation utilities
- [src/rpg/EquipmentValidator.test.ts](../src/rpg/EquipmentValidator.test.ts) - Unit tests
- [src/rpg/EquipmentValidator.verify.ts](../src/rpg/EquipmentValidator.verify.ts) - Runtime verification
- [src/rpg/RPGStateManager.ts](../src/rpg/RPGStateManager.ts) - Updated error handling
- [src/types/game.ts](../src/types/game.ts) - Equipment interface
