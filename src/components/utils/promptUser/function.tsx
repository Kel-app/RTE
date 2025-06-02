import { createRoot } from "react-dom/client";
import React from "react";
import UserPrompt from "./prompt";

export default function promptForCustomSize(): Promise<string> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const root = createRoot(container);

    const handleConfirm = (size: string) => {
      root.unmount();
      document.body.removeChild(container);
      resolve(size);
    };

    root.render(<UserPrompt onConfirm={handleConfirm} />);
  });
}
