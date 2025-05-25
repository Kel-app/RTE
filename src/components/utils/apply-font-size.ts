import { EditorView } from "prosemirror-view";
import promptForCustomSize from "./promptUser/function";

async function applyFontSize(size: string, view: EditorView | null) {
  if (!view) return;

  if (size === "custom") {
    try {
      const customSize = await promptForCustomSize();
      let customSizeCheck = customSize.trim().toLowerCase();

      if (/^\d+px$/.test(customSizeCheck)) {
        size = customSizeCheck;
      } else {
        throw new Error(
          "Invalid custom font size format. Use '16px', '23px', etc."
        );
      }
    } catch (error) {
      console.error(error);
      return;
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
}

export default applyFontSize;
