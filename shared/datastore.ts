import { Incident } from "./model.ts";

interface DataStore {
  store(incident: Incident): Promise<Incident>;
  get(incidentId: string): Promise<Incident | undefined>;
}

class DynamoDBStore implements DataStore {
  store(): Promise<Incident> {
    throw new Error("Method not implemented.");
  }
  get(incidentId: string): Promise<Incident | undefined> {
    throw new Error("Method not implemented.");
  }
}
