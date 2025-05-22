
"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { Message, ConversationSession, LmStudioRequestBody, LmStudioResponse } from "@/lib/types";
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
  apiEndpoint: string | undefined; 
  systemPrompt?: string;
}

const DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant.";
const DEFAULT_MODEL_ID = "bahasa-jawa"; // From user's screenshot

export function ChatPanel({ currentSession, setCurrentSession, saveSession, apiEndpoint, systemPrompt = DEFAULT_SYSTEM_PROMPT }: ChatPanelProps) {
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
      };
    } else {
      sessionToUpdate = {
        id: uuidv4(),
        title: content.substring(0, 30) + (content.length > 30 ? "..." : ""),
        messages: updatedMessages,
        timestamp: Date.now(),
        lastUpdated: Date.now(),
      };
      setCurrentSession(sessionToUpdate);
    }
    saveSession(sessionToUpdate);


    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...updatedMessages.map(msg => ({ role: msg.role as "user" | "assistant", content: msg.content }))
    ];
    
    const requestBody: LmStudioRequestBody = {
      messages: apiMessages,
      model: DEFAULT_MODEL_ID, // Added model identifier
      mode: "chat", 
      stream: false,
      temperature: 0.7,
    };

    const effectiveApiEndpoint = apiEndpoint?.trim();

    try {
      if (!effectiveApiEndpoint) {
        throw new Error("API endpoint is not configured. Please set NEXT_PUBLIC_LM_STUDIO_API_ENDPOINT in your .env.local file.");
      }
      const response = await fetch(effectiveApiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorBodyText = `Status: ${response.status}, StatusText: ${response.statusText}.`;
        try {
            const errorBody = await response.json();
            errorBodyText += ` Details: ${JSON.stringify(errorBody)}`;
        } catch (e) {
            // Could not parse JSON body or no body
            const textError = await response.text().catch(() => "No further details available.");
            errorBodyText += ` Details: ${textError}`;
        }
        throw new Error(`API request failed. ${errorBodyText}`);
      }

      const data = await response.json() as LmStudioResponse;
      
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const assistantMessageContent = data.choices[0].message.content;
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
        throw new Error("Invalid response structure from API.");
      }
    } catch (error: any) {
      console.error("Error during API call:", error);
      let detailedErrorMessage = "An unexpected error occurred while contacting the AI.";

      if (error instanceof TypeError && error.message.toLowerCase().includes("failed to fetch")) {
         detailedErrorMessage = "Network Error: Failed to fetch.\n\nTroubleshooting:\n1. LM Studio CORS: Ensure LM Studio's 'Enable CORS' is ON (in Server settings). This is the most common fix.\n2. Pinggy Tunnel: Verify your Pinggy tunnel is active & correctly points to LM Studio (e.g., to http://localhost:1234 or your local IP).\n3. LM Studio Server: Make sure LM Studio is running & its API server is started.\n4. API URL: Double-check NEXT_PUBLIC_LM_STUDIO_API_ENDPOINT in .env.local. It should match your Pinggy URL.\n5. Browser Console: Look for more specific CORS errors in your browser's developer console (Network tab).";
      } else if (error.message) {
        detailedErrorMessage = error.message;
      }

      toast({
        variant: "destructive",
        title: "API Connection Error",
        description: detailedErrorMessage,
        duration: 20000, 
      });

       const errorResponseMessage: Message = {
         id: uuidv4(),
         role: "assistant",
         content: `Error: ${detailedErrorMessage}`,
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
            <p className="text-sm">Ask anything or pick a past conversation from the sidebar.</p>
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
