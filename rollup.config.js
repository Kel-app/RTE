import postcss from "rollup-plugin-postcss";
import typescript from "rollup-plugin-typescript2";
import typescriptCompiler from "typescript";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.js",
      format: "cjs",
    },
    {
      file: "dist/index.mjs",
      format: "es",
    },
  ],
  plugins: [
    typescript({
      typescript: typescriptCompiler,
    }),
    postcss({
      modules: true,
      namedExports: true,
    }),
  ],
};
