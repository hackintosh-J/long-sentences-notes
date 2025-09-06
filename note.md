# How to Build a Vite + React Project for AI Studio and GitHub Pages

This note summarizes the "Hybrid Mode" architecture for creating a React + TypeScript project that works seamlessly in two different environments:

1.  **Live Preview Environments (like AI Studio):** Requires a "build-less" setup that works instantly in the browser without a build step.
2.  **Static Hosting (like GitHub Pages):** Requires a standard `npm run build` process to generate optimized, static files.

## Core Principle: The "Hybrid Mode" Architecture

The key is to make `index.html` a self-contained application for the live preview environment, while keeping the standard Vite build toolchain intact for production deployments.

---

### Step 1: Configure `index.html` (for the Live Preview Environment)

This is the most critical file. It must contain everything needed to run the app independently in a browser.

#### 1. Add the Tailwind Play CDN
Instead of processing a CSS file, we'll let the browser handle it.
```html
<!-- In <head> -->
<script src="https://cdn.tailwindcss.com"></script>
```

#### 2. Inline the Tailwind Configuration
Copy the `theme.extend` object from your `tailwind.config.js` into a script tag immediately after the CDN script.
```html
<!-- In <head> -->
<script>
  tailwind.config = {
    theme: {
      extend: {
        // ... your custom fonts, animations, colors, etc.
      },
    },
  }
</script>
```

#### 3. Create a Self-Contained Stylesheet Block
This is the magic that makes it work for both environments. Create a `<style>` block that is a complete and valid stylesheet for the build process.

-   **CRITICAL:** It **must** start with the three base `@tailwind` directives.
-   Include all your custom CSS, like `@layer` definitions and `@keyframes`.

```html
<!-- In <head> -->
<style type="text/tailwindcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer components {
    /* ... your custom component styles and animations ... */
    @keyframes soundwave {
      /* ... */
    }
    .speaking-icon::after {
      /* ... */
    }
  }
</style>
```

#### 4. Configure the Import Map
Use an `importmap` to tell the browser to fetch dependencies like React from a CDN, bypassing `node_modules` for the live preview.
```html
<!-- In <head> -->
<script type="importmap">
{
  "imports": {
    "react": "https://aistudiocdn.com/react@...",
    "react-dom/": "https://aistudiocdn.com/react-dom@.../",
    // ... other dependencies
  }
}
</script>
```

#### 5. Link the Main App Script
Load your `index.tsx` as a module.
```html
<!-- In <body> -->
<script type="module" src="/index.tsx"></script>
```

---

### Step 2: Configure Build Files (for GitHub Pages Deployment)

These files are ignored by the live preview but are essential for the `npm run build` command.

#### 1. `vite.config.ts`
-   Set the static `base` path to match your GitHub repository name (e.g., `base: '/long-sentences-notes/'`).
-   Keep your PostCSS plugin configuration (`tailwindcss`, `autoprefixer`) so the build process can compile the styles from `index.html`.

#### 2. `package.json` and `tailwind.config.js`
-   Maintain these files as you would in a standard Vite project. The build process relies on them to install dependencies and get the Tailwind configuration.

---

### Step 3: Clean Up Code to Avoid Conflicts

#### 1. Application Entry Point (`index.tsx`, `App.tsx`, etc.)
-   **DO NOT** import any `.css` files (e.g., `import './index.css'`). All styles are now handled by `index.html`.

#### 2. `index.css`
-   This file should be **empty**. It's kept to avoid breaking any import paths during the build process, but its contents are now in `index.html`.

---

### How It Works: The Two Modes

-   **In AI Studio (Live Preview):** The browser reads `index.html`. The CDN scripts for Tailwind and React execute. The inline `<style>` block is processed by the Tailwind CDN in real-time. The Vite server simply serves the files as-is.
-   **During `npm run build` (Deployment):** Vite reads `index.html` as the entry point. It **ignores** the CDN scripts and `importmap`. It finds the `<style type="text/tailwindcss">` block, recognizes it as a valid CSS entry point (because it contains the base directives), and processes it with PostCSS/Tailwind to generate an optimized, static CSS file for production.
