import { z } from "npm:zod";

export const StdField = z.object({
  description: z.object({
    name: z.string(),
    placeholder: z.string().optional(),
  }),
  status: z.object({
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

const SingleSelectField = z.object({
  type: z.literal("singleSelect"),
  name: z.string(),
  items: z.array(z.object({
    code: z.string(),
    value: z.string()
  })),
});

const MultiSelectField = z.object({
  type: z.literal("multiSelect"),
  name: z.string(),
  items: z.array(z.object({
    code: z.string(),
    value: z.string()
  })),
});

export const CustomField = z.record(
  z.string(),
  z.discriminatedUnion("type", [SingleSelectField, MultiSelectField])
)

export type CustomField = z.infer<typeof CustomField>;
