
export type Service = {
  code: string;
  value: string;
};

export type Reporter = {
  id: string;
  name: string;
};

export type IncidentLevel = {
  code: string;
  value: string;
};

export type Incident = {
  id: string;
  title: string;
  description: string;
  services: Service[];
  reporter: Reporter;
  level?: IncidentLevel; // may be unspecified when the beggining of the incident
  customFields: Record<string, unknown>;
};
