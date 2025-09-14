import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  setFontSize,
  setTextColor,
} from "../src/components/utils/textFormatting";

// Mock EditorView for testing
const createMockEditorView = () => ({
  state: {
    tr: {
      addMark: jest.fn().mockReturnThis(),
      removeMark: jest.fn().mockReturnThis(),
      scrollIntoView: jest.fn().mockReturnThis(),
    },
    selection: {
      from: 0,
      to: 10,
      empty: false,
    },
    schema: {
      marks: {
        strong: { create: jest.fn() },
        em: { create: jest.fn() },
        underline: { create: jest.fn() },
      },
    },
  },
  dispatch: jest.fn(),
});

describe("Text Formatting Utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("toggleBold", () => {
    it("applies bold formatting to selected text", () => {
      const mockView = createMockEditorView();

      toggleBold(mockView as any);

      expect(mockView.dispatch).toHaveBeenCalled();
    });

    it("handles empty selection gracefully", () => {
      const mockView = createMockEditorView();
      mockView.state.selection.empty = true;

      expect(() => {
        toggleBold(mockView as any);
      }).not.toThrow();
    });
  });

  describe("toggleItalic", () => {
    it("applies italic formatting to selected text", () => {
      const mockView = createMockEditorView();

      toggleItalic(mockView as any);

      expect(mockView.dispatch).toHaveBeenCalled();
    });

    it("handles empty selection gracefully", () => {
      const mockView = createMockEditorView();
      mockView.state.selection.empty = true;

      expect(() => {
        toggleItalic(mockView as any);
      }).not.toThrow();
    });
  });

  describe("toggleUnderline", () => {
    it("applies underline formatting to selected text", () => {
      const mockView = createMockEditorView();

      toggleUnderline(mockView as any);

      expect(mockView.dispatch).toHaveBeenCalled();
    });

    it("handles empty selection gracefully", () => {
      const mockView = createMockEditorView();
      mockView.state.selection.empty = true;

      expect(() => {
        toggleUnderline(mockView as any);
      }).not.toThrow();
    });
  });

  describe("setFontSize", () => {
    it("applies font size to selected text", () => {
      const mockView = createMockEditorView();
      const fontSize = "18px";

      setFontSize(mockView as any, fontSize);

      expect(mockView.dispatch).toHaveBeenCalled();
    });

    it("handles different font size values", () => {
      const mockView = createMockEditorView();
      const fontSizes = ["12px", "16px", "24px", "32px"];

      fontSizes.forEach((size) => {
        expect(() => {
          setFontSize(mockView as any, size);
        }).not.toThrow();
      });
    });

    it("handles empty selection gracefully", () => {
      const mockView = createMockEditorView();
      mockView.state.selection.empty = true;

      expect(() => {
        setFontSize(mockView as any, "16px");
      }).not.toThrow();
    });
  });

  describe("setTextColor", () => {
    it("applies text color to selected text", () => {
      const mockView = createMockEditorView();
      const color = "#ff0000";

      setTextColor(mockView as any, color);

      expect(mockView.dispatch).toHaveBeenCalled();
    });

    it("handles different color formats", () => {
      const mockView = createMockEditorView();
      const colors = [
        "#ff0000",
        "red",
        "rgb(255, 0, 0)",
        "rgba(255, 0, 0, 0.5)",
      ];

      colors.forEach((color) => {
        expect(() => {
          setTextColor(mockView as any, color);
        }).not.toThrow();
      });
    });

    it("handles empty selection gracefully", () => {
      const mockView = createMockEditorView();
      mockView.state.selection.empty = true;

      expect(() => {
        setTextColor(mockView as any, "#000000");
      }).not.toThrow();
    });
  });

  describe("Edge cases", () => {
    it("handles null or undefined view gracefully", () => {
      expect(() => {
        toggleBold(null as any);
      }).not.toThrow();

      expect(() => {
        toggleItalic(undefined as any);
      }).not.toThrow();
    });

    it("handles malformed selection", () => {
      const mockView = createMockEditorView();
      mockView.state.selection.from = 10;
      mockView.state.selection.to = 5; // Invalid: to < from

      expect(() => {
        toggleBold(mockView as any);
      }).not.toThrow();
    });

    it("handles missing schema marks", () => {
      const mockView = createMockEditorView();
      mockView.state.schema.marks = {}; // No marks available

      expect(() => {
        toggleBold(mockView as any);
      }).not.toThrow();
    });
  });
});
