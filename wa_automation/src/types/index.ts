export type WPPType = any;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface WAMessage {
  id: {
    fromMe: boolean;
    _serialized?: string;
  };
  from: string | any;
  body: string;
  isGroup: boolean;
}