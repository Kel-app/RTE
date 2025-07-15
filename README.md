# Kel RTE

# Warning

**This project has been shelved temporarily, while I work on the main project. If you would like to contribute, open a PR. There will be no new changes from me for a while**

## Known Issues

## Getting Started

This is the NPM package for Kel's rich text editor (RTE).

Requires: React 19 or higher, tailwindcss 4.1 or higher, and next.js. (more frameworks coming soon)

```bash
npm install @kel-app/rte
```

> Note: If your using next.js, you need to use the `use client` directive, you also need to add the styles found at `@kel-app/rte/dist/index.css` to your `layout.tsx` file if your using app router. For pages you would put it in the `_app.tsx` file.

## Seting up styles

You can import the styles found at `@kel-app/rte/dist/index.css` into your `layout.tsx` file if your using app router.

```tsx
import "@kel-app/rte/dist/index.css";
```

Pages Router for Next.js:

```tsx
import "@kel-app/rte/dist/index.css";
```

## Setting up themes

To implement proper theming for the component. You will need to use next themes. (You can also implement your own theme provider).

> Note: While you can import the theme provider from the `next-themes` package directly, it is recommended to make your own component to wrap the theme provider to prevent hydration issues.

## Usage

> Waring: For all new versions from 0.1.0-alpha.3.2, the component now has a prop called `themeSwitch` which is a boolean. It is MANDATORY to set this prop manually, as it is required for the component to work properly.

### As a standalone component

```tsx
"use client";

import { RTE } from "@kel-app/rte";

const App = () => {
  return <RTE themeSwitch={true} />;
};
```

### As a component integrated into a page with an already existing theme toggle or header:

```tsx
"use client";

import { RTE } from "@kel-app/rte";

const App = () => {
  return <RTE themeSwitch={false} />;
};
```

## Contributing

Contributions are welcome!

You can find the github repo [here](https://github.com/Kel-app/RTE).
