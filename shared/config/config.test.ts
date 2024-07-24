import { Config } from "./config.ts";
import { assert } from "jsr:@std/assert";

Deno.test("load config", async () => {
  const loaded = await Config.load("./layers/config.yaml");
  console.log(JSON.stringify(loaded, null, 2));
  assert(loaded);
})
