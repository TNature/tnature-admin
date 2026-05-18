# Amigos Web App - Project Rules and Architecture

## 1. Tech Stack

- **Framework**: Next.js (Pages Router) v13
- **Library**: React v18
- **Styling**: SCSS/SASS combined with Bootstrap 5 and React-Bootstrap
- **State Management**: React Context (`AppContext.js`)
- **Animation**: AOS (Animate on Scroll)
- **Routing Progress**: NProgress
- **Fonts**: Next.js Google Fonts (`Manrope`, `Oxanium`)

## 2. Folder Structure

The app resides primarily within the `src` directory with a standard modular hierarchy:

```
src/
├── components/          # Reusable UI components
│   ├── common/          # Modals, generic sections, section headings, logos
│   ├── layout/          # Page layouts (Header, Footer, Layout wrapper)
│   ├── screens/         # Complex screen components, primarily for specific pages like Home
│   └── ui/              # Granular UI elements (Buttons, Loading Screen, Custom Container)
├── constants/           # Hardcoded app data, services, tour information, and constants
│   ├── constants.js
├── context/             # Global State
│   └── AppContext.js
├── pages/               # Next.js Pages Route system
│   ├── _app.jsx         # Custom App component handling global styles & plugins (AOS, NProgress)
│   ├── _document.js     # Custom document setup
│   ├── index.js         # Entry point (Home Page)
│   └── api/             # API routes
└── styles/              # Global Styles and Design System
    ├── fonts.js         # Font definitions using `next/font/google`
    ├── globals.scss     # Global style rules, Bootstrap import, default resets
    └── scss/            # Modular SCSS rules
        ├── _variables.scss     # Design Tokens, Colors
        ├── _mixins.scss        # SCSS logic modifiers (flexCenter, defaultBox)
        └── _media_queries.scss # Responsive rules
```

## 3. Design System & Styling Rules

### Colors & Variables (`src/styles/scss/_variables.scss`)

### Typography (`src/styles/fonts.js`)

- **Primary Font**: `Manrope`
- **Secondary Pattern**: `Oxanium`

### Layout & Mixins (`src/styles/scss/_mixins.scss`)

- Custom utilities exist for structural alignment such as `@mixin flexCenter`.
- Shared layout classes for card-like models using the `@mixin defaultBox` (white backgrounds, subtle borders, shadow `0 4px 25px 0 rgba(168, 180, 208, 0.1)`).
- Max-width structure is constrained avoiding horizontal scrollbars via `section { max-width: 100vw; overflow: hidden; }` in `globals.scss`.

### Components

- **Animations**: AOS must be used for scroll-into-view interactions.
- **BootStrap**: Bootstrap Grid system and components are permissible alongside custom SCSS classes.
- **Custom UI**: Stick to the `ui` folder (e.g. `CustomButton`, `CustomContainer`) to maintain styling continuity when inserting generic elements.

## 4. Development Best Practices

- **Styling**: Favor component-scoped CSS Modules (e.g., `layout.module.scss`) for specific components but reference global variables inside them.
- **Assets**: Keep static assets within the `public/` directory.
- **Routing Loading State**: Keep `LoadingScreen` logic robust to avoid flash-of-unstyled-content during route swapping inside `_app.jsx`. NProgress handles the navigation loading indicator.
- **Data Fetching/Holding**: Keep heavy datasets (e.g., specific tours, services logic) strictly contained within `constants/` or queried globally using `context/` rather than jamming them within UI components.
