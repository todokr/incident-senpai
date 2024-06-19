import { expect, test } from "vitest";
import { loadConfig } from "./config";

test("load config", () => {
    const config = loadConfig("../layers/senpai-config.yaml.template");
    expect(config).toBeDefined();
});
