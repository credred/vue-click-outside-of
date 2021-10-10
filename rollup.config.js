import typescript from "rollup-plugin-typescript2";
import packageJSON from "./package.json";
import del from "rollup-plugin-delete";

/** @type {import("rollup").RollupOptions} */
const config = {
  input: "./src/index.ts",
  external: ["vue"],
  output: [
    {
      name: packageJSON.name,
      file: "dist/vue-click-outside-of.umd.js",
      format: "umd",
      exports: "named",
      sourcemap: false,
      globals: {
        vue: "Vue",
      },
    },
    {
      name: packageJSON.name,
      file: "dist/vue-click-outside-of.es.js",
      format: "es",
      sourcemap: false,
    },
  ],
  plugins: [
    typescript({
      tsconfigOverride: {
        exclude: ["__tests__"],
      },
    }),
    del({ targets: "dist/*" }),
  ],
};

export default config;
