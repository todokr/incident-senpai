import {
  type Modal,
  type ModalComponent,
} from "./bot-function/modal-components.ts";
import {
  type AnyModalBlock,
  type ViewsOpenAppPlatformRequest,
} from "https://deno.land/x/slack_web_api_client@0.11.0/mod.ts";

export function toRequest(modal: Modal): ViewsOpenAppPlatformRequest {
  return {
    trigger_id: modal.triggerId,
    view: {
      type: "modal",
      title: { type: "plain_text", text: modal.title, emoji: true },
      blocks: [],
      close: modal.cancel
        ? { type: "plain_text", text: modal.cancel.label }
        : undefined,
      submit: modal.submit
        ? { type: "plain_text", text: modal.submit.label }
        : undefined,
      private_metadata: undefined,
      callback_id: modal.callbackId,
      clear_on_close: false,
      notify_on_close: true,
      external_id: undefined,
    },
  };
}

function toBlock(component: ModalComponent): AnyModalBlock {
}
