import { EditorView } from "prosemirror-view";
import userPrompt from "./promptUser/prompt";

let customSize: string | null = null;

const applyFontSize = (size: string, view: EditorView | null) => {
  if (!view) return;

  const handleConfirm = (customSizeFromUser?: string) => {
    customSize = customSizeFromUser;
    return customSize;
  };

  if (size === "custom") {
    userPrompt((customSize: string) => handleConfirm(customSize));

    if (customSize) {
      let customSizeCheck = customSize.trim();
      customSizeCheck.toLowerCase();
      if (/^\d+px$/.test(customSizeCheck)) {
        size = customSizeCheck;
      } else {
        throw new Error(
          "Invalid custom font size format. Use '16px', '23px', etc."
        );
      }
    } else {
      throw new Error("Custom font size not provided.");
    }
  }

  const { state, dispatch } = view;
  const { from, to, empty } = state.selection;
  const markType = state.schema.marks.font_size;
  const mark = markType.create({ size });
  const tr = state.tr;

  if (empty) {
    tr.setStoredMarks([mark]);
  } else {
    tr.addMark(from, to, mark);
  }

  dispatch(tr);
  view.focus();
};

export default applyFontSize;
