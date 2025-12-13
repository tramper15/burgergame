# Deployment Guide - Itch.io

## Quick Start

### 1. Build for Production

```bash
npm run build
```

This creates a `dist/` folder with your game ready for upload.

### 2. Create Zip File

Navigate to the dist folder and create a zip:

**Windows:**
```bash
cd dist
tar -a -c -f ../burger-bun-dungeon.zip *
cd ..
```

Or use Windows Explorer: Right-click dist folder → Send to → Compressed folder

**Mac/Linux:**
```bash
cd dist
zip -r ../burger-bun-dungeon.zip .
cd ..
```

### 3. Upload to Itch.io

1. Go to [itch.io/game/new](https://itch.io/game/new)
2. Fill in game details (title, description, etc.)
3. Under "Uploads", click "Upload files"
4. Upload `burger-bun-dungeon.zip`
5. Check "This file will be played in the browser" ✅
6. Set viewport size (recommended: 800x600 or Fullscreen)
7. Click "Save"

## Detailed Steps

### Pre-Deployment Checklist

Before building, verify:

- [ ] Game works in development (`npm run dev`)
- [ ] All scenes are accessible
- [ ] All ingredients can be collected
- [ ] Ending screen displays correctly
- [ ] All three layouts render properly
- [ ] No console errors in browser DevTools

### Build Process

The build process:

1. **TypeScript Compilation** - `tsc -b` checks types
2. **Vite Build** - Creates optimized production bundle
3. **Output** - Static files in `dist/` folder

**Build output:**
```
dist/
├── index.html              # Entry point
└── assets/
    ├── index-[hash].css    # Bundled styles
    └── index-[hash].js     # Bundled JavaScript (includes React)
```

### Build Verification

After building, test locally:

```bash
npm run preview
```

Open http://localhost:4173 and verify:
- Game loads without errors
- All layouts work
- Scene navigation works
- Ingredients can be collected
- Ending screen appears

**Check browser console** (F12) for any errors.

### Itch.io Configuration

#### Embed Settings

**Viewport Dimensions:**
- **Recommended:** 800x600 (fits most screens)
- **Alternative:** 1024x768 (more spacious)
- **Fullscreen:** Allows player to maximize

**Frame Options:**
- ✅ Automatically start on page load
- ✅ Enable fullscreen button
- ✅ Mobile friendly (game works on mobile)

**Advanced Options:**
- Orientation: Landscape (recommended) or Portrait
- Background: Choose a color that matches your game

#### Sample Itch.io Page Configuration

**Title:** Burger Bun Dungeon

**Short Description:**
```
A narrative adventure where you are a sentient burger bun exploring a strange house,
collecting ingredients to become something more.
```

**Description:**
```
# Burger Bun Dungeon

You are a burger bun. You are incomplete.

Explore a mysterious house and collect ingredients to discover what you will become.

## Features
- Branching narrative with multiple paths
- 7 collectible ingredients with unique interactions
- Dynamic synergy system - ingredients react to each other
- Multiple endings based on your choices
- 3 visual themes to choose from

## Controls
- Select choices from dropdown menu
- Click "Continue" to proceed
- Use the theme switcher to change visual styles
- Restart anytime to try different paths

## Credits
Made with React + TypeScript
```

**Genre Tags:**
- Interactive Fiction
- Adventure
- Puzzle
- Experimental

**Screenshots:**
Take screenshots of all 3 layouts to show visual variety.

### Common Issues & Solutions

#### Issue: Game doesn't load on itch.io

**Solutions:**
1. Verify `base: './'` is in vite.config.ts
2. Re-build: `npm run build`
3. Re-create zip from dist folder contents (not the dist folder itself)
4. Make sure you're zipping the **contents** of dist/, not the folder

#### Issue: White screen on itch.io

**Causes:**
- JavaScript error blocking execution
- Incorrect file paths

**Debug:**
1. Test locally with `npm run preview`
2. Check browser console on itch.io page (F12)
3. Verify all asset paths are relative

#### Issue: Assets not loading (404 errors)

**Solution:**
Ensure vite.config.ts has:
```typescript
export default defineConfig({
  base: './',  // This is critical
  // ...
})
```

#### Issue: Bundle too large

**Current size:** ~208kb JS (~65kb gzipped) - This is fine!

Itch.io limits:
- Free account: 1GB total storage
- Your game: ~0.2MB (plenty of room)

If you need to optimize further:
1. Remove unused code
2. Optimize images (if added)
3. Enable terser minification in vite.config.ts

### Testing on Itch.io

After uploading:

1. Set game to "Draft" or "Restricted" visibility
2. Get the secret link from itch.io
3. Test in multiple browsers:
   - Chrome
   - Firefox
   - Safari (if available)
4. Test on mobile devices
5. Check all game functionality

### Updating Your Game

To update an existing game:

1. Make changes to code
2. `npm run build`
3. Create new zip
4. Upload to itch.io (same page)
5. Check "This file will be played in the browser"
6. Delete old version or mark new as default
7. Save

**Note:** Players may see old version due to browser cache. They can hard refresh (Ctrl+Shift+R) to get the latest.

### Version Management

**Recommended approach:**
1. Add version to game (e.g., in a corner of UI)
2. Track versions in git commits
3. Use semantic versioning: v1.0.0, v1.1.0, etc.
4. Tag releases in git: `git tag v1.0.0`

### Advanced: Custom Domain

Itch.io allows custom domains:

1. Buy a domain (e.g., burgergame.com)
2. In itch.io dashboard → Settings → Custom domain
3. Configure DNS CNAME record
4. Your game will be at your domain

### Analytics

Itch.io provides built-in analytics:
- Views
- Downloads (N/A for browser games)
- Play time
- Ratings

Check your game's dashboard for insights.

### Monetization (Optional)

You can monetize browser games on itch.io:

**Options:**
1. **Pay What You Want** - Suggested price, can pay $0
2. **Minimum Price** - Set minimum ($1+)
3. **Name Your Own Price** - Open donations

**Setup:**
1. Go to game settings
2. Set pricing under "Pricing"
3. Choose payment option
4. Save

### SEO & Discoverability

**Tips to get more players:**

1. **Good screenshots** - Show all 3 layouts
2. **Clear description** - What is the game about?
3. **Accurate tags** - Help players find you
4. **Devlog** - Post updates on itch.io
5. **Community** - Engage in itch.io forums
6. **Social media** - Share on Twitter, Reddit, etc.

### Backup

Always keep backups:

1. **Code:** Use git (already have this)
2. **Published version:** Download your own zip from itch.io
3. **Save locally:** Keep a copy of each version

## Troubleshooting

### Build Fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### TypeScript Errors

```bash
# Check for errors
npm run build

# If needed, check specific files
npx tsc --noEmit
```

### Runtime Errors

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Fix errors in source code
4. Rebuild and test

## Performance Optimization

Current performance is good, but if needed:

### Enable Terser Minification

Update vite.config.ts:

```typescript
export default defineConfig({
  // ...existing config
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,    // Remove console.logs
        drop_debugger: true
      }
    }
  }
})
```

This will:
- Remove console.log statements
- Better compression
- Slightly smaller bundle

### Analyze Bundle Size

```bash
# Install analyzer
npm install -D rollup-plugin-visualizer

# Update vite.config.ts to include plugin
# Then build and open stats.html
```

## Resources

- [Itch.io Creator Documentation](https://itch.io/docs/creators)
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#building-for-production)

## Support

If you encounter issues:
1. Check browser console for errors
2. Test with `npm run preview` locally
3. Verify vite.config.ts settings
4. Re-create zip file
5. Contact itch.io support for platform issues
