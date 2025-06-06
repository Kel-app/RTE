import { EditorView } from "prosemirror-view";

async function applyFontFace(font: string, view: EditorView | null) {
  if (!view) return;

  const { state, dispatch } = view;
  const { from, to, empty } = state.selection;
  const markType = state.schema.marks.font_face;
  const mark = markType.create({ font });
  const tr = state.tr;

  if (empty) {
    tr.setStoredMarks([mark]);
  } else {
    tr.addMark(from, to, mark);
  }

  dispatch(tr);
  view.focus()
}

export default applyFontFace;
