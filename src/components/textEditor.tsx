import React, { useEffect, useRef, useState } from "react";

// ProseMirror imports
import { EditorState } from "prosemirror-state";
import { Schema } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { history, undo, redo } from "prosemirror-history";

// 3rd party imports
import { placeholder } from "@dear-rama/prosemirror-placeholder";
import { useTheme } from "next-themes";

// Custom imports
import { fontSizeMark, textColorMark, fontFamilyMark } from "./utils/text-style";
import applyColor from "./utils/apply-color";
import applyFontSize from "./utils/apply-font-size";
// import applyFontFace from "./utils/apply-font-face"; (Not implemented. Check font_switching branch)
import applyMarkCmd from "./utils/apply-mark-cmd";
import switchTheme from "./utils/switch-theme";

// Styles
import "prosemirror-view/style/prosemirror.css";
import "../index.css";

// Components
import { Switch } from "./ui/switch";
import { Moon, Bold, Italic } from "lucide-react";
import { Toggle } from "./ui/toggle";


export default function RichTextEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<EditorView | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [defaultColor, setDefaultColor] = useState("#000000");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!editorRef.current) return;

    setTimeout(() => {
      const el = document.querySelector(".empty-node");

      if (el) {
        const style = getComputedStyle(el);
        const color = style.color;

        const rgbRegex = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
        const match = color.match(rgbRegex);

        if (match) {
          const [_, r, g, b] = match;
          console.log(`Red: ${r}, Green: ${g}, Blue: ${b}`);

          if (r === "0" && g === "0" && b === "0") {
            setDefaultColor("#000000");
          } else if (r === "255" && g === "255" && b === "255") {
            setDefaultColor("#FFFFFF");
          }
        }
      } else {
        console.error("Element with class 'empty-node' not found.");
      }
    }, 50);

    const defaultSchema = new Schema({
      nodes: addListNodes(basicSchema.spec.nodes, "paragraph block*", "block"),
      marks: basicSchema.spec.marks.append({
        font_size: fontSizeMark,
        font_family: fontFamilyMark,
        text_color: textColorMark,
      }),
    });

    const state = EditorState.create({
      schema: defaultSchema,
      plugins: [
        placeholder(),
        history(),
        keymap({ "Mod-z": undo, "Mod-y": redo }),
        keymap(baseKeymap),
      ],
    });

    const editorView = new EditorView(editorRef.current, {
      state,
      handleDOMEvents: {
        focus: () => {
          setIsFocused(true);
          return false;
        },
        blur: () => {
          setIsFocused(false);
          return false;
        },
        beforeinput: (view, event) => {
          const ie = event as InputEvent;
          if (ie.inputType === "historyUndo") {
            undo(view.state, view.dispatch);
            event.preventDefault();
            return true;
          }
          if (ie.inputType === "historyRedo") {
            redo(view.state, view.dispatch);
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
    });

    setView(editorView);
    return () => editorView.destroy();
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-white text-black dark:bg-black dark:text-white">
      <div className="fixed top-4 right-4 w-20 h-20">
        <Switch
          id="theme-switch"
          onCheckedChange={(checked) =>
            switchTheme(theme, setTheme, setDefaultColor)
          }
        >
          <Moon />
        </Switch>
      </div>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-black px-6 py-3 shadow-lg rounded-full flex items-center gap-3 z-50">
        <select
          onChange={(e) => applyFontSize(e.target.value, view)}
          defaultValue="16px"
          className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-black"
        >
          <option value="custom">specific</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="24px">24px</option>
          <option value="32px">32px</option>
        </select>

        <input
          type="color"
          defaultValue={defaultColor}
          onChange={(e) => applyColor(e.target.value, view)}
          className="w-8 h-8 p-0 border-none cursor-pointer"
        />

        <Toggle
          onClick={() => applyMarkCmd("strong", view)}
          className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer"
        >
          <Bold />
        </Toggle>
        <Toggle
          onClick={() => applyMarkCmd("em", view)}
          className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer"
        >
          <Italic />
        </Toggle>
        <button
          onClick={() => view && undo(view.state, view.dispatch)}
          className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer"
        >
          Undo
        </button>
        <button
          onClick={() => view && redo(view.state, view.dispatch)}
          className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-black cursor-pointer"
        >
          Redo
        </button>
      </div>

      <div
        ref={editorRef}
        className="flex-1 overflow-y-auto p-8 mx-12 mt-12 mb-32 rounded-lg shadow-lg bg-white text-black dark:bg-black dark:text-white active:outline-none focus:outline-none active:border-none focus:border-none"
      />
    </div>
  );
}
