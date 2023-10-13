// TODO sharing

export const Command = {
  incident: "/incident",
  showFlow: "/show-incident-flow",
} as const;

export const ActionId = {
  showIncidentResponseFlow: "show_incident_response_flow",
  assignResponder: "assign_responder",
  openIncidentLevelModal: "open_incident_level_modal",
  openContainmentModal: "open_containment_modal",
  showTimeline: "show_timeline",
} as const;

export const CallbackId = {
  initialReportSubmitted: "initial_report_submitted",
  updateIncidentLevel: "update_incident_level",
  declareContainment: "declare_containment",
} as const;
