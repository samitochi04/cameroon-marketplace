# Step 1: Project Setup & Infrastructure

This document provides detailed instructions for setting up the foundation of our multi-vendor e-commerce platform. Following these steps will establish a solid development environment and project structure.

## Prerequisites

Ensure you have the following installed on your system:

- Node.js (v16 or newer)
- npm or yarn
- Git

## 1. Initialize Vite Project with React and TypeScript

```bash
# Create a new Vite project with React and TypeScript
npm create vite@latest cameroon-marketplace -- --template react-ts

# Navigate to the project directory
cd cameroon-marketplace

# Install dependencies
npm install
```

Verify that your project runs correctly:

```bash
npm run dev
```

Your browser should open to `http://localhost:5173` displaying the Vite + React starter template.

## 2. Configure Tailwind CSS Integration

Install Tailwind CSS and its dependencies:

```bash
npm install -D tailwindcss postcss autoprefixer
```

For Windows users or if you encounter issues with the initialization command, you can create the configuration files manually:

**Option 1: Create the files directly**

Create a `tailwind.config.js` file in your project root:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0E7D6D",
        secondary: "#FFC107",
        // Add Cameroon-inspired colors if desired
        cameroon: {
          green: "#007A5E",
          red: "#CE1126",
          yellow: "#FCD116",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
```

Create a `postcss.config.js` file in your project root:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Option 2: Use the full path to the binary (Windows)**

```bash
node ./node_modules/tailwindcss/lib/cli.js init -p
```

Create or update your `src/index.css` file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom base styles can go here */
```

## 3. Setup Project Folder Structure

Organize your project with a clear folder structure:

For Windows Command Prompt:

```bash
mkdir src\components src\pages src\layouts src\hooks src\utils src\services src\context src\assets src\locales src\constants
mkdir src\components\ui src\components\forms src\components\common src\components\vendors src\components\admin src\components\customer
mkdir server\controllers server\models server\routes server\middlewares server\utils server\services server\config
mkdir docs
```

For PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path src\components, src\pages, src\layouts, src\hooks, src\utils, src\services, src\context, src\assets, src\locales, src\constants
New-Item -ItemType Directory -Force -Path src\components\ui, src\components\forms, src\components\common, src\components\vendors, src\components\admin, src\components\customer
New-Item -ItemType Directory -Force -Path server\controllers, server\models, server\routes, server\middlewares, server\utils, server\services, server\config
New-Item -ItemType Directory -Force -Path docs
```

For Git Bash or similar Unix-like shells on Windows:

```bash
mkdir -p src/{components,pages,layouts,hooks,utils,services,context,assets,locales,constants}
mkdir -p src/components/{ui,forms,common,vendors,admin,customer}
mkdir -p server/{controllers,models,routes,middlewares,utils,services,config}
mkdir -p docs
```

Create a `.env` file in the root directory for environment variables:

```bash
touch .env .env.example
```

Add the following to `.env.example`:

```
# API URLs
VITE_API_URL=http://localhost:3000
VITE_API_VERSION=v1

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Kora Pay
VITE_KORA_PAY_PUBLIC_KEY=your_kora_public_key
```

## 4. Configure ESLint and Prettier for Code Quality

Install ESLint and Prettier:

```bash
npm install -D eslint prettier eslint-plugin-react-hooks eslint-plugin-react @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-prettier
```

Create `.eslintrc.js` file:

```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "react-hooks", "prettier"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "prettier/prettier": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
```

Create `.prettierrc` file:

```json
{
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "es5",
  "jsxBracketSameLine": false,
  "endOfLine": "auto"
}
```

Add scripts to `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
  "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,css,md}\""
}
```

## 5. Implement Git Workflow Strategy

Initialize Git if not already done:

```bash
git init
```

Create `.gitignore` file:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build
/dist

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

Create a `CONTRIBUTING.md` file with branching strategy:

```markdown
# Contributing Guide

## Branching Strategy

We follow the Git Flow workflow:

- `main`: Production code only, always deployable
- `develop`: Main development branch
- `feature/*`: For new features
- `bugfix/*`: For bug fixes
- `release/*`: For preparing releases
- `hotfix/*`: For critical production fixes

## Pull Request Process

1. Create your branch from `develop` (or `main` for hotfixes)
2. Follow the code style guidelines
3. Include tests where appropriate
4. Update documentation as needed
5. Ensure all tests pass before submitting PR
6. Request review from at least one team member
```

Create GitHub pull request and issue templates:

```bash
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p .github/PULL_REQUEST_TEMPLATE
```

Create `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md`:

```markdown
## Description

[Describe the changes you've made]

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?

[Describe your testing process]

## Checklist:

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
```

## 6. Setup Deployment Environments

Create configuration files for different environments:

```bash
touch .env.development .env.staging .env.production
```

Example for `.env.development`:

```
NODE_ENV=development
VITE_API_URL=http://localhost:3000
VITE_API_VERSION=v1
```

Example for `.env.staging`:

```
NODE_ENV=staging
VITE_API_URL=https://api-staging.your-domain.com
VITE_API_VERSION=v1
```

Example for `.env.production`:

```
NODE_ENV=production
VITE_API_URL=https://api.your-domain.com
VITE_API_VERSION=v1
```

Update `package.json` scripts for environment-specific builds:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  "build:staging": "tsc && vite build --mode staging",
  "build:prod": "tsc && vite build --mode production",
  "preview": "vite preview"
}
```

## 7. Configure CI/CD Pipeline

Create GitHub Actions workflow files:

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/ci.yml` for continuous integration:

```yaml
name: CI

on:
  push:
    branches: [develop, main]
  pull_request:
    branches: [develop, main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install Dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

    # Add test command when tests are set up
    # - name: Test
    #   run: npm test
```

Create `.github/workflows/deploy-staging.yml` for staging deployment:

```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install Dependencies
        run: npm ci

      - name: Build for Staging
        run: npm run build:staging

    # Add deployment steps for your chosen hosting platform
    # Example for Netlify:
    # - name: Deploy to Netlify
    #   uses: netlify/actions/cli@master
    #   with:
    #     args: deploy --dir=dist --prod
    #   env:
    #     NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
    #     NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

Create `.github/workflows/deploy-production.yml` for production deployment:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install Dependencies
        run: npm ci

      - name: Build for Production
        run: npm run build:prod

    # Add deployment steps for your chosen hosting platform
    # Example for Vercel:
    # - name: Deploy to Vercel
    #   uses: amondnet/vercel-action@v20
    #   with:
    #     vercel-token: ${{ secrets.VERCEL_TOKEN }}
    #     vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    #     vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    #     vercel-args: '--prod'
```

## 8. Additional Setup Tasks

### Install Essential Dependencies

```bash
# Install React Router for navigation
npm install react-router-dom

# Install Lucide for icons
npm install lucide-react

# Install React Hook Form for form handling
npm install react-hook-form

# Install i18n for localization
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector

# Install Supabase client
npm install @supabase/supabase-js
```

### Create Supabase Client Utility

Create `src/utils/supabase.js`:

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Setup Initial i18n Configuration

Create language files:

```bash
mkdir -p src/locales/en src/locales/fr
```

Create `src/locales/en/common.json`:

```json
{
  "welcome": "Welcome to Cameroon Marketplace",
  "tagline": "The best multi-vendor platform in Cameroon",
  "login": "Log In",
  "signup": "Sign Up",
  "search": "Search products..."
}
```

Create `src/locales/fr/common.json`:

```json
{
  "welcome": "Bienvenue sur Cameroon Marketplace",
  "tagline": "La meilleure plateforme multi-vendeurs au Cameroun",
  "login": "Se connecter",
  "signup": "S'inscrire",
  "search": "Rechercher des produits..."
}
```

Create `src/utils/i18n.js`:

```javascript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: import.meta.env.DEV,
    supportedLngs: ["en", "fr"],
    interpolation: {
      escapeValue: false, // not needed for React
    },
    backend: {
      loadPath: "/src/locales/{{lng}}/{{ns}}.json",
    },
  });

export default i18n;
```

## Conclusion

You have now completed the setup of your project infrastructure. The project has:

- A modern React + TypeScript foundation with Vite
- Tailwind CSS for styling
- A well-organized folder structure
- Code quality tools (ESLint and Prettier)
- Git workflow strategy and templates
- Multiple environment configurations
- CI/CD pipeline
- Essential dependencies installed

In the next step, we will focus on backend development with Express.js and Supabase integration.
