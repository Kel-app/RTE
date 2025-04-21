# Kel RTE

## Known Issues

- The styles don't seem to be working properly.

## Getting Started

This is the NPM package for Kel's rich text editor (RTE).

There isn't much involved setup, just install the package and import it into your project.

> Note: I currently haven't gotten the styles to work properly, so you'll have to screw with it a bit. It might just be a next.js issue, but I'm not sure.

```bash
npm install @kel-app/rte
```

```tsx
"use client";

import { RTE } from "@kel-app/rte";

const App = () => {
  return <RTE />;
};
```

## Contributing

Contributions are welcome!
