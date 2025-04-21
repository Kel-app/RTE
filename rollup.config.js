import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import typescriptCompiler from "typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.min.js",
      format: "esm",
      plugins: [terser()],
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      typescript: typescriptCompiler,
      sourceMap: true,
    }),
    postcss({
      extract: true,
      minimize: true,
      sourceMap: false,
    }),
  ],
};
