import React from "@moonlight-mod/wp/react";
import Moonbase from "@moonlight-mod/wp/moonbase_moonbase";
import type { CustomComponent } from "@moonlight-mod/types/coreExtensions/moonbase";

function SomeConfigComponent({ value, setValue }: CustomComponent) {
  // do react things
  return <h1>meow</h1>;
}

Moonbase.registerConfigComponent("colorful", "color", SomeConfigComponent);
