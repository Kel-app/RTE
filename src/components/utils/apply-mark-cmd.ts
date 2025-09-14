import { EditorView } from "prosemirror-view";
import { toggleMark } from "prosemirror-commands";

const applyMarkCmd = (
  mark: "strong" | "em" | "underline",
  view: EditorView | null
) => {
  if (!view) return;
  toggleMark(view.state.schema.marks[mark])(view.state, view.dispatch);
  view.focus();
};

export default applyMarkCmd;
