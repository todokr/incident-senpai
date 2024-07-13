type Status = "reported" | "handling" | "closed";

export type Incident = {
  incidentId: string;
  status: Status;
  summary: string;
};
