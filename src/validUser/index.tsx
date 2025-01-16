import type { ExtensionWebExports } from "@moonlight-mod/types";

// https://moonlight-mod.github.io/ext-dev/webpack/#patching
export const patches: ExtensionWebExports["patches"] = [
  {
    find: 'className:"mention"',
    replace: {
      // mention = { react: function (data, parse, props) { if (data.userId == null) return RoleMention() else return UserMention()
      match:
        /react(?=\(\i,\i,\i\).{0,100}return null==.{0,70}\?\(0,\i\.jsx\)\((\i\.\i),.+?jsx\)\((\i\.\i),\{className:"mention")/,
      // react: (...args) => OurWrapper(RoleMention, UserMention, ...args), originalReact: theirFunc
      replacement: 'react:(...args)=>{return require("validUser_mentions").default},originalReact'
    }
  },
  {
    find: "unknownUserMentionPlaceholder:",
    replace: {
      match: /unknownUserMentionPlaceholder:/,
      replacement: "$&false&&"
    }
  }
];

// https://moonlight-mod.github.io/ext-dev/webpack/#webpack-module-insertion
export const webpackModules: ExtensionWebExports["webpackModules"] = {
  mentions: {
    dependencies: [
      { id: "react" },
      { id: "discord/dispatcher" },
      { id: "discord/constants" },
      { ext: "moonbase", id: "moonbase" }
    ]
  }
};
