
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { ConversationSession, ApiProvider } from '@/lib/types';
import { AppSidebar } from '@/components/AppSidebar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import useLocalStorage from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PanelLeft } from 'lucide-react';

const DEFAULT_LM_STUDIO_API_ENDPOINT = "https://your-pinggy-subdomain.pinggy.io/v1/chat/completions";
const LM_STUDIO_API_ENDPOINT = process.env.NEXT_PUBLIC_LM_STUDIO_API_ENDPOINT || DEFAULT_LM_STUDIO_API_ENDPOINT;
const NVIDIA_API_KEY = process.env.NEXT_PUBLIC_NVIDIA_API_KEY;

const LM_STUDIO_MODEL_ID = "bahasa-jawa"; // Or your preferred LM Studio model
const NVIDIA_MODEL_ID = "meta/llama-3.1-405b-instruct";


export default function ChatStudioPage() {
  const [sessions, setSessions] = useLocalStorage<ConversationSession[]>("chatSessions", []);
  const [currentSessionId, setCurrentSessionId] = useLocalStorage<string | null>("currentChatSessionId", null);
  const [selectedApiProvider, setSelectedApiProvider] = useLocalStorage<ApiProvider>("selectedApiProvider", "lmstudio");
  
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const currentSession = React.useMemo(() => {
    if (!hydrated) return null;
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId, hydrated]);

  const handleSetCurrentSession = useCallback((session: ConversationSession | null) => {
    setCurrentSessionId(session ? session.id : null);
    if (session && session.apiProvider) {
      setSelectedApiProvider(session.apiProvider);
    }
  }, [setCurrentSessionId, setSelectedApiProvider]);

  const saveSession = useCallback((sessionToSave: ConversationSession) => {
    setSessions(prevSessions => {
      const existingIndex = prevSessions.findIndex(s => s.id === sessionToSave.id);
      if (existingIndex > -1) {
        const updatedSessions = [...prevSessions];
        updatedSessions[existingIndex] = sessionToSave;
        return updatedSessions;
      }
      return [...prevSessions, sessionToSave];
    });
  }, [setSessions]);

  const handleNewChat = useCallback(() => {
    setCurrentSessionId(null); 
    // Optionally reset to default API provider or keep last selected
  }, [setCurrentSessionId]);

  const handleDeleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  }, [setSessions, currentSessionId, setCurrentSessionId]);
  
  const handleDeleteAllSessions = useCallback(() => {
    setSessions([]);
    setCurrentSessionId(null);
  }, [setSessions, setCurrentSessionId]);

  const handleExportAll = () => {
    if (sessions.length === 0) return;
    const exportData = sessions.map(session => ({
      id: session.id,
      title: session.title,
      apiProvider: session.apiProvider || "lmstudio", // Default if not set
      conversations: session.messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant') 
        .map(msg => ({
          role: msg.role === 'user' ? 'human' : 'assistant',
          content: msg.content,
        })),
    }));
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat_studio_history.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (!hydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
          onNewChat={handleNewChat}
          onExportAll={handleExportAll}
          onDeleteSession={handleDeleteSession}
          onDeleteAllSessions={handleDeleteAllSessions}
          selectedApiProvider={selectedApiProvider}
          setSelectedApiProvider={setSelectedApiProvider}
          isHistoryEmpty={sessions.length === 0}
        />
        <SidebarInset className="flex-1 flex flex-col p-0 md:p-2 md:m-0 md:peer-data-[variant=inset]:ml-[var(--sidebar-width-icon)] peer-data-[state=expanded]:md:peer-data-[variant=inset]:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 ease-in-out">
          <div className="p-2 md:hidden">
            <SidebarTrigger>
               <PanelLeft />
            </SidebarTrigger>
          </div>
          <main className="flex-1 p-2 md:p-4 overflow-y-auto h-full">
            <ChatPanel
              currentSession={currentSession}
              setCurrentSession={handleSetCurrentSession}
              saveSession={saveSession}
              lmStudioApiEndpoint={LM_STUDIO_API_ENDPOINT}
              nvidiaApiKey={NVIDIA_API_KEY}
              selectedApiProvider={selectedApiProvider}
              lmStudioModelId={LM_STUDIO_MODEL_ID}
              nvidiaModelId={NVIDIA_MODEL_ID}
            />
          </main>
        </SidebarInset>
      </div>
  );
}
