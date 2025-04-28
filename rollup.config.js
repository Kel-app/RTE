import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import typescriptCompiler from "typescript";
import terser from "@rollup/plugin-terser";
import cssnanoPlugin from "cssnano";

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
      plugins: [cssnanoPlugin()],
      extract: true,
      minimize: true,
      sourceMap: false,
    }),
  ],
};
