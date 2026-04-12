export interface Message {
  content: string;
  from: string;
  to: string;
  timestamp: number;
}

export interface Node {
  endpoint_id: string;
  last_updated: number | null;
  alias: string | null;
}

export interface Identity {
  alias: string;
  public_key: string;
}
