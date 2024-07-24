import { z } from "npm:zod";

export const StdField = z.object({
  description: z.object({
    name: z.string(),
    placeholder: z.string().optional(),
  }),
  services: z.object({
    name: z.string(),
    items: z.array(z.object({
      code: z.string(),
      value: z.string()
    })),
  }),
  level: z.object({
    name: z.string(),
    items: z.array(z.object({
      code: z.string(),
      value: z.string()
    })),
  }),
});

export type StdField = z.infer<typeof StdField>;

const CustomEnumField = z.object({
  type: z.literal("enum"),
  name: z.string(),
  multiple: z.boolean(),
  items: z.array(z.object({
    code: z.string(),
    value: z.string()
  })),
})

export const CustomField = z.record(
  z.string(),
  z.discriminatedUnion("type", [CustomEnumField])
)

export type CustomField = z.infer<typeof CustomField>;
