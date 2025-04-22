# Kel RTE

## Known Issues

None at the moment.

## Getting Started

This is the NPM package for Kel's rich text editor (RTE).

Requires: React 19 or higher, tailwindcss 4.1 or higher.

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

## Usage

```tsx
"use client";

import { RTE } from "@kel-app/rte";

const App = () => {
  return <RTE />;
};
```

## Contributing

Contributions are welcome!

You can find the github repo [here](https://github.com/Kel-app/RTE).
