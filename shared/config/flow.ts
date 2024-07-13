import { z } from "npm:zod";
import { Functions } from "./functions.ts";

const Trigger = z.object({
  type: z.literal("slack/command"),
  invoke: z.string(),
});
export type Trigger = z.infer<typeof Trigger>;

export const Flow = z.object({
  trigger: Trigger,
  functions: Functions,
}).refine((flow) => {
  const fnNames = flow.functions.map((fn) => fn.name);
  return fnNames.includes(flow.trigger.invoke);
}, { message: 'Function specified in "flow.trigger.invoke" not found' });
