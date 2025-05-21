
export interface Message {
  id: string; // Unique ID for each message
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface ConversationSession {
  id: string; // UUID for unique identification
  title: string; // Title for the conversation, e.g., first user message
  timestamp: number; // Creation timestamp
  messages: Message[]; // List of Message objects
  lastUpdated: number; // Timestamp of the last message
}

export interface LmStudioRequestBody {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  mode?: "chat"; // Optional, as per LM Studio docs
  stream?: boolean;
  temperature?: number;
  // Add any other parameters your LM Studio setup might need
}

export interface LmStudioChoice {
  message: {
    role: "assistant";
    content: string;
  };
  // Include other choice properties if available, e.g., finish_reason
}

export interface LmStudioResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices: LmStudioChoice[];
  // usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}
