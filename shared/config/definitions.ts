import { z } from "npm:zod";

const Definition = z.object({
  name: z.string(),
  items: z.record(
    z.string(),
    z.object({
      label: z.string(),
    }).or(z.undefined()),
  ),
});
export const Definitions = z.record(z.string(), Definition.or(z.undefined()));
