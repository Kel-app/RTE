import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import typescriptCompiler from "typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "esm",
  },
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      typescript: typescriptCompiler,
      sourceMap: true,
    }),
    postcss({
      extract: true,
      minimize: true,
      sourceMap: true,
    }),
  ],
};
