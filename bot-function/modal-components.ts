type ModalComponentType = "optionItem" | "select" | "description" | "input";

export interface ModalComponent {
  type: ModalComponentType;
}
export const ModalComponent = {
  optionitem: (code: string, label: string): OptionItem => ({
    type: "optionItem",
    code,
    label,
  }),
  select: (
    blockId: string,
    actionId: string,
    label: string,
    options: OptionItem[],
  ): Select => ({
    type: "select",
    blockId,
    actionId,
    label,
    options,
  }),
  description: (text: string): Description => ({
    type: "description",
    text,
  }),
  input: (
    blockId: string,
    actionId: string,
    label: string,
    placeHolder: string,
    optional: boolean,
    multiLine: boolean,
  ): TextInput => ({
    type: "input",
    blockId,
    actionId,
    label,
    placeHolder,
    optional,
    multiLine,
  }),
};

export interface OptionItem extends ModalComponent {
  type: "optionItem";
  code: string;
  label: string;
}
export function isOptionItem(
  component: ModalComponent,
): component is OptionItem {
  return component.type === "optionItem";
}

export interface Select extends ModalComponent {
  type: "select";
  blockId: string;
  actionId: string;
  label: string;
  options: OptionItem[];
}
export function isSelect(
  component: ModalComponent,
): component is Select {
  return component.type === "select";
}

export interface Description extends ModalComponent {
  type: "description";
  text: string;
}
export function isDescription(
  component: ModalComponent,
): component is Description {
  return component.type === "description";
}

export interface TextInput extends ModalComponent {
  type: "input";
  blockId: string;
  actionId: string;
  label: string;
  placeHolder: string;
  optional: boolean;
  multiLine: boolean;
}
export function isTextInput(
  component: ModalComponent,
): component is TextInput {
  return component.type === "input";
}

export interface Modal {
  title: string;
  triggerId: string;
  callbackId: string;
  submit: { label: string };
  cancel: { label: string };
  blocks: ModalComponent[];
}
