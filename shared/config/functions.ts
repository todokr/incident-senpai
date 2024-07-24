import { z } from "npm:zod";
import { ModalElement, PostElement } from "../model/element.ts";

const CreateIncidentFunction = z.object({
  name: z.string(),
  action: z.literal("inc/createIncident"),
  modal: z.object({
    title: z.string(),
    elements: z.array(ModalElement),
      submit: z.object({
    label: z.string().optional(),
    }),
    cancel: z.object({
      label: z.string(),
    }).optional(),
  }),
  invoke: z.array(z.string()),
});
export type CreateIncidentFunction = z.infer<typeof CreateIncidentFunction>;

const SlackPostFunction = z.object({
  name: z.string(),
  action: z.literal("slack/post"),
  channelId: z.string(),
  elements: z.array(PostElement),
});
export type SlackPostFunction = z.infer<typeof SlackPostFunction>;

const DatastoreCreateIncidentFunction = z.object({
  name: z.string(),
  action: z.literal("datastore/createIncident"),
});

const Function = z.discriminatedUnion("action", [
  CreateIncidentFunction,
  SlackPostFunction,
  DatastoreCreateIncidentFunction,
]);
export type Function = z.infer<typeof Function>;

export const Functions = z.array(Function).refine((fns) => {
  const names = new Set<string>();
  for (const fn of fns) {
    if (names.has(fn.name)) {
      return false;
    }
    names.add(fn.name);
  }
  return true;
}, { message: "function names must be unique" })
  .refine((fns) => {
    const afterCreateIncidentInvokeNotFound = fns.flatMap((fn) => {
      const invokes = fn.action === "inc/createIncident" ? fn.invoke : [];
      return invokes
        .filter((invoke) => !fns.some((x) => x.name === invoke))
        .map((invoke) => ({ name: fn.name, invoke }));
    });
    return afterCreateIncidentInvokeNotFound.length === 0;
  }, {
    message: "Function specified in `invoke` of `inc/createIncident` not found",
  });
