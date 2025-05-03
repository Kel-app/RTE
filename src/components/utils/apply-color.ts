import { EditorView } from "prosemirror-view";

const applyColor = (color: string, view: EditorView | null) => {
  if (!view) return;

  const { state, dispatch } = view;
  const { from, to, empty } = state.selection;
  const markType = state.schema.marks.text_color;
  const mark = markType.create({ color });

  const tr = state.tr;

  if (empty) {
    const newStoredMarks = (
      state.storedMarks || state.selection.$from.marks()
    ).filter((m) => m.type !== markType);
    newStoredMarks.push(mark);
    tr.setStoredMarks(newStoredMarks);
  } else {
    tr.removeMark(from, to, markType);
    tr.addMark(from, to, mark);
  }

  dispatch(tr);
  view.focus();
};

export default applyColor;
