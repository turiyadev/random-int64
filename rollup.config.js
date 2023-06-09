import dts from "rollup-plugin-dts"
import esbuild from "rollup-plugin-esbuild"

export default [
  {
    input: "src/RandomInt64.ts",
    plugins: [esbuild()],
    output: [
      {
        file: "dist/random-int64.mjs",
        format: "esm",
        sourcemap: true
      },
      {
        file: "dist/random-int64.cjs",
        format: "cjs",
        sourcemap: true
      }
    ]
  },
  {
    plugins: [dts()],
    input: "src/RandomInt64.ts",
    output: {
      file: "dist/random-int64.d.ts",
      format: "esm"
    }
  }
];
