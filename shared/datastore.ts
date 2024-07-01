interface DataStore {
  set(): Promise<void>;
}

class DynamoDBStore implements DataStore {
  set(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
