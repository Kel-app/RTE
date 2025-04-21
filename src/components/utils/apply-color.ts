import { EditorView } from "prosemirror-view";

const applyColor = (color: string, view: EditorView | null) => {
    if (!view) return;
    const { state, dispatch } = view;
    const mark = state.schema.marks.text_color.create({ color });
    dispatch(state.tr.addMark(state.selection.from, state.selection.to, mark));
    view.focus();
};

export default applyColor;