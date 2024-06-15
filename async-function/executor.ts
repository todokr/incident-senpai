import { BlockButtonAction } from "@slack/bolt/dist/types/actions";
import { ReactionAddedEvent } from "@slack/bolt/dist/types/events";
import { ViewSubmitAction } from "@slack/bolt/dist/types/view";
import { WebClient } from "@slack/web-api";
import { addHours, format } from "date-fns";
import { ShowFlow } from "./app";
import { IncidentResponseConfig, resolvePolicy } from "./config";
import { Event, EventStore, EventType } from "./eventstore";
import {
  assignMessage,
  baseChannelAssignMessage,
  baseChannelContainmentDecralationMessage,
  baseChannelInitialMessage,
  baseChannelUpdateIncidentLevelMessage,
  containmentDecralationMessage,
  followupAction,
  initialMessage,
  showFlow,
  timelineMessage,
  updateIncidentLevelMessage,
} from "./messages";

export class JobExecutor {
  constructor(
    private config: IncidentResponseConfig,
    private client: WebClient,
    private eventStore: EventStore,
  ) {}

  async startIncidentResponse(action: ViewSubmitAction): Promise<void> {
    const values = action.view.state.values;
    const selectedService = values["service"]["service"].selected_option!;
    const serviceName = selectedService.text.text;
    const serviceCode = selectedService.value;
    const selectedTriageLevel = values["triage"]["triage"].selected_option!;
    const triageLevelName = selectedTriageLevel.text.text;
    const triageLevelCode = selectedTriageLevel.value;
    const description = values["description"]["description"].value ?? "";
    const reporterId = action.user.id;

    // Create a "warroom" channel
    const warroomName = this.config.channelPrefix +
      "_" +
      serviceCode + "_" + format(addHours(new Date(), 9), "uuuuMMdd_HHmmss");
    const warroomId = await this.client.conversations.create({
      name: warroomName,
      is_private: true, // TODO configurable
    }).then((res) => res.channel?.id!);

    // Invite people
    const reporterInvitation = this.client.conversations.invite({
      channel: warroomId,
      users: reporterId,
    });
    const recipients = resolvePolicy(
      { triageLevelCode, serviceCode },
      this.config.notificationPolicies,
      this.config.defaultNotificationPolicy,
    ).recipients.map((recipient) => this.config.recipients[recipient]).filter((
      recipient,
    ) => recipient !== undefined); // TODO: 本来はconfigをパースする際にマッチしないrecipientが存在したらエラーにするべき
    const invitingPost = this.client.chat.postMessage({
      channel: warroomId,
      text: recipients.map(({ label, ids }) => {
        return `${label}（${
          ids.map((id) => `<@${id}>`).join(", ")
        }）を招待します`;
      }).join("\n"),
    });
    const recipientsInvitations = this.client.conversations.invite({
      channel: warroomId,
      users: recipients.map(({ ids }) => ids).join(" ,"),
    });

    // Post initial report
    const initialReport = this.client.chat.postMessage({
      channel: warroomId,
      ...initialMessage(reporterId, this.config.roles),
    });
    const baseChannelReport = this.client.chat.postMessage({
      channel: this.config.slackBaseChannelId,
      ...baseChannelInitialMessage(
        { channelId: warroomId, name: warroomName },
        reporterId,
        serviceName,
        triageLevelName,
        description,
      ),
    });

    const reporterName = await this.resolveUserName(reporterId);
    const event = Event.startIncidentResponse(reporterName);
    const storeEvent = this.eventStore.save(warroomId, event);

    await Promise.all([
      reporterInvitation,
      invitingPost,
      recipientsInvitations,
      initialReport,
      baseChannelReport,
      storeEvent,
    ]);
  }

  async notifyAssignment(action: BlockButtonAction) {
    const roleKey = action.actions[0].value;
    const role = this.config.roles[roleKey];
    const warroomId = action.channel!.id;
    const warroomName = await this.resolveChannelName(action.channel!.id);
    const assigneeId = action.user.id;
    const assigneeName = await this.resolveUserName(action.user.id);

    const warroomPost = this.client.chat.postMessage({
      channel: warroomId,
      ...assignMessage(assigneeId, role.label, role.message),
    });
    const baseChannelPost = this.client.chat.postMessage({
      channel: this.config.slackBaseChannelId,
      ...baseChannelAssignMessage(warroomName, assigneeName, role.label),
    });

    const event = Event.assignRole(assigneeName, role.label);
    const storeEvent = this.eventStore.save(warroomId, event);

    await Promise.all([warroomPost, baseChannelPost, storeEvent]);
  }

  async updateIncidentLevel(action: ViewSubmitAction) {
    const warroomId = action.view.private_metadata;
    const warroomName = await this.resolveChannelName(
      action.view.private_metadata,
    );
    const reporterId = action.user.id;
    const reporterName = await this.resolveUserName(reporterId);
    const selectedIncidentLevel = action.view.state
      .values["incident_level"]["incident_level"].selected_option!;
    const incidentLevelName = selectedIncidentLevel.value;

    const warroomPost = this.client.chat.postMessage({
      channel: warroomId,
      ...updateIncidentLevelMessage(
        incidentLevelName,
        reporterId,
      ),
    });
    const baseChannelPost = this.client.chat.postMessage({
      channel: warroomId,
      ...baseChannelUpdateIncidentLevelMessage(
        incidentLevelName,
        reporterName,
        warroomName,
      ),
    });

    const event = Event.updateIncidentLevel(reporterName, incidentLevelName);
    const storeEvent = this.eventStore.save(warroomId, event);

    await Promise.all([warroomPost, baseChannelPost, storeEvent]);
  }

  async declareContainment(action: ViewSubmitAction) {
    const warroomId = action.view.private_metadata;
    const containmenterId = action.user.id;
    const note =
      action.view.state.values["containment_note"]["containment_note"].value ||
      "";
    const [containmenterName, warroomName] = await Promise.all([
      this.resolveUserName(containmenterId),
      this.resolveChannelName(warroomId),
    ]);

    const warroomPost = this.client.chat.postMessage({
      channel: warroomId,
      ...containmentDecralationMessage(containmenterId, note),
    });
    const baseChannelPost = this.client.chat.postMessage({
      channel: this.config.slackBaseChannelId,
      ...baseChannelContainmentDecralationMessage(
        containmenterName,
        warroomName,
        note,
      ),
    });

    const event = Event.declareContainment(containmenterName);
    const storeEvent = this.eventStore.save(warroomId, event);

    // Show follow-up actions
    const followupPost = this.client.chat.postMessage({
      channel: warroomId,
      ...followupAction(),
    });

    await Promise.all([warroomPost, baseChannelPost, storeEvent, followupPost]);
  }

  async showTimeline(body: BlockButtonAction) {
    const events = await this.eventStore.list(body.channel!.id);
    const timeline = this.formatEvent(events);
    const warroomName = await this.resolveChannelName(body.channel!.id);

    await this.client.chat.postMessage({
      channel: body.channel!.id,
      ...timelineMessage(warroomName, timeline),
    });
  }

  async pinMessage(body: ReactionAddedEvent) {
    const pinnedMessage = await this.client.conversations.history({
      channel: body.item.channel,
      latest: body.item.ts,
      limit: 1,
    }).then((res) => res?.messages ? [0] : undefined);

    const event = Event.userPinned(body.user);
    await this.eventStore.save(body.item.channel, event);
  }

  async showFlow(body: ShowFlow) {
    const baseChannelName = await this.resolveChannelName(
      this.config.slackBaseChannelId,
    );
    const roles = Object.entries(this.config.roles).map(
      ([_, { label, description }]) => {
        return `- ${label}: ${description}`;
      },
    ).join("\n");

    const idsWithLabel = Object.entries(this.config.recipients)
      .map(([_, { label, ids }]) => ({ label, ids }));

    const recipients = await Promise.all(idsWithLabel.map(
      async ({ label, ids }) => {
        const names = await Promise.all(ids.map(this.resolveUserName));
        return { label, names };
      },
    ));

    await this.client.chat.postMessage({
      channel: body.channel_id,
      text: showFlow(this.config, baseChannelName, roles, recipients),
    });
  }

  private async resolveUserName(userId: string): Promise<string> {
    const user = await this.client.users.info({ user: userId });
    return user.user?.real_name || user.user?.name || userId;
  }

  private async resolveChannelName(channelId: string): Promise<string> {
    const channelInfo = await this.client.conversations.info({
      channel: channelId,
    });
    return channelInfo.channel?.name || channelId;
  }

  private formatEvent(events: Event[]): string {
    const timeline = events.map((e) => {
      const { eventName, userName, at, value } = e;
      const formatted = format(new Date(at), "uuuu-MM-dd HH:mm:ss");
      switch (eventName) {
        case EventType.StartIncidentResponse:
          return `- ${formatted}\t${userName}\tインシデントの報告`;
        case EventType.AssignRole:
          return `- ${formatted}\t${userName}\t${value}にアサイン`;
        case EventType.UpdateIncidentLevel:
          return `- ${formatted}\t${userName}\tインシデントレベルを \`${value}\` に更新`;
        case EventType.DeclareContainment:
          return `- ${formatted}\t${userName}\tインシデントの収束を宣言`;
        case EventType.UserPinned:
          return `- ${formatted}\t${userName}\t${value}`;
        default:
          return "";
      }
    }).join("\n");
    return "```" + timeline + "```";
  }
}
