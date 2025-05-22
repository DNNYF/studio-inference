
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { 
  Message, 
  ConversationSession, 
  LmStudioRequestBody, 
  LmStudioResponse,
  GenericChatCompletionRequest,
  GenericChatCompletionResponse,
  ApiProvider
} from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { Bot } from 'lucide-react';

interface ChatPanelProps {
  currentSession: ConversationSession | null;
  setCurrentSession: (session: ConversationSession | null) => void;
  saveSession: (session: ConversationSession) => void;
  lmStudioApiEndpoint: string | undefined; 
  nvidiaApiKey: string | undefined;
  selectedApiProvider: ApiProvider;
  systemPrompt?: string;
  lmStudioModelId?: string;
  nvidiaModelId?: string;
}

const DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant.";
const NVIDIA_API_BASE_URL = "https://integrate.api.nvidia.com/v1";

export function ChatPanel({ 
  currentSession, 
  setCurrentSession, 
  saveSession, 
  lmStudioApiEndpoint,
  nvidiaApiKey,
  selectedApiProvider,
  systemPrompt = DEFAULT_SYSTEM_PROMPT,
  lmStudioModelId = "bahasa-jawa", 
  nvidiaModelId = "meta/llama-3.1-405b-instruct", 
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(currentSession?.messages || []);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMessages(currentSession?.messages || []);
  }, [currentSession]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    let sessionToUpdate: ConversationSession;
    if (currentSession) {
      sessionToUpdate = {
        ...currentSession,
        messages: updatedMessages,
        lastUpdated: Date.now(),
        apiProvider: selectedApiProvider, 
      };
    } else {
      sessionToUpdate = {
        id: uuidv4(),
        title: content.substring(0, 30) + (content.length > 30 ? "..." : ""),
        messages: updatedMessages,
        timestamp: Date.now(),
        lastUpdated: Date.now(),
        apiProvider: selectedApiProvider,
      };
      setCurrentSession(sessionToUpdate);
    }
    saveSession(sessionToUpdate);

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...updatedMessages.filter(msg => msg.role === "user" || msg.role === "assistant").map(msg => ({ role: msg.role as "user" | "assistant", content: msg.content }))
    ];
    
    let requestUrl: string;
    let requestBody: LmStudioRequestBody | GenericChatCompletionRequest;
    let requestHeaders: HeadersInit = { "Content-Type": "application/json" };
    let responseDataExtractor: (data: any) => string | null;
    let currentModelId: string | undefined;

    if (selectedApiProvider === "nvidia") {
      currentModelId = nvidiaModelId;
      if (!nvidiaApiKey) {
        const errorMsg = "NVIDIA API Key is not configured. Please set NEXT_PUBLIC_NVIDIA_API_KEY in your .env.local file.";
        toast({ variant: "destructive", title: "NVIDIA API Error", description: errorMsg, duration: 10000 });
        setIsLoading(false);
        setMessages(prev => [...prev, { id: uuidv4(), role: "assistant", content: `Error: ${errorMsg}`, timestamp: Date.now() }]);
        return;
      }
      if (!currentModelId) {
        const errorMsg = "NVIDIA Model ID is not configured.";
        toast({ variant: "destructive", title: "NVIDIA API Error", description: errorMsg, duration: 10000 });
        setIsLoading(false);
        setMessages(prev => [...prev, { id: uuidv4(), role: "assistant", content: `Error: ${errorMsg}`, timestamp: Date.now() }]);
        return;
      }
      requestUrl = `${NVIDIA_API_BASE_URL}/chat/completions`;
      requestHeaders["Authorization"] = `Bearer ${nvidiaApiKey}`;
      requestBody = {
        model: currentModelId,
        messages: apiMessages,
        temperature: 0.7,
        stream: false,
      };
      responseDataExtractor = (data: GenericChatCompletionResponse) => data.choices?.[0]?.message?.content || null;
    } else { // lmstudio
      currentModelId = lmStudioModelId;
      const effectiveLmStudioApiEndpoint = lmStudioApiEndpoint?.trim();
      if (!effectiveLmStudioApiEndpoint) {
        const errorMsg = "LM Studio API endpoint is not configured. Please set NEXT_PUBLIC_LM_STUDIO_API_ENDPOINT in your .env.local file.";
        toast({ variant: "destructive", title: "LM Studio API Error", description: errorMsg, duration: 10000 });
        setIsLoading(false);
        setMessages(prev => [...prev, { id: uuidv4(), role: "assistant", content: `Error: ${errorMsg}`, timestamp: Date.now() }]);
        return;
      }
       if (!currentModelId) {
        const errorMsg = "LM Studio Model ID is not configured.";
        toast({ variant: "destructive", title: "LM Studio API Error", description: errorMsg, duration: 10000 });
        setIsLoading(false);
        setMessages(prev => [...prev, { id: uuidv4(), role: "assistant", content: `Error: ${errorMsg}`, timestamp: Date.now() }]);
        return;
      }
      requestUrl = effectiveLmStudioApiEndpoint;
      requestBody = {
        messages: apiMessages,
        model: currentModelId, 
        mode: "chat",
        stream: false,
        temperature: 0.7,
      };
      responseDataExtractor = (data: LmStudioResponse) => data.choices?.[0]?.message?.content || null;
    }

    console.log(`[ChatPanel] Attempting to fetch from: ${requestUrl}`);
    console.log("[ChatPanel] Request Headers:", JSON.parse(JSON.stringify(requestHeaders))); 
    console.log("[ChatPanel] Request Body:", requestBody);

    try {
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorBodyText = `Status: ${response.status}, StatusText: ${response.statusText}.`;
        try {
            const errorBodyJson = await response.json();
            errorBodyText += ` Details: ${JSON.stringify(errorBodyJson)}`;
        } catch (e) {
            const textError = await response.text().catch(() => "No further details available from response body.");
            errorBodyText += ` Response: ${textError}`;
        }
        throw new Error(`API request failed. ${errorBodyText}`);
      }

      const data = await response.json();
      const assistantMessageContent = responseDataExtractor(data);
      
      if (assistantMessageContent) {
        const assistantMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: assistantMessageContent,
          timestamp: Date.now(),
        };
        
        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        
        const finalSession = { ...sessionToUpdate, messages: finalMessages, lastUpdated: Date.now() };
         if (currentSession?.id === finalSession.id || !currentSession) {
           setCurrentSession(finalSession);
         }
        saveSession(finalSession);
      } else {
        throw new Error("Invalid response structure from API or empty message content received.");
      }
    } catch (error: any) {
      console.error(`Error during API call to ${selectedApiProvider}:`, error);
      let detailedErrorMessage = `An unexpected error occurred while contacting the AI (${selectedApiProvider}).`;

      if (error instanceof TypeError && error.message.toLowerCase().includes("failed to fetch")) {
        detailedErrorMessage = 
`🔴 **Network Error: Failed to fetch from ${selectedApiProvider} API.** 🔴

This usually means the browser could not connect to or was blocked from accessing the API. 
**Please check your browser's Developer Console (F12) > Network Tab.** 
Look for the failed request to '${requestUrl}' and inspect its 'Status' and 'Headers'. 
You might see more specific errors like 'net::ERR_CONNECTION_REFUSED', 'net::ERR_CERT_COMMON_NAME_INVALID', or CORS preflight (OPTIONS request) failures.

Troubleshooting for **${selectedApiProvider.toUpperCase()}**:
`;
        if (selectedApiProvider === 'lmstudio') {
          detailedErrorMessage += `1. **LM Studio CORS**: Ensure "Enable CORS" is ON in LM Studio Server settings. Add your app's origin (e.g., http://localhost:${window.location.port}) if specific origins are required.
2. **Pinggy Tunnel**: 
   - Verify your Pinggy tunnel ('${lmStudioApiEndpoint || 'Not Set'}') is ACTIVE and correctly points to your LM Studio server (e.g., http://localhost:1234).
   - Free Pinggy URLs can change; ensure it's current.
3. **LM Studio Server**: Make sure LM Studio is running, its API server is started, and the model ('${lmStudioModelId}') is loaded and ready.
4. **URL & .env**: Confirm 'NEXT_PUBLIC_LM_STUDIO_API_ENDPOINT' in '.env.local' is the exact Pinggy URL ending with '/v1/chat/completions'. Restart dev server after .env changes.
5. **Firewall/Network**: Check for firewalls blocking Pinggy or LM Studio.
`;
        } else if (selectedApiProvider === 'nvidia') {
          detailedErrorMessage += `1. **NVIDIA API Key**: Ensure 'NEXT_PUBLIC_NVIDIA_API_KEY' in '.env.local' is correct and valid for model '${nvidiaModelId}'.
2. **NVIDIA API Status**: Check NVIDIA API status page for outages.
3. **Network/Firewall**: Check your internet connection and firewall settings.
4. **CORS (if applicable)**: While less common for major cloud APIs, ensure no intermediate proxies are stripping headers.
`;
        }
        detailedErrorMessage += `
**General Client-Side Checks:**
- **Browser Console (Network Tab)**: Provides the MOST specific error.
- **Try Incognito Mode**: To rule out browser extensions interfering.
- **Test Endpoint**: Confirm the API URL works with Postman/curl to isolate browser-specific issues.
`;
      } else if (error.message) {
        detailedErrorMessage = `Error: ${error.message}`;
      }

      toast({
        variant: "destructive",
        title: `${selectedApiProvider.toUpperCase()} API Connection Error`,
        description: (<div className="whitespace-pre-wrap">{detailedErrorMessage}</div>),
        duration: 30000, 
      });

       const errorResponseMessage: Message = {
         id: uuidv4(),
         role: "assistant",
         content: detailedErrorMessage,
         timestamp: Date.now(),
       };
       setMessages(prev => [...prev, errorResponseMessage]);
       const finalSession = { ...sessionToUpdate, messages: [...updatedMessages, errorResponseMessage], lastUpdated: Date.now() };
        if (currentSession?.id === finalSession.id || !currentSession) {
          setCurrentSession(finalSession);
        }
       saveSession(finalSession);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card shadow-lg rounded-lg overflow-hidden">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
            <p className="text-lg mb-2">Start a conversation with Chat Studio</p>
            <p className="text-sm">Select an API provider in Settings, then ask anything or pick a past conversation.</p>
          </div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex items-center justify-start p-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
               <Bot size={18} className="animate-pulse" />
              <span>AI is typing...</span>
            </div>
          </div>
        )}
      </ScrollArea>
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}

