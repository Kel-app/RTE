import { EditorView } from "prosemirror-view";
import { EditorState, Transaction } from "prosemirror-state";
import { DOMParser } from "prosemirror-model";

// Simple markdown-to-HTML conversion
function markdownToHtml(markdown: string): string {
  return (
    markdown
      // Headers
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      // Bold
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
      .replace(/\_\_(.*\_\_)/gim, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*)\*/gim, "<em>$1</em>")
      .replace(/\_(.*)\_/gim, "<em>$1</em>")
      // Underline (not standard markdown but useful)
      .replace(/\<u\>(.*)\<\/u\>/gim, "<u>$1</u>")
      // Code
      .replace(/\`(.*)\`/gim, "<code>$1</code>")
      // Line breaks
      .replace(/\n/gim, "<br>")
  );
}

// Simple HTML-to-markdown conversion
function htmlToMarkdown(html: string): string {
  return (
    html
      // Headers
      .replace(/<h1>(.*?)<\/h1>/gim, "# $1\n")
      .replace(/<h2>(.*?)<\/h2>/gim, "## $1\n")
      .replace(/<h3>(.*?)<\/h3>/gim, "### $1\n")
      // Bold
      .replace(/<strong>(.*?)<\/strong>/gim, "**$1**")
      .replace(/<b>(.*?)<\/b>/gim, "**$1**")
      // Italic
      .replace(/<em>(.*?)<\/em>/gim, "*$1*")
      .replace(/<i>(.*?)<\/i>/gim, "*$1*")
      // Underline
      .replace(/<u>(.*?)<\/u>/gim, "<u>$1</u>")
      // Code
      .replace(/<code>(.*?)<\/code>/gim, "`$1`")
      // Line breaks
      .replace(/<br\s*\/?>/gim, "\n")
      // Remove other HTML tags
      .replace(/<[^>]*>/gim, "")
  );
}

// Import markdown content
export function importMarkdown(markdown: string, view: EditorView): void {
  if (!view) return;

  const html = markdownToHtml(markdown);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const doc = DOMParser.fromSchema(view.state.schema).parse(tempDiv);
  const tr = view.state.tr.replaceWith(
    0,
    view.state.doc.content.size,
    doc.content
  );
  view.dispatch(tr);
  view.focus();
}

// Export current content as markdown
export function exportMarkdown(view: EditorView): string {
  if (!view) return "";

  const tempDiv = document.createElement("div");
  tempDiv.appendChild(view.dom.cloneNode(true));
  const html = tempDiv.innerHTML;

  return htmlToMarkdown(html);
}

// Auto-convert markdown syntax as user types
export function setupMarkdownAutoConvert(view: EditorView): void {
  if (!view) return;

  const handleInput = (transaction: Transaction) => {
    const { doc, selection } = transaction;
    const { from, to } = selection;

    if (from !== to) return; // Only handle cursor position changes

    const text = doc.textBetween(Math.max(0, from - 20), from, " ");

    // Auto-convert patterns
    const patterns = [
      { regex: /(\*\*)(.*?)(\*\*)/, replacement: "<strong>$2</strong>" },
      { regex: /(\*)(.*?)(\*)/, replacement: "<em>$2</em>" },
      { regex: /(`)(.*?)(`)/, replacement: "<code>$2</code>" },
      { regex: /(^|\s)(#{1,3})\s(.*)/, replacement: "$1<h$2>$3</h$2>" },
    ];

    // This is a basic implementation - in a real app you'd want more sophisticated parsing
    // For now, we'll keep it simple to avoid breaking the editor
  };

  // Note: This would need to be properly integrated with ProseMirror's plugin system
  // For now, it's a placeholder for the functionality
}

export default {
  importMarkdown,
  exportMarkdown,
  setupMarkdownAutoConvert,
  markdownToHtml,
  htmlToMarkdown,
};
