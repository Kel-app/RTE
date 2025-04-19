import { MarkSpec } from "prosemirror-model";

// defines font size
export const fontSizeMark: MarkSpec = {
    attrs: { size: { default: "16px" } },
    parseDOM: [
      {
        style: "font-size",
        getAttrs: (value) => ({ size: value }),
      },
    ],
    toDOM: (node) => ["span", { style: `font-size: ${node.attrs.size}` }, 0],
};

// defines text color
export const textColorMark: MarkSpec = {
    attrs: { color: { default: "#000000" } },
    parseDOM: [
      {
        style: "color",
        getAttrs: (value) => ({ color: value }),
      },
    ],
    toDOM: (node) => ["span", { style: `color: ${node.attrs.color}` }, 0],
};