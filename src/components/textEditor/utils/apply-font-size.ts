import { EditorView } from 'prosemirror-view';

const applyFontSize = (size: string, view: EditorView | null) => {
    if (!view) return;
    const { state, dispatch } = view;
    const mark = state.schema.marks.font_size.create({ size });
    dispatch(state.tr.addMark(state.selection.from, state.selection.to, mark));
    view.focus();
};

export default applyFontSize;