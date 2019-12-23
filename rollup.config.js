import babel from "rollup-plugin-babel";
import { uglify } from "rollup-plugin-uglify";
import replace from "rollup-plugin-replace";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import json from "rollup-plugin-json";

process.env.NODE_ENV = "production";

const config = {
  input: "src/index.js",
  output: {
    name: "chubbajs",
    format: "cjs",
    file: "index.js"
  },
  // external: ["react", "react-dom"],
  plugins: [
    babel({
      exclude: "node_modules/**"
    }),
    resolve({
      jsnext: true
    }),
    json(),
    commonjs({
      include: [/src/, /node_modules/]
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    })
  ]
};

export default config;
