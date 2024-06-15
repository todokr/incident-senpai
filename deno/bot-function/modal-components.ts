type ModalComponent = Select | Radio | Check | TextInput | Description;

interface OptionItem {
  code: string;
  label: string;
}

/** Select box */
export interface Select {
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

/** Radio button */
export interface Radio {
  type: "radio";
  blockId: string;
  actionId: string;
  label: string;
  options: OptionItem[];
}
export function isRadio(
  component: ModalComponent,
): component is Radio {
  return component.type === "radio";
}

/** Check box */
export interface Check {
  type: "checkbox";
  blockId: string;
  actionId: string;
  label: string;
  options: OptionItem[];
}
export function isCheckbox(
  component: ModalComponent,
): component is Check {
  return component.type === "checkbox";
}

/** Text input */
export interface TextInput {
  type: "textInput";
  blockId: string;
  actionId: string;
  label: string;
  placeholder: string;
  optional: boolean;
  multiline: boolean;
}
export function isTextInput(
  component: ModalComponent,
): component is TextInput {
  return component.type === "textInput";
}

/* Description */
export interface Description {
  type: "description";
  text: string;
}
export function isDescription(
  component: ModalComponent,
): component is Description {
  return component.type === "description";
}

export interface Modal {
  title: string;
  triggerId: string;
  callbackId: string;
  submit: { label: string };
  cancel: { label: string };
  components: ModalComponent[];
}
