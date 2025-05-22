
export type ApiProvider = "lmstudio" | "nvidia";

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
  apiProvider?: ApiProvider; // Store which API was used for this session
}

// Specific for LM Studio
export interface LmStudioRequestBody {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  model?: string;
  mode?: "chat";
  stream?: boolean;
  temperature?: number;
}

export interface LmStudioChoice {
  message: {
    role: "assistant";
    content: string;
  };
}

export interface LmStudioResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices: LmStudioChoice[];
}


// Generic structure, similar to OpenAI, for NVIDIA
export interface GenericChatCompletionRequest {
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface GenericChatCompletionChoice {
  index?: number;
  message: {
    role: "assistant";
    content: string;
  };
  finish_reason?: string;
}

export interface GenericChatCompletionResponse {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices: GenericChatCompletionChoice[];
  // usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}
