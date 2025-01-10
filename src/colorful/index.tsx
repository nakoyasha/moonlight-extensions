import type { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: /"User Settings",/g,
    replace: {
      match: /"User Settings",/g,
      replacement: '"hacked by colorful lol",'
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  colorfulSettings: {
    dependencies: [{ id: "react" }, { ext: "moonbase", id: "moonbase" }],
    entrypoint: true
  }
};
