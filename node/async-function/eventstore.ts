import { WebClient } from "@slack/web-api";

export type Event = {
  eventName: string;
  userName: string;
  at: string;
  value?: string;
};

export const EventType = {
  StartIncidentResponse: "startIncidentResponse",
  AssignRole: "assignRole",
  UpdateIncidentLevel: "updateIncidentLevel",
  DeclareContainment: "declareContainment",
  UserPinned: "userPinned",
} as const;

const now = () => new Date().toISOString();

export const Event = {
  startIncidentResponse: (userName: string): Event => ({
    userName,
    eventName: EventType.StartIncidentResponse,
    at: now(),
  }),

  assignRole: (userName: string, roleName: string): Event => ({
    userName,
    eventName: EventType.AssignRole,
    at: now(),
    value: roleName,
  }),

  updateIncidentLevel: (
    userName: string,
    incidentLevelName: string,
  ): Event => ({
    userName,
    eventName: EventType.UpdateIncidentLevel,
    at: now(),
    value: incidentLevelName,
  }),

  declareContainment: (
    userName: string,
  ): Event => ({
    userName,
    eventName: EventType.DeclareContainment,
    at: now(),
  }),

  userPinned: (
    userName: string,
  ): Event => ({
    userName,
    eventName: EventType.UserPinned,
    at: now(),
  }),
};

export interface EventStore {
  save(channelId: string, event: Event): Promise<void>;
  list(channelId: string): Promise<Event[]>;
}

export const BookmarkEventStore = (client: WebClient): EventStore => ({
  save: async (channelId: string, event: Event): Promise<void> => {
    await client.bookmarks.add({
      channel_id: channelId,
      title: JSON.stringify(event),
      type: "link",
      link: "https://example.com",
    });
  },
  list: async (channelId: string): Promise<Event[]> => {
    const bookmarkRes = await client.bookmarks.list({
      channel_id: channelId,
    });
    const bookmarks = bookmarkRes.bookmarks!;
    return bookmarks.map((b) => b.title!)
      .filter((l) => !!l?.length)
      .map((e) => JSON.parse(e) as Event);
  },
});
