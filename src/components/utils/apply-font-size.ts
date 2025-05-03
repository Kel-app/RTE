import { EditorView } from "prosemirror-view";

const applyFontSize = (size: string, view: EditorView | null) => {
  if (!view) return;

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
