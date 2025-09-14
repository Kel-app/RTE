require("@testing-library/jest-dom");

// Mock next-themes
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }) => children,
}));

// Mock canvas for whiteboard tests
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  createImageData: jest.fn(),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}));

HTMLCanvasElement.prototype.toDataURL = jest.fn(
  () => "data:image/png;base64,test"
);

// Mock FileReader for file upload tests
global.FileReader = class {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.result = null;
  }

  readAsText(file) {
    setTimeout(() => {
      this.result = "test content";
      if (this.onload) this.onload({ target: { result: this.result } });
    }, 0);
  }

  readAsDataURL(file) {
    setTimeout(() => {
      this.result = "data:image/png;base64,test";
      if (this.onload) this.onload({ target: { result: this.result } });
    }, 0);
  }
};

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve("test")),
  },
});

// Mock alert
global.alert = jest.fn();
